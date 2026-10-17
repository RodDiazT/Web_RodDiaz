import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload, jwtSign } from 'payload'
import config from '@/payload.config'
import { entorno } from '@/lib/entorno'
import { esCorreoAutorizado, registrarIntentoRechazado } from '@/lib/acceso'
export const dynamic = 'force-dynamic'

function obtenerOrigenPublico(request: NextRequest): string {
  const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host
  const hostname = hostHeader.split(':')[0].toLowerCase()

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return request.nextUrl.origin
  }

  return entorno.URL_SITIO ? entorno.URL_SITIO.replace(/\/$/, '') : `https://${hostHeader}`
}

function obtenerRedirectUri(request: NextRequest): string {
  return `${obtenerOrigenPublico(request)}/api/oauth/google/callback`
}

export async function GET(request: NextRequest) {
  const origenPublico = obtenerOrigenPublico(request)
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const errorParam = request.nextUrl.searchParams.get('error')
  const stateCookie = request.cookies.get('oauth_state')?.value

  const redirigirConError = (codigoError: string) => {
    const res = NextResponse.redirect(`${origenPublico}/admin/login?error=${encodeURIComponent(codigoError)}`)
    res.cookies.delete('oauth_state')
    return res
  }

  if (errorParam || !code || !state || !stateCookie || state !== stateCookie) {
    return redirigirConError('error_proveedor')
  }

  const clientId = entorno.GOOGLE_CLIENT_ID
  const clientSecret = entorno.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return redirigirConError('configuracion_oauth')
  }

  try {
    const payload = await getPayload({ config })
    const redirectUri = obtenerRedirectUri(request)

    // 1. Intercambiar código de autorización por access_token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      await registrarIntentoRechazado(payload, 'desconocido@oauth.google', 'error_proveedor')
      return redirigirConError('error_proveedor')
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string }
    if (!tokenData.access_token) {
      await registrarIntentoRechazado(payload, 'desconocido@oauth.google', 'error_proveedor')
      return redirigirConError('error_proveedor')
    }

    // 2. Obtener perfil verificado desde Google OpenID Connect
    const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userRes.ok) {
      await registrarIntentoRechazado(payload, 'desconocido@oauth.google', 'error_proveedor')
      return redirigirConError('error_proveedor')
    }

    const perfil = (await userRes.json()) as {
      sub?: string
      email?: string
      email_verified?: boolean
      name?: string
    }

    const correo = perfil.email?.trim().toLowerCase()
    if (!correo || !perfil.email_verified) {
      await registrarIntentoRechazado(payload, correo || 'sin-correo@oauth.google', 'error_proveedor')
      return redirigirConError('error_proveedor')
    }

    // 3. Validar lista blanca CORREOS_ADMIN (§5.2.10, §9.17)
    if (!esCorreoAutorizado(correo)) {
      await registrarIntentoRechazado(payload, correo, 'correo_no_autorizado')
      return redirigirConError('no_autorizado')
    }

    // 4. Buscar o crear el Usuario administrador autorizado (§5.1)
    const ahoraIso = new Date().toISOString()
    const existentes = await payload.find({
      collection: 'usuarios',
      where: {
        email: {
          equals: correo,
        },
      },
      limit: 1,
      overrideAccess: true,
    })

    let usuario = existentes.docs[0]

    if (!usuario) {
      usuario = await payload.create({
        collection: 'usuarios',
        data: {
          email: correo,
          password: crypto.randomBytes(32).toString('hex'),
          nombre: perfil.name || 'Rod Díaz',
          proveedorAcceso: 'google',
          idGoogle: perfil.sub || '',
          ultimoAcceso: ahoraIso,
        },
        overrideAccess: true,
      })
    } else {
      usuario = await payload.update({
        collection: 'usuarios',
        id: usuario.id,
        data: {
          nombre: usuario.nombre || perfil.name || 'Rod Díaz',
          proveedorAcceso: 'google',
          idGoogle: perfil.sub || usuario.idGoogle || '',
          ultimoAcceso: ahoraIso,
        },
        overrideAccess: true,
      })
    }

    // 5. Firmar JWT de sesión de Payload
    const tokenExpiration = 60 * 60 * 24 * 7 // 7 días
    const { token: jwtToken } = await jwtSign({
      fieldsToSign: {
        id: usuario.id,
        collection: 'usuarios',
        email: usuario.email,
      },
      secret: payload.secret,
      tokenExpiration,
    })

    const response = NextResponse.redirect(`${origenPublico}/admin`)
    response.cookies.delete('oauth_state')
    response.cookies.set({
      name: 'payload-token',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenExpiration,
    })

    return response
  } catch (error) {
    console.error('[OAuth Google] Error en callback:', error)
    return redirigirConError('error_proveedor')
  }
}

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload, jwtSign } from 'payload'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

function renderErrorHtml(mensaje: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recuperación de acceso — Rod Díaz</title>
  <style>
    body {
      background-color: #0d0e11;
      color: #f3f4f6;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1.5rem;
      box-sizing: border-box;
      text-align: center;
    }
    .tarjeta {
      background-color: #16181d;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 2.5rem 2rem;
      max-width: 420px;
      width: 100%;
    }
    h1 {
      font-size: 1.25rem;
      margin: 0 0 1rem 0;
      color: #ffffff;
      font-weight: 500;
    }
    p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0 0 1.75rem 0;
    }
    a {
      display: inline-block;
      background-color: #ffffff;
      color: #0d0e11;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="tarjeta">
    <h1>Enlace no válido</h1>
    <p>${mensaje}</p>
    <a href="/admin">Ir al inicio de sesión</a>
  </div>
</body>
</html>`
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse(renderErrorHtml('Este enlace ya no sirve o no contiene un token válido.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  try {
    const payload = await getPayload({ config })
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const now = new Date().toISOString()

    // Buscar usuario con token vigente
    const usuarios = await payload.find({
      collection: 'usuarios',
      where: {
        and: [
          {
            recuperacionHash: {
              equals: tokenHash,
            },
          },
          {
            recuperacionVence: {
              greater_than: now,
            },
          },
        ],
      },
      limit: 1,
    })

    if (usuarios.totalDocs === 0) {
      return new NextResponse(
        renderErrorHtml('Este enlace ya no sirve. Ha expirado o ya fue utilizado. Pide uno nuevo.'),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      )
    }

    const usuario = usuarios.docs[0]

    // Quemar el token de un solo uso inmediatamente
    await payload.update({
      collection: 'usuarios',
      id: usuario.id,
      data: {
        recuperacionHash: null,
        recuperacionVence: null,
        ultimoAcceso: now,
      },
    })

    // Generar JWT firmado de sesión Payload
    const tokenExpiration = 7200 // 2 horas
    const { token: jwtToken } = await jwtSign({
      fieldsToSign: {
        id: usuario.id,
        collection: 'usuarios',
        email: usuario.email,
      },
      secret: payload.secret,
      tokenExpiration,
    })

    const response = NextResponse.redirect(new URL('/admin', request.url))

    // Configurar cookie de autenticación de Payload (payload-token)
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
    console.error('[Recuperar] Error en proceso de recuperación:', error)
    return new NextResponse(
      renderErrorHtml('Ocurrió un error inesperado al procesar la recuperación de acceso.'),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    )
  }
}

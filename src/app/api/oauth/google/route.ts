import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { entorno } from '@/lib/entorno'

export const dynamic = 'force-dynamic'

function obtenerRedirectUri(request: NextRequest): string {
  const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host
  const hostname = hostHeader.split(':')[0].toLowerCase()

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${request.nextUrl.origin}/api/oauth/google/callback`
  }

  const base = entorno.URL_SITIO ? entorno.URL_SITIO.replace(/\/$/, '') : `https://${hostHeader}`
  return `${base}/api/oauth/google/callback`
}

export async function GET(request: NextRequest) {
  const clientId = entorno.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(new URL('/admin/login?error=configuracion_oauth', request.url))
  }

  const state = crypto.randomBytes(24).toString('hex')
  const redirectUri = obtenerRedirectUri(request)

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('prompt', 'select_account')

  const response = NextResponse.redirect(authUrl.toString())
  response.cookies.set({
    name: 'oauth_state',
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutos
  })

  return response
}

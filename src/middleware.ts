import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { entorno } from './lib/entorno'

/**
 * Middleware de host único y redirección canónica 301 — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§5.2.4, §9 criterio 16).
 */
export function middleware(request: NextRequest) {
  const urlSitioRaw = entorno.URL_SITIO
  if (!urlSitioRaw) return NextResponse.next()

  try {
    const targetUrl = new URL(urlSitioRaw)
    const hostDestino = targetUrl.host.toLowerCase()
    const hostPeticion = (request.headers.get('host') || request.nextUrl.host).toLowerCase()

    // 1. Excepciones de host local (§5.2.4)
    if (
      hostPeticion.startsWith('localhost') ||
      hostPeticion.startsWith('127.0.0.1') ||
      hostPeticion.startsWith('0.0.0.0')
    ) {
      return NextResponse.next()
    }

    // 2. Excepciones de rutas críticas del sistema (chequeo de salud y OAuth)
    const pathname = request.nextUrl.pathname
    if (
      pathname.startsWith('/api/salud') ||
      pathname.startsWith('/api/oauth') ||
      pathname.startsWith('/_next') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next()
    }

    // 3. Si el host difiere del host oficial (ej. dominio antiguo o subdominio de Railway tras mudanza),
    // responder 301 permanente preservando ruta y query params
    if (hostPeticion !== hostDestino) {
      const nuevaUrl = new URL(pathname + request.nextUrl.search, targetUrl.origin)
      return NextResponse.redirect(nuevaUrl, 301)
    }
  } catch {
    // Si la URL no es válida, continuar sin interrumpir
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto archivos estáticos internos de Next.js
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

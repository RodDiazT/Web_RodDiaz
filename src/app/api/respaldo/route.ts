/**
 * Endpoint oficial de descarga y estado de respaldos — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/despliegue.md (§3.2, §5.2.7, §5.3).
 */

import { NextRequest, NextResponse } from 'next/server'
import { obtenerPayload } from '@/lib/contenido'
import {
  generarRespaldoComprimido,
  obtenerEstadoRespaldo,
} from '@/lib/respaldo'

export const dynamic = 'force-dynamic'

/**
 * Valida la sesión del usuario administrador en Payload.
 */
async function verificarUsuarioAutenticado(payload: any, request: NextRequest) {
  try {
    const authRes = await payload.auth({ headers: request.headers })
    if (authRes?.user) return authRes.user
  } catch (err: any) {
    console.warn('[API Respaldo] Error en payload.auth:', err.message)
  }
  return null
}

/**
 * GET /api/respaldo
 * Retorna las métricas y estado para la tarjeta de Respaldo del panel.
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await obtenerPayload()
    const usuario = await verificarUsuarioAutenticado(payload, request)

    if (!usuario) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const estado = await obtenerEstadoRespaldo(payload)
    return NextResponse.json(estado, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any) {
    console.error('[API Respaldo] Error al obtener estado:', error.message)
    return NextResponse.json(
      { error: 'No se pudo obtener el estado del respaldo.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/respaldo
 * Genera y entrega el archivo comprimido respaldo-roddiaz-AAAA-MM-DD.json.gz (§5.3).
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await obtenerPayload()
    const usuario = await verificarUsuarioAutenticado(payload, request)

    if (!usuario) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión activa de administrador.' },
        { status: 401 }
      )
    }

    // Fecha en formato AAAA-MM-DD para el nombre de archivo
    const fechaHoy = new Date().toISOString().split('T')[0]
    const nombreArchivo = `respaldo-roddiaz-${fechaHoy}.json.gz`

    // Generar buffer comprimido con todas las colecciones oficiales
    const bufferComprimido = await generarRespaldoComprimido(payload)

    return new Response(new Uint8Array(bufferComprimido), {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Length': String(bufferComprimido.length),
      },
    })
  } catch (error: any) {
    console.error('[API Respaldo] Error al generar respaldo:', error.message)
    const esConcurrencia = error.message?.includes('en curso')
    return NextResponse.json(
      {
        error: esConcurrencia
          ? error.message
          : 'No se pudo preparar el respaldo. Inténtalo de nuevo en unos minutos.',
      },
      { status: esConcurrencia ? 429 : 500 }
    )
  }
}

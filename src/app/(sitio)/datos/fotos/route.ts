import { NextRequest, NextResponse } from 'next/server'
import { paginaFotos } from '@/lib/contenido'

/**
 * Endpoint de scroll infinito para fotos de galería y colecciones.
 * Especificado en DocumentosTecnicos/portafolio/galeria-colecciones.md (§5.3).
 * 
 * Contrato:
 * - Parámetros: lista ('todas' | 'coleccion'), coleccion (slug), caracteristica (slug, opcional),
 *   despues (cursor opaco), limite (número 1-60, default 30).
 * - Respuesta 200: { fotos: [...], siguiente: string | null }
 * - Errores: 400 (faltan parámetros o cursor inválido), 404 (colección o característica no existe).
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const lista = searchParams.get('lista')
  const coleccion = searchParams.get('coleccion') || undefined
  const caracteristica = searchParams.get('caracteristica') || undefined
  const despues = searchParams.get('despues') || undefined
  const limiteStr = searchParams.get('limite')

  if (lista !== 'todas' && lista !== 'coleccion') {
    return NextResponse.json({ error: 'parametro_lista_invalido' }, { status: 400 })
  }

  if (lista === 'coleccion' && !coleccion) {
    return NextResponse.json({ error: 'coleccion_requerida' }, { status: 400 })
  }

  let limite = 30
  if (limiteStr) {
    const num = parseInt(limiteStr, 10)
    if (!isNaN(num)) {
      limite = Math.min(Math.max(num, 1), 60)
    }
  }

  try {
    const resultado = await paginaFotos({
      lista,
      coleccion,
      caracteristica,
      despues,
      limite,
    })

    return NextResponse.json(resultado, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'error_interno' }, { status: 500 })
  }
}

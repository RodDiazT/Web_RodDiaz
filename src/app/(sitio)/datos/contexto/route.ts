import { NextRequest, NextResponse } from 'next/server'
import { contextoFoto } from '@/lib/contenido'

/**
 * Endpoint de resolución de contexto de navegación y fotos para el visor.
 * Especificado en DocumentosTecnicos/portafolio/ficha-foto.md (§5.3).
 * 
 * Contrato:
 * - Parámetros: foto (slug, obligatorio), coleccion (slug, opcional), caracteristica (slug, opcional).
 * - Respuesta 200: { contexto, indice, total, anterior, siguiente, fotos }
 * - Errores: 400 (falta foto), 404 (foto inexistente o no visible).
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const foto = searchParams.get('foto')
  const coleccion = searchParams.get('coleccion') || undefined
  const caracteristica = searchParams.get('caracteristica') || undefined

  if (!foto) {
    return NextResponse.json({ error: 'parametro_foto_requerido' }, { status: 400 })
  }

  try {
    const resultado = await contextoFoto({
      slug: foto,
      coleccion,
      caracteristica,
    })

    if (!resultado) {
      return NextResponse.json({ error: 'foto_no_encontrada' }, { status: 404 })
    }

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

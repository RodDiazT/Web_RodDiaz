import { NextResponse } from 'next/server'
import { fotosConsultables } from '@/lib/contenido'

/**
 * Endpoint para el buscador de fotos consultables en el formulario /consulta (§5.3).
 *
 * Contrato:
 * - Respuesta 200: { fotos: [ { slug, titulo, lugar, busqueda, miniatura, formatos: [ { id, nombre, papeles: [ { id, nombre, descripcion } ] } ] } ] }
 * - Solo fotos visibles que ofrecen copia, en el orden de /fotos.
 * - Formatos ya orientados como la foto.
 * - Sin metadatos técnicos ni datos sensibles.
 * - Caché con revalidación suave (s-maxage=3600, stale-while-revalidate=86400).
 */
export async function GET() {
  try {
    const fotos = await fotosConsultables()

    return NextResponse.json(
      { fotos },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch {
    return NextResponse.json({ error: 'error_interno' }, { status: 500 })
  }
}

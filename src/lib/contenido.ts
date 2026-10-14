/**
 * Funciones de acceso y consulta de contenido para vistas públicas del sitio.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§5.3).
 */

import { getPayload } from 'payload'
import { esFotoVisible } from './visibilidad'

export async function obtenerPayload() {
  const config = (await import('../payload.config')).default
  return await getPayload({ config })
}

/**
 * Obtiene los ajustes globales del sitio.
 */
export async function ajustes() {
  const payload = await obtenerPayload()
  return await payload.findGlobal({
    slug: 'ajustes-sitio',
  })
}

export interface FiltroFotos {
  coleccionSlug?: string
  caracteristicaSlug?: string
  limit?: number
  page?: number
}

/**
 * Consulta fotos públicas que cumplen con las reglas estrictas de visibilidad.
 */
export async function fotosVisibles(filtro?: FiltroFotos) {
  const payload = await obtenerPayload()

  // 1. Obtener colecciones para validar estados y resolver relaciones
  const todasColecciones = await payload.find({
    collection: 'colecciones',
    limit: 500,
  })

  const colMap = new Map(todasColecciones.docs.map((c) => [String(c.id), c]))
  const obtenerColeccionPorId = (id: string | number) => colMap.get(String(id))

  // 2. Construir condiciones de búsqueda
  const whereConditions: any[] = [
    {
      estado: {
        equals: 'publicada',
      },
    },
  ]

  if (filtro?.coleccionSlug) {
    const colDoc = todasColecciones.docs.find((c) => c.slug === filtro.coleccionSlug)
    if (colDoc) {
      // Si la colección es madre, incluye fotos de la madre y de sus hijas
      const idsHijas = todasColecciones.docs
        .filter((c) => {
          const idPadre = typeof c.padre === 'object' && c.padre ? c.padre.id : c.padre
          return String(idPadre) === String(colDoc.id)
        })
        .map((c) => c.id)

      const idsValidos = [colDoc.id, ...idsHijas]
      whereConditions.push({
        coleccion: {
          in: idsValidos,
        },
      })
    }
  }

  if (filtro?.caracteristicaSlug) {
    const carac = await payload.find({
      collection: 'caracteristicas',
      where: {
        slug: { equals: filtro.caracteristicaSlug },
      },
      limit: 1,
    })
    if (carac.totalDocs > 0) {
      whereConditions.push({
        caracteristicas: {
          contains: carac.docs[0].id,
        },
      })
    }
  }

  const resultado = await payload.find({
    collection: 'fotos',
    where: {
      and: whereConditions,
    },
    sort: 'orden',
    limit: filtro?.limit || 100,
    page: filtro?.page || 1,
  })

  // Filtrar con la función única de visibilidad
  const visibles = resultado.docs.filter((f) => esFotoVisible(f as any, obtenerColeccionPorId))

  return {
    ...resultado,
    docs: visibles,
    totalDocs: visibles.length,
  }
}

export type ResultadoFotoSlug =
  | { tipo: 'exito'; foto: any; redirigirA?: never; noDisponible?: never }
  | { tipo: 'redirigir'; destino: string; redirigirA: string; foto?: never; noDisponible?: never }
  | { tipo: 'noDisponible'; noDisponible: true; foto?: any; redirigirA?: never }
  | null

/**
 * Busca una foto por su slug actual o histórico.
 * Conforme al modelo §5.3: devuelve { foto }, { redirigirA }, { noDisponible } o null.
 */
export async function fotoPorSlug(slug: string): Promise<ResultadoFotoSlug> {
  const payload = await obtenerPayload()

  // 1. Buscar por slug directo
  const busqueda = await payload.find({
    collection: 'fotos',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  })

  if (busqueda.totalDocs > 0) {
    const foto = busqueda.docs[0] as any

    // Si está despublicada pero estuvo alguna vez publicada (modelo §4 y §5.3)
    if (foto.estado === 'despublicada' && foto.publicadaEn) {
      return { tipo: 'noDisponible', noDisponible: true, foto }
    }

    // Verificar visibilidad de su colección
    const colId = typeof foto.coleccion === 'object' ? foto.coleccion?.id : foto.coleccion
    if (colId) {
      const col = await payload.findByID({ collection: 'colecciones', id: colId })
      if (!col || col.estado !== 'publicada') {
        return foto.publicadaEn ? { tipo: 'noDisponible', noDisponible: true, foto } : null
      }
      if (col.padre) {
        const idPadre = typeof col.padre === 'object' ? col.padre.id : col.padre
        const colPadre = await payload.findByID({ collection: 'colecciones', id: idPadre })
        if (!colPadre || colPadre.estado !== 'publicada') {
          return foto.publicadaEn ? { tipo: 'noDisponible', noDisponible: true, foto } : null
        }
      }
    }

    if (foto.estado === 'publicada') {
      return { tipo: 'exito', foto }
    }

    return null
  }

  // 2. Buscar en slugs anteriores para redirección 301/308
  const fotosAnteriores = await payload.find({
    collection: 'fotos',
    limit: 1000,
  })

  for (const f of fotosAnteriores.docs as any[]) {
    if (Array.isArray(f.slugsAnteriores) && f.slugsAnteriores.includes(slug)) {
      return {
        tipo: 'redirigir',
        destino: `/fotos/${f.slug}`,
        redirigirA: `/fotos/${f.slug}`,
      }
    }
  }

  return null
}

/**
 * Obtiene las colecciones madre que deben listarse públicamente.
 * Solo incluye colecciones publicadas con al menos una foto visible (marco §6.2.5 y modelo §5.2.5).
 */
export async function coleccionesListadas() {
  const payload = await obtenerPayload()
  const colecciones = await payload.find({
    collection: 'colecciones',
    where: {
      and: [
        { estado: { equals: 'publicada' } },
        { padre: { exists: false } },
      ],
    },
    sort: 'orden',
    limit: 100,
  })

  const listadas: any[] = []
  for (const col of colecciones.docs) {
    const fotos = await fotosVisibles({ coleccionSlug: col.slug, limit: 1 })
    if (fotos.docs.length > 0) {
      listadas.push(col)
    }
  }

  return listadas
}

export type ResultadoColeccionSlug =
  | { tipo: 'exito'; coleccion: any; esHija: boolean; madre?: any }
  | { tipo: 'redirigir'; destino: string; redirigirA: string }
  | null

/**
 * Busca una colección por su slug actual o histórico.
 * Soporta redirección automática a la madre si es hija con visibleSola = false (modelo §4).
 */
export async function coleccionPorSlug(slug: string): Promise<ResultadoColeccionSlug> {
  const payload = await obtenerPayload()

  // 1. Búsqueda directa por slug
  const busqueda = await payload.find({
    collection: 'colecciones',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (busqueda.totalDocs > 0) {
    const col = busqueda.docs[0] as any
    if (col.estado !== 'publicada') return null

    // Si es hija, verificar madre
    if (col.padre) {
      const idPadre = typeof col.padre === 'object' ? col.padre.id : col.padre
      const madre = await payload.findByID({ collection: 'colecciones', id: idPadre })
      if (!madre || madre.estado !== 'publicada') return null

      // Si no es visible sola, redirige a la madre (modelo §4)
      if (col.visibleSola === false) {
        return {
          tipo: 'redirigir',
          destino: `/colecciones/${madre.slug}`,
          redirigirA: `/colecciones/${madre.slug}`,
        }
      }

      return { tipo: 'exito', coleccion: col, esHija: true, madre }
    }

    return { tipo: 'exito', coleccion: col, esHija: false }
  }

  // 2. Buscar en histórico de slugs anteriores
  const coleccionesHist = await payload.find({
    collection: 'colecciones',
    limit: 500,
  })

  for (const c of coleccionesHist.docs as any[]) {
    if (Array.isArray(c.slugsAnteriores) && c.slugsAnteriores.includes(slug)) {
      return {
        tipo: 'redirigir',
        destino: `/colecciones/${c.slug}`,
        redirigirA: `/colecciones/${c.slug}`,
      }
    }
  }

  return null
}

/**
 * Formatea y filtra los formatos y tipos de papel activos ofrecidos en una obra.
 */
export function formatosOfrecidos(foto: any) {
  if (!foto || !Array.isArray(foto.formatos) || foto.formatos.length === 0) {
    return []
  }

  const orientacion = foto.proporcion?.orientacion || 'horizontal'

  const ofrecidos: any[] = []

  for (const f of foto.formatos) {
    const formato = typeof f === 'object' ? f : null
    if (!formato || !formato.activo) continue

    const papelesActivos = Array.isArray(formato.papeles)
      ? formato.papeles
          .map((p: any) => (typeof p === 'object' ? p : null))
          .filter((p: any) => p && p.activo)
      : []

    if (papelesActivos.length === 0) continue

    // Ajustar etiqueta de dimensiones según orientación (ancho × alto en cm)
    const anchoCm = orientacion === 'vertical' ? formato.ladoCortoCm : formato.ladoLargoCm
    const altoCm = orientacion === 'vertical' ? formato.ladoLargoCm : formato.ladoCortoCm

    ofrecidos.push({
      id: formato.id,
      nombreOriginal: formato.nombre,
      dimensionesEtiqueta: `${anchoCm} × ${altoCm} cm`,
      margenMinimoCm: formato.margenMinimoCm || 2.0,
      papeles: papelesActivos,
      requiereEleccionPapel: papelesActivos.length > 1,
    })
  }

  return ofrecidos
}

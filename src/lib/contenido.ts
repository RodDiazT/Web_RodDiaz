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

/* ==========================================================================
   Etapa 4: Portafolio Público (Galería, Ficha y Visor Fine Art)
   ========================================================================== */

import { codificarCursor, decodificarCursor } from './cursor'
import {
  orientarFormato,
  resumenCopias,
  fechaVisible,
  datosTecnicosVisibles,
  masDeCircular,
} from './ficha'

export interface ItemFotoPublica {
  slug: string
  titulo: string
  lugar?: string
  textoAlternativo?: string
  ancho: number
  alto: number
  colorDominante?: string
  filete?: boolean
  ofreceCopia?: boolean
  focalX?: number
  focalY?: number
  versiones: {
    avif?: string[]
    webp?: string[]
    jpeg?: string
    grande_avif?: string
    grande_webp?: string
  }
  seccion?: {
    slug: string
    nombre: string
    conPagina: boolean
  } | null
  href: string
}

/**
 * Mapea un documento Foto de Payload al contrato público de la grilla y el visor.
 * En la grilla NUNCA se incluye la versión de 2048px (criterio 17).
 */
export function mapearFotoPublica(
  doc: any,
  contexto?: { coleccionSlug?: string; caracteristicaSlug?: string } | null,
  seccion?: { slug: string; nombre: string; conPagina: boolean } | null,
  incluirGrande: boolean = false
): ItemFotoPublica {
  // Construir parámetro de contexto hacia la ficha (§5.2.9)
  let params = ''
  if (contexto?.coleccionSlug && contexto?.caracteristicaSlug) {
    params = `?coleccion=${encodeURIComponent(contexto.coleccionSlug)}&caracteristica=${encodeURIComponent(contexto.caracteristicaSlug)}`
  } else if (contexto?.coleccionSlug) {
    params = `?coleccion=${encodeURIComponent(contexto.coleccionSlug)}`
  } else if (contexto?.caracteristicaSlug) {
    params = `?caracteristica=${encodeURIComponent(contexto.caracteristicaSlug)}`
  }

  const sizes = doc.sizes || {}

  const avif = [sizes.pequena_avif?.url, sizes.mediana_avif?.url].filter(Boolean)
  const webp = [sizes.pequena_webp?.url, sizes.mediana_webp?.url].filter(Boolean)
  if (incluirGrande) {
    if (sizes.grande_avif?.url) avif.push(sizes.grande_avif.url)
    if (sizes.grande_webp?.url) webp.push(sizes.grande_webp.url)
  }

  const ofreceCopia = Array.isArray(doc.formatos) && doc.formatos.length > 0

  return {
    slug: doc.slug,
    titulo: doc.titulo,
    lugar: doc.lugar || undefined,
    textoAlternativo: doc.textoAlternativo || doc.titulo,
    ancho: doc.ancho || 2048,
    alto: doc.alto || 1365,
    colorDominante: doc.colorDominante || '#1C1C1C',
    filete: Boolean(doc.filete),
    ofreceCopia,
    focalX: typeof doc.focalX === 'number' ? doc.focalX : 50,
    focalY: typeof doc.focalY === 'number' ? doc.focalY : 50,
    versiones: {
      avif: avif.length > 0 ? avif : undefined,
      webp: webp.length > 0 ? webp : undefined,
      jpeg: sizes.mediana_jpg?.url || doc.url,
      grande_avif: incluirGrande ? sizes.grande_avif?.url : undefined,
      grande_webp: incluirGrande ? sizes.grande_webp?.url : undefined,
    },
    seccion: seccion || null,
    href: `/fotos/${doc.slug}${params}`,
  }
}

/**
 * Consulta la foto de portada principal del sitio (§3.1).
 */
export async function fotoPortadaSitio(): Promise<ItemFotoPublica | null> {
  try {
    const configGlobal = await ajustes()
    const payload = await obtenerPayload()

    // 1. Si hay foto portada definida en AjustesSitio
    if (configGlobal?.fotoPortada) {
      const idPortada =
        typeof configGlobal.fotoPortada === 'object'
          ? configGlobal.fotoPortada.id
          : configGlobal.fotoPortada
      const doc = await payload.findByID({ collection: 'fotos', id: idPortada })
      if (doc && doc.estado === 'publicada') {
        return mapearFotoPublica(doc, null, null, true)
      }
    }

    // 2. Primera foto destacada visible
    const destacadas = await payload.find({
      collection: 'fotos',
      where: {
        and: [{ estado: { equals: 'publicada' } }, { destacada: { equals: true } }],
      },
      sort: '-publicadaEn',
      limit: 1,
    })

    if (destacadas.totalDocs > 0) {
      return mapearFotoPublica(destacadas.docs[0], null, null, true)
    }

    // 3. Foto visible más reciente
    const recientes = await payload.find({
      collection: 'fotos',
      where: { estado: { equals: 'publicada' } },
      sort: '-publicadaEn',
      limit: 1,
    })

    if (recientes.totalDocs > 0) {
      return mapearFotoPublica(recientes.docs[0], null, null, true)
    }

    return null
  } catch {
    return null
  }
}

/**
 * Fotos destacadas para la portada (hasta 12 visibles, por publicadaEn desc).
 */
export async function fotosDestacadas(limite: number = 12): Promise<ItemFotoPublica[]> {
  try {
    const payload = await obtenerPayload()
    const resultado = await payload.find({
      collection: 'fotos',
      where: {
        and: [{ estado: { equals: 'publicada' } }, { destacada: { equals: true } }],
      },
      sort: '-publicadaEn',
      limit: limite,
    })

    return resultado.docs.map((d) => mapearFotoPublica(d, null, null, false))
  } catch {
    return []
  }
}

/**
 * Directorio de tarjetas de colecciones madre listadas (con recorte 4:5 y conteo total).
 */
export async function tarjetasColecciones(): Promise<
  Array<{
    nombre: string
    slug: string
    totalFotos: number
    portada: ItemFotoPublica | null
  }>
> {
  try {
    const payload = await obtenerPayload()
    const madres = await coleccionesListadas()

    const tarjetas: any[] = []

    for (const madre of madres) {
      // Obtener todas las fotos visibles de la madre y sus hijas para el conteo (§5.2.7)
      const fotosCol = await fotosVisibles({ coleccionSlug: madre.slug, limit: 500 })
      const totalFotos = fotosCol.docs.length

      let portadaDoc: any = null
      if (madre.portada) {
        const idPortada = typeof madre.portada === 'object' ? madre.portada.id : madre.portada
        portadaDoc = await payload.findByID({ collection: 'fotos', id: idPortada }).catch(() => null)
      }

      // Si no tiene portada o no está publicada, usar la primera visible
      if (!portadaDoc || portadaDoc.estado !== 'publicada') {
        portadaDoc = fotosCol.docs[0] || null
      }

      tarjetas.push({
        nombre: madre.nombre,
        slug: madre.slug,
        totalFotos,
        portada: portadaDoc ? mapearFotoPublica(portadaDoc, { coleccionSlug: madre.slug }, null, false) : null,
      })
    }

    return tarjetas
  } catch {
    return []
  }
}

/**
 * Lista de características con al menos una foto visible (para chips de filtro).
 */
export async function caracteristicasConFotos(filtro?: {
  coleccionSlug?: string
}): Promise<Array<{ slug: string; nombre: string }>> {
  try {
    const payload = await obtenerPayload()
    const fotos = await fotosVisibles({
      coleccionSlug: filtro?.coleccionSlug,
      limit: 500,
    })

    const caracMap = new Map<string, string>()

    for (const f of fotos.docs as any[]) {
      if (Array.isArray(f.caracteristicas)) {
        for (const c of f.caracteristicas) {
          const doc = typeof c === 'object' ? c : null
          if (doc && doc.slug && doc.nombre) {
            caracMap.set(doc.slug, doc.nombre)
          }
        }
      }
    }

    return Array.from(caracMap.entries())
      .map(([slug, nombre]) => ({ slug, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  } catch {
    return []
  }
}

/**
 * Paginación por cursor para scroll infinito (`GET /datos/fotos`).
 */
export async function paginaFotos(params: {
  lista: 'todas' | 'coleccion'
  coleccion?: string
  caracteristica?: string
  despues?: string | null
  limite?: number
}): Promise<{
  fotos: ItemFotoPublica[]
  siguiente: string | null
}> {
  const limite = Math.min(Math.max(params.limite || 30, 1), 60)
  const contexto = {
    coleccionSlug: params.coleccion,
    caracteristicaSlug: params.caracteristica,
  }

  try {
    const payload = await obtenerPayload()

    // Enfoque simplificado y robusto: consultar el subconjunto visible ordenado
    const resultado = await fotosVisibles({
      coleccionSlug: params.coleccion,
      caracteristicaSlug: params.caracteristica,
      limit: 1000,
    })

    let fotosOrdenadas = [...resultado.docs] as any[]

    if (params.lista === 'todas') {
      // Fijadas primero por ordenFijada asc, luego el resto por publicadaEn desc
      fotosOrdenadas.sort((a, b) => {
        if (a.fijada && !b.fijada) return -1
        if (!a.fijada && b.fijada) return 1
        if (a.fijada && b.fijada) {
          return (a.ordenFijada ?? 999) - (b.ordenFijada ?? 999)
        }
        const fA = new Date(a.publicadaEn || 0).getTime()
        const fB = new Date(b.publicadaEn || 0).getTime()
        if (fB !== fA) return fB - fA
        return String(b.id).localeCompare(String(a.id))
      })
    }

    // Ubicar posición según cursor 'despues'
    let startIndex = 0
    if (params.despues) {
      const cursorData = decodificarCursor(params.despues)
      if (cursorData) {
        const foundIndex = fotosOrdenadas.findIndex((f) => String(f.id) === String(cursorData.id))
        if (foundIndex !== -1) {
          startIndex = foundIndex + 1
        }
      }
    }

    const itemsPagina = fotosOrdenadas.slice(startIndex, startIndex + limite)
    const tieneMas = startIndex + limite < fotosOrdenadas.length

    let siguienteCursor: string | null = null
    if (tieneMas && itemsPagina.length > 0) {
      const ultima = itemsPagina[itemsPagina.length - 1]
      siguienteCursor = codificarCursor({
        id: ultima.id,
        publicadaEn: ultima.publicadaEn,
        ordenFijada: ultima.ordenFijada,
        esFijada: Boolean(ultima.fijada),
      })
    }

    const fotosPublicas = itemsPagina.map((f) => mapearFotoPublica(f, contexto, null, false))

    return {
      fotos: fotosPublicas,
      siguiente: siguienteCursor,
    }
  } catch {
    return { fotos: [], siguiente: null }
  }
}

/**
 * Paginación numerada para la versión sin JavaScript (?pagina=N).
 */
export async function paginaNumerada(
  params: {
    lista: 'todas' | 'coleccion'
    coleccion?: string
    caracteristica?: string
  },
  pagina: number = 1,
  limite: number = 30
): Promise<{
  fotos: ItemFotoPublica[]
  paginaActual: number
  totalPaginas: number
  totalFotos: number
  tieneSiguiente: boolean
  tieneAnterior: boolean
}> {
  const contexto = {
    coleccionSlug: params.coleccion,
    caracteristicaSlug: params.caracteristica,
  }

  try {
    const resultado = await fotosVisibles({
      coleccionSlug: params.coleccion,
      caracteristicaSlug: params.caracteristica,
      limit: 1000,
    })

    let fotos = [...resultado.docs] as any[]

    if (params.lista === 'todas') {
      fotos.sort((a, b) => {
        if (a.fijada && !b.fijada) return -1
        if (!a.fijada && b.fijada) return 1
        if (a.fijada && b.fijada) {
          return (a.ordenFijada ?? 999) - (b.ordenFijada ?? 999)
        }
        const fA = new Date(a.publicadaEn || 0).getTime()
        const fB = new Date(b.publicadaEn || 0).getTime()
        if (fB !== fA) return fB - fA
        return String(b.id).localeCompare(String(a.id))
      })
    }

    const totalFotos = fotos.length
    const totalPaginas = Math.max(1, Math.ceil(totalFotos / limite))
    const paginaActual = Math.max(1, Math.min(pagina, totalPaginas))
    const startIndex = (paginaActual - 1) * limite
    const items = fotos.slice(startIndex, startIndex + limite)

    return {
      fotos: items.map((f) => mapearFotoPublica(f, contexto, null, false)),
      paginaActual,
      totalPaginas,
      totalFotos,
      tieneSiguiente: paginaActual < totalPaginas,
      tieneAnterior: paginaActual > 1,
    }
  } catch {
    return {
      fotos: [],
      paginaActual: 1,
      totalPaginas: 1,
      totalFotos: 0,
      tieneSiguiente: false,
      tieneAnterior: false,
    }
  }
}

/**
 * Consulta y estructura completa para la vista de una colección (/colecciones/[slug]).
 */
export async function vistaColeccion(slug: string) {
  try {
    const resultadoSlug = await coleccionPorSlug(slug)
    if (!resultadoSlug) return null

    if (resultadoSlug.tipo === 'redirigir') {
      return { redirigirA: resultadoSlug.redirigirA }
    }

    const { coleccion, esHija, madre } = resultadoSlug
    const payload = await obtenerPayload()

    if (esHija) {
      // Colección hija: una sola lista de fotos
      const fotosCol = await fotosVisibles({ coleccionSlug: coleccion.slug, limit: 500 })
      return {
        tipo: 'hija' as const,
        coleccion,
        madre,
        fotos: fotosCol.docs.map((f) => mapearFotoPublica(f, { coleccionSlug: coleccion.slug }, null, false)),
        totalFotos: fotosCol.docs.length,
      }
    }

    // Colección madre: agrupada por secciones (§3.3)
    // 1. Fotos propias de la madre
    const fotosPropiasRaw = await payload.find({
      collection: 'fotos',
      where: {
        and: [{ estado: { equals: 'publicada' } }, { coleccion: { equals: coleccion.id } }],
      },
      sort: 'orden',
      limit: 500,
    })
    const fotosPropias = fotosPropiasRaw.docs.map((f) =>
      mapearFotoPublica(f, { coleccionSlug: coleccion.slug }, null, false)
    )

    // 2. Hijas publicadas con fotos visibles
    const hijasRaw = await payload.find({
      collection: 'colecciones',
      where: {
        and: [{ estado: { equals: 'publicada' } }, { padre: { equals: coleccion.id } }],
      },
      sort: 'orden',
      limit: 50,
    })

    const secciones: Array<{
      hija: any
      fotos: ItemFotoPublica[]
    }> = []

    let totalFotos = fotosPropias.length

    for (const hija of hijasRaw.docs) {
      const fotosHija = await fotosVisibles({ coleccionSlug: hija.slug, limit: 500 })
      if (fotosHija.docs.length > 0) {
        totalFotos += fotosHija.docs.length
        secciones.push({
          hija,
          fotos: fotosHija.docs.map((f) =>
            mapearFotoPublica(
              f,
              { coleccionSlug: coleccion.slug },
              { slug: hija.slug, nombre: hija.nombre, conPagina: hija.visibleSola !== false },
              false
            )
          ),
        })
      }
    }

    return {
      tipo: 'madre' as const,
      coleccion,
      fotosPropias,
      secciones,
      totalFotos,
    }
  } catch {
    return null
  }
}

/**
 * Consulta integral de datos para la ficha de foto (/fotos/[slug]).
 */
export async function fichaFoto(slug: string) {
  try {
    const resSlug = await fotoPorSlug(slug)
    if (!resSlug) return null

    if (resSlug.tipo === 'redirigir') {
      return { redirigirA: resSlug.redirigirA }
    }

    if (resSlug.tipo === 'noDisponible') {
      const colId = typeof resSlug.foto?.coleccion === 'object' ? resSlug.foto.coleccion?.id : resSlug.foto?.coleccion
      let coleccionPublica: { nombre: string; slug: string } | null = null
      if (colId) {
        const payload = await obtenerPayload()
        const col = await payload.findByID({ collection: 'colecciones', id: colId }).catch(() => null)
        if (col && col.estado === 'publicada') {
          coleccionPublica = { nombre: col.nombre, slug: col.slug }
        }
      }
      return { noDisponible: true, coleccion: coleccionPublica }
    }

    const { foto } = resSlug
    const payload = await obtenerPayload()
    const configGlobal = await ajustes()

    // Colección y madre
    let coleccionDoc: any = null
    let madreDoc: any = null

    const colId = typeof foto.coleccion === 'object' ? foto.coleccion?.id : foto.coleccion
    if (colId) {
      coleccionDoc = await payload.findByID({ collection: 'colecciones', id: colId }).catch(() => null)
      if (coleccionDoc?.padre) {
        const idPadre = typeof coleccionDoc.padre === 'object' ? coleccionDoc.padre.id : coleccionDoc.padre
        madreDoc = await payload.findByID({ collection: 'colecciones', id: idPadre }).catch(() => null)
      }
    }

    // Formatos ofrecidos y resumen
    const orientacion = foto.proporcion?.orientacion || 'horizontal'
    const formatosCrudos = Array.isArray(foto.formatos) ? foto.formatos : []
    const formatos = formatosCrudos
      .map((f: any) => (typeof f === 'object' ? orientarFormato(f, orientacion) : null))
      .filter(Boolean) as any[]

    const ofreceCopia = formatos.length > 0
    const resumen = resumenCopias(formatos, configGlobal?.textoVitrina)

    // Características
    const caracteristicas: Array<{ slug: string; nombre: string }> = []
    if (Array.isArray(foto.caracteristicas)) {
      for (const c of foto.caracteristicas) {
        const doc = typeof c === 'object' ? c : null
        if (doc && doc.slug && doc.nombre) {
          caracteristicas.push({ slug: doc.slug, nombre: doc.nombre })
        }
      }
    }

    // Bloque "Más de <colección>" (§3.5)
    let masDe: { titulo: string; href: string; fotos: ItemFotoPublica[] } | null = null
    const coleccionEfectiva = coleccionDoc?.visibleSola === false && madreDoc ? madreDoc : coleccionDoc

    if (coleccionEfectiva) {
      const fotosCol = await fotosVisibles({ coleccionSlug: coleccionEfectiva.slug, limit: 50 })
      const circulares = masDeCircular(fotosCol.docs as any[], foto.slug, 6)
      if (circulares.length > 0) {
        masDe = {
          titulo: `Más de ${coleccionEfectiva.nombre}`,
          href: `/colecciones/${coleccionEfectiva.slug}`,
          fotos: circulares.map((f) =>
            mapearFotoPublica(f, { coleccionSlug: coleccionEfectiva.slug }, null, false)
          ),
        }
      }
    }

    // Navegación por defecto (contexto "todas las fotos")
    const todasVisibles = await fotosVisibles({ limit: 500 })
    const listaOrdenada = [...todasVisibles.docs] as any[]
    listaOrdenada.sort((a, b) => {
      if (a.fijada && !b.fijada) return -1
      if (!a.fijada && b.fijada) return 1
      if (a.fijada && b.fijada) return (a.ordenFijada ?? 999) - (b.ordenFijada ?? 999)
      const fA = new Date(a.publicadaEn || 0).getTime()
      const fB = new Date(b.publicadaEn || 0).getTime()
      if (fB !== fA) return fB - fA
      return String(b.id).localeCompare(String(a.id))
    })

    const idxActual = listaOrdenada.findIndex((f) => f.slug === foto.slug)
    const ant = idxActual > 0 ? listaOrdenada[idxActual - 1] : null
    const sig = idxActual !== -1 && idxActual < listaOrdenada.length - 1 ? listaOrdenada[idxActual + 1] : null

    const navegacion = {
      anterior: ant ? { slug: ant.slug, titulo: ant.titulo, href: `/fotos/${ant.slug}` } : null,
      siguiente: sig ? { slug: sig.slug, titulo: sig.titulo, href: `/fotos/${sig.slug}` } : null,
    }

    return {
      foto: mapearFotoPublica(foto, null, null, true),
      fotoCruda: foto,
      coleccion: coleccionDoc,
      madre: madreDoc,
      caracteristicas,
      formatos,
      ofreceCopia,
      resumenCopias: resumen,
      fecha: fechaVisible(foto.fecha),
      datosTecnicos: datosTecnicosVisibles(foto.datosTecnicos),
      historia: foto.historia,
      masDe,
      navegacion,
      textoLlamadaCopia: configGlobal?.textoLlamadaCopia || 'Pedir una copia',
      textoVitrina: configGlobal?.textoVitrina || null,
    }
  } catch {
    return null
  }
}

/**
 * Resuelve el contexto de navegación activo y entrega la lista completa para el Visor (§5.3).
 */
export async function contextoFoto(params: {
  slug: string
  coleccion?: string | null
  caracteristica?: string | null
}) {
  const { slug, coleccion, caracteristica } = params

  try {
    const payload = await obtenerPayload()

    // 1. Intentar resolver contexto solicitado
    let tipoContexto: 'coleccion_caracteristica' | 'coleccion' | 'caracteristica' | 'todas' = 'todas'
    let coleccionDoc: any = null
    let caracteristicaDoc: any = null
    let listaFiltrada: any[] = []

    if (coleccion) {
      const colRes = await payload.find({
        collection: 'colecciones',
        where: { slug: { equals: coleccion } },
        limit: 1,
      })
      if (colRes.totalDocs > 0 && colRes.docs[0].estado === 'publicada') {
        coleccionDoc = colRes.docs[0]
      }
    }

    if (caracteristica) {
      const caracRes = await payload.find({
        collection: 'caracteristicas',
        where: { slug: { equals: caracteristica } },
        limit: 1,
      })
      if (caracRes.totalDocs > 0) {
        caracteristicaDoc = caracRes.docs[0]
      }
    }

    // Regla de bajada de nivel (§4): coleccion+caract -> coleccion -> todas
    if (coleccionDoc && caracteristicaDoc) {
      const fotosColCarac = await fotosVisibles({
        coleccionSlug: coleccionDoc.slug,
        caracteristicaSlug: caracteristicaDoc.slug,
        limit: 500,
      })
      if (fotosColCarac.docs.some((f) => f.slug === slug)) {
        tipoContexto = 'coleccion_caracteristica'
        listaFiltrada = fotosColCarac.docs
      }
    }

    if (tipoContexto === 'todas' && coleccionDoc) {
      const fotosCol = await fotosVisibles({ coleccionSlug: coleccionDoc.slug, limit: 500 })
      if (fotosCol.docs.some((f) => f.slug === slug)) {
        tipoContexto = 'coleccion'
        listaFiltrada = fotosCol.docs
      }
    }

    if (tipoContexto === 'todas' && caracteristicaDoc) {
      const fotosCarac = await fotosVisibles({ caracteristicaSlug: caracteristicaDoc.slug, limit: 500 })
      if (fotosCarac.docs.some((f) => f.slug === slug)) {
        tipoContexto = 'caracteristica'
        listaFiltrada = fotosCarac.docs
      }
    }

    // Si aún no se resolvió o no contiene la foto: fallback a 'todas'
    if (tipoContexto === 'todas') {
      const fotosTodas = await fotosVisibles({ limit: 500 })
      listaFiltrada = [...fotosTodas.docs]
      listaFiltrada.sort((a, b) => {
        if (a.fijada && !b.fijada) return -1
        if (!a.fijada && b.fijada) return 1
        if (a.fijada && b.fijada) return (a.ordenFijada ?? 999) - (b.ordenFijada ?? 999)
        const fA = new Date(a.publicadaEn || 0).getTime()
        const fB = new Date(b.publicadaEn || 0).getTime()
        if (fB !== fA) return fB - fA
        return String(b.id).localeCompare(String(a.id))
      })
    }

    // Ubicar índice de la foto
    const indice = listaFiltrada.findIndex((f) => f.slug === slug)
    const total = listaFiltrada.length

    // Configurar retorno
    let retorno = { etiqueta: 'Volver a Todas las fotos', href: '/fotos' }
    let parametrosContexto = ''

    if (tipoContexto === 'coleccion_caracteristica' && coleccionDoc && caracteristicaDoc) {
      retorno = {
        etiqueta: `Volver a ${coleccionDoc.nombre}`,
        href: `/colecciones/${coleccionDoc.slug}?caracteristica=${caracteristicaDoc.slug}`,
      }
      parametrosContexto = `?coleccion=${coleccionDoc.slug}&caracteristica=${caracteristicaDoc.slug}`
    } else if (tipoContexto === 'coleccion' && coleccionDoc) {
      retorno = {
        etiqueta: `Volver a ${coleccionDoc.nombre}`,
        href: `/colecciones/${coleccionDoc.slug}`,
      }
      parametrosContexto = `?coleccion=${coleccionDoc.slug}`
    } else if (tipoContexto === 'caracteristica' && caracteristicaDoc) {
      retorno = {
        etiqueta: `Volver a ${caracteristicaDoc.nombre}`,
        href: `/fotos?caracteristica=${caracteristicaDoc.slug}`,
      }
      parametrosContexto = `?caracteristica=${caracteristicaDoc.slug}`
    }

    const anteriorDoc = indice > 0 ? listaFiltrada[indice - 1] : null
    const siguienteDoc = indice !== -1 && indice < total - 1 ? listaFiltrada[indice + 1] : null

    const fotosVisor = listaFiltrada.map((f) => ({
      slug: f.slug,
      titulo: f.titulo,
      textoAlternativo: f.textoAlternativo || f.titulo,
      ancho: f.ancho || 2048,
      alto: f.alto || 1365,
      colorDominante: f.colorDominante,
      filete: Boolean(f.filete),
      ofreceCopia: Array.isArray(f.formatos) && f.formatos.length > 0,
      sizes: f.sizes,
      url: f.url,
    }))

    return {
      contexto: {
        tipo: tipoContexto,
        coleccion: coleccionDoc ? { slug: coleccionDoc.slug, nombre: coleccionDoc.nombre } : null,
        caracteristica: caracteristicaDoc
          ? { slug: caracteristicaDoc.slug, nombre: caracteristicaDoc.nombre }
          : null,
        retorno,
        parametros: parametrosContexto,
      },
      indice: Math.max(0, indice),
      total,
      anterior: anteriorDoc
        ? {
            slug: anteriorDoc.slug,
            titulo: anteriorDoc.titulo,
            href: `/fotos/${anteriorDoc.slug}${parametrosContexto}`,
          }
        : null,
      siguiente: siguienteDoc
        ? {
            slug: siguienteDoc.slug,
            titulo: siguienteDoc.titulo,
            href: `/fotos/${siguienteDoc.slug}${parametrosContexto}`,
          }
        : null,
      fotos: fotosVisor,
    }
  } catch {
    return null
  }
}

/**
 * Consulta las fotos visibles que ofrecen copia física para el buscador de /consulta (§5.3).
 * Formatos orientados, textos normalizados sin tildes y miniaturas ligeras (480px).
 */
export async function fotosConsultables() {
  try {
    const payload = await obtenerPayload()
    const todasVisibles = await fotosVisibles({ limit: 500 })
    let fotos = [...todasVisibles.docs] as any[]

    // Orden canónico de /fotos: fijadas por ordenFijada asc, luego por publicadaEn desc
    fotos.sort((a, b) => {
      if (a.fijada && !b.fijada) return -1
      if (!a.fijada && b.fijada) return 1
      if (a.fijada && b.fijada) return (a.ordenFijada ?? 999) - (b.ordenFijada ?? 999)
      const fA = new Date(a.publicadaEn || 0).getTime()
      const fB = new Date(b.publicadaEn || 0).getTime()
      if (fB !== fA) return fB - fA
      return String(b.id).localeCompare(String(a.id))
    })

    const consultables: Array<{
      slug: string
      titulo: string
      lugar?: string
      busqueda: string
      miniatura: {
        webp?: string
        avif?: string
        ancho: number
        alto: number
        colorDominante?: string
      }
      formatos: Array<{
        id: string
        nombre: string
        papeles: Array<{
          id: string
          nombre: string
          descripcion?: string
        }>
      }>
    }> = []

    for (const foto of fotos) {
      const orientacion = foto.proporcion?.orientacion || 'horizontal'
      const formatosCrudos = Array.isArray(foto.formatos) ? foto.formatos : []
      const formatos = formatosCrudos
        .map((f: any) => (typeof f === 'object' ? orientarFormato(f, orientacion) : null))
        .filter((f: any) => f && f.papeles && f.papeles.length > 0)

      if (formatos.length === 0) continue

      const textoBusqueda = [foto.titulo, foto.lugar]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      const sizes = foto.sizes || {}

      consultables.push({
        slug: foto.slug,
        titulo: foto.titulo,
        lugar: foto.lugar || undefined,
        busqueda: textoBusqueda,
        miniatura: {
          webp: sizes.pequena_webp?.url || foto.url,
          avif: sizes.pequena_avif?.url || undefined,
          ancho: sizes.pequena_webp?.width || 480,
          alto: sizes.pequena_webp?.height || 320,
          colorDominante: foto.colorDominante || '#1C1C1C',
        },
        formatos: formatos.map((f: any) => ({
          id: String(f.id),
          nombre: f.etiquetaDimensiones,
          papeles: f.papeles.map((p: any) => ({
            id: String(typeof p === 'object' ? p.id : p),
            nombre: typeof p === 'object' ? p.nombre : 'Papel Fine Art',
            descripcion: typeof p === 'object' ? p.descripcion || undefined : undefined,
          })),
        })),
      })
    }

    return consultables
  } catch {
    return []
  }
}


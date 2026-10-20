/**
 * Funciones puras para el formateo y lógica de negocio de la ficha de foto Fine Art.
 * Especificado en DocumentosTecnicos/portafolio/ficha-foto.md (§5.2, §5.3).
 */

export type Orientacion = 'horizontal' | 'vertical' | 'cuadrada'


export interface FormatoCrudo {
  id: string | number
  nombre?: string
  ladoCortoCm: number
  ladoLargoCm: number
  margenMinimoCm?: number
  activo?: boolean
  orden?: number
  papeles?: any[]
}

export interface FormatoOrientado {
  id: string | number
  nombreOriginal?: string
  anchoCm: number
  altoCm: number
  etiquetaDimensiones: string
  margenMinimoCm: number
  superficieCm2: number
  papeles: any[]
}

/**
 * Formatea un número decimal con coma (estilo chileno/latinoamérica: 29,7).
 */
export function formatearDecimalCm(num: number): string {
  if (Number.isInteger(num)) return String(num)
  return String(num).replace('.', ',')
}

/**
 * Orienta las dimensiones físicas de un formato de impresión según la orientación de la foto.
 * Ancho × Alto en cm.
 */
export function orientarFormato(
  formato: FormatoCrudo,
  orientacion: Orientacion = 'horizontal'
): FormatoOrientado {
  let anchoCm: number
  let altoCm: number

  if (orientacion === 'vertical') {
    anchoCm = formato.ladoCortoCm
    altoCm = formato.ladoLargoCm
  } else if (orientacion === 'cuadrada') {
    anchoCm = formato.ladoCortoCm
    altoCm = formato.ladoCortoCm
  } else {
    // horizontal o panorámica
    anchoCm = formato.ladoLargoCm
    altoCm = formato.ladoCortoCm
  }

  const anchoStr = formatearDecimalCm(anchoCm)
  const altoStr = formatearDecimalCm(altoCm)

  return {
    id: formato.id,
    nombreOriginal: formato.nombre,
    anchoCm,
    altoCm,
    etiquetaDimensiones: `${anchoStr} × ${altoStr} cm`,
    margenMinimoCm: formato.margenMinimoCm ?? 2.0,
    superficieCm2: anchoCm * altoCm,
    papeles: Array.isArray(formato.papeles) ? formato.papeles : [],
  }
}

/**
 * Etiqueta de proporción orientada para la información de taller Fine Art.
 * E.g. "2:3", "3:2", "4:5", "1:1".
 */
export function etiquetaProporcion(proporcion: string = '3:2', orientacion: Orientacion = 'horizontal'): string {
  if (orientacion === 'cuadrada') return '1:1'

  const partes = proporcion.split(':')
  if (partes.length === 2) {
    const a = partes[0]
    const b = partes[1]
    if (orientacion === 'vertical') {
      const numA = Number(a.replace(',', '.'))
      const numB = Number(b.replace(',', '.'))
      if (numA > numB) {
        return `${b}:${a}`
      }
    }
  }

  return proporcion
}

/**
 * Genera el resumen sintético de copias para la ficha.
 * E.g. "Copias de 20 × 30 a 60 × 90 cm · 2 papeles" o "Copia de 30 × 45 cm · Algodón mate".
 */
export function resumenCopias(
  formatos: FormatoOrientado[],
  textoVitrina?: string | null
): string {
  if (!formatos || formatos.length === 0) {
    return textoVitrina || ''
  }

  // Identificar papeles activos únicos
  const idsPapeles = new Set<string | number>()
  const nombresPapeles: string[] = []

  for (const f of formatos) {
    for (const p of f.papeles) {
      const id = typeof p === 'object' && p ? p.id : p
      const nombre = typeof p === 'object' && p ? p.nombre : null
      if (id && !idsPapeles.has(id)) {
        idsPapeles.add(id)
        if (nombre) nombresPapeles.push(nombre)
      }
    }
  }

  const totalPapeles = idsPapeles.size
  let detallePapel = ''
  if (totalPapeles === 1 && nombresPapeles[0]) {
    detallePapel = ` · ${nombresPapeles[0]}`
  } else if (totalPapeles > 1) {
    detallePapel = ` · ${totalPapeles} papeles`
  }

  if (formatos.length === 1) {
    return `Copia de ${formatos[0].etiquetaDimensiones}${detallePapel}`
  }

  // Ordenar formatos por superficie para hallar menor y mayor
  const ordenados = [...formatos].sort((a, b) => a.superficieCm2 - b.superficieCm2)
  const menor = ordenados[0].etiquetaDimensiones.replace(' cm', '')
  const mayor = ordenados[ordenados.length - 1].etiquetaDimensiones

  return `Copias de ${menor} a ${mayor}${detallePapel}`
}

/**
 * Formatea la fecha de toma a mes y año en minúsculas en timezone de Chile.
 * E.g. "marzo de 2025" y formato datetime ISO "2025-03-14".
 */
export function fechaVisible(fechaIso?: string | null): { legible: string; datetime: string } | null {
  if (!fechaIso) return null

  try {
    const fecha = new Date(fechaIso)
    if (isNaN(fecha.getTime())) return null

    const formateador = new Intl.DateTimeFormat('es-CL', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Santiago',
    })

    const partes = formateador.formatToParts(fecha)
    const mes = partes.find((p) => p.type === 'month')?.value.toLowerCase() || ''
    const anio = partes.find((p) => p.type === 'year')?.value || ''

    const legible = `${mes} de ${anio}`
    const datetime = fecha.toISOString().split('T')[0]

    return { legible, datetime }
  } catch {
    return null
  }
}

/**
 * Formatea los datos técnicos visibles (distancia focal, apertura, velocidad, ISO).
 * Omite campos ausentes o no especificados. E.g. "35 mm · f/8 · 1/250 s · ISO 100".
 */
export function datosTecnicosVisibles(datos?: {
  distanciaFocal?: string | number | null
  apertura?: string | number | null
  velocidad?: string | null
  iso?: string | number | null
}): string | null {
  if (!datos) return null

  const items: string[] = []

  if (datos.distanciaFocal) {
    const focalStr = String(datos.distanciaFocal).trim()
    items.push(focalStr.endsWith('mm') ? focalStr : `${focalStr} mm`)
  }

  if (datos.apertura) {
    const aperturaStr = String(datos.apertura).trim().replace('.', ',')
    items.push(aperturaStr.startsWith('f/') ? aperturaStr : `f/${aperturaStr}`)
  }

  if (datos.velocidad) {
    items.push(String(datos.velocidad).trim())
  }

  if (datos.iso) {
    const isoStr = String(datos.iso).trim()
    items.push(/^iso\b/i.test(isoStr) ? isoStr : `ISO ${isoStr}`)
  }

  return items.length > 0 ? items.join(' · ') : null
}

/**
 * Construye el enlace hacia el formulario de consulta respetando el contrato de URL (§5.2.9).
 */
export function hrefConsulta(
  slug: string,
  formatoId?: string | number | null,
  origen: 'ficha' | 'visor' = 'ficha'
): string {
  let url = `/consulta?foto=${encodeURIComponent(slug)}`
  if (formatoId !== undefined && formatoId !== null) {
    url += `&formato=${encodeURIComponent(String(formatoId))}`
  }
  url += `&origen=${origen}`
  return url
}

/**
 * Obtiene hasta N fotos de la colección en orden circular comenzando por la que sigue a la actual.
 */
export function masDeCircular<T extends { slug: string }>(
  lista: T[],
  slugActual: string,
  limite: number = 6
): T[] {
  if (!Array.isArray(lista) || lista.length <= 1) return []

  const indiceActual = lista.findIndex((f) => f.slug === slugActual)
  if (indiceActual === -1) {
    return lista.slice(0, limite)
  }

  const sinActual = [...lista.slice(indiceActual + 1), ...lista.slice(0, indiceActual)]
  return sinActual.slice(0, limite)
}

/**
 * Funciones puras de dominio para el sistema de consultas 1:1, antispam y cumplimiento normativo.
 * Especificado en DocumentosTecnicos/consultas/consulta-copia.md (§5.1, §5.2, §5.3, §6).
 */

import crypto from 'crypto'

export interface ItemConsultaInput {
  foto?: string | { id?: string | number; slug?: string } | null
  slugFoto?: string
  tituloFoto?: string
  formato?: string | number | null
  papel?: string | number | null
  nombreFormatoSnapshot?: string
  nombrePapelSnapshot?: string
}

export interface DatosFormularioConsulta {
  nombre: string
  correo: string
  telefono?: string | null
  ciudad?: string | null
  mensaje?: string | null
  items?: ItemConsultaInput[]
  acepta?: boolean | string
  promociones?: boolean | string
  origen?: 'ficha' | 'visor' | 'general' | 'licencia'
  claveEnvio?: string
  emitidoEn?: string | number
  firma?: string
  sitio_web?: string // Trampa antispam honeypot
}

export interface ErrorValidacionConsulta {
  requerido?: string
  formato?: string
  largo?: string
  maximo_items?: string
  limite?: string
  guardado?: string
  [campo: string]: string | undefined
}

/**
 * Dominios de correo comunes y variantes frecuentes para sugerencia de tipeo (§5.2.5).
 */
const DOMINIOS_COMUNES = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'live.cl',
  'hotmail.cl',
  'yahoo.cl',
]

const TYPOS_MAP: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmaild.com': 'gmail.com',
  'gmaul.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.con': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'iclud.com': 'icloud.com',
  'iclou.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'icloud.con': 'icloud.com',
}

/**
 * Calcula la distancia de Levenshtein entre dos cadenas.
 */
function distanciaLevenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // eliminación
        dp[i][j - 1] + 1, // inserción
        dp[i - 1][j - 1] + costo // sustitución
      )
    }
  }

  return dp[m][n]
}

/**
 * Sugerencia de corrección para errores comunes en el dominio del correo electrónico (§3.5, §5.2).
 * E.g., 'juan@gmial.com' -> 'juan@gmail.com'
 */
export function sugerirCorreo(correo: string): string | null {
  if (!correo || !correo.includes('@')) return null

  const partes = correo.trim().toLowerCase().split('@')
  if (partes.length !== 2) return null

  const [usuario, dominio] = partes
  if (!usuario || !dominio) return null

  // 1. Coincidencia directa en tabla de tipeos frecuentes
  if (TYPOS_MAP[dominio]) {
    return `${usuario}@${TYPOS_MAP[dominio]}`
  }

  // 2. Si ya es un dominio correcto, no sugerir nada
  if (DOMINIOS_COMUNES.includes(dominio)) {
    return null
  }

  // 3. Proximidad por distancia de Levenshtein (distancia 1 o 2)
  for (const comun of DOMINIOS_COMUNES) {
    const dist = distanciaLevenshtein(dominio, comun)
    if (dist > 0 && dist <= 2) {
      return `${usuario}@${comun}`
    }
  }

  return null
}

/**
 * Genera la firma HMAC SHA-256 para el timestamp de emisión del formulario.
 */
export function firmarEmision(timestampMs: number, secret?: string): string {
  const clave = secret || process.env.PAYLOAD_SECRET || 'secreto-reserva-consultas'
  return crypto.createHmac('sha256', clave).update(String(timestampMs)).digest('hex')
}

/**
 * Verifica la firma y el tiempo mínimo de llenado del formulario (§5.2.5).
 * - Tiempo mínimo: 1.8 s (calibrado para autocompletado en navegadores móviles).
 * - Si tiene más de 24 horas, se acepta igual (pestaña abierta largo rato).
 */
export function verificarEmision(
  timestampMs: number,
  firma: string,
  secret?: string,
  ahoraMs: number = Date.now()
): { valido: boolean; motivo?: string } {
  if (!timestampMs || !firma) {
    return { valido: false, motivo: 'faltan_parametros' }
  }

  const firmaEsperada = firmarEmision(timestampMs, secret)

  // Comparación segura contra ataques de tiempo
  const bufferA = Buffer.from(firma)
  const bufferB = Buffer.from(firmaEsperada)

  if (bufferA.length !== bufferB.length || !crypto.timingSafeEqual(bufferA, bufferB)) {
    return { valido: false, motivo: 'firma_invalida' }
  }

  const tiempoTranscurrido = ahoraMs - timestampMs

  // Envío en menos de 1.8 segundos: bot o script automatizado
  if (tiempoTranscurrido < 1800) {
    return { valido: false, motivo: 'tiempo_insuficiente' }
  }

  return { valido: true }
}

/**
 * Clasifica si el envío presenta características de spam (§5.2.5).
 */
export function clasificarSpam(
  datos: {
    trampa?: string | null
    emitidoEn?: string | number | null
    firma?: string | null
  },
  ahoraMs: number = Date.now(),
  secret?: string
): boolean {
  // 1. Campo trampa oculto con texto
  if (datos.trampa && String(datos.trampa).trim().length > 0) {
    return true
  }

  // 2. Validación de emisión HMAC y tiempo mínimo de 1.8s
  const emitidoNum = Number(datos.emitidoEn)
  if (!emitidoNum || isNaN(emitidoNum) || !datos.firma) {
    return true
  }

  const resultadoFirma = verificarEmision(emitidoNum, datos.firma, secret, ahoraMs)
  if (!resultadoFirma.valido) {
    return true
  }

  return false
}

/**
 * Valida los datos del formulario de consulta según las reglas del negocio (§5.1, §5.2.2).
 */
export function validarConsulta(datos: any): {
  valido: boolean
  errores: Record<string, string>
  valores: {
    nombre: string
    correo: string
    telefono: string
    ciudad: string
    mensaje: string
    acepta: boolean
    promociones: boolean
    items: ItemConsultaInput[]
  }
} {
  const errores: Record<string, string> = {}

  // 1. Nombre (obligatorio, 2 a 80 caracteres)
  const nombre = typeof datos?.nombre === 'string' ? datos.nombre.trim() : ''
  if (!nombre) {
    errores.nombre = 'Escribe tu nombre'
  } else if (nombre.length < 2) {
    errores.nombre = 'El nombre debe tener al menos 2 caracteres'
  } else if (nombre.length > 80) {
    errores.nombre = 'El nombre no puede exceder 80 caracteres'
  }

  // 2. Correo (obligatorio, máx 254 caracteres, formato válido)
  const correo = typeof datos?.correo === 'string' ? datos.correo.trim().toLowerCase() : ''
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!correo) {
    errores.correo = 'Escribe tu correo'
  } else if (!regexCorreo.test(correo) || correo.length > 254) {
    errores.correo = 'Revisa el correo: falta algo como nombre@dominio.cl'
  }

  // 3. Teléfono (opcional, máx 20 caracteres, formato libre 0-9 +-() y espacios)
  const telefono = typeof datos?.telefono === 'string' ? datos.telefono.trim() : ''
  if (telefono) {
    if (telefono.length > 20) {
      errores.telefono = 'El teléfono no puede exceder 20 caracteres'
    } else if (!/^[0-9+\-()\s]+$/.test(telefono)) {
      errores.telefono = 'El teléfono solo puede contener números, espacios y signos (+, -, ())'
    }
  }

  // 4. Ciudad (opcional, máx 80 caracteres)
  const ciudad = typeof datos?.ciudad === 'string' ? datos.ciudad.trim() : ''
  if (ciudad && ciudad.length > 80) {
    errores.ciudad = 'La ciudad no puede exceder 80 caracteres'
  }

  // 5. Mensaje (opcional, máx 2000 caracteres, texto plano)
  const mensaje = typeof datos?.mensaje === 'string' ? datos.mensaje.trim() : ''
  if (mensaje && mensaje.length > 2000) {
    errores.mensaje = 'El mensaje no puede exceder 2000 caracteres'
  }

  // 6. Casilla de consentimiento obligatorio (Ley 21.719)
  const acepta =
    datos?.acepta === true ||
    datos?.acepta === 'true' ||
    datos?.acepta === 'on' ||
    datos?.acepta === 1 ||
    datos?.acepta === '1'

  if (!acepta) {
    errores.acepta = 'Marca la casilla para poder enviar'
  }

  // 7. Casilla de novedades (opcional)
  const promociones =
    datos?.promociones === true ||
    datos?.promociones === 'true' ||
    datos?.promociones === 'on' ||
    datos?.promociones === 1 ||
    datos?.promociones === '1'

  // 8. Ítems (0 a 5 ítems)
  const itemsBrutos = Array.isArray(datos?.items) ? datos.items : []
  if (itemsBrutos.length > 5) {
    errores.items = 'El número máximo de obras por consulta es 5'
  }

  const itemsLimpios = limpiarItems(itemsBrutos)

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    valores: {
      nombre,
      correo,
      telefono,
      ciudad,
      mensaje,
      acepta,
      promociones,
      items: itemsLimpios,
    },
  }
}

/**
 * Deduplica y limpia la lista de ítems de una consulta. Máximo 5 ítems (§4, §5.2.2).
 */
export function limpiarItems(items: any[]): ItemConsultaInput[] {
  if (!Array.isArray(items)) return []

  const limpios: ItemConsultaInput[] = []
  const slugsVistos = new Set<string>()

  for (const item of items) {
    if (!item) continue
    const slug =
      typeof item.foto === 'object' && item.foto?.slug
        ? item.foto.slug
        : item.slugFoto || (typeof item.foto === 'string' ? item.foto : null)

    if (!slug || slugsVistos.has(slug)) {
      continue
    }

    slugsVistos.add(slug)

    limpios.push({
      foto: typeof item.foto === 'object' ? item.foto?.id || item.foto : item.foto,
      slugFoto: slug,
      tituloFoto: item.tituloFoto || (typeof item.foto === 'object' ? item.foto?.titulo : slug),
      formato: item.formato ?? null,
      papel: item.papel ?? null,
      nombreFormatoSnapshot: item.nombreFormatoSnapshot || undefined,
      nombrePapelSnapshot: item.nombrePapelSnapshot || undefined,
    })

    if (limpios.length >= 5) {
      break
    }
  }

  return limpios
}

/**
 * Calcula la fecha de purga programada `eliminarDespuesDe` (§5.1, §5.2.10).
 * - 12 meses desde la última actividad.
 * - 30 días si el estado es spam.
 */
export function calcularEliminarDespuesDe(
  consulta: {
    estado?: string
    ultimaActividad?: string | Date | null
    createdAt?: string | Date | null
  },
  ahora: Date = new Date()
): string {
  if (consulta.estado === 'spam') {
    const base = consulta.createdAt ? new Date(consulta.createdAt) : ahora
    const purgaSpam = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000)
    return purgaSpam.toISOString()
  }

  const base = consulta.ultimaActividad ? new Date(consulta.ultimaActividad) : ahora
  // 12 meses (365 días)
  const purga12Meses = new Date(base.getTime() + 365 * 24 * 60 * 60 * 1000)
  return purga12Meses.toISOString()
}

/**
 * Genera URLs preparadas para responder desde Gmail o cliente mailto (§5.2.6).
 */
export function urlRespuestaGmail(
  consulta: {
    nombre: string
    correo: string
    tipo?: string
    items?: Array<{
      tituloFoto?: string
      nombreFormatoSnapshot?: string
      nombrePapelSnapshot?: string
    }>
  },
  plantilla?: string | null,
  correoRod?: string
): { urlGmail: string; urlMailto: string } {
  const fotosTitulos =
    Array.isArray(consulta.items) && consulta.items.length > 0
      ? consulta.items.map((i) => `«${i.tituloFoto || 'Fotografía'}»`).join(' y ')
      : ''

  const asunto = fotosTitulos ? `Tu consulta por ${fotosTitulos}` : 'Tu mensaje'

  let detalle = ''
  if (Array.isArray(consulta.items) && consulta.items.length > 0) {
    detalle = consulta.items
      .map((i) => {
        const titulo = i.tituloFoto || 'Fotografía'
        const formato = i.nombreFormatoSnapshot || 'formato a convenir'
        const papel = i.nombrePapelSnapshot ? ` sobre ${i.nombrePapelSnapshot}` : ''
        return `• ${titulo} (${formato}${papel})`
      })
      .join('\n')
  }

  let cuerpo = plantilla || 'Hola {nombre}:\n\nGracias por escribirme. {detalle}\n\n'
  cuerpo = cuerpo
    .replace(/{nombre}/g, consulta.nombre)
    .replace(/{fotos}/g, fotosTitulos)
    .replace(/{detalle}/g, detalle)

  const to = encodeURIComponent(consulta.correo)
  const su = encodeURIComponent(asunto)
  const body = encodeURIComponent(cuerpo)
  const authuser = correoRod ? `&authuser=${encodeURIComponent(correoRod)}` : ''

  const urlGmail = `https://mail.google.com/mail/?view=cm&fs=1${authuser}&to=${to}&su=${su}&body=${body}`
  const urlMailto = `mailto:${consulta.correo}?subject=${su}&body=${body}`

  return { urlGmail, urlMailto }
}

/**
 * Calcula el indicador mensual de consultas recibidas vs respondidas de los últimos 12 meses (§5.2.8).
 * Solo toma en cuenta consultas `tipo = copia` que no sean `spam`.
 */
export function indicadorMensual(
  consultas: Array<{
    tipo?: string
    estado?: string
    createdAt?: string | Date
    respondidaEn?: string | Date | null
  }>,
  fechaReferencia: Date = new Date()
): {
  meses: Array<{
    claveMes: string
    etiqueta: string
    recibidas: number
    respondidas: number
  }>
  generales: number
} {
  // Construir los 12 meses hacia atrás en zona horaria America/Santiago
  const formateadorMes = new Intl.DateTimeFormat('es-CL', {
    month: 'short',
    year: '2-digit',
    timeZone: 'America/Santiago',
  })

  const formateadorClave = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'America/Santiago',
  })

  const listaMeses: Array<{
    claveMes: string
    etiqueta: string
    recibidas: number
    respondidas: number
  }> = []

  const mapaIndices = new Map<string, number>()

  for (let i = 11; i >= 0; i--) {
    const d = new Date(fechaReferencia)
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const claveMes = formateadorClave.format(d) // "2026-10"
    const etiqueta = formateadorMes.format(d).replace('.', '') // "oct 26"
    mapaIndices.set(claveMes, listaMeses.length)
    listaMeses.push({
      claveMes,
      etiqueta,
      recibidas: 0,
      respondidas: 0,
    })
  }

  let generales = 0

  for (const c of consultas) {
    if (c.tipo === 'general') {
      generales += 1
      continue
    }

    if (c.estado === 'spam') {
      continue
    }

    // Consulta de copia válida
    if (c.createdAt) {
      const fechaCreacion = new Date(c.createdAt)
      const claveCreacion = formateadorClave.format(fechaCreacion)
      const idxCreacion = mapaIndices.get(claveCreacion)
      if (idxCreacion !== undefined) {
        listaMeses[idxCreacion].recibidas += 1
      }
    }

    if (c.respondidaEn) {
      const fechaRespuesta = new Date(c.respondidaEn)
      const claveRespuesta = formateadorClave.format(fechaRespuesta)
      const idxRespuesta = mapaIndices.get(claveRespuesta)
      if (idxRespuesta !== undefined) {
        listaMeses[idxRespuesta].respondidas += 1
      }
    }
  }

  return {
    meses: listaMeses,
    generales,
  }
}

/**
 * Exporta en texto plano legible todos los datos de consultas de un interesado para el ejercicio
 * de su derecho de acceso (Ley 21.719, §5.2.9).
 */
export function exportarDatosCorreo(
  consultas: any[],
  correoTitular: string
): string {
  const fechaGeneracion = new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'America/Santiago',
  }).format(new Date())

  const lineas: string[] = [
    '======================================================================',
    'INFORME DE DATOS PERSONALES REGISTRADOS — ROD DÍAZ FOTOGRAFÍA FINE ART',
    'En cumplimiento de la Ley 21.719 sobre Protección de Datos Personales',
    '======================================================================',
    '',
    `Titular solicitante: ${correoTitular}`,
    `Fecha de emisión: ${fechaGeneracion}`,
    `Total de consultas registradas: ${consultas.length}`,
    '',
    '----------------------------------------------------------------------',
  ]

  consultas.forEach((c, idx) => {
    lineas.push(`CONSULTA #${idx + 1}`)
    lineas.push(`ID interno: ${c.id}`)
    lineas.push(`Fecha de envío: ${c.createdAt ? new Date(c.createdAt).toISOString() : 'N/A'}`)
    lineas.push(`Nombre declarado: ${c.nombre}`)
    lineas.push(`Correo: ${c.correo}`)
    lineas.push(`Teléfono: ${c.telefono || '(no proporcionado)'}`)
    lineas.push(`Ciudad: ${c.ciudad || '(no proporcionada)'}`)
    lineas.push(`Tipo: ${c.tipo === 'copia' ? 'Copia Fine Art' : 'Mensaje general'}`)
    lineas.push(`Estado actual: ${c.estado}`)
    lineas.push(`Consentimiento registrado: ${c.consentimientoEn || 'N/A'}`)
    lineas.push(`Versión política aceptada: ${c.versionPolitica || 'N/A'}`)
    lineas.push(`Aceptó novedades y promociones: ${c.aceptaPromociones ? 'Sí' : 'No'}`)

    if (Array.isArray(c.items) && c.items.length > 0) {
      lineas.push('Obras solicitadas:')
      c.items.forEach((it: any, iIdx: number) => {
        lineas.push(
          `  ${iIdx + 1}. ${it.tituloFoto || 'Foto'} — Formato: ${it.nombreFormatoSnapshot || 'Por definir'} — Papel: ${it.nombrePapelSnapshot || 'Por definir'}`
        )
      })
    }

    if (c.mensaje) {
      lineas.push('Mensaje del interesado:')
      lineas.push(`  "${c.mensaje}"`)
    }

    lineas.push('----------------------------------------------------------------------')
  })

  lineas.push('')
  lineas.push('Para solicitar la rectificación o supresión de estos datos, responde a este correo.')
  lineas.push('======================================================================')

  return lineas.join('\n')
}

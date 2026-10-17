/**
 * Lectura segura y normalización acotada de metadatos EXIF.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§4, §5.1, §5.2.2, §5.5)
 * y DocumentosTecnicos/marco-general/marco-general-proyecto.md (§7.2).
 * 
 * Regla de oro: SOLO se leen DateTimeOriginal, FocalLength, FNumber y ExposureTime.
 * NUNCA se lee cámara, lente, número de serie ni coordenadas GPS.
 */

import exifr from 'exifr'

export interface DatosTecnicosNormalizados {
  distanciaFocal?: number
  apertura?: number
  velocidad?: string
}

export interface ExifExtraido {
  fecha?: string // Formato ISO a las 12:00 America/Santiago en UTC (día calendario protegido)
  datosTecnicos?: DatosTecnicosNormalizados
}

/**
 * Convierte un valor numérico o racional EXIF/XMP (ej. 24, "24/1", "1/250", [24, 1]) a número decimal.
 */
export function parsearNumeroExif(valor?: unknown): number | undefined {
  if (valor === undefined || valor === null) return undefined
  if (typeof valor === 'number') {
    return isNaN(valor) || !isFinite(valor) ? undefined : valor
  }
  if (Array.isArray(valor) && valor.length >= 2) {
    const num = Number(valor[0])
    const den = Number(valor[1])
    if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den
  }
  if (typeof valor === 'string') {
    const limpio = valor.trim()
    const matchFraccion = limpio.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
    if (matchFraccion) {
      const num = Number(matchFraccion[1])
      const den = Number(matchFraccion[2])
      if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den
    }
    const matchNum = limpio.replace(',', '.').match(/(\d+(?:\.\d+)?)/)
    if (matchNum) {
      const n = Number(matchNum[1])
      return isNaN(n) ? undefined : n
    }
  }
  return undefined
}

/**
 * Normaliza el tiempo de exposición a una representación humana estándar ("1/250 s" o "2 s").
 */
export function normalizarVelocidad(entrada?: number | string): string | undefined {
  const segundos = parsearNumeroExif(entrada)
  if (segundos === undefined || segundos === null || isNaN(segundos) || segundos <= 0) {
    return undefined
  }

  if (segundos >= 1) {
    const redondeado = Math.round(segundos * 10) / 10
    return `${redondeado} s`
  }

  // Menor a 1 segundo: expresar como fracción 1/X s
  const denominador = Math.round(1 / segundos)
  return `1/${denominador} s`
}

/**
 * Normaliza la apertura (f-number) a un número con 1 decimal máximo.
 */
export function normalizarApertura(entrada?: number | string): number | undefined {
  const apertura = parsearNumeroExif(entrada)
  if (apertura === undefined || apertura === null || isNaN(apertura) || apertura <= 0) {
    return undefined
  }
  return Math.round(apertura * 10) / 10
}

/**
 * Normaliza la distancia focal a milímetros enteros.
 */
export function normalizarDistanciaFocal(entrada?: number | string): number | undefined {
  const focal = parsearNumeroExif(entrada)
  if (focal === undefined || focal === null || isNaN(focal) || focal <= 0) {
    return undefined
  }
  return Math.round(focal)
}

/**
 * Normaliza una fecha a día calendario a las 12:00 hora de Santiago en UTC (15:00 o 16:00 UTC).
 * Así nunca cambiará de día sin importar conversiones de zona horaria (modelo §5.2.3).
 */
export function normalizarFechaDia(fechaOriginal?: Date | string): string | undefined {
  if (!fechaOriginal) return undefined

  let anio: number | undefined
  let mes: number | undefined
  let dia: number | undefined

  if (typeof fechaOriginal === 'string') {
    // Formato EXIF clásico (YYYY:MM:DD ...) o ISO (YYYY-MM-DD...)
    const match = fechaOriginal.trim().match(/^(\d{4})[-:/](\d{2})[-:/](\d{2})/)
    if (match) {
      anio = Number(match[1])
      mes = Number(match[2])
      dia = Number(match[3])
    } else {
      const dateObj = new Date(fechaOriginal)
      if (isNaN(dateObj.getTime())) return undefined
      anio = dateObj.getUTCFullYear()
      mes = dateObj.getUTCMonth() + 1
      dia = dateObj.getUTCDate()
    }
  } else if (fechaOriginal instanceof Date) {
    if (isNaN(fechaOriginal.getTime())) return undefined
    // exifr reviveDate crea el Date usando componentes locales de la cámara
    anio = fechaOriginal.getFullYear()
    mes = fechaOriginal.getMonth() + 1
    dia = fechaOriginal.getDate()
  }

  if (!anio || !mes || !dia || isNaN(anio) || isNaN(mes) || isNaN(dia)) {
    return undefined
  }

  const mesStr = String(mes).padStart(2, '0')
  const diaStr = String(dia).padStart(2, '0')

  // Se fija a las 15:00 UTC (12:00 mediodía en Chile Continental UTC-3)
  return `${anio}-${mesStr}-${diaStr}T15:00:00.000Z`
}

/**
 * Lee exclusivamente las 4 etiquetas autorizadas de un buffer o archivo y las normaliza.
 */
export async function leerExifSeguro(
  entrada: Buffer | ArrayBuffer | Uint8Array | Blob
): Promise<ExifExtraido> {
  try {
    const raw = await exifr.parse(entrada as any, {
      tiff: true,
      ifd0: false,
      exif: ['DateTimeOriginal', 'CreateDate', 'FocalLength', 'FNumber', 'ExposureTime'],
      xmp: true,
      translateValues: false,
      reviveValues: true,
      icc: false,
      iptc: false,
      jfif: false,
      gps: false, // Blindaje explícito: GPS descartado
    })

    if (!raw) return {}

    const fechaCruda = raw.DateTimeOriginal || raw.CreateDate || raw.DateCreated
    const fecha = normalizarFechaDia(fechaCruda)
    const distanciaFocal = normalizarDistanciaFocal(raw.FocalLength)
    const apertura = normalizarApertura(raw.FNumber)
    const velocidad = normalizarVelocidad(raw.ExposureTime)

    const datosTecnicos: DatosTecnicosNormalizados = {}
    if (distanciaFocal !== undefined) datosTecnicos.distanciaFocal = distanciaFocal
    if (apertura !== undefined) datosTecnicos.apertura = apertura
    if (velocidad !== undefined) datosTecnicos.velocidad = velocidad

    return {
      fecha,
      datosTecnicos: Object.keys(datosTecnicos).length > 0 ? datosTecnicos : undefined,
    }
  } catch (error) {
    console.warn('[EXIF] No se pudo leer metadatos de la imagen:', error)
    return {}
  }
}

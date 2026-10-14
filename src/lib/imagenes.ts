/**
 * Procesamiento seguro de imágenes con Sharp para el portafolio Fine Art.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§4, §5.1, §5.2.2, §5.5)
 * y DocumentosTecnicos/marco-general/marco-general-proyecto.md (§6.2.1, §6.2.2, §7.2).
 */

import sharp from 'sharp'
import crypto from 'crypto'
import { calcularProporcion, ProporcionCalculada } from './proporcion'

// Configuración de Sharp para Railway: sin caché y concurrencia serial para fotos de hasta 45 MP
sharp.cache(false)
sharp.concurrency(1)

export const LIMITE_TAMANO_BYTES = 60 * 1024 * 1024 // 60 MB

/**
 * Valida la firma de bytes reales del archivo para asegurar que sea JPEG auténtico.
 * La firma JPEG inicia siempre con 0xFF 0xD8 0xFF.
 */
export function esJpegValido(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 3) return false
  return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
}

/**
 * Valida tamaño y firma de la imagen subida.
 */
export function validarArchivoFoto(buffer: Buffer): void {
  if (buffer.length > LIMITE_TAMANO_BYTES) {
    throw new Error('La foto pesa más de 60 MB.')
  }
  if (!esJpegValido(buffer)) {
    throw new Error('Solo se aceptan fotos JPG. Exporta la foto como JPG desde Lightroom.')
  }
}

/**
 * Calcula la huella SHA-256 del archivo original recibido para detección de duplicados.
 */
export function calcularHuellaSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

/**
 * Extrae el color dominante en formato hexadecimal (#rrggbb).
 */
export async function extraerColorDominante(instanciaSharp: sharp.Sharp): Promise<string> {
  try {
    const stats = await instanciaSharp.stats()
    const { dominant } = stats
    if (dominant) {
      const r = dominant.r.toString(16).padStart(2, '0')
      const g = dominant.g.toString(16).padStart(2, '0')
      const b = dominant.b.toString(16).padStart(2, '0')
      return `#${r}${g}${b}`
    }
  } catch (error) {
    console.warn('[Imágenes] No se pudo obtener color dominante con stats:', error)
  }

  // Fallback: redimensionar a 1x1 pixel y leer canales RGB
  try {
    const pixel = await instanciaSharp.clone().resize(1, 1, { fit: 'fill' }).raw().toBuffer()
    const r = (pixel[0] ?? 0).toString(16).padStart(2, '0')
    const g = (pixel[1] ?? 0).toString(16).padStart(2, '0')
    const b = (pixel[2] ?? 0).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  } catch {
    return '#151515' // Color neutro base
  }
}

export interface ResultadoProcesamientoFoto {
  bufferPrincipal: Buffer
  ancho: number
  alto: number
  colorDominante: string
  huella: string
  proporcion: ProporcionCalculada
}

/**
 * Procesa la imagen al subir:
 * 1. Valida JPG y tamaño.
 * 2. Calcula huella SHA-256.
 * 3. Aplica rotate() por orientación EXIF.
 * 4. Convierte a espacio sRGB e incrusta el perfil sRGB ICC.
 * 5. Descarta todo metadato sensible (EXIF/GPS).
 * 6. Limita el lado largo del archivo principal a máximo 2048 px (sin ampliar).
 * 7. Extrae dimensiones, proporción normalizada y color dominante.
 */
export async function procesarImagenFoto(bufferOriginal: Buffer): Promise<ResultadoProcesamientoFoto> {
  validarArchivoFoto(bufferOriginal)
  const huella = calcularHuellaSha256(bufferOriginal)

  // 1. Orientación y espacio de color seguro
  const transformacionBase = sharp(bufferOriginal)
    .rotate() // Respeta la orientación EXIF antes de limpiarla
    .toColorspace('srgb')
    .withIccProfile('srgb') // Preserva perfil de color sRGB para evitar alteraciones visuales

  // 2. Extraer dimensiones orientadas
  const metadataOrientada = await transformacionBase.metadata()
  const anchoOrig = metadataOrientada.width || 0
  const altoOrig = metadataOrientada.height || 0

  if (!anchoOrig || !altoOrig) {
    throw new Error('No se pudieron obtener las dimensiones de la imagen orientada.')
  }

  // 3. Proporción y color dominante
  const proporcion = calcularProporcion(anchoOrig, altoOrig)
  const colorDominante = await extraerColorDominante(transformacionBase.clone())

  // 4. Redimensionar el archivo principal a un tope de 2048 px en el lado largo
  const MAX_LADO_LARGO = 2048
  let instanciaPrincipal = transformacionBase.clone()

  if (anchoOrig > MAX_LADO_LARGO || altoOrig > MAX_LADO_LARGO) {
    if (anchoOrig >= altoOrig) {
      instanciaPrincipal = instanciaPrincipal.resize({ width: MAX_LADO_LARGO, withoutEnlargement: true })
    } else {
      instanciaPrincipal = instanciaPrincipal.resize({ height: MAX_LADO_LARGO, withoutEnlargement: true })
    }
  }

  // Generar JPEG optimizado calidad 88, sin metadatos privados
  const bufferPrincipal = await instanciaPrincipal
    .jpeg({ quality: 88, progressive: true })
    .toBuffer()

  const metaFinal = await sharp(bufferPrincipal).metadata()
  const anchoFinal = metaFinal.width || anchoOrig
  const altoFinal = metaFinal.height || altoOrig

  return {
    bufferPrincipal,
    ancho: anchoFinal,
    alto: altoFinal,
    colorDominante,
    huella,
    proporcion,
  }
}

/**
 * Generación dinámica de lienzos Open Graph (1200 × 630 px) con Sharp — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§3.2, §5.2.6, §12).
 */

import sharp from 'sharp'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

export interface OpcionesLienzoOg {
  bufferImagen: Buffer
  anchoOriginal?: number
  altoOriginal?: number
  nombreSitio?: string
  bufferLogo?: Buffer | null
}

const ANCHO_LIENZO = 1200
const ALTO_LIENZO = 630
const ANCHO_FOTO_MAX = 1104
const ALTO_FOTO_MAX = 494
const MARGEN_SUPERIOR = 40
const ALTO_FRANJA_MARCA = 96
const Y_FRANJA_MARCA = 534

/**
 * Calcula el parámetro corto ?v= para forzar la actualización de vista previa en redes sociales (§5.2.6.7).
 */
export function versionOg(updatedAtItem?: string | null, updatedAtAjustes?: string | null): string {
  const hash = crypto.createHash('sha1')
  hash.update(updatedAtItem || '')
  hash.update(':')
  hash.update(updatedAtAjustes || '')
  return hash.digest('hex').slice(0, 8)
}

/**
 * Genera el lienzo JPEG de 1200 × 630 px con fondo grafito / desenfoque adaptativo
 * y la marca en la franja inferior (§5.2.6).
 */
export async function generarLienzoOg({
  bufferImagen,
  anchoOriginal,
  altoOriginal,
  nombreSitio = 'Rod Díaz',
  bufferLogo,
}: OpcionesLienzoOg): Promise<Buffer> {
  // 1. Obtener metadatos de dimensiones de la imagen fuente si no vienen dados
  let ancho = anchoOriginal
  let alto = altoOriginal

  if (!ancho || !alto) {
    const meta = await sharp(bufferImagen).metadata()
    ancho = meta.width || 1200
    alto = meta.height || 800
  }

  const esVerticalOCuadrada = alto >= ancho * 0.95

  // 2. Escalar la imagen principal dentro del área disponible (1104 × 494) sin recorte
  const fotoEscaladaBuffer = await sharp(bufferImagen)
    .resize(ANCHO_FOTO_MAX, ALTO_FOTO_MAX, {
      fit: 'inside',
      withoutEnlargement: false,
    })
    .toBuffer()

  const metaFotoEscalada = await sharp(fotoEscaladaBuffer).metadata()
  const anchoEscalado = metaFotoEscalada.width || ANCHO_FOTO_MAX
  const altoEscalado = metaFotoEscalada.height || ALTO_FOTO_MAX

  // Posicionamiento centrado en el área de la foto (48 px márgenes laterales, 40 px arriba)
  const leftFoto = Math.round((ANCHO_LIENZO - anchoEscalado) / 2)
  const topFoto = Math.round(MARGEN_SUPERIOR + (ALTO_FOTO_MAX - altoEscalado) / 2)

  // 3. Crear el fondo
  let lienzoBase: sharp.Sharp

  if (esVerticalOCuadrada) {
    // Optimización WhatsApp / iMessage (§5.2.6.3 & §12):
    // Fondo de 1200 × 630 con la propia imagen desenfocada y atenuada
    const fondoDesenfoque = await sharp(bufferImagen)
      .resize(ANCHO_LIENZO, ALTO_LIENZO, {
        fit: 'cover',
        position: 'center',
      })
      .blur(30)
      .modulate({
        brightness: 0.35,
        saturation: 0.8,
      })
      .toBuffer()

    lienzoBase = sharp(fondoDesenfoque)
  } else {
    // Fondo plano grafito oficial #151515
    lienzoBase = sharp({
      create: {
        width: ANCHO_LIENZO,
        height: ALTO_LIENZO,
        channels: 3,
        background: { r: 0x15, g: 0x15, b: 0x15 },
      },
    })
  }

  // 4. Preparar la marca en la franja inferior de 96 px (§3.2)
  const capasAComponer: sharp.OverlayOptions[] = [
    {
      input: fotoEscaladaBuffer,
      left: leftFoto,
      top: topFoto,
    },
  ]

  if (bufferLogo) {
    try {
      const logoEscalado = await sharp(bufferLogo)
        .resize({ height: 32, width: 200, fit: 'inside' })
        .toBuffer()

      const metaLogo = await sharp(logoEscalado).metadata()
      const anchoLogo = metaLogo.width || 100
      const altoLogo = metaLogo.height || 32

      const leftLogo = Math.round((ANCHO_LIENZO - anchoLogo) / 2)
      const topLogo = Math.round(Y_FRANJA_MARCA + (ALTO_FRANJA_MARCA - altoLogo) / 2)

      capasAComponer.push({
        input: logoEscalado,
        left: leftLogo,
        top: topLogo,
      })
    } catch {
      // Fallback a texto si el logo no pudo procesarse
      agregarMarcaTexto(capasAComponer, nombreSitio)
    }
  } else {
    agregarMarcaTexto(capasAComponer, nombreSitio)
  }

  // 5. Componer capas y exportar en JPEG sRGB de alta eficiencia (< 300 KB)
  return await lienzoBase
    .composite(capasAComponer)
    .jpeg({
      quality: 82,
      progressive: true,
      mozjpeg: true,
    })
    .toBuffer()
}

function agregarMarcaTexto(capas: sharp.OverlayOptions[], texto: string) {
  const textoEscapado = texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const svgMarca = Buffer.from(`
    <svg width="${ANCHO_LIENZO}" height="${ALTO_FRANJA_MARCA}" viewBox="0 0 ${ANCHO_LIENZO} ${ALTO_FRANJA_MARCA}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .marca {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-weight: 500;
          font-size: 30px;
          fill: #ECECEC;
          letter-spacing: 0.05em;
        }
      </style>
      <text x="50%" y="58" class="marca" text-anchor="middle">${textoEscapado}</text>
    </svg>
  `)

  capas.push({
    input: svgMarca,
    left: 0,
    top: Y_FRANJA_MARCA,
  })
}

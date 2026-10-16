import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'
import { fotoPorSlug, ajustes } from '@/lib/contenido'
import { generarLienzoOg } from '@/lib/seo/lienzo-og'

export const revalidate = 86400 // 24 horas

interface RouteContext {
  params: Promise<{
    slug: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { slug } = await params

  // 1. Verificar si la foto existe y está visible (§5.2.6.8)
  const [resFoto, configGlobal] = await Promise.all([
    fotoPorSlug(slug),
    ajustes(),
  ])

  if (!resFoto || resFoto.tipo !== 'exito' || !resFoto.foto) {
    return new Response('Fotografía no encontrada o no disponible para vista previa.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const foto = resFoto.foto
  const nombreSitio = configGlobal?.nombreSitio || 'Rod Díaz'

  try {
    // 2. Localizar archivo de imagen en medios (preferir versión mediana de 1200 px)
    const nombreArchivo =
      foto.sizes?.mediana_jpg?.filename ||
      foto.sizes?.mediana_webp?.filename ||
      foto.filename ||
      ''

    const rutaArchivo = path.join(process.cwd(), 'medios/fotos', nombreArchivo)

    let bufferImagen: Buffer

    try {
      bufferImagen = await fs.readFile(rutaArchivo)
    } catch {
      // Si el archivo físico aún no está en disco (ej. entorno de desarrollo/pruebas),
      // generamos una imagen base Fine Art proporcional con Sharp para no fallar
      const ancho = foto.width || 1200
      const alto = foto.height || 800
      bufferImagen = await sharp({
        create: {
          width: ancho,
          height: alto,
          channels: 3,
          background: { r: 0x22, g: 0x22, b: 0x22 },
        },
      })
        .jpeg()
        .toBuffer()
    }

    // 3. Cargar logotipo si existe
    let bufferLogo: Buffer | null = null
    if (configGlobal?.logo && typeof configGlobal.logo === 'object' && configGlobal.logo.filename) {
      try {
        const rutaLogo = path.join(
          process.cwd(),
          'medios/auxiliares',
          configGlobal.logo.filename
        )
        bufferLogo = await fs.readFile(rutaLogo)
      } catch {
        bufferLogo = null
      }
    }

    // 4. Generar el lienzo Open Graph de 1200 × 630 px con Sharp
    const bufferOg = await generarLienzoOg({
      bufferImagen,
      anchoOriginal: foto.width || undefined,
      altoOriginal: foto.height || undefined,
      nombreSitio,
      bufferLogo,
    })

    return new Response(new Uint8Array(bufferOg), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error: any) {
    console.error(`[OG/Foto] Error al generar lienzo para ${slug}:`, error.message)
    return new Response('Error interno al generar el lienzo de vista previa.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

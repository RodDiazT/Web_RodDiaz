import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'
import { obtenerPayload, ajustes } from '@/lib/contenido'
import { generarLienzoOg } from '@/lib/seo/lienzo-og'

export const revalidate = 86400 // 24 horas

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params

  try {
    const payload = await obtenerPayload()
    const [medio, configGlobal] = await Promise.all([
      payload.findByID({ collection: 'medios', id }).catch(() => null),
      ajustes(),
    ])

    if (!medio) {
      return new Response('Medio no encontrado.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const nombreSitio = configGlobal?.nombreSitio || 'Rod Díaz'
    const nombreArchivo =
      medio.sizes?.mediana?.filename ||
      medio.filename ||
      ''

    const rutaArchivo = path.join(process.cwd(), 'medios/auxiliares', nombreArchivo)

    let bufferImagen: Buffer
    try {
      bufferImagen = await fs.readFile(rutaArchivo)
    } catch {
      const ancho = medio.width || 1200
      const alto = medio.height || 800
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

    // Cargar logotipo si existe
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

    const bufferOg = await generarLienzoOg({
      bufferImagen,
      anchoOriginal: medio.width || undefined,
      altoOriginal: medio.height || undefined,
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
    console.error(`[OG/Medio] Error al generar lienzo para medio ${id}:`, error.message)
    return new Response('Error interno al generar el lienzo de vista previa.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

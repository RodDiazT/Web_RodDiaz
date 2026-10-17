import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sql } from '@payloadcms/db-postgres'
import fs from 'fs'
import path from 'path'
import { entorno } from '@/lib/entorno'
import { revalidarRutasSeguras } from '@/lib/revalidacion'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })

    // Verificación de conexión con Postgres con timeout estricto de 2 segundos (despliegue §5.2.8)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de 2s excedido en base de datos')), 2000)
    )

    const dbPromise = payload.db.drizzle.execute(sql`SELECT 1`)
    await Promise.race([dbPromise, timeoutPromise])

    // Verificación de lectura del volumen de medios
    const rutaMedios = path.resolve(process.cwd(), entorno.RUTA_MEDIOS)
    if (!fs.existsSync(rutaMedios)) {
      // Si aún no existe en local o primer arranque, intentamos asegurar su acceso
      fs.mkdirSync(rutaMedios, { recursive: true })
    }
    await fs.promises.access(rutaMedios, fs.constants.R_OK)

    // Si la solicitud proviene del calentamiento interno al arrancar el contenedor,
    // invalidamos el caché generado sin BD durante `next build` antes de calentar las páginas.
    const ua = request.headers.get('user-agent') || ''
    if (ua === 'Web_RodDiaz_Warmup/1.0') {
      revalidarRutasSeguras(
        ['/', '/fotos', '/colecciones', '/sobre-mi', '/contacto', '/privacidad', '/condiciones', '/consulta'],
        ['ajustes', 'fotos', 'colecciones', 'paginas', 'medios']
      )
    }

    // Contrato estricto: 200 { "estado": "ok" } sin revelar versiones ni rutas
    return NextResponse.json(
      { estado: 'ok' },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('[Salud] Fallo en chequeo de salud:', error)
    // Contrato estricto: 503 { "estado": "falla" }
    return NextResponse.json(
      { estado: 'falla' },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  }
}

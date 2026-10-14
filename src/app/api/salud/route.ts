import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sql } from '@payloadcms/db-postgres'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const payload = await getPayload({ config })
    
    // Verificación activa de conexión con la base de datos PostgreSQL
    await payload.db.drizzle.execute(sql`SELECT 1`)

    return NextResponse.json(
      {
        estado: 'ok',
        servicio: 'web-roddiaz',
        entorno: process.env.ENTORNO || 'pruebas',
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('[Salud] Error en chequeo de base de datos:', error)
    return NextResponse.json(
      {
        estado: 'error',
        motivo: 'db_no_disponible',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  }
}

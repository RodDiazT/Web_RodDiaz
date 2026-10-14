/**
 * Tarea programada para purga automática de registros vencidos.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§5.2.11, §5.4)
 * y DocumentosTecnicos/consultas/consulta-copia.md (§5.2).
 * 
 * Reglas de retención:
 * 1. Intentos de acceso rechazados (IntentoAcceso): eliminación tras 90 días (marco normativo Ley 21.719).
 * 2. Consultas (Consulta): eliminación según fecha calculada en eliminarDespuesDe (12 meses o 30 días si spam).
 */

import { getPayload } from 'payload'
import config from '../payload.config'

export async function borrarRegistrosVencidos() {
  const payload = await getPayload({ config })
  const ahora = new Date()
  console.log(`[Tareas] Iniciando purga de registros vencidos a las ${ahora.toISOString()}...`)

  // 1. Borrar IntentosAcceso con más de 90 días
  const limite90Dias = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const intentosVencidos = await payload.find({
      collection: 'intentos-acceso',
      where: {
        fecha: {
          less_than: limite90Dias,
        },
      },
      limit: 500,
    })

    if (intentosVencidos.totalDocs > 0) {
      for (const intento of intentosVencidos.docs) {
        await payload.delete({
          collection: 'intentos-acceso',
          id: intento.id,
        })
      }
      console.log(`[Tareas] Se purgaron ${intentosVencidos.totalDocs} intentos de acceso con más de 90 días.`)
    } else {
      console.log('[Tareas] No hay intentos de acceso pendientes de purga.')
    }
  } catch (error) {
    console.error('[Tareas] Error al purgar intentos de acceso:', error)
  }

  // 2. Borrar Consultas con eliminarDespuesDe vencido
  try {
    const consultasVencidas = await payload.find({
      collection: 'consultas',
      where: {
        and: [
          {
            eliminarDespuesDe: {
              exists: true,
            },
          },
          {
            eliminarDespuesDe: {
              less_than_equal: ahora.toISOString(),
            },
          },
        ],
      },
      limit: 500,
    })

    if (consultasVencidas.totalDocs > 0) {
      for (const c of consultasVencidas.docs) {
        await payload.delete({
          collection: 'consultas',
          id: c.id,
        })
      }
      console.log(`[Tareas] Se purgaron ${consultasVencidas.totalDocs} consultas vencidas.`)
    } else {
      console.log('[Tareas] No hay consultas pendientes de purga.')
    }
  } catch (error) {
    console.error('[Tareas] Error al purgar consultas vencidas:', error)
  }

  console.log('[Tareas] Purga de registros finalizada.')
}

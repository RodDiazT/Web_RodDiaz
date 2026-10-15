/**
 * Tarea programada para purga automática de consultas vencidas y limpiezas de privacidad.
 * Especificado en DocumentosTecnicos/consultas/consulta-copia.md (§5.2.10, §5.4, §9 criterio 17).
 *
 * Reglas de conservación:
 * - Consultas legítimas: 12 meses desde última actividad.
 * - Consultas spam: 30 días desde su creación.
 * - Registro en logs sin datos personales (solo cantidad purgada).
 * - Limpieza de hashes de supresiones recientes en AjustesSitio con más de 45 días.
 */

import { getPayload } from 'payload'
import config from '../payload.config'

export async function borrarConsultasVencidas() {
  const payload = await getPayload({ config })
  const ahoraIso = new Date().toISOString()
  const ahoraMs = Date.now()

  let totalPurgadas = 0

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
              less_than_equal: ahoraIso,
            },
          },
        ],
      },
      limit: 500,
      overrideAccess: true,
    })

    if (consultasVencidas.totalDocs > 0) {
      for (const c of consultasVencidas.docs) {
        await payload.delete({
          collection: 'consultas',
          id: c.id,
          overrideAccess: true,
        })
        totalPurgadas += 1
      }
      console.log(`[Tareas/Consultas] Se purgaron ${totalPurgadas} consultas con plazo de conservación vencido.`)
    } else {
      console.log('[Tareas/Consultas] No hay consultas con plazo de conservación vencido.')
    }
  } catch (error: any) {
    console.error('[Tareas/Consultas] Error al purgar consultas vencidas:', error.message)
  }

  // Limpieza de supresiones recientes > 45 días en AjustesSitio (§5.2.9)
  try {
    const ajustes = await payload.findGlobal({
      slug: 'ajustes-sitio',
      overrideAccess: true,
    })

    if (Array.isArray(ajustes.supresionesRecientes)) {
      const limite45DiasMs = ahoraMs - 45 * 24 * 60 * 60 * 1000
      const filtradas = (ajustes.supresionesRecientes as any[]).filter((item) => {
        if (!item || !item.fecha) return false
        return new Date(item.fecha).getTime() > limite45DiasMs
      })

      if (filtradas.length !== (ajustes.supresionesRecientes as any[]).length) {
        await payload.updateGlobal({
          slug: 'ajustes-sitio',
          data: {
            supresionesRecientes: filtradas,
          },
          overrideAccess: true,
        })
        console.log('[Tareas/Consultas] Se limpiaron registros de supresión con más de 45 días.')
      }
    }
  } catch (error: any) {
    console.warn('[Tareas/Consultas] No se pudieron limpiar supresiones recientes:', error.message)
  }

  return totalPurgadas
}

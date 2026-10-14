/**
 * Control de acceso al panel y registro de intentos no autorizados.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§5.2.10).
 */

import { entorno } from './entorno'
import type { BasePayload } from 'payload'

/**
 * Valida si un correo electrónico pertenece a la lista permitida de administradores.
 */
export function esCorreoAutorizado(correo?: string | null): boolean {
  if (!correo) return false
  const limpio = correo.trim().toLowerCase()
  return entorno.listaCorreosAdmin.includes(limpio)
}

/**
 * Registra un intento de acceso rechazado en la colección IntentoAcceso.
 * Limita a un máximo de un registro por correo por hora para evitar saturación de la base de datos.
 */
export async function registrarIntentoRechazado(
  payload: BasePayload,
  correo: string,
  motivo: 'correo_no_autorizado' | 'error_proveedor' = 'correo_no_autorizado'
): Promise<void> {
  const correoLimpio = correo.trim().toLowerCase()
  const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  try {
    // Verificar si ya existe un intento registrado en la última hora para este correo
    const intentosRecientes = await payload.find({
      collection: 'intentos-acceso',
      where: {
        and: [
          {
            correo: {
              equals: correoLimpio,
            },
          },
          {
            fecha: {
              greater_than: unaHoraAtras,
            },
          },
        ],
      },
      limit: 1,
    })

    if (intentosRecientes.totalDocs > 0) {
      // Ya se registró un intento en la última hora; se omite
      return
    }

    // Registrar nuevo intento
    await payload.create({
      collection: 'intentos-acceso',
      data: {
        correo: correoLimpio,
        fecha: new Date().toISOString(),
        motivo,
      },
    })
  } catch (error) {
    console.error('[Acceso] Error al registrar intento rechazado:', error)
  }
}

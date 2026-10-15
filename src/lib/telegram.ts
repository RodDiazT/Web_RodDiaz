/**
 * Notificación push inmediata y resiliente a través de Bot de Telegram.
 * Especificado en DocumentosTecnicos/consultas/consulta-copia.md (§5.2.3, §12).
 *
 * Principio: Guardar primero y avisar después de forma asíncrona no bloqueante.
 * Si las credenciales no existen o la API de Telegram falla, la consulta no se ve afectada.
 */

import { entorno } from './entorno'

export interface DatosNotificacionTelegram {
  nombre: string
  correo: string
  telefono?: string | null
  ciudad?: string | null
  mensaje?: string | null
  tipo: 'copia' | 'general'
  items?: Array<{
    tituloFoto?: string
    slugFoto?: string
    nombreFormatoSnapshot?: string
    nombrePapelSnapshot?: string
  }>
}

/**
 * Escapa caracteres reservados para Telegram MarkdownV2 o texto seguro.
 */
function limpiarTexto(str: string): string {
  return str.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}

/**
 * Despacha aviso push al Bot de Telegram de Rod Díaz.
 * Ejecución no bloqueante.
 */
export async function notificarTelegramConsulta(
  datos: DatosNotificacionTelegram
): Promise<boolean> {
  const token = entorno.TELEGRAM_BOT_TOKEN
  const chatId = entorno.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    // Variables no configuradas: no es un error en entornos sin Telegram (p. ej. pruebas locales)
    return false
  }

  try {
    const ahoraChile = new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Santiago',
    }).format(new Date())

    const lineas: string[] = [
      datos.tipo === 'copia'
        ? '📸 *Nueva Consulta de Copia Fine Art*'
        : '✉️ *Nuevo Mensaje General*',
      `📅 ${ahoraChile}`,
      '',
      `👤 *Nombre:* ${datos.nombre}`,
      `📧 *Correo:* ${datos.correo}`,
    ]

    if (datos.telefono) {
      lineas.push(`📞 *Teléfono:* ${datos.telefono}`)
    }

    if (datos.ciudad) {
      lineas.push(`📍 *Ciudad:* ${datos.ciudad}`)
    }

    if (Array.isArray(datos.items) && datos.items.length > 0) {
      lineas.push('')
      lineas.push(`🖼️ *Obras solicitadas (${datos.items.length}):*`)
      for (const item of datos.items) {
        const titulo = item.tituloFoto || 'Fotografía'
        const formato = item.nombreFormatoSnapshot || 'Tamaño por definir'
        const papel = item.nombrePapelSnapshot ? ` · ${item.nombrePapelSnapshot}` : ''
        lineas.push(`• *${titulo}*: ${formato}${papel}`)
      }
    }

    if (datos.mensaje) {
      lineas.push('')
      lineas.push(`💬 *Mensaje:*`)
      lineas.push(`_${datos.mensaje.trim()}_`)
    }

    const cuerpoTexto = lineas.join('\n')

    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: cuerpoTexto,
        parse_mode: 'Markdown',
      }),
      signal: AbortSignal.timeout(5000), // Timeout 5s para no retener recursos
    })

    if (!respuesta.ok) {
      const errTexto = await respuesta.text().catch(() => '')
      console.warn('[Telegram] Aviso no enviado:', respuesta.status, errTexto)
      return false
    }

    return true
  } catch (error: any) {
    console.warn('[Telegram] Excepción al notificar consulta:', error.message)
    return false
  }
}

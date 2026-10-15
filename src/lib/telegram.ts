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
 * Escapa entidades HTML para Telegram HTML parse mode.
 */
function escaparHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
        ? '📸 <b>Nueva Consulta de Copia Fine Art</b>'
        : '✉️ <b>Nuevo Mensaje General</b>',
      `📅 ${escaparHtml(ahoraChile)}`,
      '',
      `👤 <b>Nombre:</b> ${escaparHtml(datos.nombre)}`,
      `📧 <b>Correo:</b> ${escaparHtml(datos.correo)}`,
    ]

    if (datos.telefono) {
      lineas.push(`📞 <b>Teléfono:</b> ${escaparHtml(datos.telefono)}`)
    }

    if (datos.ciudad) {
      lineas.push(`📍 <b>Ciudad:</b> ${escaparHtml(datos.ciudad)}`)
    }

    if (Array.isArray(datos.items) && datos.items.length > 0) {
      lineas.push('')
      lineas.push(`🖼️ <b>Obras solicitadas (${datos.items.length}):</b>`)
      for (const item of datos.items) {
        const titulo = item.tituloFoto || 'Fotografía'
        const formato = item.nombreFormatoSnapshot || 'Tamaño por definir'
        const papel = item.nombrePapelSnapshot ? ` · ${item.nombrePapelSnapshot}` : ''
        lineas.push(`• <b>${escaparHtml(titulo)}</b>: ${escaparHtml(formato)}${escaparHtml(papel)}`)
      }
    }

    if (datos.mensaje) {
      lineas.push('')
      lineas.push(`💬 <b>Mensaje:</b>`)
      lineas.push(`<i>${escaparHtml(datos.mensaje.trim())}</i>`)
    }

    const cuerpoTexto = lineas.join('\n')

    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: cuerpoTexto,
        parse_mode: 'HTML',
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

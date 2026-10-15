'use server'

/**
 * Server Action para el envío de consultas de copia y mensajes generales.
 * Especificado en DocumentosTecnicos/consultas/consulta-copia.md (§5.2, §5.3, §5.5, §6).
 *
 * Principios:
 * - Mejora progresiva: funciona con y sin JavaScript.
 * - Idempotencia mediante claveEnvio (UUID).
 * - Antispam en tres capas: límite por IP (memoria), trampa honeypot y tiempo mínimo 1.8s (HMAC).
 * - Preservación de snapshots inmutables de catálogo en la base de datos.
 * - Notificación push por Bot de Telegram asíncrona y no bloqueante.
 */

import { headers } from 'next/headers'
import { obtenerPayload, ajustes } from '@/lib/contenido'
import {
  validarConsulta,
  clasificarSpam,
  ItemConsultaInput,
} from '@/lib/consultas'
import { verificarLimiteIp } from '@/lib/limiteEnvios'
import { notificarTelegramConsulta } from '@/lib/telegram'

export interface EstadoAccionConsulta {
  estado: 'inicial' | 'exito' | 'error'
  errores?: Record<string, string>
  valores?: any
  resumen?: {
    nombre: string
    correo: string
    tipo: 'copia' | 'general'
    items: Array<{
      tituloFoto: string
      slugFoto: string
      formato?: string
      papel?: string
    }>
    aceptaPromociones: boolean
  }
}

export async function enviarConsulta(
  _estadoPrevio: EstadoAccionConsulta,
  formData: FormData
): Promise<EstadoAccionConsulta> {
  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headerList.get('x-real-ip') ||
    '127.0.0.1'

  const configGlobal = await ajustes()
  const correoContacto = configGlobal?.correoContacto || 'rodrigodiaztapia@gmail.com'

  // 1. Limitador de tasa por IP en memoria (5 por hora) (§5.2.5)
  const estadoIp = verificarLimiteIp(ip)
  if (!estadoIp.permitido) {
    return {
      estado: 'error',
      errores: {
        limite: `Recibimos varias consultas desde tu conexión. Intenta en una hora o escríbeme a ${correoContacto}.`,
      },
    }
  }

  // 2. Extracción de campos del formulario
  const nombre = String(formData.get('nombre') || '')
  const correo = String(formData.get('correo') || '')
  const telefono = String(formData.get('telefono') || '')
  const ciudad = String(formData.get('ciudad') || '')
  const mensaje = String(formData.get('mensaje') || '')
  const acepta = formData.get('acepta')
  const promociones = formData.get('promociones')
  const origen = (formData.get('origen') as any) || 'general'
  const claveEnvio = String(formData.get('claveEnvio') || '')
  const emitidoEn = formData.get('emitidoEn') as string
  const firma = formData.get('firma') as string
  const sitio_web = formData.get('sitio_web') as string

  // Extracción de ítems (soporta formato serializado JSON o campos de array formData)
  let itemsCrudos: ItemConsultaInput[] = []
  const itemsJson = formData.get('itemsJson')
  if (typeof itemsJson === 'string' && itemsJson.trim()) {
    try {
      itemsCrudos = JSON.parse(itemsJson)
    } catch {
      itemsCrudos = []
    }
  } else {
    // Lectura de campos indexados items[0][foto], etc. para envíos sin JS
    for (let i = 0; i < 5; i++) {
      const foto = formData.get(`items[${i}][foto]`)
      if (foto) {
        itemsCrudos.push({
          foto: String(foto),
          slugFoto: String(formData.get(`items[${i}][slugFoto]`) || foto),
          tituloFoto: String(formData.get(`items[${i}][tituloFoto]`) || ''),
          formato: formData.get(`items[${i}][formato]`) as string,
          papel: formData.get(`items[${i}][papel]`) as string,
        })
      }
    }
  }

  const valoresEntrada = {
    nombre,
    correo,
    telefono,
    ciudad,
    mensaje,
    acepta: Boolean(acepta),
    promociones: Boolean(promociones),
    items: itemsCrudos,
    origen,
    claveEnvio,
  }

  // 3. Verificación de Idempotencia (§5.2.4)
  const payload = await obtenerPayload()
  if (claveEnvio) {
    try {
      const existente = await payload.find({
        collection: 'consultas',
        where: { claveEnvio: { equals: claveEnvio } },
        limit: 1,
        overrideAccess: true,
      })

      if (existente.totalDocs > 0) {
        const c = existente.docs[0] as any
        return {
          estado: 'exito',
          resumen: {
            nombre: c.nombre,
            correo: c.correo,
            tipo: c.tipo,
            items: Array.isArray(c.items)
              ? c.items.map((it: any) => ({
                  tituloFoto: it.tituloFoto || 'Fotografía',
                  slugFoto: it.slugFoto || '',
                  formato: it.nombreFormatoSnapshot,
                  papel: it.nombrePapelSnapshot,
                }))
              : [],
            aceptaPromociones: Boolean(c.aceptaPromociones),
          },
        }
      }
    } catch {
      // Continuar si la comprobación falla
    }
  }

  // 4. Clasificación de Antispam (§5.2.5)
  const esSpam = clasificarSpam({
    trampa: sitio_web,
    emitidoEn,
    firma,
  })

  // 5. Validación de negocio
  const validacion = validarConsulta({
    nombre,
    correo,
    telefono,
    ciudad,
    mensaje,
    acepta,
    promociones,
    items: itemsCrudos,
  })

  if (!validacion.valido && !esSpam) {
    return {
      estado: 'error',
      errores: validacion.errores,
      valores: valoresEntrada,
    }
  }

  // 6. Preparar datos y snapshots inmutables de catálogo (§5.1)
  try {
    const ahoraIso = new Date().toISOString()

    // Obtener versión de política de privacidad activa (§5.1, §6)
    let versionPoliticaIso = ahoraIso
    try {
      const pagPrivacidad = await payload.find({
        collection: 'paginas',
        where: { slug: { equals: 'privacidad' } },
        limit: 1,
      })
      if (pagPrivacidad.totalDocs > 0) {
        const pag = pagPrivacidad.docs[0] as any
        versionPoliticaIso = pag.contenidoActualizadoEn || pag.updatedAt || ahoraIso
      }
    } catch {}

    // Resolver fotos y snapshots de catálogo
    const itemsProcesados: any[] = []
    const resumenItems: Array<{
      tituloFoto: string
      slugFoto: string
      formato?: string
      papel?: string
    }> = []

    for (const item of validacion.valores.items) {
      const slug = item.slugFoto || (typeof item.foto === 'string' ? item.foto : '')
      if (!slug) continue

      const busqFoto = await payload.find({
        collection: 'fotos',
        where: { slug: { equals: slug } },
        limit: 1,
      })

      if (busqFoto.totalDocs === 0) continue
      const fotoDoc = busqFoto.docs[0] as any

      // Solo fotos visibles y que ofrezcan copia (§5.2.2)
      if (fotoDoc.estado !== 'publicada' || !Array.isArray(fotoDoc.formatos) || fotoDoc.formatos.length === 0) {
        continue
      }

      let formatoSnapshot = item.nombreFormatoSnapshot
      let papelSnapshot = item.nombrePapelSnapshot
      let formatoId = item.formato ? String(item.formato) : null
      let papelId = item.papel ? String(item.papel) : null

      // Validar y snapshottear formato si existe
      if (formatoId) {
        const formatoDoc = fotoDoc.formatos.find((f: any) => {
          const id = typeof f === 'object' ? String(f.id) : String(f)
          return id === formatoId
        })

        if (formatoDoc && typeof formatoDoc === 'object') {
          formatoSnapshot =
            formatoSnapshot ||
            (formatoDoc.nombre || `${formatoDoc.ladoCortoCm} × ${formatoDoc.ladoLargoCm} cm`)

          // Validar y snapshottear papel si existe
          if (papelId && Array.isArray(formatoDoc.papeles)) {
            const papelDoc = formatoDoc.papeles.find((p: any) => {
              const id = typeof p === 'object' ? String(p.id) : String(p)
              return id === papelId
            })
            if (papelDoc && typeof papelDoc === 'object') {
              papelSnapshot = papelSnapshot || papelDoc.nombre
            } else {
              papelId = null
              papelSnapshot = undefined
            }
          }
        } else {
          formatoId = null
          formatoSnapshot = undefined
          papelId = null
          papelSnapshot = undefined
        }
      }

      itemsProcesados.push({
        foto: fotoDoc.id,
        tituloFoto: fotoDoc.titulo,
        slugFoto: fotoDoc.slug,
        formato: formatoId || undefined,
        papel: papelId || undefined,
        nombreFormatoSnapshot: formatoSnapshot || undefined,
        nombrePapelSnapshot: papelSnapshot || undefined,
      })

      resumenItems.push({
        tituloFoto: fotoDoc.titulo,
        slugFoto: fotoDoc.slug,
        formato: formatoSnapshot,
        papel: papelSnapshot,
      })
    }

    const tipoFinal = itemsProcesados.length > 0 ? 'copia' : 'general'

    // 7. Guardar en base de datos primero (§5.2.3)
    const consultaCreada = await payload.create({
      collection: 'consultas',
      data: {
        nombre: validacion.valores.nombre,
        correo: validacion.valores.correo,
        telefono: validacion.valores.telefono || undefined,
        ciudad: validacion.valores.ciudad || undefined,
        mensaje: validacion.valores.mensaje || undefined,
        tipo: tipoFinal,
        estado: esSpam ? 'spam' : 'nueva',
        items: itemsProcesados,
        consentimientoEn: ahoraIso,
        versionPolitica: versionPoliticaIso,
        aceptaPromociones: validacion.valores.promociones,
        origen,
        claveEnvio: claveEnvio || undefined,
      },
      overrideAccess: true,
    })

    // 8. Si aceptó promociones y no es spam, registrar o actualizar Suscriptor (§5.1, §5.2.13)
    if (validacion.valores.promociones && !esSpam) {
      try {
        const existente = await payload.find({
          collection: 'suscriptores',
          where: { correo: { equals: validacion.valores.correo } },
          limit: 1,
          overrideAccess: true,
        })

        if (existente.totalDocs > 0) {
          await payload.update({
            collection: 'suscriptores',
            id: existente.docs[0].id,
            data: {
              nombre: validacion.valores.nombre,
              consentimientoEn: ahoraIso,
              versionPolitica: versionPoliticaIso,
            },
            overrideAccess: true,
          })
        } else {
          await payload.create({
            collection: 'suscriptores',
            data: {
              nombre: validacion.valores.nombre,
              correo: validacion.valores.correo,
              consentimientoEn: ahoraIso,
              versionPolitica: versionPoliticaIso,
              origen: consultaCreada.id,
            },
            overrideAccess: true,
          })
        }
      } catch (err: any) {
        console.warn('[Suscriptores] Error al registrar suscriptor:', err.message)
      }
    }

    // 9. Despachar notificación push no bloqueante por Bot de Telegram (§5.2.3)
    if (!esSpam) {
      void notificarTelegramConsulta({
        nombre: validacion.valores.nombre,
        correo: validacion.valores.correo,
        telefono: validacion.valores.telefono,
        ciudad: validacion.valores.ciudad,
        mensaje: validacion.valores.mensaje,
        tipo: tipoFinal,
        items: resumenItems,
      })
    }

    // 10. Responder éxito al visitante (al bot también se le muestra éxito sin dar pistas)
    return {
      estado: 'exito',
      resumen: {
        nombre: validacion.valores.nombre,
        correo: validacion.valores.correo,
        tipo: tipoFinal,
        items: resumenItems,
        aceptaPromociones: validacion.valores.promociones,
      },
    }
  } catch (error: any) {
    console.error('[Consultas] Error al procesar consulta:', error)
    return {
      estado: 'error',
      errores: {
        guardado: `No pudimos enviar tu consulta. Lo que escribiste sigue aquí: intenta de nuevo en un momento o escríbeme a ${correoContacto}.`,
      },
      valores: valoresEntrada,
    }
  }
}

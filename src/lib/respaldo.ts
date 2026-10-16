/**
 * Módulo de generación y gestión de respaldos — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/despliegue.md (§3.2, §5.2.7, §5.3, §6).
 */

import zlib from 'zlib'
import fs from 'fs/promises'
import path from 'path'
import type { Payload } from 'payload'
import { entorno } from './entorno.ts'

export const VERSION_ESQUEMA_RESPALDO = '1.0'
export const LIMITE_VOLUMEN_MEDIOS_BYTES = 5 * 1024 * 1024 * 1024 // 5 GB por defecto en Railway

let generandoRespaldoEnCurso = false

export interface ManifiestoRespaldo {
  versionEsquema: string
  fecha: string
  commit?: string
  conteos: Record<string, number>
}

export interface EstructuraRespaldo {
  manifiesto: ManifiestoRespaldo
  globales: {
    ajustesSitio: any
  }
  colecciones: {
    fotos: any[]
    colecciones: any[]
    caracteristicas: any[]
    formatosImpresion: any[]
    tiposPapel: any[]
    paginas: any[]
    medios: any[]
    consultas: any[]
    suscriptores: any[]
    usuarios: any[]
  }
}

export interface EstadoRespaldo {
  ultimoRespaldoEn: string | null
  diasDesdeUltimo: number | null
  textoDias: string
  alertaDias: boolean
  espacioUsadoBytes: number
  espacioTotalBytes: number
  textoEspacio: string
  alertaEspacio: boolean
}

/**
 * Calcula recursivamente el tamaño en bytes de un directorio.
 */
export async function calcularTamanoDirectorio(dirPath: string): Promise<number> {
  let total = 0
  try {
    const entradas = await fs.readdir(dirPath, { withFileTypes: true })
    for (const entrada of entradas) {
      const rutaCompleta = path.join(dirPath, entrada.name)
      if (entrada.isDirectory()) {
        total += await calcularTamanoDirectorio(rutaCompleta)
      } else if (entrada.isFile()) {
        const stats = await fs.stat(rutaCompleta)
        total += stats.size
      }
    }
  } catch {
    // Si el directorio no existe o no es accesible, retorna 0
  }
  return total
}

/**
 * Formatea bytes a representación en GB con coma decimal (ej. "0,8 de 5 GB").
 */
export function formatearEspacioGb(usadoBytes: number, totalBytes: number = LIMITE_VOLUMEN_MEDIOS_BYTES): string {
  const gbUsados = usadoBytes / (1024 * 1024 * 1024)
  const gbTotales = Math.round(totalBytes / (1024 * 1024 * 1024))
  const textoGb = gbUsados < 0.05 && usadoBytes > 0 ? '0,1' : gbUsados.toFixed(1).replace('.', ',')
  return `${textoGb} de ${gbTotales} GB`
}

/**
 * Calcula la diferencia en días calendario entre dos instantes UTC.
 */
export function calcularDiasDesde(fechaIso?: string | null): number | null {
  if (!fechaIso) return null
  const fecha = new Date(fechaIso)
  if (isNaN(fecha.getTime())) return null

  const ahora = new Date()
  const diffMs = ahora.getTime() - fecha.getTime()
  if (diffMs < 0) return 0
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Obtiene el estado actual para la tarjeta de Respaldo del panel (§3.2).
 */
export async function obtenerEstadoRespaldo(payload?: Payload): Promise<EstadoRespaldo> {
  let ultimoRespaldoEn: string | null = null

  if (payload) {
    try {
      const config = await payload.findGlobal({ slug: 'ajustes-sitio' })
      ultimoRespaldoEn = (config as any)?.ultimoRespaldoEn || null
    } catch {
      // Ignorar si no hay conexión activa
    }
  }

  const dias = calcularDiasDesde(ultimoRespaldoEn)
  let textoDias = 'Aún no descargas un respaldo'
  let alertaDias = false

  if (dias !== null) {
    if (dias === 0) {
      textoDias = 'Último respaldo descargado: hace 0 días'
    } else if (dias <= 30) {
      textoDias = `Último respaldo descargado: hace ${dias} día${dias === 1 ? '' : 's'}`
    } else {
      textoDias = `Han pasado ${dias} días desde tu último respaldo`
      alertaDias = true
    }
  }

  // Medir volumen de imágenes
  const rutaBaseMedios = entorno.RUTA_MEDIOS || path.join(process.cwd(), 'medios')
  const espacioUsadoBytes = await calcularTamanoDirectorio(rutaBaseMedios)
  const espacioTotalBytes = LIMITE_VOLUMEN_MEDIOS_BYTES
  const textoEspacio = `Espacio de imágenes: ${formatearEspacioGb(espacioUsadoBytes, espacioTotalBytes)}`
  const alertaEspacio = espacioUsadoBytes >= espacioTotalBytes * 0.8 // Alerta desde el 80%

  return {
    ultimoRespaldoEn,
    diasDesdeUltimo: dias,
    textoDias,
    alertaDias,
    espacioUsadoBytes,
    espacioTotalBytes,
    textoEspacio,
    alertaEspacio,
  }
}

/**
 * Genera el paquete de respaldo comprimido en gzip conteniendo todas las entidades oficiales (§5.2.7).
 */
export async function generarRespaldoComprimido(payload: Payload, hashCommit?: string): Promise<Buffer> {
  if (generandoRespaldoEnCurso) {
    throw new Error('Ya hay una exportación de respaldo en curso. Espera a que finalice.')
  }

  generandoRespaldoEnCurso = true

  try {
    // 1. Extraer colecciones oficiales
    const [
      fotos,
      colecciones,
      caracteristicas,
      formatos,
      papeles,
      paginas,
      medios,
      consultas,
      suscriptores,
      usuariosRaw,
      ajustesSitio,
    ] = await Promise.all([
      payload.find({ collection: 'fotos', limit: 10000, pagination: false }),
      payload.find({ collection: 'colecciones', limit: 1000, pagination: false }),
      payload.find({ collection: 'caracteristicas', limit: 1000, pagination: false }),
      payload.find({ collection: 'formatos-impresion', limit: 1000, pagination: false }),
      payload.find({ collection: 'tipos-papel', limit: 1000, pagination: false }),
      payload.find({ collection: 'paginas', limit: 1000, pagination: false }),
      payload.find({ collection: 'medios', limit: 10000, pagination: false }),
      payload.find({ collection: 'consultas', limit: 10000, pagination: false }),
      payload.find({ collection: 'suscriptores', limit: 10000, pagination: false }),
      payload.find({ collection: 'usuarios', limit: 1000, pagination: false }),
      payload.findGlobal({ slug: 'ajustes-sitio' }),
    ])

    // Sanitizar usuarios: excluir tokens y hashes de recuperación (§5.2.7)
    const usuarios = usuariosRaw.docs.map((u: any) => {
      const limpio = { ...u }
      delete limpio.recuperacionHash
      delete limpio.recuperacionVence
      delete limpio.resetPasswordToken
      delete limpio.resetPasswordExpiration
      delete limpio.salt
      delete limpio.hash
      return limpio
    })

    const conteos: Record<string, number> = {
      fotos: fotos.docs.length,
      colecciones: colecciones.docs.length,
      caracteristicas: caracteristicas.docs.length,
      formatosImpresion: formatos.docs.length,
      tiposPapel: papeles.docs.length,
      paginas: paginas.docs.length,
      medios: medios.docs.length,
      consultas: consultas.docs.length,
      suscriptores: suscriptores.docs.length,
      usuarios: usuarios.length,
    }

    const estructura: EstructuraRespaldo = {
      manifiesto: {
        versionEsquema: VERSION_ESQUEMA_RESPALDO,
        fecha: new Date().toISOString(),
        commit: hashCommit || process.env.RAILWAY_GIT_COMMIT_SHA || undefined,
        conteos,
      },
      globales: {
        ajustesSitio,
      },
      colecciones: {
        fotos: fotos.docs,
        colecciones: colecciones.docs,
        caracteristicas: caracteristicas.docs,
        formatosImpresion: formatos.docs,
        tiposPapel: papeles.docs,
        paginas: paginas.docs,
        medios: medios.docs,
        consultas: consultas.docs,
        suscriptores: suscriptores.docs,
        usuarios,
      },
    }

    // 2. Serializar a JSON y comprimir en Gzip
    const jsonString = JSON.stringify(estructura)
    const bufferComprimido = zlib.gzipSync(Buffer.from(jsonString, 'utf-8'), { level: 9 })

    // 3. Registrar fecha de respaldo en AjustesSitio (§5.3)
    try {
      await payload.updateGlobal({
        slug: 'ajustes-sitio',
        data: {
          ultimoRespaldoEn: estructura.manifiesto.fecha,
        },
      })
    } catch (err: any) {
      console.warn('[Respaldo] No se pudo actualizar ultimoRespaldoEn en ajustes-sitio:', err.message)
    }

    return bufferComprimido
  } finally {
    generandoRespaldoEnCurso = false
  }
}

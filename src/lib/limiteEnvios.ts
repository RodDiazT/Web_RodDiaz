/**
 * Limitador de tasa por IP en memoria para envíos de consultas.
 * Especificado en DocumentosTecnicos/consultas/consulta-copia.md (§5.2.5, §5.6).
 *
 * Reglas:
 * - Máximo 5 envíos por hora por IP.
 * - La IP se resume con SHA-256 más una sal diaria volátil en memoria.
 * - NUNCA se almacena la IP en disco ni en base de datos.
 * - Al reiniciar el servicio el mapa se reinicia en memoria (arquitectura de servicio único).
 */

import crypto from 'crypto'

interface RegistroLimite {
  conteo: number
  expiraEn: number
}

// Sal diaria en memoria para no almacenar hashes estables
let salDiaria = crypto.randomBytes(16).toString('hex')
let diaSalActual = new Date().getUTCDate()

function obtenerSalDiaria(): string {
  const diaHoy = new Date().getUTCDate()
  if (diaHoy !== diaSalActual) {
    diaSalActual = diaHoy
    salDiaria = crypto.randomBytes(16).toString('hex')
    mapaEnvios.clear() // Limpieza automática diaria
  }
  return salDiaria
}

const mapaEnvios = new Map<string, RegistroLimite>()

const LIMITE_POR_HORA = 5
const VENTANA_MS = 60 * 60 * 1000 // 1 hora

/**
 * Genera el hash irreversible de la IP.
 */
export function hashearIp(ip: string): string {
  const sal = obtenerSalDiaria()
  return crypto.createHash('sha256').update(`${sal}:${ip.trim()}`).digest('hex')
}

/**
 * Evalúa si una IP tiene permitido enviar una consulta.
 * Si está dentro del límite, incrementa el contador.
 */
export function verificarLimiteIp(ip: string): {
  permitido: boolean
  restantes: number
  restableceEnMs: number
} {
  const ahora = Date.now()
  const hash = hashearIp(ip || '127.0.0.1')

  const registro = mapaEnvios.get(hash)

  // Si no existe o ya expiró la ventana de 1 hora
  if (!registro || ahora > registro.expiraEn) {
    mapaEnvios.set(hash, {
      conteo: 1,
      expiraEn: ahora + VENTANA_MS,
    })
    return {
      permitido: true,
      restantes: LIMITE_POR_HORA - 1,
      restableceEnMs: VENTANA_MS,
    }
  }

  // Si aún está dentro de la ventana
  if (registro.conteo >= LIMITE_POR_HORA) {
    return {
      permitido: false,
      restantes: 0,
      restableceEnMs: Math.max(0, registro.expiraEn - ahora),
    }
  }

  registro.conteo += 1
  return {
    permitido: true,
    restantes: LIMITE_POR_HORA - registro.conteo,
    restableceEnMs: Math.max(0, registro.expiraEn - ahora),
  }
}

/**
 * Resetea el registro en memoria (útil para pruebas unitarias).
 */
export function reiniciarLimitesPruebas(): void {
  mapaEnvios.clear()
}

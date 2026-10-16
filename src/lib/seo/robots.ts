/**
 * Definiciones y validaciones de robots y rastreadores — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§5.2.10, §4).
 */

export const ROBOTS_BUSCADORES_PROHIBIDOS = [
  '*',
  'googlebot',
  'googlebot-image',
  'bingbot',
  'oai-searchbot',
  'chatgpt-user',
  'claude-searchbot',
  'claude-user',
  'perplexitybot',
] as const

export const ROBOTS_ENTRENAMIENTO_POR_DEFECTO = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
] as const

/**
 * Valida que un identificador de robot no corresponda a un buscador o asistente de búsqueda.
 * Si intenta bloquear un buscador esencial, lanza el error oficial (§4).
 */
export function validarRobotExcluido(robot: string): void {
  if (!robot) return
  const limpio = robot.trim().toLowerCase()
  if ((ROBOTS_BUSCADORES_PROHIBIDOS as readonly string[]).includes(limpio)) {
    throw new Error('Ese robot es de un buscador; bloquearlo te sacaría de las búsquedas.')
  }
}

/**
 * Normaliza cualquier formato en que venga configurada la lista de robots excluidos
 * (array de strings, array de objetos, JSON parseado o texto con saltos de línea/comas).
 */
export function normalizarRobotsExcluidos(raw: any): string[] {
  if (!raw) {
    return [...ROBOTS_ENTRENAMIENTO_POR_DEFECTO]
  }

  let lista: string[] = []

  if (Array.isArray(raw)) {
    lista = raw
      .map((item) => (typeof item === 'object' && item ? item.robot || item.nombre || '' : String(item)))
      .map((s) => s.trim())
      .filter(Boolean)
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return normalizarRobotsExcluidos(parsed)
      }
    } catch {
      // Es texto plano separado por comas o saltos de línea
      lista = raw
        .split(/[\r\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }

  // Deduplicar manteniendo orden
  const unicos = new Set<string>()
  for (const r of lista) {
    if (r) unicos.add(r)
  }

  return unicos.size > 0 ? Array.from(unicos) : [...ROBOTS_ENTRENAMIENTO_POR_DEFECTO]
}

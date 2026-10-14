/**
 * Manejo y validación de cursores opacos para paginación estable de fotos.
 * Especificado en DocumentosTecnicos/portafolio/galeria-colecciones.md (§5.2.8, §5.3).
 */

export interface DatosCursor {
  id: string | number
  publicadaEn?: string
  ordenFijada?: number
  esFijada?: boolean
}

/**
 * Codifica los datos de posición en un cursor opaco en base64 seguro para URL.
 */
export function codificarCursor(datos: DatosCursor): string {
  const json = JSON.stringify(datos)
  return Buffer.from(json, 'utf8').toString('base64url')
}

/**
 * Decodifica y valida un cursor opaco. Devuelve null si está corrupto o es inválido.
 */
export function decodificarCursor(cursor: string): DatosCursor | null {
  if (!cursor || typeof cursor !== 'string') return null

  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8')
    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.id === undefined || parsed.id === null) return null

    return {
      id: parsed.id,
      publicadaEn: typeof parsed.publicadaEn === 'string' ? parsed.publicadaEn : undefined,
      ordenFijada: typeof parsed.ordenFijada === 'number' ? parsed.ordenFijada : undefined,
      esFijada: Boolean(parsed.esFijada),
    }
  } catch {
    return null
  }
}

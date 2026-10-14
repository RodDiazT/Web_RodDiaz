/**
 * Utilidades para generación y normalización de slugs y gestión de slugs anteriores.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§4 y §5.4).
 */

export function generarSlug(texto: string, maxLongitud: number = 120): string {
  if (!texto) return ''

  const normalizado = texto
    .normalize('NFD') // Descompone caracteres con acento
    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas diacríticas (tildes, etc.)
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'n')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Caracteres no alfanuméricos a guion
    .replace(/^-+|-+$/g, '') // Quita guiones iniciales y finales
    .replace(/-{2,}/g, '-') // Colapsa múltiples guiones seguidos

  return normalizado.slice(0, maxLongitud).replace(/-+$/, '')
}

/**
 * Actualiza la lista de slugs históricos sin duplicados cuando un slug es renombrado.
 */
export function actualizarSlugsAnteriores(
  slugNuevo: string,
  slugAnterior?: string | null,
  listaPrevia?: string[] | null
): string[] {
  const existentes = new Set(listaPrevia || [])

  if (slugAnterior && slugAnterior !== slugNuevo) {
    existentes.add(slugAnterior)
  }

  // El slug actual nunca debe figurar en los slugs anteriores
  existentes.delete(slugNuevo)

  return Array.from(existentes)
}

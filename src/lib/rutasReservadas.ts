/**
 * Lista exhaustiva de rutas y slugs reservados por el sistema.
 * Especificado en DocumentosTecnicos/paginas/paginas.md (§4, §5.1, §5.4).
 * 
 * Ninguna página libre editable por el administrador puede utilizar uno de estos slugs.
 */

export const SLUGS_RESERVADOS_PAGINAS = [
  'sobre-mi',
  'contacto',
  'privacidad',
  'condiciones',
] as const

export const RUTAS_RESERVADAS_SITIO = [
  ...SLUGS_RESERVADOS_PAGINAS,
  'fotos',
  'colecciones',
  'consulta',
  'admin',
  'api',
  'datos',
  'sitemap.xml',
  'robots.txt',
  'guia-estilo',
  'og',
  'icon.svg',
] as const

export type SlugReservadoPagina = (typeof SLUGS_RESERVADOS_PAGINAS)[number]

/**
 * Verifica si un slug coincide con alguna de las rutas reservadas del sistema.
 */
export function esRutaReservada(slug: string): boolean {
  if (!slug) return false
  const normalizado = slug.trim().toLowerCase()
  return (RUTAS_RESERVADAS_SITIO as readonly string[]).includes(normalizado)
}

/**
 * Verifica si un slug corresponde a una de las cuatro páginas institucionales reservadas.
 */
export function esPaginaReservada(slug: string): boolean {
  if (!slug) return false
  const normalizado = slug.trim().toLowerCase()
  return (SLUGS_RESERVADOS_PAGINAS as readonly string[]).includes(normalizado)
}

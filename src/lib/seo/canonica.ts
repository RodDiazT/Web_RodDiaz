/**
 * Normalización de URLs canónicas absolutas — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§5.2.3, §5.2.4, §4).
 */

import { entorno } from '../entorno.ts'

export interface ParametrosCanonica {
  caracteristica?: string | null
  pagina?: number | string | null
  coleccion?: string | null
  [key: string]: any
}

/**
 * Normaliza y construye la URL canónica absoluta oficial para una ruta dada.
 */
export function canonicaPara(
  ruta: string,
  parametros?: ParametrosCanonica | null,
  urlSitioBase?: string | null
): string {
  const base = (urlSitioBase || entorno.URL_SITIO || 'http://localhost:3000').replace(/\/+$/, '')
  const rutaLimpia = (ruta || '/').split('?')[0].trim()
  const rutaNormalizada = rutaLimpia.startsWith('/') ? rutaLimpia : `/${rutaLimpia}`

  // Caso especial: portada
  if (rutaNormalizada === '/' || rutaNormalizada === '') {
    return `${base}/`
  }

  // Caso especial: ficha de foto (/fotos/[slug])
  // En ficha nunca se conservan parámetros de query (ni contexto ni campañas) (§4, §5.2.3)
  if (rutaNormalizada.startsWith('/fotos/') && rutaNormalizada !== '/fotos') {
    return `${base}${rutaNormalizada}`
  }

  // Caso: listado general /fotos
  if (rutaNormalizada === '/fotos') {
    const paramsOut = new URLSearchParams()

    // 1. caracteristica
    if (parametros?.caracteristica && typeof parametros.caracteristica === 'string') {
      const c = parametros.caracteristica.trim()
      if (c) {
        paramsOut.set('caracteristica', c)
      }
    }

    // 2. pagina (solo si N >= 2)
    const paginaNum = Number(parametros?.pagina)
    if (paginaNum >= 2) {
      paramsOut.set('pagina', String(paginaNum))
    }

    const query = paramsOut.toString()
    return query ? `${base}/fotos?${query}` : `${base}/fotos`
  }

  // Caso: colecciones (/colecciones/[slug])
  if (rutaNormalizada.startsWith('/colecciones/') && rutaNormalizada !== '/colecciones') {
    // Si viene con filtro ?caracteristica=, la canónica descarta el filtro (§4)
    // Solo conserva pagina si N >= 2
    const paginaNum = Number(parametros?.pagina)
    if (paginaNum >= 2) {
      return `${base}${rutaNormalizada}?pagina=${paginaNum}`
    }
    return `${base}${rutaNormalizada}`
  }

  // Caso: listado /colecciones
  if (rutaNormalizada === '/colecciones') {
    const paginaNum = Number(parametros?.pagina)
    if (paginaNum >= 2) {
      return `${base}/colecciones?pagina=${paginaNum}`
    }
    return `${base}/colecciones`
  }

  // Cualquier otra ruta pública (páginas, contacto, etc.): sin parámetros
  return `${base}${rutaNormalizada}`
}

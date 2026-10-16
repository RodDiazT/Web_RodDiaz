import type { MetadataRoute } from 'next'
import { ajustes } from '@/lib/contenido'
import { entorno } from '@/lib/entorno'
import { normalizarRobotsExcluidos } from '@/lib/seo/robots'

export const revalidate = 86400 // 24 horas

/**
 * Generador de archivo robots.txt — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§5.2.10, §4).
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const urlSitio = (entorno.URL_SITIO || 'http://localhost:3000').replace(/\/+$/, '')

  // En entornos de prueba o pre-producción: excluir todo (§4, §5.2.10)
  if (entorno.ENTORNO !== 'produccion') {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    }
  }

  // En producción: permitir buscadores y rastreo, excluir admin y datos,
  // y bloquear bots de entrenamiento de IA según decisión de Rod
  const configGlobal = await ajustes()
  const robotsExcluidos = normalizarRobotsExcluidos(
    (configGlobal as any)?.seo?.robotsExcluidos || (configGlobal as any)?.robotsExcluidos
  )

  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      disallow: ['/admin', '/datos/'],
    },
  ]

  if (robotsExcluidos.length > 0) {
    rules.push({
      userAgent: robotsExcluidos,
      disallow: '/',
    })
  }

  return {
    rules,
    sitemap: `${urlSitio}/sitemap.xml`,
  }
}

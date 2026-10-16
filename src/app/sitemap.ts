import type { MetadataRoute } from 'next'
import {
  obtenerPayload,
  fotosVisibles,
  coleccionesListadas,
  caracteristicasConFotos,
} from '@/lib/contenido'
import { entorno } from '@/lib/entorno'

export const revalidate = 86400 // 24 horas

/**
 * Generador de mapa del sitio /sitemap.xml — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§5.2.9, §5.3, §9 criterio 11).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urlSitio = (entorno.URL_SITIO || 'http://localhost:3000').replace(/\/+$/, '')
  const ahora = new Date()

  // 1. Rutas estáticas raíz obligatorias
  const rutas: MetadataRoute.Sitemap = [
    {
      url: `${urlSitio}/`,
      lastModified: ahora,
    },
    {
      url: `${urlSitio}/fotos`,
      lastModified: ahora,
    },
    {
      url: `${urlSitio}/colecciones`,
      lastModified: ahora,
    },
  ]

  try {
    const payload = await obtenerPayload()

    // 2. Fichas de fotos visibles (con imagen asociada 2048px en sitemap)
    const resFotos = await fotosVisibles({ limit: 1000 })
    let ultimaModificacionFotos = ahora

    for (const foto of resFotos.docs as any[]) {
      if (foto.slug) {
        const fechaFoto = foto.updatedAt ? new Date(foto.updatedAt) : ahora
        if (fechaFoto > ultimaModificacionFotos) {
          ultimaModificacionFotos = fechaFoto
        }

        let urlImg =
          foto.sizes?.grande_webp?.url ||
          foto.sizes?.mediana_webp?.url ||
          foto.url

        if (!urlImg) {
          const fn = foto.sizes?.grande_webp?.filename || foto.sizes?.mediana_webp?.filename || foto.filename
          if (fn) {
            urlImg = `/api/fotos/file/${fn}`
          }
        }

        if (urlImg && !urlImg.startsWith('http')) {
          urlImg = `${urlSitio}${urlImg.startsWith('/') ? '' : '/'}${urlImg}`
        }

        rutas.push({
          url: `${urlSitio}/fotos/${foto.slug}`,
          lastModified: fechaFoto,
          images: urlImg ? [urlImg] : undefined,
        })
      }
    }

    // Actualizar rutas de portada y fotos con la fecha más reciente
    rutas[0].lastModified = ultimaModificacionFotos
    rutas[1].lastModified = ultimaModificacionFotos

    // 3. Colecciones visibles (madres e hijas con visibleSola = true)
    const coleccionesMadre = await coleccionesListadas()
    for (const col of coleccionesMadre) {
      rutas.push({
        url: `${urlSitio}/colecciones/${col.slug}`,
        lastModified: col.updatedAt ? new Date(col.updatedAt) : ahora,
      })
    }

    // Hijas con visibleSola
    const resHijas = await payload.find({
      collection: 'colecciones',
      where: {
        and: [
          { estado: { equals: 'publicada' } },
          { padre: { exists: true } },
          { visibleSola: { equals: true } },
        ],
      },
      limit: 100,
    })

    for (const hija of resHijas.docs) {
      // Verificar que tenga al menos una foto visible
      const fotosHija = await fotosVisibles({ coleccionSlug: hija.slug, limit: 1 })
      if (fotosHija.docs.length > 0) {
        rutas.push({
          url: `${urlSitio}/colecciones/${hija.slug}`,
          lastModified: hija.updatedAt ? new Date(hija.updatedAt) : ahora,
        })
      }
    }

    // 4. Características que tienen al menos una foto visible
    const caracteristicas = await caracteristicasConFotos()
    for (const car of caracteristicas) {
      rutas.push({
        url: `${urlSitio}/fotos?caracteristica=${car.slug}`,
        lastModified: ahora,
      })
    }

    // 5. Páginas publicadas (reservadas y libres)
    const resPaginas = await payload.find({
      collection: 'paginas',
      where: {
        estado: { equals: 'publicada' },
      },
      limit: 100,
    })

    for (const pag of resPaginas.docs) {
      if (pag.slug) {
        rutas.push({
          url: `${urlSitio}/${pag.slug}`,
          lastModified: pag.contenidoActualizadoEn
            ? new Date(pag.contenidoActualizadoEn)
            : pag.updatedAt
            ? new Date(pag.updatedAt)
            : ahora,
        })
      }
    }
  } catch {
    // Si la base de datos no está activa durante la compilación estática,
    // se entregan las rutas base
  }

  return rutas
}

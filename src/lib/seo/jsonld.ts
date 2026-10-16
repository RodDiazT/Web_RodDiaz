/**
 * Generador de datos estructurados JSON-LD (@graph) — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§5.2.7, §5.2.8, §5.5).
 */

import { canonicaPara } from './canonica.ts'
import type { ParametrosCanonica } from './canonica.ts'
import { descripcionPara } from './descripciones.ts'
import { entorno } from '../entorno.ts'

export interface OpcionesJsonLd {
  tipo:
    | 'portada'
    | 'fotos'
    | 'foto'
    | 'colecciones'
    | 'coleccion'
    | 'caracteristica'
    | 'sobre-mi'
    | 'pagina'
  datos?: any
  ajustes?: any
  ruta: string
  parametros?: ParametrosCanonica | null
  condicionesPublicada?: boolean
  imagenSobreMiUrl?: string | null
}

/**
 * Serializa un objeto a JSON de forma segura para incrustar en <script type="application/ld+json">,
 * reemplazando caracteres peligrosos (<, >, &) por secuencias de escape unicode (§5.5).
 */
export function serializarJsonLdSeguro(data: any): string {
  const json = JSON.stringify(data)
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/**
 * Construye el grafo JSON-LD completo según la ruta y la entidad (§5.2.7).
 */
export function jsonLdPara({
  tipo,
  datos,
  ajustes,
  ruta,
  parametros,
  condicionesPublicada = true,
  imagenSobreMiUrl,
}: OpcionesJsonLd): Record<string, any> {
  const urlSitio = (entorno.URL_SITIO || 'http://localhost:3000').replace(/\/+$/, '')
  const S = ajustes?.nombreSitio?.trim() || 'Rod Díaz'
  const idSitio = `${urlSitio}/#sitio`
  const idAutor = `${urlSitio}/#autor`

  // Redes sociales para Person.sameAs
  const redes: string[] = []
  if (Array.isArray(ajustes?.redes)) {
    for (const r of ajustes.redes) {
      if (r?.url && typeof r.url === 'string') {
        redes.push(r.url.trim())
      }
    }
  }

  // 1. Nodos comunes presentes en todas las páginas indexables: WebSite y Person
  const nodoSitio: Record<string, any> = {
    '@type': 'WebSite',
    '@id': idSitio,
    name: S,
    url: `${urlSitio}/`,
    inLanguage: 'es-CL',
    publisher: {
      '@id': idAutor,
    },
  }

  const nodoAutor: Record<string, any> = {
    '@type': 'Person',
    '@id': idAutor,
    name: S,
    url: `${urlSitio}/`,
    description:
      ajustes?.descripcion?.trim() ||
      'Fotógrafo de naturaleza y expediciones en Chile y Sudamérica.',
  }

  if (redes.length > 0) {
    nodoAutor.sameAs = redes
  }

  if (imagenSobreMiUrl) {
    nodoAutor.image = imagenSobreMiUrl
  }

  const grafo: any[] = [nodoSitio, nodoAutor]

  // 2. Nodos específicos según tipo de página
  switch (tipo) {
    case 'foto': {
      const foto = datos
      if (foto) {
        // Migas de pan: Inicio -> (Madre) -> Colección -> Foto
        const itemsBreadcrumb: any[] = [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: `${urlSitio}/`,
          },
        ]

        let pos = 2
        if (foto.coleccion) {
          const col = foto.coleccion
          if (col.padre && typeof col.padre === 'object') {
            itemsBreadcrumb.push({
              '@type': 'ListItem',
              position: pos++,
              name: col.padre.nombre,
              item: `${urlSitio}/colecciones/${col.padre.slug}`,
            })
          }
          itemsBreadcrumb.push({
            '@type': 'ListItem',
            position: pos++,
            name: col.nombre,
            item: `${urlSitio}/colecciones/${col.slug}`,
          })
        }

        itemsBreadcrumb.push({
          '@type': 'ListItem',
          position: pos,
          name: foto.titulo,
          item: `${urlSitio}/fotos/${foto.slug}`,
        })

        grafo.push({
          '@type': 'BreadcrumbList',
          itemListElement: itemsBreadcrumb,
        })

        // Versiones de imagen para ImageObject
        let contentUrl = foto.url
        let thumbnailUrl = foto.url
        let anchoImg = foto.width || 2048
        let altoImg = foto.height || 1365

        if (foto.sizes?.grande_webp?.url) {
          contentUrl = foto.sizes.grande_webp.url
          anchoImg = foto.sizes.grande_webp.width || anchoImg
          altoImg = foto.sizes.grande_webp.height || altoImg
        } else if (foto.sizes?.mediana_webp?.url) {
          contentUrl = foto.sizes.mediana_webp.url
        }

        if (foto.sizes?.pequena_webp?.url) {
          thumbnailUrl = foto.sizes.pequena_webp.url
        }

        // Asegurar URLs absolutas
        if (contentUrl && !contentUrl.startsWith('http')) {
          contentUrl = `${urlSitio}${contentUrl}`
        }
        if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
          thumbnailUrl = `${urlSitio}${thumbnailUrl}`
        }

        const anioToma = foto.fecha ? new Date(foto.fecha).getFullYear() : new Date().getFullYear()
        const fechaDia = foto.fecha ? new Date(foto.fecha).toISOString().split('T')[0] : undefined

        const descripcionFoto = descripcionPara('foto', foto, ajustes)

        // Nodo ImageObject con licencia Fine Art (§5.2.8)
        const nodoImagen: Record<string, any> = {
          '@type': 'ImageObject',
          representativeOfPage: true,
          contentUrl,
          thumbnailUrl,
          width: anchoImg,
          height: altoImg,
          name: foto.titulo,
          description: descripcionFoto,
          caption: foto.textoAlternativo || foto.titulo,
          dateCreated: fechaDia,
          datePublished: foto.publicadaEn || undefined,
          creator: {
            '@id': idAutor,
          },
          creditText: S,
          copyrightNotice: `© ${anioToma} ${S}`,
          copyrightHolder: {
            '@id': idAutor,
          },
        }

        if (foto.lugar) {
          nodoImagen.contentLocation = {
            '@type': 'Place',
            name: foto.lugar,
          }
        }

        // Etiqueta "Con licencia" de Google Imágenes (§5.2.8)
        if (condicionesPublicada) {
          nodoImagen.license = `${urlSitio}/condiciones`

          const ofreceCopia = Boolean(
            foto.ofreceCopia !== false &&
            Array.isArray(foto.formatos) &&
            foto.formatos.length > 0
          )

          if (ofreceCopia) {
            nodoImagen.acquireLicensePage = `${urlSitio}/consulta?foto=${foto.slug}&origen=licencia`
          } else {
            nodoImagen.acquireLicensePage = `${urlSitio}/consulta?origen=licencia`
          }
        }

        grafo.push(nodoImagen)
      }
      break
    }

    case 'coleccion': {
      const col = datos
      if (col) {
        // Migas de pan: Inicio -> Colecciones -> (Madre) -> Colección
        const itemsBreadcrumb: any[] = [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: `${urlSitio}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Colecciones',
            item: `${urlSitio}/colecciones`,
          },
        ]

        let pos = 3
        if (col.padre && typeof col.padre === 'object') {
          itemsBreadcrumb.push({
            '@type': 'ListItem',
            position: pos++,
            name: col.padre.nombre,
            item: `${urlSitio}/colecciones/${col.padre.slug}`,
          })
        }

        itemsBreadcrumb.push({
          '@type': 'ListItem',
          position: pos,
          name: col.nombre,
          item: `${urlSitio}/colecciones/${col.slug}`,
        })

        grafo.push({
          '@type': 'BreadcrumbList',
          itemListElement: itemsBreadcrumb,
        })

        const nodoColeccion: Record<string, any> = {
          '@type': 'CollectionPage',
          name: col.nombre,
          description: col.descripcion || descripcionPara('coleccion', col, ajustes),
          url: canonicaPara(ruta, parametros, urlSitio),
        }

        if (col.portada?.url) {
          const urlPortada = col.portada.url.startsWith('http')
            ? col.portada.url
            : `${urlSitio}${col.portada.url}`
          nodoColeccion.primaryImageOfPage = urlPortada
        }

        grafo.push(nodoColeccion)
      }
      break
    }

    case 'fotos':
    case 'colecciones':
    case 'caracteristica': {
      grafo.push({
        '@type': 'CollectionPage',
        name: datos?.nombre || (tipo === 'fotos' ? 'Fotos' : 'Colecciones'),
        description: descripcionPara(tipo, datos, ajustes),
        url: canonicaPara(ruta, parametros, urlSitio),
      })
      break
    }

    case 'sobre-mi': {
      grafo.push({
        '@type': 'ProfilePage',
        name: datos?.titulo || `Sobre mí · ${S}`,
        url: `${urlSitio}/sobre-mi`,
        mainEntity: {
          '@id': idAutor,
        },
      })
      break
    }

    case 'pagina': {
      grafo.push({
        '@type': 'WebPage',
        name: datos?.titulo || S,
        url: canonicaPara(ruta, parametros, urlSitio),
      })
      break
    }

    default:
      break
  }

  return {
    '@context': 'https://schema.org',
    '@graph': grafo,
  }
}

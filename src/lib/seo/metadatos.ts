/**
 * Generador integral de Metadata para Next.js — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§5.2, §5.3).
 */

import type { Metadata } from 'next'
import { tituloPara } from './titulos.ts'
import type { TipoTitulo, AjustesTitulo } from './titulos.ts'
import { descripcionPara } from './descripciones.ts'
import type { TipoDescripcion, AjustesDescripcion } from './descripciones.ts'
import { canonicaPara } from './canonica.ts'
import type { ParametrosCanonica } from './canonica.ts'
import { versionOg } from './lienzo-og.ts'
import { entorno } from '../entorno.ts'

export interface OpcionesMetadatos {
  tipo: TipoTitulo & TipoDescripcion
  datos?: any
  ajustes?: (AjustesTitulo & AjustesDescripcion & {
    seo?: {
      verificacionGoogle?: string | null
      tituloPortada?: string | null
    } | null
    verificacionGoogle?: string | null
    updatedAt?: string | null
    fotoPortada?: any
  }) | null
  ruta: string
  parametros?: ParametrosCanonica | null
  robotsOverride?: {
    index: boolean
    follow: boolean
  }
}

export function metadatosPara({
  tipo,
  datos,
  ajustes,
  ruta,
  parametros,
  robotsOverride,
}: OpcionesMetadatos): Metadata {
  const S = ajustes?.nombreSitio?.trim() || 'Rod Díaz'
  const urlSitio = entorno.URL_SITIO

  // 1. Título y descripción
  const title = tituloPara(tipo, datos, ajustes)
  const description = descripcionPara(tipo, datos, ajustes)

  // 2. Título limpio para Open Graph / Twitter (sin el sufijo " · S" según §5.2.5)
  const ogTitle = title.endsWith(` · ${S}`) ? title.slice(0, -(S.length + 3)) : title

  // 3. URL Canónica
  const canonicalUrl = canonicaPara(ruta, parametros, urlSitio)

  // 4. Reglas de Robots (§5.2.3)
  let robots = {
    index: true,
    follow: true,
  }

  if (robotsOverride) {
    robots = robotsOverride
  } else if (tipo === 'foto_amable') {
    robots = { index: false, follow: true }
  } else if (tipo === 'no_encontrada') {
    robots = { index: false, follow: false }
  }

  // 5. URL de imagen para Open Graph (§5.2.5, §5.2.6)
  let rutaOg = '/og/foto/portada' // fallback
  let updatedAtItem: string | null = null
  let altImagen = S

  if (tipo === 'foto' && datos?.slug) {
    rutaOg = `/og/foto/${datos.slug}`
    updatedAtItem = datos.updatedAt || null
    altImagen = datos.textoAlternativo || datos.titulo || S
  } else if (tipo === 'coleccion' && datos?.portada?.slug) {
    rutaOg = `/og/foto/${datos.portada.slug}`
    updatedAtItem = datos.portada.updatedAt || null
    altImagen = datos.portada.textoAlternativo || datos.portada.titulo || datos.nombre || S
  } else if (tipo === 'pagina' && datos?.imagen?.id) {
    rutaOg = `/og/medio/${datos.imagen.id}`
    updatedAtItem = datos.imagen.updatedAt || null
    altImagen = datos.imagen.textoAlternativo || datos.titulo || S
  } else if (ajustes?.fotoPortada?.slug) {
    rutaOg = `/og/foto/${ajustes.fotoPortada.slug}`
    updatedAtItem = ajustes.fotoPortada.updatedAt || null
    altImagen = ajustes.fotoPortada.textoAlternativo || S
  }

  const vHash = versionOg(updatedAtItem, ajustes?.updatedAt)
  const ogImageUrl = `${urlSitio}${rutaOg}?v=${vHash}`

  // 6. Configurar objeto Metadata completo de Next.js
  const meta: Metadata = {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: robots.index,
      follow: robots.follow,
      googleBot: {
        index: robots.index,
        follow: robots.follow,
      },
    },
    openGraph: {
      siteName: S,
      locale: 'es_CL',
      type: 'website',
      url: canonicalUrl,
      title: ogTitle,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: altImagen,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [ogImageUrl],
    },
  }

  // 7. Verificación de Google Search Console exclusiva para la portada (§5.1, §5.2.11)
  if (tipo === 'portada') {
    const codVerif =
      ajustes?.seo?.verificacionGoogle ||
      ajustes?.verificacionGoogle

    if (codVerif) {
      meta.verification = {
        google: codVerif,
      }
    }
  }

  return meta
}

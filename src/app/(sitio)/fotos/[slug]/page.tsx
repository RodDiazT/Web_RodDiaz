import React from 'react'
import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { fichaFoto, ajustes, paginasEnNavegacion } from '@/lib/contenido'
import { Ficha } from '@/componentes/ficha/Ficha'
import { FotoNoDisponible } from '@/componentes/ficha/FotoNoDisponible'
import { metadatosPara } from '@/lib/seo/metadatos'
import { jsonLdPara } from '@/lib/seo/jsonld'
import { JsonLd } from '@/componentes/JsonLd'

export const dynamic = 'force-dynamic'

interface PaginaFotoProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PaginaFotoProps): Promise<Metadata> {
  const { slug } = await params
  const [datos, configGlobal] = await Promise.all([
    fichaFoto(slug),
    ajustes(),
  ])

  if (!datos || 'redirigirA' in datos) {
    return metadatosPara({
      tipo: 'foto',
      datos: { titulo: 'Fotografía', slug },
      ajustes: configGlobal,
      ruta: `/fotos/${slug}`,
    })
  }

  if ('noDisponible' in datos) {
    return metadatosPara({
      tipo: 'foto_amable',
      datos: { slug },
      ajustes: configGlobal,
      ruta: `/fotos/${slug}`,
      robotsOverride: { index: false, follow: true },
    })
  }

  const { foto } = datos
  return metadatosPara({
    tipo: 'foto',
    datos: foto,
    ajustes: configGlobal,
    ruta: `/fotos/${slug}`,
  })
}

export default async function PaginaFoto({ params }: PaginaFotoProps) {
  const { slug } = await params
  const [datos, configGlobal, paginasNav] = await Promise.all([
    fichaFoto(slug),
    ajustes(),
    paginasEnNavegacion(),
  ])

  if (!datos) {
    notFound()
  }

  if ('redirigirA' in datos && typeof datos.redirigirA === 'string') {
    redirect(datos.redirigirA)
  }

  if ('noDisponible' in datos) {
    return <FotoNoDisponible coleccion={datos.coleccion} />
  }

  const jsonLd = jsonLdPara({
    tipo: 'foto',
    datos: datos.foto,
    ajustes: configGlobal,
    ruta: `/fotos/${datos.foto.slug}`,
    condicionesPublicada: paginasNav.condiciones,
  })

  return (
    <>
      <JsonLd datos={jsonLd} />
      <Ficha datos={datos} />
    </>
  )
}

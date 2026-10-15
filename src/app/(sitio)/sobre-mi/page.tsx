import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { paginaPorSlug, fotosDestacadas, paginasEnNavegacion, ajustes } from '@/lib/contenido'
import { PlantillaSobreMi } from '@/componentes/paginas/PlantillaSobreMi'

export const revalidate = 3600 // Revalidación ISR cada hora

export async function generateMetadata(): Promise<Metadata> {
  const [res, configGlobal] = await Promise.all([
    paginaPorSlug('sobre-mi'),
    ajustes(),
  ])

  const nombreSitio = configGlobal?.nombreSitio || 'Rod Díaz'

  if (res.tipo !== 'exito' || !res.pagina) {
    return {
      title: `Sobre mí — ${nombreSitio}`,
    }
  }

  const pagina = res.pagina
  const titulo = pagina.titulo || 'Sobre mí'
  const descripcion =
    pagina.seo?.descripcion ||
    configGlobal?.descripcion ||
    'Fotografía Fine Art de naturaleza y paisaje por Rod Díaz.'

  return {
    title: `${titulo} — ${nombreSitio}`,
    description: descripcion,
  }
}

export default async function PaginaSobreMi() {
  const [resPagina, destacadas, nav, configGlobal] = await Promise.all([
    paginaPorSlug('sobre-mi'),
    fotosDestacadas(6),
    paginasEnNavegacion(),
    ajustes(),
  ])

  if (resPagina.tipo !== 'exito' || !resPagina.pagina) {
    notFound()
  }

  return (
    <PlantillaSobreMi
      pagina={resPagina.pagina}
      destacadas={destacadas}
      contactoPublicado={nav.contacto}
      correoContacto={configGlobal?.correoContacto}
    />
  )
}

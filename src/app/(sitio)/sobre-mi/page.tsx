import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { paginaPorSlug, fotosDestacadas, paginasEnNavegacion, ajustes } from '@/lib/contenido'
import { PlantillaSobreMi } from '@/componentes/paginas/PlantillaSobreMi'
import { metadatosPara } from '@/lib/seo/metadatos'
import { jsonLdPara } from '@/lib/seo/jsonld'
import { JsonLd } from '@/componentes/JsonLd'

export const revalidate = 3600 // Revalidación ISR cada hora

export async function generateMetadata(): Promise<Metadata> {
  const [res, configGlobal] = await Promise.all([
    paginaPorSlug('sobre-mi'),
    ajustes(),
  ])

  if (res.tipo !== 'exito' || !res.pagina) {
    return metadatosPara({
      tipo: 'pagina',
      datos: { titulo: 'Sobre mí' },
      ajustes: configGlobal,
      ruta: '/sobre-mi',
    })
  }

  return metadatosPara({
    tipo: 'pagina',
    datos: res.pagina,
    ajustes: configGlobal,
    ruta: '/sobre-mi',
  })
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

  const jsonLd = jsonLdPara({
    tipo: 'sobre-mi',
    datos: resPagina.pagina,
    ajustes: configGlobal,
    ruta: '/sobre-mi',
    imagenSobreMiUrl: resPagina.pagina.imagen?.url || undefined,
  })

  return (
    <>
      <JsonLd datos={jsonLd} />
      <PlantillaSobreMi
        pagina={resPagina.pagina}
        destacadas={destacadas}
        contactoPublicado={nav.contacto}
        correoContacto={configGlobal?.correoContacto}
      />
    </>
  )
}

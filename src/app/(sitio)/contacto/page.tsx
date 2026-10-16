import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { paginaPorSlug, ajustes } from '@/lib/contenido'
import { PlantillaContacto } from '@/componentes/paginas/PlantillaContacto'
import { metadatosPara } from '@/lib/seo/metadatos'
import { jsonLdPara } from '@/lib/seo/jsonld'
import { JsonLd } from '@/componentes/JsonLd'

export const revalidate = 3600 // Revalidación ISR cada hora

export async function generateMetadata(): Promise<Metadata> {
  const [res, configGlobal] = await Promise.all([
    paginaPorSlug('contacto'),
    ajustes(),
  ])

  if (res.tipo !== 'exito' || !res.pagina) {
    return metadatosPara({
      tipo: 'pagina',
      datos: { titulo: 'Contacto' },
      ajustes: configGlobal,
      ruta: '/contacto',
    })
  }

  return metadatosPara({
    tipo: 'pagina',
    datos: res.pagina,
    ajustes: configGlobal,
    ruta: '/contacto',
  })
}

export default async function PaginaContacto() {
  const [resPagina, configGlobal] = await Promise.all([
    paginaPorSlug('contacto'),
    ajustes(),
  ])

  if (resPagina.tipo !== 'exito' || !resPagina.pagina) {
    notFound()
  }

  const jsonLd = jsonLdPara({
    tipo: 'pagina',
    datos: resPagina.pagina,
    ajustes: configGlobal,
    ruta: '/contacto',
  })

  return (
    <>
      <JsonLd datos={jsonLd} />
      <PlantillaContacto
        pagina={resPagina.pagina}
        redes={configGlobal?.redes}
        correoContacto={configGlobal?.correoContacto}
      />
    </>
  )
}

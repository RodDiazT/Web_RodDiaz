import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { paginaPorSlug, ajustes } from '@/lib/contenido'
import { PlantillaContacto } from '@/componentes/paginas/PlantillaContacto'

export const revalidate = 3600 // Revalidación ISR cada hora

export async function generateMetadata(): Promise<Metadata> {
  const [res, configGlobal] = await Promise.all([
    paginaPorSlug('contacto'),
    ajustes(),
  ])

  const nombreSitio = configGlobal?.nombreSitio || 'Rod Díaz'

  if (res.tipo !== 'exito' || !res.pagina) {
    return {
      title: `Contacto — ${nombreSitio}`,
    }
  }

  const pagina = res.pagina
  const titulo = pagina.titulo || 'Contacto'
  const descripcion =
    pagina.seo?.descripcion ||
    configGlobal?.descripcion ||
    'Escribe a Rod Díaz para consultas sobre copias Fine Art, colaboraciones o impresiones de autor.'

  return {
    title: `${titulo} — ${nombreSitio}`,
    description: descripcion,
  }
}

export default async function PaginaContacto() {
  const [resPagina, configGlobal] = await Promise.all([
    paginaPorSlug('contacto'),
    ajustes(),
  ])

  if (resPagina.tipo !== 'exito' || !resPagina.pagina) {
    notFound()
  }

  return (
    <PlantillaContacto
      pagina={resPagina.pagina}
      redes={configGlobal?.redes}
      correoContacto={configGlobal?.correoContacto}
    />
  )
}

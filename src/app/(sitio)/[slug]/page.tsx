import React from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { paginaPorSlug, ajustes, obtenerPayload } from '@/lib/contenido'
import { PlantillaTexto } from '@/componentes/paginas/PlantillaTexto'
import { SLUGS_RESERVADOS_PAGINAS } from '@/lib/rutasReservadas'

export const revalidate = 3600 // Revalidación ISR cada hora

interface PaginaDinamicaProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  try {
    const payload = await obtenerPayload()
    const paginas = await payload.find({
      collection: 'paginas',
      where: {
        estado: { equals: 'publicada' },
      },
      limit: 50,
      depth: 0,
    })

    return paginas.docs
      .filter((p) => p.slug && p.slug !== 'sobre-mi' && p.slug !== 'contacto')
      .map((p) => ({ slug: p.slug }))
  } catch {
    // Si la base de datos no está disponible en la compilación, retornar array vacío para SSG/ISR
    return []
  }
}

export async function generateMetadata({ params }: PaginaDinamicaProps): Promise<Metadata> {
  const { slug } = await params
  const [res, configGlobal] = await Promise.all([
    paginaPorSlug(slug),
    ajustes(),
  ])

  const nombreSitio = configGlobal?.nombreSitio || 'Rod Díaz'

  if (res.tipo !== 'exito' || !res.pagina) {
    return {
      title: `Página — ${nombreSitio}`,
    }
  }

  const pagina = res.pagina
  const titulo = pagina.titulo || 'Página'
  const descripcion =
    pagina.seo?.descripcion ||
    configGlobal?.descripcion ||
    `Página editorial de ${nombreSitio}.`

  return {
    title: `${titulo} — ${nombreSitio}`,
    description: descripcion,
  }
}

export default async function PaginaDinamica({ params }: PaginaDinamicaProps) {
  const { slug } = await params
  const [resPagina, configGlobal] = await Promise.all([
    paginaPorSlug(slug),
    ajustes(),
  ])

  if (resPagina.tipo === 'redirigir') {
    // Redirección 308 permanente para slugs renombrados (§4, §5.3)
    permanentRedirect(resPagina.destino)
  }

  if (resPagina.tipo !== 'exito' || !resPagina.pagina) {
    notFound()
  }

  const pagina = resPagina.pagina
  const esLegal = slug === 'privacidad' || slug === 'condiciones'

  return (
    <PlantillaTexto
      pagina={pagina}
      mostrarFecha={esLegal}
      correoContacto={configGlobal?.correoContacto}
      retorno={{ etiqueta: 'Volver', href: '/' }}
    />
  )
}

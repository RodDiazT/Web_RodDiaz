import React from 'react'
import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { fichaFoto } from '@/lib/contenido'
import { Ficha } from '@/componentes/ficha/Ficha'
import { FotoNoDisponible } from '@/componentes/ficha/FotoNoDisponible'

export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  // Seguro para compilar sin base de datos activa (plataforma/despliegue.md §5.2.6)
  return []
}

interface PaginaFotoProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PaginaFotoProps): Promise<Metadata> {
  const { slug } = await params
  const datos = await fichaFoto(slug)

  if (!datos || 'redirigirA' in datos) {
    return { title: 'Fotografía — Rod Díaz' }
  }

  if ('noDisponible' in datos) {
    return {
      title: 'Foto no disponible — Rod Díaz',
      robots: { index: false, follow: true },
    }
  }

  const { foto } = datos
  return {
    title: `${foto.titulo} — Rod Díaz`,
    description: `Fotografía Fine Art "${foto.titulo}" tomada en ${foto.lugar || 'Chile'}. Impresión en taller propio de Rod Díaz.`,
  }
}

export default async function PaginaFoto({ params }: PaginaFotoProps) {
  const { slug } = await params
  const datos = await fichaFoto(slug)

  if (!datos) {
    notFound()
  }

  if ('redirigirA' in datos && typeof datos.redirigirA === 'string') {
    redirect(datos.redirigirA)
  }


  if ('noDisponible' in datos) {
    return <FotoNoDisponible coleccion={datos.coleccion} />
  }

  return <Ficha datos={datos} />
}

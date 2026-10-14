import React from 'react'
import styles from './RejillaColecciones.module.css'
import { TarjetaColeccion } from '@/componentes/base/TarjetaColeccion'
import { ItemFotoPublica } from '@/lib/contenido'

interface ColeccionItem {
  nombre: string
  slug: string
  totalFotos: number
  portada: ItemFotoPublica | null
}

interface RejillaColeccionesProps {
  colecciones: ColeccionItem[]
  className?: string
}

export function RejillaColecciones({
  colecciones,
  className = '',
}: RejillaColeccionesProps) {
  if (!colecciones || colecciones.length === 0) return null

  return (
    <div className={`${styles.rejilla} ${className}`}>
      {colecciones.map((col) => (
        <TarjetaColeccion
          key={col.slug}
          coleccion={{
            nombre: col.nombre,
            slug: col.slug,
            totalFotos: col.totalFotos,
            portada: col.portada,
          }}
        />
      ))}
    </div>
  )
}

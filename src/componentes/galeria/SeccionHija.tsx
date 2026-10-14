import React from 'react'
import Link from 'next/link'
import styles from './SeccionHija.module.css'
import { GrillaFotos } from './GrillaFotos'
import { ItemFotoPublica } from '@/lib/contenido'

interface SeccionHijaProps {
  nombre: string
  slug: string
  conPagina: boolean
  fotos: ItemFotoPublica[]
  className?: string
}

export function SeccionHija({
  nombre,
  slug,
  conPagina,
  fotos,
  className = '',
}: SeccionHijaProps) {
  if (!fotos || fotos.length === 0) return null

  return (
    <section className={`${styles.seccion} ${className}`} aria-labelledby={`seccion-${slug}`}>
      <div className={styles.cabeceraSeccion}>
        <h2 id={`seccion-${slug}`} className={styles.titulo}>
          {nombre}
        </h2>

        {conPagina && (
          <Link href={`/colecciones/${slug}`} className={styles.enlaceVerColeccion}>
            Ver colección
          </Link>
        )}
      </div>

      <GrillaFotos fotos={fotos} prioridadPrimeras={0} />
    </section>
  )
}

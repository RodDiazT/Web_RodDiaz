import React from 'react'
import Link from 'next/link'
import styles from './NavegacionFotos.module.css'
import { IconoFlechaIzquierda, IconoFlechaDerecha } from './iconos'

export interface ItemNavegacionFoto {
  titulo: string
  href: string
}

interface NavegacionFotosProps {
  anterior?: ItemNavegacionFoto
  siguiente?: ItemNavegacionFoto
  className?: string
}

export function NavegacionFotos({
  anterior,
  siguiente,
  className = '',
}: NavegacionFotosProps) {
  if (!anterior && !siguiente) return null

  return (
    <nav className={`${styles.navegacion} ${className}`} aria-label="Navegación entre fotos">
      {anterior ? (
        <Link href={anterior.href} className={styles.item} rel="prev">
          <IconoFlechaIzquierda size={20} />
          <div className={styles.texto}>
            <span className={styles.rotulo}>Anterior</span>
            <span className={styles.titulo}>{anterior.titulo}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {siguiente && (
        <Link href={siguiente.href} className={`${styles.item} ${styles.itemSiguiente}`} rel="next">
          <div className={styles.texto}>
            <span className={styles.rotulo}>Siguiente</span>
            <span className={styles.titulo}>{siguiente.titulo}</span>
          </div>
          <IconoFlechaDerecha size={20} />
        </Link>
      )}
    </nav>
  )
}

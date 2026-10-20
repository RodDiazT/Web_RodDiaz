import React from 'react'
import Link from 'next/link'
import styles from './PortadaSitio.module.css'
import { MarcoFoto } from '@/componentes/base/MarcoFoto'
import { ItemFotoPublica } from '@/lib/contenido'

interface PortadaSitioProps {
  foto: ItemFotoPublica
  className?: string
}

export function PortadaSitio({ foto, className = '' }: PortadaSitioProps) {
  const pieFoto = [foto.titulo, foto.lugar].filter(Boolean).join(' · ')
  const ratio = foto.ancho && foto.alto ? foto.ancho / foto.alto : 1.5

  return (
    <section className={`${styles.seccionPortada} ${className}`} aria-label="Fotografía de portada">
      <Link href={foto.href} className={styles.enlacePortada}>
        <div
          className={styles.contenedorFoto}
          style={{ ['--ratio-portada' as any]: ratio.toFixed(3) }}
        >
          <MarcoFoto
            foto={foto}
            modo="portada"
            prioridad
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          />
        </div>

        {pieFoto && (
          <div className={styles.pieFoto}>
            <span className={styles.titulo}>{foto.titulo}</span>
            {foto.lugar && <span className={styles.lugar}> · {foto.lugar}</span>}
          </div>
        )}
      </Link>
    </section>
  )
}

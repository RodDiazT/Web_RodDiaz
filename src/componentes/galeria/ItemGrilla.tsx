import React from 'react'
import Link from 'next/link'
import styles from './GrillaFotos.module.css'
import { MarcoFoto } from '@/componentes/base/MarcoFoto'
import { ItemFotoPublica } from '@/lib/contenido'

interface ItemGrillaProps {
  foto: ItemFotoPublica
  prioridad?: boolean
  className?: string
}

export function ItemGrilla({ foto, prioridad = false, className = '' }: ItemGrillaProps) {
  const proporcion = foto.ancho && foto.alto ? foto.ancho / foto.alto : 1.5

  const textoSubtitulo = [foto.titulo, foto.lugar].filter(Boolean).join(' · ')

  return (
    <Link
      href={foto.href}
      className={`${styles.item} ${className}`}
      style={{
        flexGrow: proporcion,
        flexBasis: `calc(${proporcion} * var(--alto-fila))`,
        maxWidth: `calc(${proporcion} * (100svh - var(--alto-encabezado)))`,
      }}
      aria-label={`Ver ficha de la fotografía: ${foto.titulo}`}
    >
      <MarcoFoto
        foto={foto}
        modo="grilla"
        prioridad={prioridad}
        sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, calc(${Math.round(proporcion * 320)}px)`}
      />

      <div className={styles.lineaTitulo} aria-hidden="true">
        <span>{textoSubtitulo}</span>
      </div>
    </Link>
  )
}

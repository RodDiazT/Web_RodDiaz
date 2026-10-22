'use client'

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
  const esPanoramica = proporcion >= 2.0

  const textoSubtitulo = [foto.titulo, foto.lugar].filter(Boolean).join(' · ')

  const manejarClic = () => {
    try {
      const clave = `galeria_${window.location.pathname}${window.location.search}`
      sessionStorage.setItem(
        clave,
        JSON.stringify({
          scrollY: window.scrollY,
          slug: foto.slug,
        })
      )
    } catch {}
  }

  return (
    <Link
      href={foto.href}
      id={`foto-${foto.slug}`}
      onClick={manejarClic}
      className={`${styles.item} ${className}`}
      style={
        esPanoramica
          ? {
              flex: '1 1 100%',
              width: '100%',
              maxWidth: '100%',
            }
          : {
              flexGrow: proporcion,
              flexBasis: `calc(${proporcion} * var(--alto-fila))`,
              maxWidth: `min(100%, calc(${proporcion} * 78svh))`,
            }
      }
      aria-label={`Ver ficha de la fotografía: ${foto.titulo}`}
    >
      <MarcoFoto
        foto={foto}
        modo="grilla"
        prioridad={prioridad}
        sizes={
          esPanoramica
            ? '(min-width: 1440px) 1400px, 100vw'
            : `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, calc(${Math.round(proporcion * 380)}px)`
        }
      />

      <div className={styles.lineaTitulo} aria-hidden="true">
        <span>{textoSubtitulo}</span>
      </div>
    </Link>
  )
}

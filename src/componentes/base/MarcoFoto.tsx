'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from './MarcoFoto.module.css'

export type ModoMarcoFoto = 'grilla' | 'ficha' | 'portada' | 'visor'

export interface FotoMarco {
  url?: string
  ancho?: number
  alto?: number
  colorDominante?: string
  titulo?: string
  textoAlternativo?: string
  filete?: boolean
  sizes?: {
    pequena_avif?: { url?: string }
    pequena_webp?: { url?: string }
    mediana_avif?: { url?: string }
    mediana_webp?: { url?: string }
    mediana_jpg?: { url?: string }
    grande_avif?: { url?: string }
    grande_webp?: { url?: string }
  }
}

interface MarcoFotoProps {
  foto: FotoMarco
  modo?: ModoMarcoFoto
  prioridad?: boolean
  sizes?: string
  alAmpliar?: () => void
  className?: string
}

export function MarcoFoto({
  foto,
  modo = 'grilla',
  prioridad = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  alAmpliar,
  className = '',
}: MarcoFotoProps) {
  const [cargada, setCargada] = useState(false)
  const [errorCarga, setErrorCarga] = useState(false)
  const [hidratado, setHidratado] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setHidratado(true)
    if (imgRef.current?.complete) {
      setCargada(true)
    }
  }, [])

  const ratio = foto.ancho && foto.alto ? `${foto.ancho} / ${foto.alto}` : '3 / 2'
  const alt = foto.textoAlternativo || foto.titulo || 'Fotografía Fine Art de Rod Díaz'

  const modoClase =
    modo === 'ficha'
      ? styles.modoFicha
      : modo === 'portada'
        ? styles.modoPortada
        : modo === 'visor'
          ? styles.modoVisor
          : styles.modoGrilla

  if (errorCarga) {
    return (
      <div
        className={`${styles.contenedor} ${styles.error} ${className}`}
        style={{ aspectRatio: ratio }}
      >
        <span>No pudimos cargar esta foto</span>
      </div>
    )
  }

  // Fuentes de imagen optimizadas
  const srcAvif = [
    foto.sizes?.pequena_avif?.url && `${foto.sizes.pequena_avif.url} 480w`,
    foto.sizes?.mediana_avif?.url && `${foto.sizes.mediana_avif.url} 1200w`,
    foto.sizes?.grande_avif?.url && `${foto.sizes.grande_avif.url} 2048w`,
  ]
    .filter(Boolean)
    .join(', ')

  const srcWebp = [
    foto.sizes?.pequena_webp?.url && `${foto.sizes.pequena_webp.url} 480w`,
    foto.sizes?.mediana_webp?.url && `${foto.sizes.mediana_webp.url} 1200w`,
    foto.sizes?.grande_webp?.url && `${foto.sizes.grande_webp.url} 2048w`,
  ]
    .filter(Boolean)
    .join(', ')

  const srcJpg = foto.sizes?.mediana_jpg?.url || foto.url || ''

  const aplicarFundido = hidratado && !prioridad && !cargada

  return (
    <div
      className={`
        ${styles.contenedor}
        ${modoClase}
        ${foto.filete ? styles.filete : ''}
        ${alAmpliar ? styles.interactivo : ''}
        ${className}
      `}
      style={{
        aspectRatio: modo !== 'visor' ? ratio : undefined,
        backgroundColor: foto.colorDominante || 'var(--color-superficie)',
      }}
      onClick={alAmpliar}
      onKeyDown={(e) => {
        if (alAmpliar && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          alAmpliar()
        }
      }}
      tabIndex={alAmpliar ? 0 : undefined}
      role={alAmpliar ? 'button' : undefined}
      aria-label={alAmpliar ? `Ampliar fotografía: ${foto.titulo || 'Ver detalle'}` : undefined}
    >
      <picture>
        {srcAvif && <source type="image/avif" srcSet={srcAvif} sizes={sizes} />}
        {srcWebp && <source type="image/webp" srcSet={srcWebp} sizes={sizes} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={srcJpg}
          alt={alt}
          width={foto.ancho || 2048}
          height={foto.alto || 1365}
          loading={prioridad ? 'eager' : 'lazy'}
          fetchPriority={prioridad ? 'high' : 'auto'}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onLoad={() => setCargada(true)}
          onError={() => setErrorCarga(true)}
          className={`
            ${styles.imagen}
            ${aplicarFundido ? styles.fundidoInicial : styles.cargada}
          `}
        />
      </picture>
    </div>
  )
}

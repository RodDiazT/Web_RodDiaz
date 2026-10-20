'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from './MarcoFoto.module.css'

export type ModoMarcoFoto = 'grilla' | 'ficha' | 'portada' | 'visor'

export interface FotoMarco {
  slug?: string
  url?: string
  ancho?: number
  alto?: number
  colorDominante?: string
  titulo?: string
  textoAlternativo?: string
  filete?: boolean
  ofreceCopia?: boolean
  focalX?: number
  focalY?: number
  sizes?: {
    pequena?: { url?: string }
    mediana?: { url?: string }
    pequena_avif?: { url?: string }
    pequena_webp?: { url?: string }
    mediana_avif?: { url?: string }
    mediana_webp?: { url?: string }
    mediana_jpg?: { url?: string }
    grande_avif?: { url?: string }
    grande_webp?: { url?: string }
  }
  versiones?: {
    avif?: string[]
    webp?: string[]
    jpeg?: string
    grande_avif?: string
    grande_webp?: string
  }
}

interface MarcoFotoProps {
  foto: FotoMarco
  modo?: ModoMarcoFoto
  prioridad?: boolean
  sizes?: string
  proporcion?: string
  ajustarContenedor?: boolean
  alAmpliar?: () => void
  className?: string
}

export function MarcoFoto({
  foto,
  modo = 'grilla',
  prioridad = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  proporcion,
  ajustarContenedor = false,
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

  useEffect(() => {
    setErrorCarga(false)
  }, [
    foto.url,
    foto.versiones?.jpeg,
    foto.sizes?.mediana?.url,
    foto.sizes?.mediana_jpg?.url,
    foto.sizes?.pequena?.url,
    foto.sizes?.pequena_webp?.url,
  ])

  const ratio = proporcion
    ? proporcion.replace(':', ' / ')
    : foto.ancho && foto.alto
      ? `${foto.ancho} / ${foto.alto}`
      : '3 / 2'
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

  // Fuentes de imagen optimizadas (compatible con Foto, ItemFotoPublica.versiones y Medio auxiliar)
  const urlPequenaAvif = foto.sizes?.pequena_avif?.url || foto.versiones?.avif?.[0]
  const urlMedianaAvif = foto.sizes?.mediana_avif?.url || foto.versiones?.avif?.[1]
  const urlGrandeAvif =
    foto.sizes?.grande_avif?.url || foto.versiones?.grande_avif || foto.versiones?.avif?.[2]

  const srcAvif = [
    urlPequenaAvif && `${urlPequenaAvif} 480w`,
    urlMedianaAvif && `${urlMedianaAvif} 1200w`,
    urlGrandeAvif && `${urlGrandeAvif} 2048w`,
  ]
    .filter(Boolean)
    .join(', ')

  const urlPequenaWebp =
    foto.sizes?.pequena_webp?.url || foto.sizes?.pequena?.url || foto.versiones?.webp?.[0]
  const urlMedianaWebp =
    foto.sizes?.mediana_webp?.url || foto.sizes?.mediana?.url || foto.versiones?.webp?.[1]
  const urlGrandeWebp =
    foto.sizes?.grande_webp?.url || foto.versiones?.grande_webp || foto.versiones?.webp?.[2]

  const srcWebp = [
    urlPequenaWebp && `${urlPequenaWebp} 480w`,
    urlMedianaWebp && `${urlMedianaWebp} 1200w`,
    urlGrandeWebp && `${urlGrandeWebp} 2048w`,
  ]
    .filter(Boolean)
    .join(', ')

  const srcJpg =
    foto.sizes?.mediana_jpg?.url ||
    foto.sizes?.mediana?.url ||
    foto.versiones?.jpeg ||
    foto.url ||
    urlMedianaWebp ||
    urlPequenaWebp ||
    ''

  const aplicarFundido = hidratado && !prioridad && !cargada

  const posicionFocal =
    foto.focalX !== undefined || foto.focalY !== undefined
      ? `${foto.focalX ?? 50}% ${foto.focalY ?? 50}%`
      : undefined

  return (
    <div
      className={`
        ${styles.contenedor}
        ${modoClase}
        ${foto.filete ? styles.filete : ''}
        ${alAmpliar ? styles.interactivo : ''}
        ${ajustarContenedor ? styles.ajustarContenedor : ''}
        ${className}
      `}
      style={{
        aspectRatio: !ajustarContenedor && modo !== 'visor' ? ratio : undefined,
        backgroundColor: foto.colorDominante || 'var(--color-superficie)',
        height: ajustarContenedor ? '100%' : undefined,
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
          style={posicionFocal ? { objectPosition: posicionFocal } : undefined}
          className={`
            ${styles.imagen}
            ${aplicarFundido ? styles.fundidoInicial : styles.cargada}
          `}
        />
      </picture>
    </div>
  )
}

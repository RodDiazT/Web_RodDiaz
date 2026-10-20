import React from 'react'
import Link from 'next/link'
import styles from './TarjetaColeccion.module.css'
import { MarcoFoto, FotoMarco } from './MarcoFoto'

export interface ColeccionTarjeta {
  nombre: string
  slug: string
  totalFotos?: number
  portada?: FotoMarco | null
  fotosPreview?: FotoMarco[]
}

interface TarjetaColeccionProps {
  coleccion: ColeccionTarjeta
  href?: string
  className?: string
}

function esFotoVertical(foto?: FotoMarco | null): boolean {
  if (!foto) return false
  const fotoConProp = foto as FotoMarco & { proporcion?: { orientacion?: string } }
  if (fotoConProp.proporcion?.orientacion === 'vertical') return true
  if (foto.ancho && foto.alto && foto.alto > foto.ancho) return true
  return false
}

export function TarjetaColeccion({
  coleccion,
  href = `/colecciones/${coleccion.slug}`,
  className = '',
}: TarjetaColeccionProps) {
  const conteoTexto =
    coleccion.totalFotos !== undefined
      ? `${coleccion.totalFotos} ${coleccion.totalFotos === 1 ? 'foto' : 'fotos'}`
      : undefined

  // Colección de fotos para previsualizar (portada + hasta 2 fotos adicionales)
  const fotos: FotoMarco[] =
    coleccion.fotosPreview && coleccion.fotosPreview.length > 0
      ? coleccion.fotosPreview
      : coleccion.portada
        ? [coleccion.portada]
        : []

  const portada = fotos[0] || null
  const esVertical = esFotoVertical(portada)
  const totalMuestras = fotos.length

  return (
    <Link href={href} className={`${styles.tarjeta} ${className}`}>
      <div className={styles.portadaWrapper}>
        {totalMuestras === 0 ? (
          <div className={styles.vacio} />
        ) : totalMuestras === 1 ? (
          /* Caso 1 foto: si es vertical, va en modo 'portada' (object-fit: contain) con passepartout para no cortar la obra */
          <div className={`${styles.slotFoto} ${esVertical ? styles.slotVerticalUnico : ''}`}>
            <MarcoFoto
              foto={portada}
              modo={esVertical ? 'portada' : 'grilla'}
              ajustarContenedor
              sizes="(max-width: 640px) 100vw, (max-width: 1440px) 50vw, 720px"
              className={styles.marcoFoto}
            />
          </div>
        ) : totalMuestras === 2 ? (
          /* Caso 2 fotos: Portada a la izquierda + foto 2 a la derecha */
          <div
            className={`
              ${styles.collage}
              ${esVertical ? styles.collageVerticalPortada : styles.collageHorizontalPortada}
            `}
          >
            <div className={styles.slotFoto}>
              <MarcoFoto
                foto={portada}
                modo="grilla"
                ajustarContenedor
                sizes="(max-width: 640px) 70vw, (max-width: 1440px) 35vw, 450px"
                className={styles.marcoFoto}
              />
            </div>
            <div className={styles.slotFoto}>
              <MarcoFoto
                foto={fotos[1]}
                modo="grilla"
                ajustarContenedor
                sizes="(max-width: 640px) 40vw, (max-width: 1440px) 20vw, 280px"
                className={styles.marcoFoto}
              />
            </div>
          </div>
        ) : (
          /* Caso 3+ fotos: Portada grande a la izquierda + 2 fotos apiladas a la derecha */
          <div
            className={`
              ${styles.collage}
              ${esVertical ? styles.collageVerticalPortada : styles.collageHorizontalPortada}
            `}
          >
            <div className={styles.slotFoto}>
              <MarcoFoto
                foto={portada}
                modo="grilla"
                ajustarContenedor
                sizes="(max-width: 640px) 70vw, (max-width: 1440px) 35vw, 450px"
                className={styles.marcoFoto}
              />
            </div>
            <div className={styles.columnaSecundaria}>
              <div className={styles.slotFoto}>
                <MarcoFoto
                  foto={fotos[1]}
                  modo="grilla"
                  ajustarContenedor
                  sizes="(max-width: 640px) 35vw, (max-width: 1440px) 18vw, 240px"
                  className={styles.marcoFoto}
                />
              </div>
              <div className={styles.slotFoto}>
                <MarcoFoto
                  foto={fotos[2]}
                  modo="grilla"
                  ajustarContenedor
                  sizes="(max-width: 640px) 35vw, (max-width: 1440px) 18vw, 240px"
                  className={styles.marcoFoto}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.nombre}>{coleccion.nombre}</h3>
        {conteoTexto && <span className={styles.conteo}>{conteoTexto}</span>}
      </div>
    </Link>
  )
}

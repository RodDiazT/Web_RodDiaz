import React from 'react'
import Link from 'next/link'
import styles from './TarjetaColeccion.module.css'
import { MarcoFoto, FotoMarco } from './MarcoFoto'

export interface ColeccionTarjeta {
  nombre: string
  slug: string
  totalFotos?: number
  portada?: FotoMarco | null
}

interface TarjetaColeccionProps {
  coleccion: ColeccionTarjeta
  href?: string
  className?: string
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

  return (
    <Link href={href} className={`${styles.tarjeta} ${className}`}>
      <div className={styles.portadaWrapper}>
        {coleccion.portada ? (
          <MarcoFoto
            foto={coleccion.portada}
            modo="grilla"
            proporcion="4/5"
            ajustarContenedor
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-superficie)' }} />
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.nombre}>{coleccion.nombre}</h3>
        {conteoTexto && <span className={styles.conteo}>{conteoTexto}</span>}
      </div>
    </Link>
  )
}

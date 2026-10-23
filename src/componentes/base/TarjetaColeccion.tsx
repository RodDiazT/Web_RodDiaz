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

export function TarjetaColeccion({
  coleccion,
  href = `/colecciones/${coleccion.slug}`,
  className = '',
}: TarjetaColeccionProps) {
  const conteoTexto =
    coleccion.totalFotos !== undefined
      ? `${coleccion.totalFotos} ${coleccion.totalFotos === 1 ? 'foto' : 'fotos'}`
      : undefined

  const portada = coleccion.portada || coleccion.fotosPreview?.[0] || null

  const ratioNumero =
    portada?.ancho && portada?.alto
      ? portada.ancho / portada.alto
      : 1.5

  // Panorámica si la relación de aspecto es >= 1.85 (ej. 16:9 amplio, 2:1, 3:1)
  const esPanoramica = ratioNumero >= 1.85
  // Proporción uniforme 3:2 para equilibrar la cuadrícula en toda la web:
  // tanto obras verticales como horizontales estándar comparten la misma altura simétrica y alineación de títulos.
  // Las panorámicas a ancho completo conservan su formato cinematográfico nativo.
  const ratioString = esPanoramica
    ? `${portada?.ancho} / ${portada?.alto}`
    : '3 / 2'

  return (
    <Link
      href={href}
      className={`
        ${styles.tarjeta}
        ${esPanoramica ? styles.tarjetaPanoramica : ''}
        ${className}
      `}
    >
      <div
        className={styles.portadaWrapper}
        style={{ aspectRatio: ratioString }}
      >
        {portada ? (
          <MarcoFoto
            foto={portada}
            modo="grilla"
            proporcion={ratioString}
            ajustarContenedor
            sizes={
              esPanoramica
                ? '(max-width: 640px) 100vw, (max-width: 1440px) 100vw, 1200px'
                : '(max-width: 640px) 100vw, (max-width: 1440px) 50vw, 720px'
            }
            className={styles.marcoFoto}
          />
        ) : (
          <div className={styles.vacio} />
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.nombre}>{coleccion.nombre}</h3>
        {conteoTexto && <span className={styles.conteo}>{conteoTexto}</span>}
      </div>
    </Link>
  )
}

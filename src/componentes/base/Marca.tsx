import React from 'react'
import Link from 'next/link'
import styles from './Marca.module.css'

export const LOGO_HORIZONTAL_OFICIAL = '/marca/RodDiaz-logo-horizontal-blanco.svg'

interface MarcaProps {
  nombreSitio?: string
  logoUrl?: string | null
  usarWordmark?: boolean
}

export function Marca({
  nombreSitio = 'Rod Díaz',
  logoUrl,
  usarWordmark = false,
}: MarcaProps) {
  const srcEfectivo = usarWordmark ? null : logoUrl || LOGO_HORIZONTAL_OFICIAL

  return (
    <Link href="/" className={styles.marca} aria-label={nombreSitio}>
      {srcEfectivo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={srcEfectivo}
          alt={nombreSitio}
          className={styles.logo}
          height={32}
        />
      ) : (
        <span>{nombreSitio}</span>
      )}
    </Link>
  )
}

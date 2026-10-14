import React from 'react'
import Link from 'next/link'
import styles from './Marca.module.css'

interface MarcaProps {
  nombreSitio?: string
  logoUrl?: string | null
}

export function Marca({ nombreSitio = 'Rod Díaz', logoUrl }: MarcaProps) {
  return (
    <Link href="/" className={styles.marca} aria-label={nombreSitio}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
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

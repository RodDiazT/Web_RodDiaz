'use client'

import React from 'react'
import Link from 'next/link'
import styles from './Retorno.module.css'
import { IconoFlechaIzquierda } from './iconos'

interface RetornoProps {
  etiqueta: string
  href: string
  className?: string
  usarHistorial?: boolean
}

export function Retorno({ etiqueta, href, className = '', usarHistorial = false }: RetornoProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && document.referrer) {
      try {
        const refUrl = new URL(document.referrer)
        const targetUrl = new URL(href, window.location.origin)
        if (
          refUrl.origin === window.location.origin &&
          (refUrl.pathname === targetUrl.pathname || (usarHistorial && window.history.length > 1))
        ) {
          e.preventDefault()
          window.history.back()
        }
      } catch {
        // Fallback al enlace normal
      }
    }
  }

  return (
    <Link href={href} onClick={handleClick} className={`${styles.retorno} ${className}`}>
      <IconoFlechaIzquierda size={16} />
      <span>{etiqueta}</span>
    </Link>
  )
}

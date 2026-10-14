import React from 'react'
import Link from 'next/link'
import styles from './Retorno.module.css'
import { IconoFlechaIzquierda } from './iconos'

interface RetornoProps {
  etiqueta: string
  href: string
  className?: string
}

export function Retorno({ etiqueta, href, className = '' }: RetornoProps) {
  return (
    <Link href={href} className={`${styles.retorno} ${className}`}>
      <IconoFlechaIzquierda size={16} />
      <span>{etiqueta}</span>
    </Link>
  )
}

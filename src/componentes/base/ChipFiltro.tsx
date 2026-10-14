import React from 'react'
import Link from 'next/link'
import styles from './ChipFiltro.module.css'
import { IconoCheck } from './iconos'

interface ChipFiltroProps {
  etiqueta: string
  href: string
  activo?: boolean
  className?: string
}

export function ChipFiltro({
  etiqueta,
  href,
  activo = false,
  className = '',
}: ChipFiltroProps) {
  return (
    <Link
      href={href}
      className={`${styles.chip} ${activo ? styles.activo : ''} ${className}`}
      aria-current={activo ? 'true' : undefined}
    >
      {activo && <IconoCheck size={14} />}
      <span>{etiqueta}</span>
    </Link>
  )
}

import React from 'react'
import styles from './Esqueleto.module.css'

interface EsqueletoProps {
  proporcion?: string // e.g. "3/2", "4/5", "1/1"
  lineas?: number
  className?: string
}

export function Esqueleto({
  proporcion,
  lineas,
  className = '',
}: EsqueletoProps) {
  if (proporcion) {
    return (
      <div
        className={`${styles.esqueleto} ${styles.foto} ${className}`}
        style={{ aspectRatio: proporcion.replace(':', '/') }}
        aria-hidden="true"
      />
    )
  }

  const cantLineas = lineas || 3
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: cantLineas }).map((_, i) => (
        <div key={i} className={`${styles.esqueleto} ${styles.linea}`} />
      ))}
    </div>
  )
}

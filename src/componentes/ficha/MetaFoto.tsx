import React from 'react'

interface MetaFotoProps {
  lugar?: string
  fecha?: {
    legible: string
    datetime: string
  } | null
  className?: string
}

export function MetaFoto({ lugar, fecha, className = '' }: MetaFotoProps) {
  if (!lugar && !fecha) return null

  return (
    <div
      className={className}
      style={{
        font: 'var(--texto-sm)',
        color: 'var(--color-texto-secundario)',
      }}
    >
      {lugar && <span>{lugar}</span>}
      {lugar && fecha && <span> · </span>}
      {fecha && <time dateTime={fecha.datetime}>{fecha.legible}</time>}
    </div>
  )
}

import React from 'react'

interface DatosTecnicosProps {
  datos?: string | null
  className?: string
}

export function DatosTecnicos({ datos, className = '' }: DatosTecnicosProps) {
  if (!datos) return null

  return (
    <div
      className={className}
      style={{
        font: 'var(--texto-xs)',
        color: 'var(--color-texto-terciario)',
      }}
    >
      <span>{datos}</span>
    </div>
  )
}

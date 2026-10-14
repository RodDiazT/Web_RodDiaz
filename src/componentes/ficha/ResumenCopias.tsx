import React from 'react'

interface ResumenCopiasProps {
  texto: string
  className?: string
}

export function ResumenCopias({ texto, className = '' }: ResumenCopiasProps) {
  if (!texto) return null

  return (
    <div
      className={className}
      style={{
        font: 'var(--texto-sm)',
        color: 'var(--color-texto-secundario)',
      }}
    >
      {texto}
    </div>
  )
}

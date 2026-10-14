import React from 'react'
import Link from 'next/link'

interface CaracteristicasFotoProps {
  caracteristicas: Array<{
    slug: string
    nombre: string
  }>
  className?: string
}

export function CaracteristicasFoto({
  caracteristicas,
  className = '',
}: CaracteristicasFotoProps) {
  if (!caracteristicas || caracteristicas.length === 0) return null

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--esp-2)',
        alignItems: 'center',
        font: 'var(--texto-sm)',
      }}
      aria-label="Características de la obra"
    >
      {caracteristicas.map((c, i) => (
        <React.Fragment key={c.slug}>
          <Link
            href={`/fotos?caracteristica=${encodeURIComponent(c.slug)}`}
            style={{
              color: 'var(--color-texto-secundario)',
              textDecoration: 'none',
              transition: 'color var(--dur-rapida) var(--curva-salida)',
            }}
          >
            {c.nombre}
          </Link>
          {i < caracteristicas.length - 1 && (
            <span style={{ color: 'var(--color-linea-control)' }}>·</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

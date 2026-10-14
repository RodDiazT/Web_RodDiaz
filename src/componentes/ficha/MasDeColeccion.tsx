import React from 'react'
import Link from 'next/link'
import { GrillaFotos } from '@/componentes/galeria/GrillaFotos'
import { ItemFotoPublica } from '@/lib/contenido'

interface MasDeColeccionProps {
  titulo: string
  href: string
  fotos: ItemFotoPublica[]
  className?: string
}

export function MasDeColeccion({
  titulo,
  href,
  fotos,
  className = '',
}: MasDeColeccionProps) {
  if (!fotos || fotos.length === 0) return null

  return (
    <section className={className} aria-labelledby="titulo-mas-de">
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-linea)',
          paddingBottom: 'var(--esp-3)',
          marginBottom: 'var(--esp-5)',
        }}
      >
        <h2 id="titulo-mas-de" style={{ font: 'var(--titulo-md)', margin: 0 }}>
          {titulo}
        </h2>

        <Link
          href={href}
          style={{
            font: 'var(--texto-sm)',
            color: 'var(--color-texto-secundario)',
            textDecoration: 'none',
          }}
        >
          Ver la colección
        </Link>
      </div>

      <GrillaFotos fotos={fotos} prioridadPrimeras={0} />
    </section>
  )
}

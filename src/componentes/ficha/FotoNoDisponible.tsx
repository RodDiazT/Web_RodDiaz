import React from 'react'
import { Boton } from '@/componentes/base/Boton'

interface FotoNoDisponibleProps {
  coleccion?: {
    nombre: string
    slug: string
  } | null
}

export function FotoNoDisponible({ coleccion }: FotoNoDisponibleProps) {
  return (
    <div
      style={{
        padding: 'var(--esp-8) var(--margen)',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 'var(--esp-6)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-2)', maxWidth: '480px' }}>
        <h1 style={{ font: 'var(--titulo-lg)', margin: 0, color: 'var(--color-texto)' }}>
          Esta foto ya no está disponible
        </h1>
        <p style={{ font: 'var(--texto-base)', color: 'var(--color-texto-secundario)', margin: 0 }}>
          Puedes ver otras fotos en la galería.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--esp-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Boton variante="secundario" href="/fotos">
          Ver todas las fotos
        </Boton>
        {coleccion && (
          <Boton variante="secundario" href={`/colecciones/${coleccion.slug}`}>
            Ver {coleccion.nombre}
          </Boton>
        )}
      </div>
    </div>
  )
}

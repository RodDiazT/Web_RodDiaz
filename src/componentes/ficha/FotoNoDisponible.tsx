import React from 'react'
import { PlantillaEstado } from '@/componentes/base/PlantillaEstado'

interface FotoNoDisponibleProps {
  coleccion?: {
    nombre: string
    slug: string
  } | null
}

export function FotoNoDisponible({ coleccion }: FotoNoDisponibleProps) {
  const etiquetaAccion = coleccion
    ? `Ver ${coleccion.nombre}`
    : 'Ver todas las fotos'
  const hrefAccion = coleccion
    ? `/colecciones/${coleccion.slug}`
    : '/fotos'

  return (
    <div style={{ padding: 'var(--esp-8) var(--margen)', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <PlantillaEstado
        titulo="Esta foto ya no está disponible"
        texto="Puedes explorar otras fotografías en la galería de obras."
        etiquetaAccion={etiquetaAccion}
        hrefAccion={hrefAccion}
      />
    </div>
  )
}

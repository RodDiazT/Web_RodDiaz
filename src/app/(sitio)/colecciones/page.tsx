import React from 'react'
import type { Metadata } from 'next'
import { tarjetasColecciones } from '@/lib/contenido'
import { RejillaColecciones } from '@/componentes/galeria/RejillaColecciones'
import { PlantillaEstado } from '@/componentes/base/PlantillaEstado'

export const dynamic = 'force-static'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Colecciones — Rod Díaz',
  description: 'Series fotográficas y expediciones documentadas por Rod Díaz.',
}

export default async function PaginaColecciones() {
  const colecciones = await tarjetasColecciones()

  return (
    <div
      style={{
        maxWidth: 'var(--ancho-max-contenido)',
        width: '100%',
        margin: '0 auto',
        padding: 'var(--esp-8) var(--margen)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--esp-8)',
      }}
    >
      <header style={{ borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-4)' }}>
        <h1 style={{ font: 'var(--titulo-lg)', margin: 0 }}>Colecciones</h1>
      </header>

      {colecciones.length > 0 ? (
        <RejillaColecciones colecciones={colecciones} />
      ) : (
        <PlantillaEstado
          titulo="Pronto habrá colecciones"
          texto="Actualmente se están preparando las series fotográficas oficiales."
          etiquetaAccion="Ver todas las fotos"
          hrefAccion="/fotos"
        />
      )}
    </div>
  )
}

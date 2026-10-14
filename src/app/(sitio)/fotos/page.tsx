import React from 'react'
import type { Metadata } from 'next'
import {
  paginaFotos,
  caracteristicasConFotos,
} from '@/lib/contenido'
import { FiltroCaracteristicas } from '@/componentes/galeria/FiltroCaracteristicas'
import { CargaInfinita } from '@/componentes/galeria/CargaInfinita'
import { PlantillaEstado } from '@/componentes/base/PlantillaEstado'

export const dynamic = 'force-static'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Todas las fotos — Rod Díaz',
  description: 'Catálogo fotográfico completo y series Fine Art de Rod Díaz.',
}

interface PaginaFotosProps {
  searchParams: Promise<{ caracteristica?: string }>
}

export default async function PaginaFotos({ searchParams }: PaginaFotosProps) {
  const { caracteristica: caracteristicaFiltro } = await searchParams

  const [resultadoFotos, caracteristicas] = await Promise.all([
    paginaFotos({
      lista: 'todas',
      caracteristica: caracteristicaFiltro,
      limite: 30,
    }),
    caracteristicasConFotos(),
  ])

  const { fotos, siguiente } = resultadoFotos

  return (
    <div
      style={{
        maxWidth: 'var(--ancho-max-contenido)',
        width: '100%',
        margin: '0 auto',
        padding: 'var(--esp-8) var(--margen)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--esp-6)',
      }}
    >
      <header style={{ borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-4)' }}>
        <h1 style={{ font: 'var(--titulo-lg)', margin: 0 }}>Fotos</h1>
      </header>

      {caracteristicas.length > 0 && (
        <FiltroCaracteristicas
          caracteristicas={caracteristicas}
          slugActivo={caracteristicaFiltro}
          baseHref="/fotos"
        />
      )}

      {fotos.length > 0 ? (
        <CargaInfinita
          fotosIniciales={fotos}
          siguienteCursorInicial={siguiente}
          lista="todas"
          caracteristicaSlug={caracteristicaFiltro}
        />
      ) : (
        <PlantillaEstado
          titulo="No hay fotos con esta característica por ahora"
          texto="Puedes explorar el catálogo completo seleccionando otra categoría."
          etiquetaAccion="Ver todas las fotos"
          hrefAccion="/fotos"
        />
      )}
    </div>
  )
}

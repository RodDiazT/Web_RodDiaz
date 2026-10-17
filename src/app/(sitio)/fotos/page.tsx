import React from 'react'
import type { Metadata } from 'next'
import {
  paginaFotos,
  caracteristicasConFotos,
  ajustes,
} from '@/lib/contenido'
import { FiltroCaracteristicas } from '@/componentes/galeria/FiltroCaracteristicas'
import { CargaInfinita } from '@/componentes/galeria/CargaInfinita'
import { PlantillaEstado } from '@/componentes/base/PlantillaEstado'
import { metadatosPara } from '@/lib/seo/metadatos'
import { jsonLdPara } from '@/lib/seo/jsonld'
import { JsonLd } from '@/componentes/JsonLd'

export const dynamic = 'force-static'
export const revalidate = 3600

interface PaginaFotosProps {
  searchParams: Promise<{ caracteristica?: string; pagina?: string }>
}

export async function generateMetadata({ searchParams }: PaginaFotosProps): Promise<Metadata> {
  const { caracteristica: caracSlug, pagina: pagParam } = await searchParams
  const [configGlobal, caracteristicas, resFotos] = await Promise.all([
    ajustes(),
    caracteristicasConFotos(),
    caracSlug
      ? paginaFotos({ lista: 'todas', caracteristica: caracSlug, limite: 1 })
      : Promise.resolve({ fotos: [] }),
  ])

  const pagina = Number(pagParam) || 1
  const caracEncontrada = caracteristicas.find((c) => c.slug === caracSlug)

  if (caracSlug) {
    const sinResultados = !caracEncontrada || resFotos.fotos.length === 0
    return metadatosPara({
      tipo: 'caracteristica',
      datos: {
        nombre: caracEncontrada?.nombre || caracSlug,
        totalFotos: resFotos.fotos.length,
        pagina,
      },
      ajustes: configGlobal,
      ruta: '/fotos',
      parametros: { caracteristica: caracSlug, pagina },
      robotsOverride: sinResultados ? { index: false, follow: true } : undefined,
    })
  }

  return metadatosPara({
    tipo: 'fotos',
    datos: { pagina },
    ajustes: configGlobal,
    ruta: '/fotos',
    parametros: { pagina },
  })
}

export default async function PaginaFotos({ searchParams }: PaginaFotosProps) {
  const { caracteristica: caracteristicaFiltro, pagina: pagParam } = await searchParams

  const [resultadoFotos, caracteristicas, configGlobal] = await Promise.all([
    paginaFotos({
      lista: 'todas',
      caracteristica: caracteristicaFiltro,
      limite: 30,
    }),
    caracteristicasConFotos(),
    ajustes(),
  ])

  const { fotos, siguiente } = resultadoFotos
  const pagina = Number(pagParam) || 1
  const caracEncontrada = caracteristicas.find((c) => c.slug === caracteristicaFiltro)

  const jsonLd = jsonLdPara({
    tipo: caracteristicaFiltro ? 'caracteristica' : 'fotos',
    datos: {
      nombre: caracEncontrada?.nombre || (caracteristicaFiltro ? 'Fotos' : 'Todas las fotos'),
      pagina,
    },
    ajustes: configGlobal,
    ruta: '/fotos',
    parametros: { caracteristica: caracteristicaFiltro, pagina },
  })

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
      <JsonLd datos={jsonLd} />
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
          titulo={
            caracteristicaFiltro
              ? 'No hay fotos con esta característica por ahora'
              : 'Pronto habrá fotografías publicadas'
          }
          texto={
            caracteristicaFiltro
              ? 'Puedes explorar el catálogo completo seleccionando otra categoría.'
              : 'Actualmente se están preparando las obras del catálogo.'
          }
          etiquetaAccion={caracteristicaFiltro ? 'Ver todas las fotos' : 'Conocer sobre mí'}
          hrefAccion={caracteristicaFiltro ? '/fotos' : '/sobre-mi'}
        />
      )}
    </div>
  )
}

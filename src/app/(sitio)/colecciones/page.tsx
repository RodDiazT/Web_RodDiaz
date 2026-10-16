import React from 'react'
import type { Metadata } from 'next'
import { tarjetasColecciones, ajustes } from '@/lib/contenido'
import { RejillaColecciones } from '@/componentes/galeria/RejillaColecciones'
import { PlantillaEstado } from '@/componentes/base/PlantillaEstado'
import { metadatosPara } from '@/lib/seo/metadatos'
import { jsonLdPara } from '@/lib/seo/jsonld'
import { JsonLd } from '@/componentes/JsonLd'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const configGlobal = await ajustes()
  return metadatosPara({
    tipo: 'colecciones',
    ajustes: configGlobal,
    ruta: '/colecciones',
  })
}

export default async function PaginaColecciones() {
  const [colecciones, configGlobal] = await Promise.all([
    tarjetasColecciones(),
    ajustes(),
  ])

  const jsonLd = jsonLdPara({
    tipo: 'colecciones',
    datos: { nombre: 'Colecciones' },
    ajustes: configGlobal,
    ruta: '/colecciones',
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
        gap: 'var(--esp-8)',
      }}
    >
      <JsonLd datos={jsonLd} />
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

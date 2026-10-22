import React from 'react'
import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import {
  vistaColeccion,
  caracteristicasConFotos,
  paginaFotos,
  ajustes,
} from '@/lib/contenido'
import { CabeceraColeccion } from '@/componentes/galeria/CabeceraColeccion'
import { FiltroCaracteristicas } from '@/componentes/galeria/FiltroCaracteristicas'
import { CargaInfinita } from '@/componentes/galeria/CargaInfinita'
import { RejillaColecciones } from '@/componentes/galeria/RejillaColecciones'
import { PlantillaEstado } from '@/componentes/base/PlantillaEstado'
import { metadatosPara } from '@/lib/seo/metadatos'
import { jsonLdPara } from '@/lib/seo/jsonld'
import { JsonLd } from '@/componentes/JsonLd'

export const dynamic = 'force-dynamic'

interface PaginaColeccionProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ caracteristica?: string; pagina?: string }>
}

export async function generateMetadata({
  params,
  searchParams,
}: PaginaColeccionProps): Promise<Metadata> {
  const { slug } = await params
  const { pagina: pagParam } = (await searchParams) || {}
  const [vista, configGlobal] = await Promise.all([
    vistaColeccion(slug),
    ajustes(),
  ])

  if (!vista || 'redirigirA' in vista) {
    return metadatosPara({
      tipo: 'coleccion',
      datos: { nombre: 'Colección', slug },
      ajustes: configGlobal,
      ruta: `/colecciones/${slug}`,
    })
  }

  const col = vista.coleccion
  const pagina = Number(pagParam) || 1
  const esHija = vista.tipo === 'hija'
  const nombreMadre = vista.tipo === 'hija' ? vista.madre?.nombre : undefined

  return metadatosPara({
    tipo: 'coleccion',
    datos: {
      nombre: col.nombre,
      esHija,
      nombreMadre,
      descripcion: col.descripcion,
      totalFotos: vista.totalFotos,
      portada: col.portada,
      pagina,
    },
    ajustes: configGlobal,
    ruta: `/colecciones/${slug}`,
    parametros: { pagina },
  })
}

export default async function PaginaColeccion({
  params,
  searchParams,
}: PaginaColeccionProps) {
  const { slug } = await params
  const { caracteristica: caracteristicaFiltro, pagina: pagParam } = await searchParams

  const [vista, configGlobal] = await Promise.all([
    vistaColeccion(slug),
    ajustes(),
  ])

  if (!vista) {
    notFound()
  }

  if ('redirigirA' in vista && typeof vista.redirigirA === 'string') {
    redirect(vista.redirigirA)
  }


  const { coleccion } = vista

  // Características para filtro (§5.2.6: mostrar solo si hay 2 o más características)
  const caracteristicas = await caracteristicasConFotos({ coleccionSlug: coleccion.slug })
  const mostrarFiltros = caracteristicas.length >= 2

  // Configurar retorno para la cabecera
  const retorno =
    vista.tipo === 'hija' && vista.madre
      ? {
          etiqueta: `Volver a ${vista.madre.nombre}`,
          href: `/colecciones/${vista.madre.slug}`,
        }
      : {
          etiqueta: 'Colecciones',
          href: '/colecciones',
        }

  // Si hay filtro activo de característica, cargar las fotos correspondientes
  const { fotos: fotosFiltradas, siguiente: siguienteCursor } = await paginaFotos({
    lista: 'coleccion',
    coleccion: coleccion.slug,
    caracteristica: caracteristicaFiltro,
    limite: 30,
  })

  const tieneFotos = vista.totalFotos > 0

  const pagina = Number(pagParam) || 1
  const jsonLd = jsonLdPara({
    tipo: 'coleccion',
    datos: {
      ...coleccion,
      padre: vista.tipo === 'hija' ? vista.madre : undefined,
    },
    ajustes: configGlobal,
    ruta: `/colecciones/${coleccion.slug}`,
    parametros: { pagina },
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
      <CabeceraColeccion
        nombre={coleccion.nombre}
        descripcion={coleccion.descripcion}
        totalFotos={vista.totalFotos}
        retorno={retorno}
      />

      {mostrarFiltros && (
        <FiltroCaracteristicas
          caracteristicas={caracteristicas}
          slugActivo={caracteristicaFiltro}
          baseHref={`/colecciones/${coleccion.slug}`}
        />
      )}

      {/* Si hay un filtro activo, se muestra la lista filtrada unificada */}
      {caracteristicaFiltro ? (
        fotosFiltradas.length > 0 ? (
          <CargaInfinita
            fotosIniciales={fotosFiltradas}
            siguienteCursorInicial={siguienteCursor}
            lista="coleccion"
            coleccionSlug={coleccion.slug}
            caracteristicaSlug={caracteristicaFiltro}
          />
        ) : (
          <PlantillaEstado
            titulo="No hay fotos con esta característica en esta colección"
            texto="Puedes explorar la colección completa o seleccionar otra característica."
            etiquetaAccion="Ver colección completa"
            hrefAccion={`/colecciones/${coleccion.slug}`}
          />
        )
      ) : vista.tipo === 'hija' ? (
        /* Vista de colección hija: lista continua de fotos */
        fotosFiltradas.length > 0 ? (
          <CargaInfinita
            fotosIniciales={fotosFiltradas}
            siguienteCursorInicial={siguienteCursor}
            lista="coleccion"
            coleccionSlug={coleccion.slug}
          />
        ) : (
          <PlantillaEstado
            titulo="No hay fotos disponibles en esta colección"
            texto="Pronto se publicarán obras en esta serie."
            etiquetaAccion="Ver colecciones"
            hrefAccion="/colecciones"
          />
        )
      ) : (
        /* Vista de colección madre: comprimir sub-colecciones en tarjetas de portada */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-8)' }}>
          {/* Fotos propias de la madre si existen */}
          {vista.fotosPropias.length > 0 && (
            <CargaInfinita
              fotosIniciales={vista.fotosPropias}
              siguienteCursorInicial={null}
              lista="coleccion"
              coleccionSlug={coleccion.slug}
            />
          )}

          {/* Sub-colecciones hijas comprimidas en tarjetas de portada con 1 foto cada una */}
          {vista.secciones.length > 0 && (
            <div>
              {vista.fotosPropias.length > 0 && (
                <h2 style={{ font: 'var(--titulo-md)', margin: '0 0 var(--esp-6) 0' }}>
                  Sub-colecciones
                </h2>
              )}
              <RejillaColecciones
                colecciones={vista.secciones.map((sec) => ({
                  nombre: sec.hija.nombre,
                  slug: sec.hija.slug,
                  totalFotos: sec.fotos.length,
                  portada: sec.portada || sec.fotos[0] || null,
                }))}
              />
            </div>
          )}

          {!tieneFotos && (
            <PlantillaEstado
              titulo="No encontramos fotos en esta colección"
              texto="Pronto se publicarán obras fotográficas en esta serie."
              etiquetaAccion="Ver colecciones"
              hrefAccion="/colecciones"
            />
          )}
        </div>
      )}
    </div>
  )
}

import React from 'react'
import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import {
  vistaColeccion,
  caracteristicasConFotos,
  paginaFotos,
} from '@/lib/contenido'
import { CabeceraColeccion } from '@/componentes/galeria/CabeceraColeccion'
import { FiltroCaracteristicas } from '@/componentes/galeria/FiltroCaracteristicas'
import { CargaInfinita } from '@/componentes/galeria/CargaInfinita'
import { SeccionHija } from '@/componentes/galeria/SeccionHija'
import { PlantillaEstado } from '@/componentes/base/PlantillaEstado'

export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  // Seguro para compilar sin base de datos activa (plataforma/despliegue.md §5.2.6)
  return []
}

interface PaginaColeccionProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ caracteristica?: string }>
}

export async function generateMetadata({
  params,
}: PaginaColeccionProps): Promise<Metadata> {
  const { slug } = await params
  const vista = await vistaColeccion(slug)

  if (!vista || 'redirigirA' in vista) {
    return { title: 'Colección — Rod Díaz' }
  }

  return {
    title: `${vista.coleccion.nombre} — Rod Díaz`,
    description: vista.coleccion.descripcion || `Serie fotográfica ${vista.coleccion.nombre} de Rod Díaz.`,
  }
}

export default async function PaginaColeccion({
  params,
  searchParams,
}: PaginaColeccionProps) {
  const { slug } = await params
  const { caracteristica: caracteristicaFiltro } = await searchParams

  const vista = await vistaColeccion(slug)

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
        /* Vista de colección madre: agrupada por secciones (§3.3) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-8)' }}>
          {/* Fotos propias de la madre */}
          {vista.fotosPropias.length > 0 && (
            <CargaInfinita
              fotosIniciales={vista.fotosPropias}
              siguienteCursorInicial={null}
              lista="coleccion"
              coleccionSlug={coleccion.slug}
            />
          )}

          {/* Secciones de hijas con fotos visibles */}
          {vista.secciones.map((sec) => (
            <SeccionHija
              key={sec.hija.slug}
              nombre={sec.hija.nombre}
              slug={sec.hija.slug}
              conPagina={sec.hija.visibleSola !== false}
              fotos={sec.fotos}
            />
          ))}

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

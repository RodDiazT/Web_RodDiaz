import React from 'react'
import type { Metadata } from 'next'
import {
  fotoPortadaSitio,
  tarjetasColecciones,
  fotosDestacadas,
  ajustes,
} from '@/lib/contenido'
import { PortadaSitio } from '@/componentes/galeria/PortadaSitio'
import { BloqueTaller } from '@/componentes/galeria/BloqueTaller'
import { RejillaColecciones } from '@/componentes/galeria/RejillaColecciones'
import { GrillaFotos } from '@/componentes/galeria/GrillaFotos'
import { Boton } from '@/componentes/base/Boton'
import { PlantillaEstado } from '@/componentes/base/PlantillaEstado'
import { metadatosPara } from '@/lib/seo/metadatos'
import { jsonLdPara } from '@/lib/seo/jsonld'
import { JsonLd } from '@/componentes/JsonLd'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const configGlobal = await ajustes()
  return metadatosPara({
    tipo: 'portada',
    ajustes: configGlobal,
    ruta: '/',
  })
}

export default async function PaginaInicio() {
  const [fotoPortada, colecciones, destacadas, configGlobal] = await Promise.all([
    fotoPortadaSitio(),
    tarjetasColecciones(),
    fotosDestacadas(12),
    ajustes(),
  ])

  const jsonLd = jsonLdPara({
    tipo: 'portada',
    ajustes: configGlobal,
    ruta: '/',
  })

  const nombreSitio = configGlobal?.nombreSitio || 'Rod Díaz'
  const mostrarBotonVerTodasColecciones = colecciones.length > 6
  const coleccionesPortada = colecciones.slice(0, 6)
  const portafolioVacio = !fotoPortada && colecciones.length === 0 && destacadas.length === 0

  if (portafolioVacio) {
    return (
      <div
        style={{
          maxWidth: 'var(--ancho-max-contenido)',
          width: '100%',
          margin: '0 auto',
          padding: 'var(--esp-8) var(--margen)',
        }}
      >
        <JsonLd datos={jsonLd} />
        <PlantillaEstado
          titulo="Portafolio en preparación"
          texto="Actualmente se están seleccionando las obras y colecciones de lanzamiento. Mientras tanto, puedes conocer la historia detrás de este proyecto."
          etiquetaAccion="Conocer sobre mí"
          hrefAccion="/sobre-mi"
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-9)', paddingBottom: 'var(--esp-9)' }}>
      <JsonLd datos={jsonLd} />

      {/* 1. Apertura, Hero Editorial y Foto principal de portada */}
      {fotoPortada && <PortadaSitio foto={fotoPortada} nombreSitio={nombreSitio} />}

      {/* 2. Vitrina de Colecciones (Capítulos / Series temáticas) */}
      {colecciones.length > 0 && (
        <section
          id="seccion-colecciones"
          style={{
            maxWidth: 'var(--ancho-max-contenido)',
            width: '100%',
            margin: '0 auto',
            padding: '0 var(--margen)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--esp-6)',
          }}
          aria-labelledby="titulo-colecciones-portada"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-linea)',
              paddingBottom: 'var(--esp-4)',
              flexWrap: 'wrap',
              gap: 'var(--esp-3)',
            }}
          >
            <div>
              <p
                style={{
                  font: 'var(--texto-xs)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--color-texto-terciario)',
                  margin: '0 0 var(--esp-1)',
                  fontWeight: 500,
                }}
              >
                Series fotográficas
              </p>
              <h2 id="titulo-colecciones-portada" style={{ font: 'var(--titulo-md)', margin: 0 }}>
                Colecciones
              </h2>
              <p
                style={{
                  font: 'var(--texto-sm)',
                  color: 'var(--color-texto-secundario)',
                  margin: 'var(--esp-2) 0 0',
                  maxWidth: '65ch',
                  lineHeight: 1.5,
                }}
              >
                Cuerpos de obra organizados por geografía y atmósfera. Cada serie reúne expediciones y encuentros a lo largo de los años.
              </p>
            </div>

            {mostrarBotonVerTodasColecciones && (
              <Boton variante="secundario" href="/colecciones">
                Ver todas las colecciones
              </Boton>
            )}
          </div>

          <RejillaColecciones colecciones={coleccionesPortada} />
        </section>
      )}

      {/* 3. El Manifiesto del Taller Fine Art (Storytelling de la copia impresa y materialidad) */}
      <BloqueTaller nombreSitio={nombreSitio} />

      {/* 4. Selección de Fotografías Destacadas (Obras individuales) */}
      {destacadas.length > 0 && (
        <section
          style={{
            maxWidth: 'var(--ancho-max-contenido)',
            width: '100%',
            margin: '0 auto',
            padding: '0 var(--margen)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--esp-6)',
          }}
          aria-labelledby="titulo-destacadas-portada"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-linea)',
              paddingBottom: 'var(--esp-4)',
              flexWrap: 'wrap',
              gap: 'var(--esp-3)',
            }}
          >
            <div>
              <p
                style={{
                  font: 'var(--texto-xs)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--color-texto-terciario)',
                  margin: '0 0 var(--esp-1)',
                  fontWeight: 500,
                }}
              >
                Selección curada
              </p>
              <h2 id="titulo-destacadas-portada" style={{ font: 'var(--titulo-md)', margin: 0 }}>
                Fotografías destacadas
              </h2>
              <p
                style={{
                  font: 'var(--texto-sm)',
                  color: 'var(--color-texto-secundario)',
                  margin: 'var(--esp-2) 0 0',
                  maxWidth: '65ch',
                  lineHeight: 1.5,
                }}
              >
                Instantes irrepetibles de cordillera, luz y fauna capturados en expediciones de montaña.
              </p>
            </div>

            <Boton variante="secundario" href="/fotos">
              Ver catálogo completo
            </Boton>
          </div>

          <GrillaFotos fotos={destacadas} prioridadPrimeras={2} />
        </section>
      )}

      {/* 5. Cierre de portada: Invitación al diálogo y consulta */}
      <section
        style={{
          maxWidth: 'var(--ancho-max-contenido)',
          width: '100%',
          margin: '0 auto',
          padding: 'var(--esp-7) var(--margen) 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--esp-5)',
        }}
        aria-label="Contacto y catálogo completo"
      >
        <div style={{ maxWidth: '640px' }}>
          <h3 style={{ font: 'var(--titulo-sm)', margin: '0 0 var(--esp-2)', color: 'var(--color-texto)' }}>
            ¿Buscas una pieza para un espacio particular?
          </h3>
          <p style={{ font: 'var(--texto-sm)', color: 'var(--color-texto-secundario)', margin: 0, lineHeight: 1.6 }}>
            Puedo orientarte personalmente con formatos, proporciones y papeles de algodón que mejor armonicen con tu espacio. Escríbeme sin compromiso para coordinar detalles de impresión y despacho.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--esp-3)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          <Boton variante="secundario" href="/contacto">
            Escríbeme para consultar
          </Boton>
          <Boton variante="enlace" href="/fotos">
            Explorar todas las fotos →
          </Boton>
        </div>
      </section>
    </div>
  )
}

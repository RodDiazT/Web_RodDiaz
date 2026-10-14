'use client'

/**
 * Ficha de foto Fine Art: orquesta la experiencia completa de visualización y consulta.
 * Especificado en DocumentosTecnicos/portafolio/ficha-foto.md (§3, §5.4).
 */

import React from 'react'
import { DisposicionFicha } from '@/componentes/base/DisposicionFicha'
import { MarcoFoto } from '@/componentes/base/MarcoFoto'
import { Boton } from '@/componentes/base/Boton'
import { MetaFoto } from './MetaFoto'
import { ResumenCopias } from './ResumenCopias'
import { TamanosPapeles } from './TamanosPapeles'
import { BarraCopiaMovil } from './BarraCopiaMovil'
import { Historia } from './Historia'
import { CaracteristicasFoto } from './CaracteristicasFoto'
import { DatosTecnicos } from './DatosTecnicos'
import { Compartir } from './Compartir'
import { MasDeColeccion } from './MasDeColeccion'
import { ProveedorEleccionCopia, usarEleccionCopia } from './EleccionCopia'
import { ContextoFicha } from './ContextoFicha'
import { etiquetaProporcion } from '@/lib/ficha'

interface FichaProps {
  datos: {
    foto: any
    coleccion: any
    madre: any
    caracteristicas: any[]
    formatos: any[]
    ofreceCopia: boolean
    resumenCopias: string
    fecha: any
    datosTecnicos: string | null
    historia: any
    masDe: any
    navegacion: any
    textoLlamadaCopia: string
    textoVitrina: string | null
  }
}

function ContenidoFicha({ datos }: FichaProps) {
  const { foto, formatos, ofreceCopia, resumenCopias: textoResumen, fecha, datosTecnicos, historia, caracteristicas, masDe, textoLlamadaCopia } = datos
  const { hrefPrincipal } = usarEleccionCopia()

  const orientacion = foto.proporcion?.orientacion || 'horizontal'
  const proporcionOrientada = etiquetaProporcion(
    foto.proporcion?.etiqueta || '3:2',
    orientacion
  )

  const retornoPorDefecto = {
    etiqueta: datos.coleccion ? `Volver a ${datos.coleccion.nombre}` : 'Volver a Todas las fotos',
    href: datos.coleccion ? `/colecciones/${datos.coleccion.slug}` : '/fotos',
  }

  const formatoUnicoId = formatos.length === 1 ? String(formatos[0].id) : null

  return (
    <ContextoFicha
      fotoSlug={foto.slug}
      fotoActual={foto}
      retornoPorDefecto={retornoPorDefecto}
      navegacionPorDefecto={datos.navegacion}
      ofreceCopia={ofreceCopia}
      textoLlamadaCopia={textoLlamadaCopia}
    >
      {({ alAbrirVisor, retornoElemento, navegacionElemento }) => (
        <>
          <div style={{ maxWidth: 'var(--ancho-max-contenido)', margin: '0 auto', padding: 'var(--esp-4) var(--margen) 0' }}>
            {retornoElemento}
          </div>

          <DisposicionFicha
            orientacion={orientacion}
            ancho={foto.ancho}
            alto={foto.alto}
            foto={
              <MarcoFoto
                foto={foto}
                modo="ficha"
                prioridad
                alAmpliar={alAbrirVisor}
                sizes={
                  orientacion === 'vertical' || orientacion === 'cuadrada'
                    ? '(min-width: 1024px) 60vw, 100vw'
                    : '(min-width: 1600px) 1600px, 100vw'
                }
              />
            }
            titulo={
              <h1
                style={{
                  font:
                    orientacion === 'vertical' || orientacion === 'cuadrada'
                      ? 'var(--titulo-md)'
                      : 'var(--titulo-lg)',
                  margin: 0,
                  textWrap: 'balance',
                }}
              >
                {foto.titulo}
              </h1>
            }
            meta={<MetaFoto lugar={foto.lugar} fecha={fecha} />}
            resumen={
              ofreceCopia ? (
                <ResumenCopias texto={textoResumen} />
              ) : datos.textoVitrina ? (
                <ResumenCopias texto={datos.textoVitrina} />
              ) : null
            }
            accion={
              ofreceCopia ? (
                <div id="contenedor-cta-copia">
                  <Boton
                    id="boton-copia-principal"
                    variante="primario"
                    href={hrefPrincipal}
                  >
                    {textoLlamadaCopia}
                  </Boton>
                </div>
              ) : null
            }
            selectorFormatos={
              ofreceCopia ? (
                <TamanosPapeles
                  formatos={formatos}
                  proporcionOrientada={proporcionOrientada}
                />
              ) : null
            }
            historia={historia ? <Historia contenido={historia} /> : null}
            caracteristicas={
              caracteristicas.length > 0 ? (
                <CaracteristicasFoto caracteristicas={caracteristicas} />
              ) : null
            }
            datosTecnicos={
              datosTecnicos ? <DatosTecnicos datos={datosTecnicos} /> : null
            }
            compartir={<Compartir tituloFoto={foto.titulo} slugFoto={foto.slug} />}
            navegacion={navegacionElemento}
            masDe={
              masDe ? (
                <MasDeColeccion
                  titulo={masDe.titulo}
                  href={masDe.href}
                  fotos={masDe.fotos}
                />
              ) : null
            }
          />

          {ofreceCopia && (
            <BarraCopiaMovil
              tituloFoto={foto.titulo}
              formatos={formatos}
              textoBoton={textoLlamadaCopia}
              idBotonPrincipal="boton-copia-principal"
            />
          )}
        </>
      )}
    </ContextoFicha>
  )
}

export function Ficha({ datos }: FichaProps) {
  const formatoUnicoId = datos.formatos.length === 1 ? String(datos.formatos[0].id) : null

  return (
    <ProveedorEleccionCopia fotoSlug={datos.foto.slug} formatoUnicoId={formatoUnicoId}>
      <ContenidoFicha datos={datos} />
    </ProveedorEleccionCopia>
  )
}

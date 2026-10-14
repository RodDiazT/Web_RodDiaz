import React from 'react'
import {
  fotoPortadaSitio,
  tarjetasColecciones,
  fotosDestacadas,
} from '@/lib/contenido'
import { PortadaSitio } from '@/componentes/galeria/PortadaSitio'
import { RejillaColecciones } from '@/componentes/galeria/RejillaColecciones'
import { GrillaFotos } from '@/componentes/galeria/GrillaFotos'
import { Boton } from '@/componentes/base/Boton'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function PaginaInicio() {
  const [fotoPortada, colecciones, destacadas] = await Promise.all([
    fotoPortadaSitio(),
    tarjetasColecciones(),
    fotosDestacadas(12),
  ])

  const mostrarBotonVerTodasColecciones = colecciones.length > 6
  const coleccionesPortada = colecciones.slice(0, 6)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-9)', paddingBottom: 'var(--esp-9)' }}>
      {/* 1. Foto principal de portada (§3.1) */}
      {fotoPortada && <PortadaSitio foto={fotoPortada} />}

      {/* 2. Vitrina de Colecciones (§3.1) */}
      {colecciones.length > 0 && (
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
          aria-labelledby="titulo-colecciones-portada"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-linea)',
              paddingBottom: 'var(--esp-3)',
            }}
          >
            <h2 id="titulo-colecciones-portada" style={{ font: 'var(--titulo-md)', margin: 0 }}>
              Colecciones
            </h2>

            {mostrarBotonVerTodasColecciones && (
              <Boton variante="secundario" href="/colecciones">
                Ver todas las colecciones
              </Boton>
            )}
          </div>

          <RejillaColecciones colecciones={coleccionesPortada} />
        </section>
      )}

      {/* 3. Selección de Fotografías Destacadas (§3.1) */}
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
          <div style={{ borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-3)' }}>
            <h2 id="titulo-destacadas-portada" style={{ font: 'var(--titulo-md)', margin: 0 }}>
              Destacadas
            </h2>
          </div>

          <GrillaFotos fotos={destacadas} prioridadPrimeras={2} />
        </section>
      )}

      {/* 4. Cierre de portada (§3.1): Acceso directo a todas las fotos sin botón primario */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 'var(--esp-6) var(--margen) 0',
        }}
      >
        <Boton variante="secundario" href="/fotos">
          Ver todas las fotos
        </Boton>
      </section>
    </div>
  )
}

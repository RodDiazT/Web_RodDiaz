import React from 'react'
import { Boton } from '@/componentes/base/Boton'

export default function PaginaInicio() {
  const esDesarrollo = process.env.NODE_ENV !== 'production'

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: 'var(--esp-8) var(--margen)',
        textAlign: 'center',
        maxWidth: 'var(--ancho-max-contenido)',
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          font: 'var(--titulo-xl)',
          margin: '0 0 var(--esp-3) 0',
          color: 'var(--color-texto)',
        }}
      >
        Rod Díaz
      </h1>

      <p
        style={{
          font: 'var(--texto-lectura)',
          color: 'var(--color-texto-secundario)',
          maxWidth: '38rem',
          margin: '0 0 var(--esp-6) 0',
        }}
      >
        Portafolio fotográfico Fine Art con impresión artesanal en taller propio sobre papeles 100% algodón y baritados.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--esp-4)', justifyContent: 'center' }}>
        <Boton variante="primario" href="/admin">
          Panel de administración
        </Boton>
        {esDesarrollo && (
          <Boton variante="secundario" href="/guia-estilo">
            Ver guía de estilo
          </Boton>
        )}
      </div>
    </section>
  )
}

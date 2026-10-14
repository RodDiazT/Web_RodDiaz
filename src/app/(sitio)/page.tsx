import React from 'react'
import Link from 'next/link'

export default function PaginaInicio() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '2.5rem',
          fontWeight: 400,
          letterSpacing: '0.05em',
          margin: '0 0 1rem 0',
          color: '#ffffff',
        }}
      >
        Rod Díaz
      </h1>
      <p
        style={{
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '36rem',
          lineHeight: 1.6,
          margin: '0 0 2rem 0',
        }}
      >
        Portafolio fotográfico Fine Art con impresión artesanal en taller propio sobre papeles de algodón y baritados.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link
          href="/admin"
          style={{
            color: '#0d0e11',
            backgroundColor: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'opacity 0.2s ease',
          }}
        >
          Panel de administración
        </Link>
      </div>
    </main>
  )
}

import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Rod Díaz — Fotografía',
  description: 'Portafolio fotográfico y catálogo de copias Fine Art de Rod Díaz.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body
        style={{
          backgroundColor: '#0d0e11',
          color: '#f3f4f6',
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  )
}

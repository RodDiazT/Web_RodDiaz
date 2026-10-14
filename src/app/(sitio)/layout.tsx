import type { Metadata, Viewport } from 'next'
import React from 'react'
import '@/estilos/tokens.css'
import '@/estilos/base.css'
import { cormorant, manrope } from './fuentes'
import { SaltarContenido } from '@/componentes/base/SaltarContenido'
import { Encabezado } from '@/componentes/base/Encabezado'
import { Pie } from '@/componentes/base/Pie'

export const metadata: Metadata = {
  title: 'Rod Díaz — Fotografía Fine Art',
  description: 'Portafolio fotográfico y copias Fine Art impresas en taller propio de Rod Díaz.',
}

export const viewport: Viewport = {
  themeColor: '#151515',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <SaltarContenido />
        <Encabezado />
        <main id="contenido-principal" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <Pie />
      </body>
    </html>
  )
}

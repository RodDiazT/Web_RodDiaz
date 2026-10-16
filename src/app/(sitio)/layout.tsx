import type { Metadata, Viewport } from 'next'
import React from 'react'
import '@/estilos/tokens.css'
import '@/estilos/base.css'
import { cormorant, manrope } from './fuentes'
import { SaltarContenido } from '@/componentes/base/SaltarContenido'
import { Encabezado } from '@/componentes/base/Encabezado'
import { Pie } from '@/componentes/base/Pie'

import { entorno } from '@/lib/entorno'
import { ajustes, paginasEnNavegacion } from '@/lib/contenido'
import { ItemNavegacion } from '@/componentes/base/MenuMovil'

export const metadata: Metadata = {
  metadataBase: new URL(entorno.URL_SITIO || 'http://localhost:3000'),
  title: {
    default: 'Rod Díaz · Fotografía',
    template: '%s',
  },
  description: 'Portafolio fotográfico y copias Fine Art impresas en taller propio de Rod Díaz.',
}

export const viewport: Viewport = {
  themeColor: '#151515',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [configGlobal, paginasNav] = await Promise.all([
    ajustes(),
    paginasEnNavegacion(),
  ])

  const navegacion: ItemNavegacion[] = [
    { etiqueta: 'Colecciones', href: '/colecciones' },
    { etiqueta: 'Fotos', href: '/fotos' },
  ]

  if (paginasNav.sobreMi) {
    navegacion.push({ etiqueta: 'Sobre mí', href: '/sobre-mi' })
  }
  if (paginasNav.contacto) {
    navegacion.push({ etiqueta: 'Contacto', href: '/contacto' })
  }

  const redInstagram = configGlobal?.redes?.find((r) => r.red === 'instagram')
  const instagramUrl = redInstagram?.url || undefined

  return (
    <html lang="es" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <SaltarContenido />
        <Encabezado
          nombreSitio={configGlobal?.nombreSitio || 'Rod Díaz'}
          logoUrl={typeof configGlobal?.logo === 'object' ? configGlobal.logo?.url : undefined}
          navegacion={navegacion}
        />
        <main id="contenido-principal" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <Pie
          nombreSitio={configGlobal?.nombreSitio || 'Rod Díaz'}
          textoDerechos={configGlobal?.textoDerechos || 'Todos los derechos reservados'}
          instagramUrl={instagramUrl}
          enlacesLegales={paginasNav}
        />
      </body>
    </html>
  )
}


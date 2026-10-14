'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Encabezado.module.css'
import { Marca } from './Marca'
import { MenuMovil, ItemNavegacion } from './MenuMovil'
import { IconoMenu } from './iconos'
import { usarEncabezadoOcultable } from './lib/usarEncabezadoOcultable'

export const NAVEGACION_DEFAULT: ItemNavegacion[] = [
  { etiqueta: 'Fotos', href: '/fotos' },
  { etiqueta: 'Colecciones', href: '/colecciones' },
  { etiqueta: 'Sobre mí', href: '/sobre-mi' },
  { etiqueta: 'Contacto', href: '/contacto' },
]

interface EncabezadoProps {
  nombreSitio?: string
  logoUrl?: string | null
  navegacion?: ItemNavegacion[]
  ocultable?: boolean
}

export function Encabezado({
  nombreSitio = 'Rod Díaz',
  logoUrl,
  navegacion = NAVEGACION_DEFAULT,
  ocultable = true,
}: EncabezadoProps) {
  const rutaActual = usePathname()
  const esFicha = rutaActual?.startsWith('/fotos/')
  // En la ficha, el encabezado nunca se oculta (§5.3.1 y §5.4)
  const debeOcultar = ocultable && !esFicha
  const visible = usarEncabezadoOcultable(debeOcultar)
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <>
      <header
        className={`${styles.encabezado} ${!visible ? styles.encabezadoOculto : ''}`}
      >
        <div className={styles.contenedor}>
          <Marca nombreSitio={nombreSitio} logoUrl={logoUrl} />

          <nav className={styles.navegacionEscritorio} aria-label="Navegación principal">
            {navegacion.map((item) => {
              const esActivo = rutaActual === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.enlace} ${esActivo ? styles.enlaceActivo : ''}`}
                  aria-current={esActivo ? 'page' : undefined}
                >
                  {item.etiqueta}
                </Link>
              )
            })}
          </nav>

          <button
            type="button"
            className={styles.botonMenuMovil}
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
          >
            <span>Menú</span>
            <IconoMenu size={20} />
          </button>
        </div>
      </header>

      <MenuMovil
        navegacion={navegacion}
        abierto={menuAbierto}
        alCerrar={() => setMenuAbierto(false)}
        rutaActual={rutaActual}
      />
    </>
  )
}

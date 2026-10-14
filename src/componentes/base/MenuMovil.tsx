'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './MenuMovil.module.css'
import { IconoCerrar } from './iconos'
import { bloquearScroll, desbloquearScroll } from './lib/bloqueoScroll'

export interface ItemNavegacion {
  etiqueta: string
  href: string
}

interface MenuMovilProps {
  navegacion: ItemNavegacion[]
  abierto: boolean
  alCerrar: () => void
  rutaActual?: string
}

export function MenuMovil({
  navegacion,
  abierto,
  alCerrar,
  rutaActual,
}: MenuMovilProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (abierto) {
      bloquearScroll()
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      desbloquearScroll()
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [abierto])

  useEffect(() => {
    return () => {
      desbloquearScroll()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={styles.menuDialogo}
      onCancel={(e) => {
        e.preventDefault()
        alCerrar()
      }}
    >
      <div className={styles.cabecera}>
        <span className={styles.tituloMenu}>Menú</span>
        <button
          type="button"
          className={styles.botonCerrar}
          onClick={alCerrar}
          aria-label="Cerrar menú"
        >
          <IconoCerrar size={24} />
        </button>
      </div>

      <nav className={styles.navegacion} aria-label="Navegación móvil">
        {navegacion.map((item) => {
          const esActivo =
            rutaActual === item.href ||
            (item.href === '/colecciones' && rutaActual?.startsWith('/colecciones')) ||
            (item.href === '/fotos' && rutaActual === '/fotos')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.enlace} ${esActivo ? styles.enlaceActivo : ''}`}
              aria-current={esActivo ? 'page' : undefined}
              onClick={alCerrar}
            >
              {item.etiqueta}
            </Link>
          )
        })}
      </nav>
    </dialog>
  )
}


'use client'

import React, { useEffect, useRef } from 'react'
import styles from './Dialogo.module.css'
import { IconoCerrar } from './iconos'
import { bloquearScroll, desbloquearScroll } from './lib/bloqueoScroll'

interface DialogoProps {
  abierto: boolean
  alCerrar: () => void
  titulo?: string
  children: React.ReactNode
  className?: string
}

export function Dialogo({
  abierto,
  alCerrar,
  titulo,
  children,
  className = '',
}: DialogoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const disparadorRef = useRef<Element | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (abierto) {
      disparadorRef.current = document.activeElement
      bloquearScroll()
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      desbloquearScroll()
      if (dialog.open) {
        dialog.close()
      }
      if (disparadorRef.current && 'focus' in disparadorRef.current) {
        ;(disparadorRef.current as HTMLElement).focus()
      }
    }

    return () => {
      desbloquearScroll()
    }
  }, [abierto])

  const manejarCancel = (e: React.SyntheticEvent) => {
    e.preventDefault()
    alCerrar()
  }

  if (!abierto) return null

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialogo} ${className}`}
      onCancel={manejarCancel}
    >
      <div className={styles.panel}>
        <div className={styles.cabecera}>
          {titulo ? <h2 className={styles.titulo}>{titulo}</h2> : <div />}
          <button
            type="button"
            className={styles.botonCerrar}
            onClick={alCerrar}
            aria-label="Cerrar diálogo"
          >
            <IconoCerrar size={20} />
          </button>
        </div>
        <div className={styles.cuerpo}>{children}</div>
      </div>
    </dialog>
  )
}

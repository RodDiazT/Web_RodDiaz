'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import styles from './Visor.module.css'
import { IconoCerrar, IconoFlechaIzquierda, IconoFlechaDerecha } from './iconos'
import { MarcoFoto, FotoMarco } from './MarcoFoto'
import { bloquearScroll, desbloquearScroll } from './lib/bloqueoScroll'

interface VisorProps {
  fotos: FotoMarco[]
  indiceInicial?: number
  abierto: boolean
  alCerrar: () => void
  alCambiar?: (nuevoIndice: number) => void
  accion?: React.ReactNode
}

export function Visor({
  fotos,
  indiceInicial = 0,
  abierto,
  alCerrar,
  alCambiar,
  accion,
}: VisorProps) {
  const [indice, setIndice] = useState(indiceInicial)
  const [desplazamientoX, setDesplazamientoX] = useState(0)
  const [enZoom, setEnZoom] = useState(false)
  const [origenZoom, setOrigenZoom] = useState({ x: 50, y: 50 })

  const [arrastrando, setArrastrando] = useState(false)

  const dialogRef = useRef<HTMLDialogElement>(null)
  const disparadorRef = useRef<Element | null>(null)
  const arrastrandoRef = useRef(false)
  const inicioXRef = useRef(0)
  const tiempoInicioRef = useRef(0)
  const ultimoTapRef = useRef(0)

  useEffect(() => {
    setIndice(indiceInicial)
  }, [indiceInicial])

  const cambiarIndice = useCallback(
    (nuevo: number) => {
      if (nuevo >= 0 && nuevo < fotos.length) {
        setIndice(nuevo)
        setEnZoom(false)
        alCambiar?.(nuevo)
      }
    },
    [fotos.length, alCambiar]
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (abierto && fotos.length > 0) {
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
  }, [abierto, fotos.length])

  useEffect(() => {
    return () => {
      desbloquearScroll()
    }
  }, [])

  // Navegación por teclado instantánea (← → Esc)
  useEffect(() => {
    if (!abierto) return

    const manejarTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        alCerrar()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        cambiarIndice(indice - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        cambiarIndice(indice + 1)
      }
    }

    window.addEventListener('keydown', manejarTeclado)
    return () => window.removeEventListener('keydown', manejarTeclado)
  }, [abierto, indice, cambiarIndice, alCerrar])

  const fotoActual = fotos[indice] || fotos[0]

  // Precarga de fotos vecinas en 1200px (§5.4)
  const fotoAnterior = indice > 0 ? fotos[indice - 1] : null
  const fotoSiguiente = indice < fotos.length - 1 ? fotos[indice + 1] : null

  // Control táctil de puntero (deslizamiento 1:1)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (enZoom) return

    arrastrandoRef.current = true
    setArrastrando(true)
    inicioXRef.current = e.clientX
    tiempoInicioRef.current = Date.now()
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrastrandoRef.current || enZoom) return

    const delta = e.clientX - inicioXRef.current

    // Resistencia elástica en los extremos
    const enExtremo =
      (indice === 0 && delta > 0) || (indice === fotos.length - 1 && delta < 0)
    const deltaConResistencia = enExtremo ? delta * 0.35 : delta

    setDesplazamientoX(deltaConResistencia)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrastrandoRef.current || enZoom) return
    arrastrandoRef.current = false
    setArrastrando(false)

    const delta = e.clientX - inicioXRef.current
    const duracionMs = Date.now() - tiempoInicioRef.current
    const velocidad = Math.abs(delta) / duracionMs
    const anchoPantalla = window.innerWidth

    // Umbrales del sistema de diseño (§5.4): > 25% del ancho o velocidad > 0.11 px/ms
    const superarUmbral = Math.abs(delta) > anchoPantalla * 0.25 || velocidad > 0.11

    if (superarUmbral) {
      if (delta > 0 && indice > 0) {
        cambiarIndice(indice - 1)
      } else if (delta < 0 && indice < fotos.length - 1) {
        cambiarIndice(indice + 1)
      }
    }

    setDesplazamientoX(0)
  }


  // Doble toque (double-tap zoom 2.5x) para inspección Fine Art (§5.4, §12)
  const manejarDobleToque = (e: React.MouseEvent<HTMLDivElement>) => {
    const ahora = Date.now()
    const tiempoEntreTaps = ahora - ultimoTapRef.current
    ultimoTapRef.current = ahora

    if (tiempoEntreTaps < 300) {
      // Doble toque detectado
      if (enZoom) {
        setEnZoom(false)
      } else {
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = ((e.clientX - rect.left) / rect.width) * 100
        const clickY = ((e.clientY - rect.top) / rect.height) * 100
        setOrigenZoom({ x: Math.max(0, Math.min(100, clickX)), y: Math.max(0, Math.min(100, clickY)) })
        setEnZoom(true)
      }
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialogoVisor}
      onCancel={(e) => {
        e.preventDefault()
        alCerrar()
      }}
      aria-label="Visor de fotografía a pantalla completa"
    >
      <div className={styles.barraSuperior}>
        <span className={styles.contador}>
          {indice + 1} de {fotos.length}
        </span>
        <button
          type="button"
          className={styles.botonCerrar}
          onClick={alCerrar}
          aria-label="Cerrar visor"
        >
          <IconoCerrar size={24} />
        </button>
      </div>

      <div
        className={styles.escenario}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={manejarDobleToque}
      >
        {indice > 0 && (
          <button
            type="button"
            className={`${styles.flechaNavegacion} ${styles.flechaAnterior}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              cambiarIndice(indice - 1)
            }}
            aria-label="Fotografía anterior"
          >
            <IconoFlechaIzquierda size={24} />
          </button>
        )}

        <div
          className={`${styles.fotoWrapper} ${enZoom ? styles.fotoZoom : ''}`}
          style={{
            transform: enZoom
              ? `scale(2.5)`
              : `translateX(${desplazamientoX}px)`,
            transformOrigin: `${origenZoom.x}% ${origenZoom.y}%`,
            transition: arrastrando ? 'none' : undefined,
          }}
        >
          <MarcoFoto foto={fotoActual} modo="visor" prioridad />
        </div>

        {indice < fotos.length - 1 && (
          <button
            type="button"
            className={`${styles.flechaNavegacion} ${styles.flechaSiguiente}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              cambiarIndice(indice + 1)
            }}
            aria-label="Fotografía siguiente"
          >
            <IconoFlechaDerecha size={24} />
          </button>
        )}
      </div>

      <div className={styles.barraInferior}>
        <span className={styles.tituloFoto}>{fotoActual.titulo}</span>
        {accion && <div className={styles.accionWrapper}>{accion}</div>}
      </div>

      {/* Precarga no visible de vecinas en 1200px (§5.4) */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {fotoAnterior?.sizes?.mediana_webp?.url && (
          <img src={fotoAnterior.sizes.mediana_webp.url} alt="" loading="eager" />
        )}
        {fotoSiguiente?.sizes?.mediana_webp?.url && (
          <img src={fotoSiguiente.sizes.mediana_webp.url} alt="" loading="eager" />
        )}
      </div>
    </dialog>
  )
}


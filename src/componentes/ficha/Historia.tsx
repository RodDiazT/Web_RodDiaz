'use client'

/**
 * Componente cliente para visualización editorial de la historia fotográfica con plegado progresivo.
 * Especificado en DocumentosTecnicos/portafolio/ficha-foto.md (§3.4).
 */

import React, { useState, useEffect, useRef } from 'react'
import styles from './Historia.module.css'

interface HistoriaProps {
  contenido?: any
  className?: string
}

export function Historia({ contenido, className = '' }: HistoriaProps) {
  const [expandido, setExpandido] = useState(false)
  const [esLargo, setEsLargo] = useState(false)
  const [hidratado, setHidratado] = useState(false)
  const textoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHidratado(true)
    const el = textoRef.current
    if (el) {
      // Verificar si supera aproximadamente 4 líneas (> 116px en fuente 17px/1.7)
      if (el.scrollHeight > 120) {
        setEsLargo(true)
      }
    }
  }, [contenido])

  if (!contenido) return null

  // Extraer texto simple si el contenido viene como estructura Lexical o string
  let textoRenderizado: string = ''
  if (typeof contenido === 'string') {
    textoRenderizado = contenido
  } else if (contenido && typeof contenido === 'object' && contenido.root) {
    try {
      const extraerTexto = (nodo: any): string => {
        if (!nodo) return ''
        if (nodo.text) return nodo.text
        if (Array.isArray(nodo.children)) {
          return nodo.children.map(extraerTexto).join(' ')
        }
        return ''
      }
      textoRenderizado = extraerTexto(contenido.root).trim()
    } catch {
      textoRenderizado = ''
    }
  }

  if (!textoRenderizado) return null

  const debePlegar = hidratado && esLargo && !expandido

  return (
    <div className={`${styles.contenedor} ${className}`}>
      <div
        ref={textoRef}
        id="historia-foto-texto"
        className={`${styles.texto} ${debePlegar ? styles.plegado : ''}`}
        lang="es-CL"
      >
        <p>{textoRenderizado}</p>
      </div>

      {hidratado && esLargo && (
        <button
          type="button"
          className={styles.botonPlegado}
          onClick={() => setExpandido(!expandido)}
          aria-expanded={expandido}
          aria-controls="historia-foto-texto"
        >
          {expandido ? 'Leer menos' : 'Leer más'}
        </button>
      )}
    </div>
  )
}

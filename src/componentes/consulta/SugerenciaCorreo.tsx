'use client'

/**
 * Sugerencia accesible e interactiva para correos con errores comunes de tipeo (§3.5).
 */

import React from 'react'
import { sugerirCorreo } from '@/lib/consultas'

interface SugerenciaCorreoProps {
  correo: string
  alAceptar: (sugerido: string) => void
}

export function SugerenciaCorreo({ correo, alAceptar }: SugerenciaCorreoProps) {
  const sugerencia = sugerirCorreo(correo)

  if (!sugerencia) return null

  return (
    <div
      style={{
        marginTop: 'var(--esp-1)',
        fontSize: 'var(--texto-xs)',
        color: 'var(--color-texto-secundario)',
      }}
    >
      ¿Quisiste decir{' '}
      <button
        type="button"
        onClick={() => alAceptar(sugerencia)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'var(--color-texto)',
          textDecoration: 'underline',
          cursor: 'pointer',
          font: 'inherit',
          fontWeight: 600,
        }}
      >
        {sugerencia}
      </button>
      ?
    </div>
  )
}

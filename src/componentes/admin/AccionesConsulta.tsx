'use client'

/**
 * Barra de acciones operativas para responder y gestionar el estado de una consulta (§3.7, §5.2.6).
 */

import React, { useState } from 'react'
import { urlRespuestaGmail } from '@/lib/consultas'

interface AccionesConsultaProps {
  consultaId: string | number
  nombre: string
  correo: string
  estado: string
  items?: any[]
  plantillaRespuesta?: string | null
  correoRod?: string
  alCambiarEstado?: (nuevoEstado: string) => void
}

export function AccionesConsulta({
  consultaId,
  nombre,
  correo,
  estado: estadoInicial,
  items,
  plantillaRespuesta,
  correoRod,
  alCambiarEstado,
}: AccionesConsultaProps) {
  const [estado, setEstado] = useState(estadoInicial)
  const [actualizando, setActualizando] = useState(false)

  const { urlGmail, urlMailto } = urlRespuestaGmail(
    { nombre, correo, items },
    plantillaRespuesta,
    correoRod
  )

  const actualizarEstado = async (nuevoEstado: string) => {
    setActualizando(true)
    try {
      const res = await fetch(`/api/consultas/${consultaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (res.ok) {
        setEstado(nuevoEstado)
        alCambiarEstado?.(nuevoEstado)
      }
    } catch {
      // Error de red
    } finally {
      setActualizando(false)
    }
  }

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--theme-elevation-100, #222)',
        border: '1px solid var(--theme-elevation-200, #333)',
        borderRadius: '6px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        margin: '16px 0',
      }}
    >
      {/* Botón principal: Responder por Gmail (§3.7, §5.2.6) */}
      <a
        href={urlGmail}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          backgroundColor: '#c5221f',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '13px',
          borderRadius: '4px',
          textDecoration: 'none',
        }}
      >
        ✉️ Responder por Gmail
      </a>

      {/* Enlace mailto alternativo */}
      <a
        href={urlMailto}
        style={{
          fontSize: '12px',
          color: 'var(--theme-elevation-600, #aaa)',
          textDecoration: 'underline',
        }}
      >
        Usar otro programa
      </a>

      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--theme-elevation-250, #444)', margin: '0 4px' }} />

      {/* Botones de transición de estado (§5.2.7) */}
      {estado !== 'respondida' && (
        <button
          type="button"
          disabled={actualizando}
          onClick={() => actualizarEstado('respondida')}
          style={{
            padding: '6px 12px',
            backgroundColor: 'var(--theme-success-500, #38a169)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          ✓ Marcar respondida
        </button>
      )}

      {estado !== 'cerrada' && (
        <button
          type="button"
          disabled={actualizando}
          onClick={() => actualizarEstado('cerrada')}
          style={{
            padding: '6px 12px',
            backgroundColor: 'var(--theme-elevation-200, #333)',
            color: 'var(--theme-text, #fff)',
            border: '1px solid var(--theme-elevation-300, #555)',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Cerrar
        </button>
      )}

      {estado === 'spam' ? (
        <button
          type="button"
          disabled={actualizando}
          onClick={() => actualizarEstado('nueva')}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: 'var(--theme-elevation-600, #aaa)',
            border: '1px solid var(--theme-elevation-300, #555)',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          No es spam
        </button>
      ) : (
        <button
          type="button"
          disabled={actualizando}
          onClick={() => actualizarEstado('spam')}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: 'var(--theme-error-500, #e53e3e)',
            border: '1px solid var(--theme-error-500, #e53e3e)',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Es spam
        </button>
      )}
    </div>
  )
}

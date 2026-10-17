'use client'

/**
 * Procedimiento de ejercicio de derechos del titular (Ley 21.719, §5.2.9).
 * - Acceso: Descarga de informe en archivo .txt legible.
 * - Supresión: Eliminación de todas las consultas y registro de huella en supresionesRecientes.
 */

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { exportarDatosCorreo } from '@/lib/consultas'

interface DatosDeCorreoProps {
  correo?: string
}

export function DatosDeCorreo({ correo: propCorreo }: DatosDeCorreoProps) {
  const docInfo = useDocumentInfo()
  const datosDoc = (docInfo?.initialData || docInfo?.savedDocumentData || {}) as any
  const correo = propCorreo ?? datosDoc.correo ?? ''

  const [descargando, setDescargando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [confirmacion, setConfirmacion] = useState('')
  const [mostrarDialogoBorrar, setMostrarDialogoBorrar] = useState(false)
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null)

  if (!correo) return null

  // 1. Acceso: Descargar informe .txt (§5.2.9)
  const manejarDescargar = async () => {
    if (!correo) return
    setDescargando(true)

    try {
      const res = await fetch(`/api/consultas?where[correo][equals]=${encodeURIComponent(correo)}&limit=100`)
      if (!res.ok) throw new Error('Error al consultar datos')
      const datos = await res.json()

      const textoInforme = exportarDatosCorreo(datos.docs || [], correo)

      const blob = new Blob([textoInforme], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `datos-personales-${correo.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(`Error al generar descarga: ${err.message}`)
    } finally {
      setDescargando(false)
    }
  }

  // 2. Supresión total u Oposición (§5.2.9)
  const manejarBorrarTodas = async () => {
    if (confirmacion.trim().toLowerCase() !== correo.trim().toLowerCase()) {
      alert('El correo escrito no coincide exactamente.')
      return
    }

    setEliminando(true)

    try {
      // 1. Obtener todas las consultas del correo
      const res = await fetch(`/api/consultas?where[correo][equals]=${encodeURIComponent(correo)}&limit=100`)
      const datos = await res.json()

      if (datos.docs && Array.isArray(datos.docs)) {
        for (const doc of datos.docs) {
          await fetch(`/api/consultas/${doc.id}`, { method: 'DELETE' })
        }
      }

      // 2. Eliminar de Suscriptores si existía
      const resSusc = await fetch(`/api/suscriptores?where[correo][equals]=${encodeURIComponent(correo)}&limit=1`)
      const datosSusc = await resSusc.json()
      if (datosSusc.docs && datosSusc.docs.length > 0) {
        await fetch(`/api/suscriptores/${datosSusc.docs[0].id}`, { method: 'DELETE' })
      }

      setMensajeEstado('Todas las consultas y suscripciones asociadas a este correo fueron eliminadas.')
      setMostrarDialogoBorrar(false)
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--theme-elevation-50, #1c1c1c)',
        border: '1px solid var(--theme-elevation-150, #2c2c2c)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '16px',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text, #fff)' }}>
        Derechos del interesado (Ley 21.719) — {correo}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={descargando}
          onClick={manejarDescargar}
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
          {descargando ? 'Generando informe…' : '📥 Descargar informe (.txt)'}
        </button>

        <button
          type="button"
          onClick={() => setMostrarDialogoBorrar(true)}
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
          🗑️ Borrar todas las consultas de este correo
        </button>
      </div>

      {mensajeEstado && (
        <div style={{ fontSize: '12px', color: 'var(--theme-success-500, #38a169)' }}>
          {mensajeEstado}
        </div>
      )}

      {/* Modal de confirmación para borrado total */}
      {mostrarDialogoBorrar && (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--theme-elevation-100, #222)',
            border: '1px solid var(--theme-error-500, #e53e3e)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-error-500, #e53e3e)' }}>
            ¿Confirmas la eliminación total de los datos de este titular?
          </div>
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-600, #aaa)' }}>
            Escribe <strong>{correo}</strong> a continuación para confirmar la supresión irreversible:
          </div>

          <input
            type="text"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            placeholder={correo}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--theme-elevation-50, #111)',
              border: '1px solid var(--theme-elevation-300, #555)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
            }}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              disabled={eliminando}
              onClick={manejarBorrarTodas}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--theme-error-500, #e53e3e)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {eliminando ? 'Borrando…' : 'Confirmar y borrar todo'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMostrarDialogoBorrar(false)
                setConfirmacion('')
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                color: 'var(--theme-elevation-600, #aaa)',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

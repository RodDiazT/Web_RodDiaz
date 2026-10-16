'use client'

/**
 * Tarjeta del dashboard para gestión y descarga de respaldos (§3.2, §5.2.7).
 * Especificado en DocumentosTecnicos/plataforma/despliegue.md.
 */

import React, { useState, useEffect, useRef } from 'react'

export function TarjetaRespaldo() {
  const [textoDias, setTextoDias] = useState<string>('Cargando estado...')
  const [alertaDias, setAlertaDias] = useState<boolean>(false)
  const [textoEspacio, setTextoEspacio] = useState<string>('Espacio de imágenes: calculando...')
  const [alertaEspacio, setAlertaEspacio] = useState<boolean>(false)
  const [descargando, setDescargando] = useState<boolean>(false)
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null)

  const dialogRef = useRef<HTMLDialogElement>(null)

  const cargarEstado = () => {
    fetch('/api/respaldo')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTextoDias(data.textoDias || 'Aún no descargas un respaldo')
          setAlertaDias(Boolean(data.alertaDias))
          setTextoEspacio(data.textoEspacio || 'Espacio de imágenes: 0 de 5 GB')
          setAlertaEspacio(Boolean(data.alertaEspacio))
        }
      })
      .catch(() => {
        setTextoDias('Aún no descargas un respaldo')
        setTextoEspacio('Espacio de imágenes: 0 de 5 GB')
      })
  }

  useEffect(() => {
    cargarEstado()
  }, [])

  const abrirModal = () => {
    setErrorDescarga(null)
    if (dialogRef.current) {
      dialogRef.current.showModal()
    }
  }

  const cerrarModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close()
    }
  }

  const ejecutarDescarga = async () => {
    setDescargando(true)
    setErrorDescarga(null)

    try {
      const res = await fetch('/api/respaldo', {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Error en el servidor al generar el respaldo')
      }

      // Obtener nombre sugerido del header
      const disposition = res.headers.get('content-disposition')
      let nombreArchivo = `respaldo-roddiaz-${new Date().toISOString().split('T')[0]}.json.gz`
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) {
          nombreArchivo = match[1]
        }
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nombreArchivo
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Actualizar tarjeta a hace 0 días (§3.2)
      setTextoDias('Último respaldo descargado: hace 0 días')
      setAlertaDias(false)
      cerrarModal()
    } catch {
      setErrorDescarga('No se pudo preparar el respaldo. Inténtalo de nuevo en unos minutos.')
    } finally {
      setDescargando(false)
    }
  }

  const colorAviso = 'var(--theme-warning-500, #f59e0b)'

  return (
    <>
      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--theme-elevation-50, #1c1c1c)',
          border: '1px solid var(--theme-elevation-150, #2c2c2c)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '280px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: 'var(--theme-elevation-500, #888)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          Respaldo
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontSize: '14px',
              color: alertaDias ? colorAviso : 'var(--theme-text, #fff)',
              fontWeight: alertaDias ? 600 : 400,
            }}
          >
            {textoDias}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: alertaEspacio ? colorAviso : 'var(--theme-elevation-500, #888)',
              fontWeight: alertaEspacio ? 600 : 400,
            }}
          >
            {textoEspacio}
          </div>
        </div>

        <div style={{ marginTop: '4px' }}>
          <button
            type="button"
            onClick={abrirModal}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--theme-elevation-150, #2c2c2c)',
              color: 'var(--theme-text, #fff)',
              border: '1px solid var(--theme-elevation-250, #3c3c3c)',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background-color 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-250, #3c3c3c)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-150, #2c2c2c)'
            }}
          >
            Descargar respaldo
          </button>
        </div>
      </div>

      {/* Diálogo modal nativo <dialog> según especificación §3.2 */}
      <dialog
        ref={dialogRef}
        style={{
          border: '1px solid var(--theme-elevation-200, #333)',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: 'var(--theme-elevation-100, #181818)',
          color: 'var(--theme-text, #fff)',
          maxWidth: '440px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>
          Descargar copia de respaldo
        </h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: 1.5, color: 'var(--theme-elevation-700, #bbb)' }}>
          Este archivo tiene tu contenido y los datos de quienes te escribieron. Guárdalo en un lugar seguro, por
          ejemplo tu Google Drive, y borra el anterior.
        </p>

        {errorDescarga && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {errorDescarga}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={cerrarModal}
            disabled={descargando}
            style={{
              padding: '8px 14px',
              backgroundColor: 'transparent',
              color: 'var(--theme-elevation-700, #aaa)',
              border: '1px solid var(--theme-elevation-200, #333)',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: descargando ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={ejecutarDescarga}
            disabled={descargando}
            style={{
              padding: '8px 16px',
              backgroundColor: descargando ? 'var(--theme-elevation-300, #555)' : '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: descargando ? 'not-allowed' : 'pointer',
            }}
          >
            {descargando ? 'Preparando…' : 'Descargar'}
          </button>
        </div>
      </dialog>
    </>
  )
}

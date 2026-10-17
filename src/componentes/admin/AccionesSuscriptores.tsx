'use client'

/**
 * Acciones para gestión de suscriptores a novedades Fine Art (§3.7, §5.2.13).
 * "Copiar correos" para CCO en Gmail y "Dar de baja".
 */

import React, { useState, useEffect } from 'react'

export function AccionesSuscriptores() {
  const [copiado, setCopiado] = useState(false)
  const [copiando, setCopiando] = useState(false)
  const [plantillaCopiada, setPlantillaCopiada] = useState(false)
  const [plantillaNovedades, setPlantillaNovedades] = useState<string>(
    'Recibes este correo porque te suscribiste en Rod Díaz. Si no quieres recibir más, responde BAJA a este correo.'
  )

  useEffect(() => {
    fetch('/api/globals/ajustes-sitio')
      .then((r) => (r.ok ? r.json() : null))
      .then((aj) => {
        if (aj?.plantillaNovedades) {
          setPlantillaNovedades(aj.plantillaNovedades)
        }
      })
      .catch(() => {})
  }, [])

  const manejarCopiarCorreos = async () => {
    setCopiando(true)
    try {
      const res = await fetch('/api/suscriptores?limit=1000&depth=0')
      if (!res.ok) throw new Error('Error al obtener lista')
      const datos = await res.json()

      const correos = (datos.docs || [])
        .map((s: any) => s.correo)
        .filter(Boolean)

      if (correos.length === 0) {
        alert('No hay suscriptores registrados actualmente.')
        return
      }

      const textoCopiado = correos.join(', ')
      await navigator.clipboard.writeText(textoCopiado)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 3000)
    } catch (err: any) {
      alert(`Error al copiar: ${err.message}`)
    } finally {
      setCopiando(false)
    }
  }

  const manejarCopiarPlantilla = async () => {
    try {
      await navigator.clipboard.writeText(plantillaNovedades)
      setPlantillaCopiada(true)
      setTimeout(() => setPlantillaCopiada(false), 3000)
    } catch {
      // Ignorar si no hay permiso de portapapeles
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
        gap: '8px',
        margin: '16px 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={copiando}
          onClick={manejarCopiarCorreos}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--theme-primary-500, #3182ce)',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          {copiando ? 'Copiando…' : '📋 Copiar todos los correos para Gmail'}
        </button>

        <button
          type="button"
          onClick={manejarCopiarPlantilla}
          style={{
            padding: '8px 14px',
            backgroundColor: 'var(--theme-elevation-200, #333)',
            color: 'var(--theme-text, #fff)',
            border: '1px solid var(--theme-elevation-300, #555)',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          📄 Copiar pie de baja (plantilla de Ajustes)
        </button>

        {copiado && (
          <span style={{ fontSize: '12px', color: 'var(--theme-success-500, #38a169)' }}>
            ✓ Correos copiados al portapapeles
          </span>
        )}
        {plantillaCopiada && (
          <span style={{ fontSize: '12px', color: 'var(--theme-success-500, #38a169)' }}>
            ✓ Pie de baja copiado al portapapeles
          </span>
        )}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--theme-elevation-600, #aaa)' }}>
        ⚠️ <strong>Recordatorio de privacidad (Ley 21.719 / Ley 19.496):</strong> Pega siempre los correos en el campo <strong>CCO (Copia Oculta)</strong> de Gmail, nunca en Para ni CC, para proteger la privacidad de los interesados.
      </div>
    </div>
  )
}

'use client'

/**
 * Tarjeta del dashboard para consultas nuevas sin responder (§3.7).
 */

import React, { useState, useEffect } from 'react'

export function TarjetaConsultasNuevas() {
  const [conteo, setConteo] = useState<number | null>(null)
  const [antiguedad, setAntiguedad] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/consultas?where[estado][equals]=nueva&sort=createdAt&limit=1')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.totalDocs === 'number') {
          setConteo(data.totalDocs)
          if (data.docs && data.docs.length > 0 && data.docs[0].createdAt) {
            const fechaAntigua = new Date(data.docs[0].createdAt)
            const diffDias = Math.floor((Date.now() - fechaAntigua.getTime()) / (24 * 60 * 60 * 1000))
            if (diffDias <= 0) {
              setAntiguedad('hoy')
            } else if (diffDias === 1) {
              setAntiguedad('hace 1 día')
            } else {
              setAntiguedad(`hace ${diffDias} días`)
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'var(--theme-elevation-50, #1c1c1c)',
        border: '1px solid var(--theme-elevation-150, #2c2c2c)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '240px',
      }}
    >
      <div style={{ fontSize: '13px', color: 'var(--theme-elevation-500, #888)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Consultas nuevas
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--theme-text, #fff)' }}>
          {cargando ? '—' : conteo ?? 0}
        </span>
        {antiguedad && (
          <span style={{ fontSize: '13px', color: 'var(--theme-elevation-500, #888)' }}>
            (La más antigua: {antiguedad})
          </span>
        )}
      </div>

      <div>
        <a
          href="/admin/collections/consultas?where[estado][equals]=nueva"
          style={{
            fontSize: '13px',
            color: 'var(--theme-primary-500, #3182ce)',
            textDecoration: 'none',
          }}
        >
          Ver consultas nuevas →
        </a>
      </div>
    </div>
  )
}

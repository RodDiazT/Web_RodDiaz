'use client'

/**
 * Tarjeta del dashboard para evolución de consultas por mes con barras CSS nativas (§3.7, §5.2.8).
 */

import React, { useState, useEffect } from 'react'
import { indicadorMensual } from '@/lib/consultas'

export function TarjetaConsultasPorMes() {
  const [datos, setDatos] = useState<{
    meses: Array<{ claveMes: string; etiqueta: string; recibidas: number; respondidas: number }>
    generales: number
  } | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/consultas?limit=500&depth=0')
      .then((res) => (res.ok ? res.json() : null))
      .then((resJson) => {
        if (resJson && Array.isArray(resJson.docs)) {
          const resultado = indicadorMensual(resJson.docs)
          setDatos(resultado)
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--theme-elevation-50, #1c1c1c)',
          border: '1px solid var(--theme-elevation-150, #2c2c2c)',
          borderRadius: '8px',
        }}
      >
        Cargando indicador de consultas...
      </div>
    )
  }

  const meses = datos?.meses || []
  const maxValor = Math.max(
    1,
    ...meses.map((m) => Math.max(m.recibidas, m.respondidas))
  )

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'var(--theme-elevation-50, #1c1c1c)',
        border: '1px solid var(--theme-elevation-150, #2c2c2c)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '680px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--theme-text, #fff)' }}>
            Consultas por mes (Copias Fine Art)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500, #888)' }}>
            Últimos 12 meses · Hora de Chile
          </div>
        </div>

        {datos && (
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-600, #aaa)' }}>
            Mensajes generales: <strong>{datos.generales}</strong>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--theme-elevation-600, #aaa)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#3182ce', borderRadius: '2px' }} />
          <span>Recibidas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#38a169', borderRadius: '2px' }} />
          <span>Respondidas</span>
        </div>
      </div>

      {/* Gráfico de barras en CSS puro (§5.6) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${meses.length}, 1fr)`,
          gap: '8px',
          alignItems: 'flex-end',
          height: '140px',
          paddingTop: '20px',
          borderBottom: '1px solid var(--theme-elevation-200, #333)',
        }}
      >
        {meses.map((m) => {
          const altoRecibidas = Math.round((m.recibidas / maxValor) * 100)
          const altoRespondidas = Math.round((m.respondidas / maxValor) * 100)

          return (
            <div
              key={m.claveMes}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                gap: '2px',
              }}
              title={`${m.etiqueta}: ${m.recibidas} recibidas / ${m.respondidas} respondidas`}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '2px',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                }}
              >
                {/* Barra Recibidas */}
                <div
                  style={{
                    width: '45%',
                    height: `${Math.max(altoRecibidas, m.recibidas > 0 ? 4 : 0)}%`,
                    backgroundColor: '#3182ce',
                    borderRadius: '2px 2px 0 0',
                    minHeight: m.recibidas > 0 ? '4px' : '0',
                  }}
                />
                {/* Barra Respondidas */}
                <div
                  style={{
                    width: '45%',
                    height: `${Math.max(altoRespondidas, m.respondidas > 0 ? 4 : 0)}%`,
                    backgroundColor: '#38a169',
                    borderRadius: '2px 2px 0 0',
                    minHeight: m.respondidas > 0 ? '4px' : '0',
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--theme-elevation-500, #888)',
                  marginTop: '4px',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.etiqueta}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

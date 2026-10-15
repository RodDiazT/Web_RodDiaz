'use client'

/**
 * Lista de otras consultas enviadas por el mismo correo electrónico (§3.7).
 */

import React, { useState, useEffect } from 'react'

interface OtrasConsultasCorreoProps {
  correo: string
  consultaActualId: string | number
}

export function OtrasConsultasCorreo({ correo, consultaActualId }: OtrasConsultasCorreoProps) {
  const [otras, setOtras] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!correo) return

    fetch(`/api/consultas?where[correo][equals]=${encodeURIComponent(correo)}&limit=20`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.docs)) {
          const filtradas = data.docs.filter((d: any) => String(d.id) !== String(consultaActualId))
          setOtras(filtradas)
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [correo, consultaActualId])

  if (cargando) return <div>Cargando historial de consultas...</div>
  if (otras.length === 0) return <div>No hay otras consultas de este correo.</div>

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
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text, #fff)' }}>
        Otras consultas de este correo ({otras.length})
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {otras.map((c) => {
          const fechaStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-CL') : ''
          return (
            <li key={c.id} style={{ fontSize: '12px' }}>
              <a
                href={`/admin/collections/consultas/${c.id}`}
                style={{ color: 'var(--theme-primary-500, #3182ce)', textDecoration: 'none' }}
              >
                Consulta del {fechaStr} · {c.tipo === 'copia' ? 'Copia Fine Art' : 'General'} ({c.estado})
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

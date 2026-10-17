'use client'

/**
 * Globo contador de consultas nuevas en el panel de administración (§3.7).
 */

import React, { useState, useEffect } from 'react'

export function ContadorConsultas() {
  const [nuevas, setNuevas] = useState<number>(0)

  useEffect(() => {
    // Consulta conteo de consultas nuevas vía API
    fetch('/api/consultas?where[estado][equals]=nueva&limit=0')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.totalDocs === 'number') {
          setNuevas(data.totalDocs)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <style>{`#change-password, #force-unlock, .auth-fields__controls { display: none !important; }`}</style>
      {nuevas > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
            height: '18px',
            borderRadius: '9px',
            backgroundColor: 'var(--theme-error-500, #e53e3e)',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 'bold',
            marginLeft: '6px',
            lineHeight: 1,
          }}
          title={`${nuevas} consultas nuevas sin responder`}
        >
          {nuevas}
        </span>
      )}
    </>
  )
}

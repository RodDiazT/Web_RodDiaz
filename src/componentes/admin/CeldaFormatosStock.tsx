'use client'

import React from 'react'

interface Props {
  rowData?: any
}

export const CeldaFormatosStock: React.FC<Props> = ({ rowData }) => {
  const formatos = rowData?.formatos
  const total = Array.isArray(formatos) ? formatos.length : 0

  if (total === 0) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 500,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          color: 'var(--theme-elevation-600, #999)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        title="Solo en vitrina (sin formatos de impresión configurados)"
      >
        Vitrina
      </span>
    )
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: 'rgba(212, 175, 55, 0.12)',
        color: '#e5c158',
        border: '1px solid rgba(212, 175, 55, 0.3)',
      }}
      title={`${total} formatos de impresión Fine Art asignados`}
    >
      {total} {total === 1 ? 'formato' : 'formatos'}
    </span>
  )
}

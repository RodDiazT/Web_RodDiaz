'use client'

import React from 'react'
import Link from 'next/link'

interface Props {
  rowData?: any
}

export const CeldaMiniaturaFoto: React.FC<Props> = ({ rowData }) => {
  if (!rowData?.id) return null

  // Priorizar versiones WebP/AVIF optimizadas o la URL base
  const src =
    rowData?.sizes?.pequena_webp?.url ||
    rowData?.sizes?.pequena_avif?.url ||
    rowData?.sizes?.mediana_webp?.url ||
    rowData?.url ||
    (rowData?.filename ? `/api/fotos/file/${rowData.filename}` : '')

  const titulo = rowData?.titulo || 'Sin título'
  const orientacion = rowData?.proporcion?.orientacion || 'horizontal'
  const etiqueta = rowData?.proporcion?.etiqueta || '3:2'
  const rawOriginal = rowData?.nombreArchivoOriginal || ''
  const colorFondo = rowData?.colorDominante || '#1c1b18'

  return (
    <Link
      href={`/admin/collections/fotos/${rowData.id}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
      }}
      title={`${titulo}${rawOriginal ? ` · RAW: ${rawOriginal}` : ''} · ${etiqueta} (${orientacion})`}
    >
      <div
        style={{
          width: '56px',
          height: '42px',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: colorFondo,
          border: '1px solid rgba(255, 255, 255, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.4)',
          flexShrink: 0,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={titulo}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        ) : (
          <span style={{ fontSize: '10px', color: '#888' }}>Foto</span>
        )}
      </div>
    </Link>
  )
}

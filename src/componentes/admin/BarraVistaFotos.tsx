'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface FotoDoc {
  id: number
  titulo?: string | null
  slug?: string | null
  lugar?: string | null
  fecha?: string | null
  estado?: 'borrador' | 'publicada' | 'despublicada' | null
  destacada?: boolean | null
  coleccion?: any
  formatos?: any[] | null
  proporcion?: {
    etiqueta?: string | null
    orientacion?: string | null
    valor?: number | null
  } | null
  nombreArchivoOriginal?: string | null
  colorDominante?: string | null
  filename?: string | null
  url?: string | null
  sizes?: {
    pequena_webp?: { url?: string | null }
    pequena_avif?: { url?: string | null }
    mediana_webp?: { url?: string | null }
  } | null
}

export function BarraVistaFotos() {
  const [modo, setModo] = useState<'tabla' | 'mosaico'>('mosaico')
  const [fotos, setFotos] = useState<FotoDoc[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroColeccion, setFiltroColeccion] = useState<string>('todas')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState<string>('')

  // Cargar preferencia guardada en localStorage
  useEffect(() => {
    try {
      const guardado = localStorage.getItem('roddiaz_admin_vista_fotos')
      if (guardado === 'tabla' || guardado === 'mosaico') {
        setModo(guardado)
      }
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }, [])

  const cambiarModo = (nuevoModo: 'tabla' | 'mosaico') => {
    setModo(nuevoModo)
    try {
      localStorage.setItem('roddiaz_admin_vista_fotos', nuevoModo)
    } catch {
      // Ignorar
    }
  }

  // Cargar fotos para la vista Mosaico y métricas
  useEffect(() => {
    setCargando(true)
    fetch('/api/fotos?limit=200&depth=1&sort=-createdAt')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.docs && Array.isArray(data.docs)) {
          setFotos(data.docs)
        }
      })
      .catch((err) => {
        console.error('Error cargando fotos para vista mosaico:', err)
      })
      .finally(() => {
        setCargando(false)
      })
  }, [])

  // Colecciones únicas detectadas en las fotos cargadas
  const colecciones = useMemo(() => {
    const mapa = new Map<string, { id: string | number; nombre: string; total: number }>()
    fotos.forEach((f) => {
      const col = f.coleccion
      if (col && typeof col === 'object' && col.nombre) {
        const idKey = String(col.id || col.nombre)
        const actual = mapa.get(idKey)
        if (actual) {
          actual.total += 1
        } else {
          mapa.set(idKey, { id: idKey, nombre: col.nombre, total: 1 })
        }
      }
    })
    return Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [fotos])

  // Métricas rápidas de stock
  const metricas = useMemo(() => {
    const total = fotos.length
    const publicadas = fotos.filter((f) => f.estado === 'publicada').length
    const borradores = fotos.filter((f) => f.estado === 'borrador').length
    const enPortada = fotos.filter((f) => f.destacada === true).length
    const enVitrina = fotos.filter((f) => !f.formatos || f.formatos.length === 0).length
    const conCopias = total - enVitrina
    return { total, publicadas, borradores, enPortada, enVitrina, conCopias }
  }, [fotos])

  // Fotos filtradas para la vista Mosaico
  const fotosFiltradas = useMemo(() => {
    return fotos.filter((f) => {
      // Filtro de colección
      if (filtroColeccion !== 'todas') {
        const colId = f.coleccion && typeof f.coleccion === 'object' ? String(f.coleccion.id || f.coleccion.nombre) : ''
        if (colId !== filtroColeccion) return false
      }

      // Filtro de estado
      if (filtroEstado === 'publicada' && f.estado !== 'publicada') return false
      if (filtroEstado === 'borrador' && f.estado !== 'borrador') return false
      if (filtroEstado === 'portada' && !f.destacada) return false
      if (filtroEstado === 'vitrina' && f.formatos && f.formatos.length > 0) return false
      if (filtroEstado === 'copias' && (!f.formatos || f.formatos.length === 0)) return false

      // Búsqueda en vivo (título, lugar, RAW)
      if (busqueda.trim()) {
        const term = busqueda.toLowerCase().trim()
        const t = (f.titulo || '').toLowerCase()
        const l = (f.lugar || '').toLowerCase()
        const r = (f.nombreArchivoOriginal || '').toLowerCase()
        const c = (f.coleccion?.nombre || '').toLowerCase()
        if (!t.includes(term) && !l.includes(term) && !r.includes(term) && !c.includes(term)) {
          return false
        }
      }

      return true
    })
  }, [fotos, filtroColeccion, filtroEstado, busqueda])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        margin: '12px 0 24px 0',
        padding: '16px',
        backgroundColor: 'var(--theme-elevation-50, #141414)',
        border: '1px solid var(--theme-elevation-150, #262626)',
        borderRadius: '8px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Ocultar tabla nativa de Payload cuando el usuario activa el modo Mosaico */}
      {modo === 'mosaico' && (
        <style>{`
          .collection-list__table,
          .table,
          .payload__table,
          table.table {
            display: none !important;
          }
          .collection-list__controls {
            margin-bottom: 8px !important;
          }
        `}</style>
      )}

      {/* Cabecera superior: Métricas de Stock + Alternador de Vista */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--theme-elevation-150, #262626)',
        }}
      >
        {/* Métricas rápidas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{ fontWeight: 600, color: '#fff' }}>
            {metricas.total} {metricas.total === 1 ? 'fotografía' : 'fotografías'} en catálogo
          </span>
          <span style={{ color: 'var(--theme-elevation-400, #666)' }}>•</span>
          <span style={{ color: '#4ade80' }}>{metricas.publicadas} publicadas</span>
          <span style={{ color: 'var(--theme-elevation-400, #666)' }}>•</span>
          <span style={{ color: '#facc15' }}>{metricas.borradores} borradores</span>
          <span style={{ color: 'var(--theme-elevation-400, #666)' }}>•</span>
          <span style={{ color: '#e5c158' }}>{metricas.conCopias} con copias Fine Art</span>
          {metricas.enVitrina > 0 && (
            <>
              <span style={{ color: 'var(--theme-elevation-400, #666)' }}>•</span>
              <span style={{ color: 'var(--theme-elevation-500, #888)' }}>{metricas.enVitrina} en vitrina</span>
            </>
          )}
        </div>

        {/* Botones de alternancia de vista */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--theme-elevation-100, #1e1e1e)',
            border: '1px solid var(--theme-elevation-200, #333)',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => cambiarModo('mosaico')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: modo === 'mosaico' ? 600 : 400,
              color: modo === 'mosaico' ? '#fff' : 'var(--theme-elevation-600, #999)',
              backgroundColor: modo === 'mosaico' ? 'var(--theme-elevation-250, #383838)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            title="Vista de cuadrícula con fotografías grandes (estilo Lightroom / Curaduría)"
          >
            <span style={{ fontSize: '14px' }}>☵</span> Mosaico Visual
          </button>
          <button
            type="button"
            onClick={() => cambiarModo('tabla')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: modo === 'tabla' ? 600 : 400,
              color: modo === 'tabla' ? '#fff' : 'var(--theme-elevation-600, #999)',
              backgroundColor: modo === 'tabla' ? 'var(--theme-elevation-250, #383838)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            title="Vista de tabla detallada con miniaturas y ordenación por columnas"
          >
            <span style={{ fontSize: '14px' }}>≡</span> Tabla Detallada
          </button>
        </div>
      </div>

      {/* Controles interactivos del Modo Mosaico */}
      {modo === 'mosaico' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Fila de Filtros y Búsqueda */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            {/* Buscador en vivo */}
            <div style={{ flex: '1 1 260px', maxWidth: '380px' }}>
              <input
                type="text"
                placeholder="Buscar por título, lugar o RAW Lightroom..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  backgroundColor: 'var(--theme-elevation-100, #1c1c1c)',
                  border: '1px solid var(--theme-elevation-200, #333)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Filtros de Estado */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'todos', label: 'Todos los estados' },
                { id: 'publicada', label: 'Publicadas' },
                { id: 'borrador', label: 'Borradores' },
                { id: 'copias', label: 'Con copias' },
                { id: 'vitrina', label: 'Vitrina' },
                { id: 'portada', label: 'Portada ★' },
              ].map((est) => (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => setFiltroEstado(est.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: filtroEstado === est.id ? 600 : 400,
                    color: filtroEstado === est.id ? '#fff' : 'var(--theme-elevation-600, #aaa)',
                    backgroundColor:
                      filtroEstado === est.id ? 'var(--theme-elevation-300, #444)' : 'var(--theme-elevation-100, #222)',
                    border: '1px solid',
                    borderColor: filtroEstado === est.id ? '#d4af37' : 'var(--theme-elevation-200, #333)',
                    borderRadius: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {est.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros rápidos por Colección */}
          {colecciones.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--theme-elevation-500, #777)', marginRight: '4px' }}>
                Colección:
              </span>
              <button
                type="button"
                onClick={() => setFiltroColeccion('todas')}
                style={{
                  padding: '3px 9px',
                  fontSize: '11px',
                  fontWeight: filtroColeccion === 'todas' ? 600 : 400,
                  color: filtroColeccion === 'todas' ? '#fff' : 'var(--theme-elevation-600, #aaa)',
                  backgroundColor:
                    filtroColeccion === 'todas' ? 'var(--theme-elevation-300, #444)' : 'var(--theme-elevation-100, #222)',
                  border: '1px solid',
                  borderColor: filtroColeccion === 'todas' ? '#d4af37' : 'var(--theme-elevation-200, #333)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                Todas ({fotos.length})
              </button>
              {colecciones.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setFiltroColeccion(String(col.id))}
                  style={{
                    padding: '3px 9px',
                    fontSize: '11px',
                    fontWeight: filtroColeccion === String(col.id) ? 600 : 400,
                    color: filtroColeccion === String(col.id) ? '#fff' : 'var(--theme-elevation-600, #aaa)',
                    backgroundColor:
                      filtroColeccion === String(col.id)
                        ? 'var(--theme-elevation-300, #444)'
                        : 'var(--theme-elevation-100, #222)',
                    border: '1px solid',
                    borderColor: filtroColeccion === String(col.id) ? '#d4af37' : 'var(--theme-elevation-200, #333)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {col.nombre} ({col.total})
                </button>
              ))}
            </div>
          )}

          {/* Cuadrícula Visual de Fotografías (Grid) */}
          {cargando ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#888', fontSize: '14px' }}>
              Cargando catálogo visual de fotografías...
            </div>
          ) : fotosFiltradas.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#888',
                backgroundColor: 'var(--theme-elevation-100, #1a1a1a)',
                borderRadius: '6px',
                border: '1px dashed var(--theme-elevation-200, #333)',
              }}
            >
              No se encontraron fotografías con los filtros seleccionados.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px',
                marginTop: '8px',
              }}
            >
              {fotosFiltradas.map((foto) => {
                const src =
                  foto.sizes?.mediana_webp?.url ||
                  foto.sizes?.pequena_webp?.url ||
                  foto.sizes?.pequena_avif?.url ||
                  foto.url ||
                  (foto.filename ? `/api/fotos/file/${foto.filename}` : '')

                const formatosCount = Array.isArray(foto.formatos) ? foto.formatos.length : 0
                const orientacion = foto.proporcion?.orientacion || 'horizontal'
                const etiquetaProporcion = foto.proporcion?.etiqueta || '3:2'

                return (
                  <Link
                    key={foto.id}
                    href={`/admin/collections/fotos/${foto.id}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'var(--theme-elevation-100, #1a1a1a)',
                      border: '1px solid var(--theme-elevation-200, #2c2c2c)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.borderColor = '#d4af37'
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.borderColor = 'var(--theme-elevation-200, #2c2c2c)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Marco fotográfico con fondo de color dominante */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '180px',
                        backgroundColor: foto.colorDominante || '#121212',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={foto.titulo || 'Foto'}
                          loading="lazy"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '11px', color: '#666' }}>Sin imagen</span>
                      )}

                      {/* Badges superiores sobre la imagen */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          display: 'flex',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            padding: '2px 7px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                            backgroundColor:
                              foto.estado === 'publicada'
                                ? 'rgba(34, 197, 94, 0.88)'
                                : foto.estado === 'borrador'
                                  ? 'rgba(234, 179, 8, 0.88)'
                                  : 'rgba(100, 116, 139, 0.88)',
                            color: '#000',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          }}
                        >
                          {foto.estado || 'Borrador'}
                        </span>
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          display: 'flex',
                          gap: '4px',
                        }}
                      >
                        {foto.destacada && (
                          <span
                            style={{
                              padding: '2px 7px',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: 700,
                              backgroundColor: 'rgba(212, 175, 55, 0.95)',
                              color: '#000',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                            }}
                            title="Foto destacada en el Home"
                          >
                            ★ Portada
                          </span>
                        )}
                      </div>

                      {/* Badge inferior con proporción y orientación */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 500,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: '#ddd',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {etiquetaProporcion} {orientacion === 'vertical' ? '↕' : orientacion === 'cuadrada' ? '■' : '↔'}
                      </div>
                    </div>

                    {/* Ficha descriptiva inferior */}
                    <div
                      style={{
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        flex: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#fff',
                            lineHeight: 1.3,
                            marginBottom: '4px',
                          }}
                        >
                          {foto.titulo || 'Sin título'}
                        </div>

                        {/* Colección y Lugar */}
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--theme-elevation-600, #bbb)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span style={{ color: '#d4af37', fontWeight: 500 }}>
                            {foto.coleccion?.nombre || 'Sin colección'}
                          </span>
                          {foto.lugar && (
                            <>
                              <span style={{ color: '#555' }}>•</span>
                              <span style={{ color: '#888' }}>{foto.lugar}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stock de formatos y RAW original */}
                      <div
                        style={{
                          paddingTop: '8px',
                          borderTop: '1px solid var(--theme-elevation-200, #262626)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          fontSize: '11px',
                        }}
                      >
                        <div>
                          {formatosCount > 0 ? (
                            <span style={{ color: '#e5c158', fontWeight: 600 }}>
                              {formatosCount} {formatosCount === 1 ? 'formato' : 'formatos'}
                            </span>
                          ) : (
                            <span style={{ color: '#777' }}>Vitrina</span>
                          )}
                        </div>

                        {foto.nombreArchivoOriginal && (
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '10px',
                              color: '#666',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '120px',
                            }}
                            title={`Archivo RAW Lightroom: ${foto.nombreArchivoOriginal}`}
                          >
                            {foto.nombreArchivoOriginal}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

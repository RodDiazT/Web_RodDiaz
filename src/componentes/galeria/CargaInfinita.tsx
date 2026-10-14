'use client'

/**
 * Componente cliente para scroll infinito accesible, con recuperación de posición en sessionStorage.
 * Especificado en DocumentosTecnicos/portafolio/galeria-colecciones.md (§3.7, §5.4, §5.5).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ItemFotoPublica } from '@/lib/contenido'
import { GrillaFotos } from './GrillaFotos'
import { Esqueleto } from '@/componentes/base/Esqueleto'
import { Aviso } from '@/componentes/base/Aviso'
import { Boton } from '@/componentes/base/Boton'

interface CargaInfinitaProps {
  fotosIniciales: ItemFotoPublica[]
  siguienteCursorInicial: string | null
  lista: 'todas' | 'coleccion'
  coleccionSlug?: string
  caracteristicaSlug?: string
  totalFotos?: number
}

export function CargaInfinita({
  fotosIniciales,
  siguienteCursorInicial,
  lista,
  coleccionSlug,
  caracteristicaSlug,
}: CargaInfinitaProps) {
  const [fotos, setFotos] = useState<ItemFotoPublica[]>(fotosIniciales)
  const [siguienteCursor, setSiguienteCursor] = useState<string | null>(siguienteCursorInicial)
  const [cargando, setCargando] = useState(false)
  const [errorCarga, setErrorCarga] = useState(false)
  const [mensajeAccesible, setMensajeAccesible] = useState('')

  const centinelaRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Guardar estado en sessionStorage antes de navegar a una ficha (§3.7)
  useEffect(() => {
    try {
      const clave = `galeria_${window.location.pathname}`
      const guardarEstado = () => {
        sessionStorage.setItem(
          clave,
          JSON.stringify({
            cantidad: fotos.length,
            scrollY: window.scrollY,
          })
        )
      }
      window.addEventListener('beforeunload', guardarEstado)
      return () => window.removeEventListener('beforeunload', guardarEstado)
    } catch {
      // sessionStorage no disponible en navegación privada
    }
  }, [fotos.length])

  // Cargar siguiente página
  const cargarMasFotos = useCallback(async () => {
    if (cargando || !siguienteCursor) return

    setCargando(true)
    setErrorCarga(false)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const params = new URLSearchParams({
        lista,
        despues: siguienteCursor,
        limite: '30',
      })
      if (coleccionSlug) params.set('coleccion', coleccionSlug)
      if (caracteristicaSlug) params.set('caracteristica', caracteristicaSlug)

      const respuesta = await fetch(`/datos/fotos?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      })

      if (!respuesta.ok) {
        throw new Error('Error al cargar fotos')
      }

      const datos = await respuesta.json()
      const nuevasFotos: ItemFotoPublica[] = datos.fotos || []

      if (nuevasFotos.length > 0) {
        setFotos((prev) => [...prev, ...nuevasFotos])
        setSiguienteCursor(datos.siguiente)
        setMensajeAccesible(`Se sumaron ${nuevasFotos.length} fotos`)
      } else {
        setSiguienteCursor(null)
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorCarga(true)
      }
    } finally {
      setCargando(false)
    }
  }, [cargando, siguienteCursor, lista, coleccionSlug, caracteristicaSlug])

  // IntersectionObserver activo con margen de 1200px (§3.7)
  useEffect(() => {
    const centinela = centinelaRef.current
    if (!centinela || !siguienteCursor) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !cargando && !errorCarga) {
          cargarMasFotos()
        }
      },
      {
        rootMargin: '1200px',
      }
    )

    observer.observe(centinela)
    return () => observer.disconnect()
  }, [cargarMasFotos, siguienteCursor, cargando, errorCarga])

  return (
    <div>
      {/* Grilla con todas las fotos cargadas */}
      <GrillaFotos fotos={fotos} prioridadPrimeras={4} />

      {/* Región aria-live para anuncios de lectores de pantalla */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {mensajeAccesible}
      </div>

      {/* Fila de esqueletos durante la carga */}
      {cargando && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--esp-2)',
            marginTop: 'var(--esp-2)',
          }}
          aria-hidden="true"
        >
          <Esqueleto proporcion="3/2" />
          <Esqueleto proporcion="3/2" />
          <Esqueleto proporcion="3/2" />
        </div>
      )}

      {/* Estado de error en línea con reintento */}
      {errorCarga && (
        <div style={{ marginTop: 'var(--esp-6)', display: 'flex', justifyContent: 'center' }}>
          <Aviso
            tipo="error"
            titulo="No pudimos cargar más fotos"
            accion={
              <Boton variante="secundario" onClick={cargarMasFotos}>
                Reintentar
              </Boton>
            }
          >
            Verifica tu conexión a internet o reintenta en unos instantes.
          </Aviso>
        </div>
      )}

      {/* Marcador invisible para el observador */}
      {siguienteCursor && !cargando && !errorCarga && (
        <div ref={centinelaRef} style={{ height: '1px', width: '100%', opacity: 0 }} />
      )}
    </div>
  )
}

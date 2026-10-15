'use client'

/**
 * Modal buscador de fotos disponibles para añadir a la consulta (§3.4).
 * Carga diferida de /datos/fotos-consultables y filtrado en cliente sin tildes.
 */

import React, { useState, useEffect, useMemo } from 'react'
import styles from './BuscadorFotos.module.css'
import { Dialogo } from '@/componentes/base/Dialogo'
import { Campo } from '@/componentes/base/Campo'
import { Esqueleto } from '@/componentes/base/Esqueleto'
import { Aviso } from '@/componentes/base/Aviso'
import { Boton } from '@/componentes/base/Boton'
import { IconoCheck } from '@/componentes/base/iconos'

export interface FotoConsultableItem {
  slug: string
  titulo: string
  lugar?: string
  busqueda: string
  miniatura: {
    webp?: string
    avif?: string
    ancho: number
    alto: number
    colorDominante?: string
  }
  formatos: Array<{
    id: string
    nombre: string
    papeles: Array<{
      id: string
      nombre: string
      descripcion?: string
    }>
  }>
}

interface BuscadorFotosProps {
  abierto: boolean
  slugsYaAgregados: string[]
  alCerrar: () => void
  alSeleccionar: (foto: FotoConsultableItem) => void
}

export function BuscadorFotos({
  abierto,
  slugsYaAgregados,
  alCerrar,
  alSeleccionar,
}: BuscadorFotosProps) {
  const [fotos, setFotos] = useState<FotoConsultableItem[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorCarga, setErrorCarga] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const cargarFotos = () => {
    setCargando(true)
    setErrorCarga(false)

    fetch('/datos/fotos-consultables')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar')
        return res.json()
      })
      .then((datos) => {
        setFotos(datos.fotos || [])
      })
      .catch(() => {
        setErrorCarga(true)
      })
      .finally(() => {
        setCargando(false)
      })
  }

  // Cargar catálogo de fotos consultables al abrir por primera vez (§3.4)
  useEffect(() => {
    if (abierto && fotos.length === 0 && !cargando && !errorCarga) {
      cargarFotos()
    }
  }, [abierto, fotos.length, cargando, errorCarga])

  // Filtrar fotos en cliente sin mayúsculas ni tildes ("nuble" -> "Ñuble") (§3.4)
  const fotosFiltradas = useMemo(() => {
    const termino = busqueda
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    if (!termino) return fotos

    return fotos.filter((f) => f.busqueda.includes(termino))
  }, [fotos, busqueda])

  return (
    <Dialogo abierto={abierto} alCerrar={alCerrar} titulo="Elige una foto">
      <div className={styles.contenedorBuscador}>
        <div className={styles.cabeceraFiltro}>
          <Campo
            tipo="texto"
            etiqueta="Buscar por título o lugar"
            id="buscador-fotos-input"
            name="buscar"
            valor={busqueda}
            alCambiar={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe para buscar..."
            autoFocus
          />
        </div>

        {cargando && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 'var(--esp-3)',
            }}
          >
            <Esqueleto proporcion="3/2" />
            <Esqueleto proporcion="3/2" />
            <Esqueleto proporcion="3/2" />
            <Esqueleto proporcion="3/2" />
          </div>
        )}

        {errorCarga && (
          <Aviso
            tipo="error"
            titulo="No pudimos cargar las fotos"
            accion={
              <Boton variante="secundario" onClick={cargarFotos}>
                Reintentar
              </Boton>
            }
          >
            Verifica tu conexión a internet para cargar el catálogo.
          </Aviso>
        )}

        {!cargando && !errorCarga && fotosFiltradas.length === 0 && (
          <div className={styles.sinResultados}>
            <span>No encontré fotos con «{busqueda}».</span>
            <Boton variante="enlace" onClick={() => setBusqueda('')}>
              Ver todas
            </Boton>
          </div>
        )}

        {!cargando && !errorCarga && fotosFiltradas.length > 0 && (
          <div className={styles.grillaFotosBuscador} role="listbox" aria-label="Fotografías disponibles">
            {fotosFiltradas.map((foto) => {
              const yaAgregada = slugsYaAgregados.includes(foto.slug)

              return (
                <button
                  key={foto.slug}
                  type="button"
                  className={styles.tarjetaFotoBuscador}
                  disabled={yaAgregada}
                  onClick={() => {
                    if (!yaAgregada) {
                      alSeleccionar(foto)
                      alCerrar()
                    }
                  }}
                  aria-label={
                    yaAgregada
                      ? `${foto.titulo} ya está en tu consulta`
                      : `Agregar ${foto.titulo}`
                  }
                  role="option"
                  aria-selected={yaAgregada}
                >
                  <img
                    src={foto.miniatura.webp}
                    alt=""
                    className={styles.miniaturaBuscador}
                    loading="lazy"
                  />

                  <span className={styles.tituloFotoBuscador}>{foto.titulo}</span>
                  {foto.lugar && <span className={styles.lugarFotoBuscador}>{foto.lugar}</span>}

                  {yaAgregada && (
                    <span className={styles.marcaYaAgregada} aria-hidden="true">
                      <IconoCheck size={14} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Dialogo>
  )
}

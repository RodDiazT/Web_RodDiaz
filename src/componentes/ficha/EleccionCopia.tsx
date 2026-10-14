'use client'

/**
 * Contexto de estado para la selección de formato de copia en la ficha de foto.
 * Especificado en DocumentosTecnicos/portafolio/ficha-foto.md (§3.3, §5.2.9, §5.4).
 */

import React, { createContext, useContext, useState, useMemo } from 'react'
import { hrefConsulta } from '@/lib/ficha'

interface ContextoEleccionCopia {
  fotoSlug: string
  formatoSeleccionado: string | null
  seleccionarFormato: (id: string | null) => void
  formatoUnicoId?: string | null
  hrefPrincipal: string
  hrefBarraMovil: string
  hrefVisor: string
}

const EleccionCopiaContext = createContext<ContextoEleccionCopia | null>(null)

export function ProveedorEleccionCopia({
  fotoSlug,
  formatoUnicoId = null,
  children,
}: {
  fotoSlug: string
  formatoUnicoId?: string | null
  children: React.ReactNode
}) {
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<string | null>(formatoUnicoId)

  const valorEfectivo = formatoUnicoId || formatoSeleccionado

  const hrefPrincipal = useMemo(() => {
    return hrefConsulta(fotoSlug, valorEfectivo, 'ficha')
  }, [fotoSlug, valorEfectivo])

  const hrefBarraMovil = useMemo(() => {
    return hrefConsulta(fotoSlug, valorEfectivo, 'ficha')
  }, [fotoSlug, valorEfectivo])

  const hrefVisor = useMemo(() => {
    return hrefConsulta(fotoSlug, valorEfectivo, 'visor')
  }, [fotoSlug, valorEfectivo])

  return (
    <EleccionCopiaContext.Provider
      value={{
        fotoSlug,
        formatoSeleccionado,
        seleccionarFormato: setFormatoSeleccionado,
        formatoUnicoId,
        hrefPrincipal,
        hrefBarraMovil,
        hrefVisor,
      }}
    >
      {children}
    </EleccionCopiaContext.Provider>
  )
}

export function usarEleccionCopia() {
  const ctx = useContext(EleccionCopiaContext)
  if (!ctx) {
    throw new Error('usarEleccionCopia debe utilizarse dentro de un ProveedorEleccionCopia')
  }
  return ctx
}

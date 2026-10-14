'use client'

/**
 * Hook para comportamiento del encabezado ocultable.
 * Especificado en DocumentosTecnicos/identidad/sistema-de-diseno.md (§3.5 O-3, §5.4).
 * 
 * Reglas:
 * - scrollY <= 80 px: siempre visible.
 * - scrollY > 80 px: se oculta al bajar.
 * - Subir >= 24 px seguidos: vuelve a mostrarse.
 * - Si ocultable es false (ej. en la ficha), se mantiene fijo sin ocultarse.
 */

import { useState, useEffect, useRef } from 'react'

export function usarEncabezadoOcultable(ocultable: boolean = true) {
  const [visible, setVisible] = useState(true)
  const ultimoScrollY = useRef(0)
  const acumuladoSubida = useRef(0)

  useEffect(() => {
    if (!ocultable) {
      setVisible(true)
      return
    }

    const manejarScroll = () => {
      const scrollActual = Math.max(0, window.scrollY)
      const delta = scrollActual - ultimoScrollY.current

      if (scrollActual <= 80) {
        // En los primeros 80 px siempre es visible
        setVisible(true)
        acumuladoSubida.current = 0
      } else if (delta > 0) {
        // Desplazamiento hacia abajo: ocultar
        setVisible(false)
        acumuladoSubida.current = 0
      } else {
        // Desplazamiento hacia arriba: acumular
        acumuladoSubida.current += Math.abs(delta)
        if (acumuladoSubida.current >= 24) {
          setVisible(true)
        }
      }

      ultimoScrollY.current = scrollActual
    }

    window.addEventListener('scroll', manejarScroll, { passive: true })
    return () => window.removeEventListener('scroll', manejarScroll)
  }, [ocultable])

  return visible
}

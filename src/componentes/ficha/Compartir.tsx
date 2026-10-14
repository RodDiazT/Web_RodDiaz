'use client'

/**
 * Componente cliente para compartir obra fotográfica.
 * Especificado en DocumentosTecnicos/portafolio/ficha-foto.md (§3.7, §12).
 */

import React, { useState } from 'react'
import styles from './Compartir.module.css'
import { Boton } from '@/componentes/base/Boton'
import { IconoCompartir, IconoWhatsApp } from '@/componentes/base/iconos'

interface CompartirProps {
  tituloFoto: string
  slugFoto: string
  className?: string
}

export function Compartir({ tituloFoto, slugFoto, className = '' }: CompartirProps) {
  const [copiado, setCopiado] = useState(false)
  const [mostrarRespaldo, setMostrarRespaldo] = useState(false)

  // URL canónica sin parámetros de navegación (§3.7)
  const urlCanonica =
    typeof window !== 'undefined'
      ? `${window.location.origin}/fotos/${slugFoto}`
      : `/fotos/${slugFoto}`

  const manejarCompartir = async () => {
    // 1. Web Share API nativo si está disponible
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${tituloFoto} — Rod Díaz`,
          url: urlCanonica,
        })
        return
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // El usuario canceló voluntariamente el diálogo nativo
          return
        }
      }
    }

    // 2. Copiar enlace al portapapeles
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(urlCanonica)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
        return
      } catch {
        // Falló portapapeles
      }
    }

    // 3. Fallback: mostrar campo de selección manual
    setMostrarRespaldo(true)
  }

  const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(
    `Fotografía Fine Art: "${tituloFoto}" por Rod Díaz: ${urlCanonica}`
  )}`

  return (
    <div className={`${styles.contenedor} ${className}`}>
      <div className={styles.filaBotones}>
        <Boton
          variante="enlace"
          icono={<IconoCompartir size={18} />}
          onClick={manejarCompartir}
        >
          Compartir
        </Boton>

        <Boton
          variante="enlace"
          icono={<IconoWhatsApp size={18} />}
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </Boton>
      </div>

      {copiado && (
        <span className={styles.avisoCopiado} role="status" aria-live="polite">
          Enlace copiado al portapapeles
        </span>
      )}

      {mostrarRespaldo && (
        <div className={styles.campoRespaldo}>
          <label htmlFor={`enlace-compartir-${slugFoto}`} style={{ font: 'var(--texto-xs)' }}>
            Copia este enlace:
          </label>
          <input
            id={`enlace-compartir-${slugFoto}`}
            type="text"
            readOnly
            value={urlCanonica}
            className={styles.inputRespaldo}
            onFocus={(e) => e.target.select()}
          />
        </div>
      )}
    </div>
  )
}

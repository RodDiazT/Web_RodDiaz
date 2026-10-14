'use client'

/**
 * Componente cliente para barra fija inferior móvil en la ficha de foto.
 * Especificado en DocumentosTecnicos/portafolio/ficha-foto.md (§3.2).
 */

import React, { useState, useEffect } from 'react'
import styles from './BarraCopiaMovil.module.css'
import { Boton } from '@/componentes/base/Boton'
import { usarEleccionCopia } from './EleccionCopia'
import { FormatoOrientado } from '@/lib/ficha'

interface BarraCopiaMovilProps {
  tituloFoto: string
  formatos: FormatoOrientado[]
  textoBoton?: string
  idBotonPrincipal?: string
}

export function BarraCopiaMovil({
  tituloFoto,
  formatos,
  textoBoton = 'Pedir una copia',
  idBotonPrincipal = 'boton-copia-principal',
}: BarraCopiaMovilProps) {
  const { hrefBarraMovil, formatoSeleccionado } = usarEleccionCopia()
  const [visible, setVisible] = useState(false)

  const formatoDoc = formatos.find((f) => String(f.id) === String(formatoSeleccionado))
  const detalleFormato = formatoDoc ? formatoDoc.etiquetaDimensiones : null

  useEffect(() => {
    const elBoton = document.getElementById(idBotonPrincipal)
    if (!elBoton) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Aparece cuando el botón principal sale por encima de la vista (boundingClientRect.top < 0)
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setVisible(true)
        } else {
          setVisible(false)
        }
      },
      {
        threshold: 0,
      }
    )

    observer.observe(elBoton)
    return () => observer.disconnect()
  }, [idBotonPrincipal])

  return (
    <aside
      className={`${styles.barraMovil} ${visible ? styles.visible : ''}`}
      aria-label="Acción rápida de consulta de copia"
      aria-hidden={!visible}
    >
      <div className={styles.info}>
        <span className={styles.titulo}>{tituloFoto}</span>
        {detalleFormato && <span className={styles.formato}>{detalleFormato}</span>}
      </div>

      <Boton variante="primario" href={hrefBarraMovil} tabIndex={visible ? 0 : -1}>
        {textoBoton}
      </Boton>
    </aside>
  )
}

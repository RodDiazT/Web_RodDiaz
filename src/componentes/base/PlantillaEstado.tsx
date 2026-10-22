'use client'

import React from 'react'
import styles from './PlantillaEstado.module.css'
import { Boton } from './Boton'
import { MarcoFoto, FotoMarco } from './MarcoFoto'

interface PlantillaEstadoProps {
  titulo: string
  texto: string
  etiquetaAccion?: string
  hrefAccion?: string
  alAccionar?: () => void
  foto?: FotoMarco
  className?: string
}

export function PlantillaEstado({
  titulo,
  texto,
  etiquetaAccion = 'Ver todas las fotos',
  hrefAccion = '/fotos',
  alAccionar,
  foto,
  className = '',
}: PlantillaEstadoProps) {
  return (
    <div className={`${styles.contenedor} ${className}`}>
      <h1 className={styles.titulo}>{titulo}</h1>
      <p className={styles.texto}>{texto}</p>

      <div className={styles.accion}>
        {alAccionar ? (
          <Boton variante="secundario" onClick={alAccionar}>
            {etiquetaAccion}
          </Boton>
        ) : (
          <Boton variante="secundario" href={hrefAccion}>
            {etiquetaAccion}
          </Boton>
        )}
      </div>

      {foto && (
        <div className={styles.fotoContainer}>
          <MarcoFoto foto={foto} modo="grilla" />
        </div>
      )}
    </div>
  )
}

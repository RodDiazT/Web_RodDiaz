import React from 'react'
import styles from './DisposicionFicha.module.css'
import { Orientacion } from '@/lib/proporcion'

interface DisposicionFichaProps {
  orientacion?: Orientacion
  ancho?: number
  alto?: number
  foto: React.ReactNode
  titulo: React.ReactNode
  meta: React.ReactNode
  accion: React.ReactNode
  historia?: React.ReactNode
  selectorFormatos?: React.ReactNode
  className?: string
}

export function DisposicionFicha({
  orientacion,
  ancho,
  alto,
  foto,
  titulo,
  meta,
  accion,
  historia,
  selectorFormatos,
  className = '',
}: DisposicionFichaProps) {
  // Evaluación precisa de orientación según especificación (§5.3.1)
  const esVerticalOCuadrada =
    orientacion === 'vertical' ||
    orientacion === 'cuadrada' ||
    (Boolean(ancho && alto) && (ancho! / alto!) <= 1.1)

  if (esVerticalOCuadrada) {
    return (
      <div className={`${styles.contenedor} ${className}`}>
        <div className={styles.columnaLateral}>
          <div className={styles.areaFotoLateral}>{foto}</div>

          <aside className={styles.panelLateral}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-2)' }}>
              {titulo}
              {meta}
            </div>

            {selectorFormatos}

            <div>{accion}</div>

            {historia && <div style={{ marginTop: 'var(--esp-4)' }}>{historia}</div>}
          </aside>
        </div>
      </div>
    )
  }

  // Horizontal o panorámica
  return (
    <div className={`${styles.contenedor} ${className}`}>
      <div className={styles.franjaInferior}>
        <div className={styles.areaFotoHorizontal}>{foto}</div>

        <div className={styles.franjaPrincipal}>
          <div className={styles.franjaIzquierda}>
            {titulo}
            {meta}
          </div>
          <div className={styles.franjaDerecha}>
            {selectorFormatos}
            <div style={{ marginTop: 'var(--esp-2)' }}>{accion}</div>
          </div>
        </div>

        {historia && <div className={styles.areaHistoriaHorizontal}>{historia}</div>}
      </div>
    </div>
  )
}

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
  resumen?: React.ReactNode
  accion: React.ReactNode
  selectorFormatos?: React.ReactNode
  historia?: React.ReactNode
  caracteristicas?: React.ReactNode
  datosTecnicos?: React.ReactNode
  compartir?: React.ReactNode
  navegacion?: React.ReactNode
  masDe?: React.ReactNode
  className?: string
}

export function DisposicionFicha({
  orientacion,
  ancho,
  alto,
  foto,
  titulo,
  meta,
  resumen,
  accion,
  selectorFormatos,
  historia,
  caracteristicas,
  datosTecnicos,
  compartir,
  navegacion,
  masDe,
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
            <div className={styles.cabeceraLateral}>
              {titulo}
              {meta}
              {resumen}
            </div>

            <div className={styles.bloqueAccion}>{accion}</div>

            {selectorFormatos}

            {historia}

            {caracteristicas}

            {datosTecnicos}

            {compartir}
          </aside>
        </div>

        {navegacion && <div className={styles.areaNavegacion}>{navegacion}</div>}
        {masDe && <div className={styles.areaMasDe}>{masDe}</div>}
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
            {resumen}
          </div>
          <div className={styles.franjaDerecha}>
            <div className={styles.bloqueAccion}>{accion}</div>
          </div>
        </div>

        <div className={styles.areaDetallesHorizontal}>
          {selectorFormatos}
          {historia}
          {caracteristicas}
          {datosTecnicos}
          {compartir}
        </div>

        {navegacion && <div className={styles.areaNavegacion}>{navegacion}</div>}
        {masDe && <div className={styles.areaMasDe}>{masDe}</div>}
      </div>
    </div>
  )
}


'use client'

/**
 * Componente cliente para desplegable de Tamaños y Papeles Fine Art
 * Especificado en DocumentosTecnicos/portafolio/ficha-foto.md (§3.3).
 */

import React from 'react'
import styles from './TamanosPapeles.module.css'
import { FormatoOrientado } from '@/lib/ficha'
import { usarEleccionCopia } from './EleccionCopia'
import { IconoCheck } from '@/componentes/base/iconos'

interface TamanosPapelesProps {
  formatos: FormatoOrientado[]
  proporcionOrientada: string
  className?: string
}

export function TamanosPapeles({
  formatos,
  proporcionOrientada,
  className = '',
}: TamanosPapelesProps) {
  const { formatoSeleccionado, seleccionarFormato, formatoUnicoId } = usarEleccionCopia()

  if (!formatos || formatos.length === 0) return null

  // Si hay un solo formato, no se requiere radio selector (§3.3)
  const esUnicoFormato = formatos.length === 1

  const formatoActivoDoc = formatos.find((f) => String(f.id) === String(formatoSeleccionado))

  return (
    <div className={className}>
      <details className={styles.detalles}>
        <summary className={styles.resumen}>
          <span>Tamaños y papeles</span>
          <svg
            className={styles.flechaIcono}
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 10 13 14 9" />
          </svg>
        </summary>

        <div className={styles.contenido}>
          {/* Leyenda de taller de conservación Fine Art (§3.3) */}
          <div className={styles.leyendaTaller}>
            Proporción {proporcionOrientada}. Impresión con margen blanco perimetral de conservación para enmarcado y firma de autor. La imagen no se recorta.
          </div>

          <fieldset className={styles.grupoOpciones}>
            <legend className={styles.opcionLegend}>
              {esUnicoFormato ? 'Formato disponible' : 'Elige un tamaño (opcional)'}
            </legend>

            {formatos.map((formato) => {
              const idStr = String(formato.id)
              const activo = String(formatoSeleccionado) === idStr

              const papelesTexto = formato.papeles
                .map((p) => {
                  const nombre = typeof p === 'object' ? p.nombre : ''
                  const atributos = [
                    p.base ? p.base : null,
                    p.gramajeGsm ? `${p.gramajeGsm} gsm` : null,
                    p.libreDeAcido ? 'libre de ácido' : null,
                  ]
                    .filter(Boolean)
                    .join(', ')
                  return atributos ? `${nombre} (${atributos})` : nombre
                })
                .filter(Boolean)
                .join(' · ')

              if (esUnicoFormato) {
                return (
                  <div key={idStr} className={`${styles.filaOpcion} ${styles.filaOpcionActiva}`}>
                    <div className={styles.infoFormato}>
                      <span className={styles.dimensiones}>{formato.etiquetaDimensiones}</span>
                      {papelesTexto && <span className={styles.papeles}>{papelesTexto}</span>}
                    </div>
                  </div>
                )
              }

              return (
                <label
                  key={idStr}
                  className={`${styles.filaOpcion} ${activo ? styles.filaOpcionActiva : ''}`}
                >
                  <input
                    type="radio"
                    name="formatoImpresion"
                    value={idStr}
                    checked={activo}
                    onChange={() => seleccionarFormato(idStr)}
                    className={styles.radioInput}
                  />

                  <div className={styles.infoFormato}>
                    <span className={styles.dimensiones}>{formato.etiquetaDimensiones}</span>
                    {papelesTexto && <span className={styles.papeles}>{papelesTexto}</span>}
                  </div>

                  {activo && (
                    <span className={styles.indicadorCheck}>
                      <IconoCheck size={16} />
                    </span>
                  )}
                </label>
              )
            })}
          </fieldset>
        </div>
      </details>
    </div>
  )
}

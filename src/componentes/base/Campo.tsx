import React, { useId } from 'react'
import styles from './Campo.module.css'

export type TipoCampo = 'texto' | 'correo' | 'telefono' | 'area' | 'seleccion' | 'casilla'

export interface OpcionSeleccion {
  label: string
  value: string
}

export interface CampoProps {
  id?: string
  tipo?: TipoCampo
  nombre?: string
  name?: string
  etiqueta: string
  ayuda?: string
  error?: string
  obligatorio?: boolean
  requerido?: boolean
  valor?: string | boolean
  valorPorDefecto?: string | boolean
  opciones?: OpcionSeleccion[]
  placeholder?: string
  className?: string
  lineas?: number
  autoComplete?: string
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
  autoFocus?: boolean
  deshabilitado?: boolean
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  alCambiar?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  alDesenfocar?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
}

export function Campo({
  id,
  tipo = 'texto',
  nombre,
  name,
  etiqueta,
  ayuda,
  error,
  obligatorio = false,
  requerido = false,
  valor,
  valorPorDefecto,
  opciones = [],
  placeholder,
  className = '',
  lineas = 4,
  autoComplete,
  enterKeyHint,
  autoFocus,
  deshabilitado = false,
  onChange,
  alCambiar,
  onBlur,
  alDesenfocar,
}: CampoProps) {
  const idUnico = useId()
  const nombreFinal = nombre || name || 'campo'
  const idControl = id || `campo-${nombreFinal}-${idUnico}`
  const idAyuda = ayuda ? `${idControl}-ayuda` : undefined
  const idError = error ? `${idControl}-error` : undefined
  const describedBy = [idError, idAyuda].filter(Boolean).join(' ') || undefined
  const esObligatorio = obligatorio || requerido
  const handleChange = onChange || alCambiar
  const handleBlur = onBlur || alDesenfocar

  if (tipo === 'casilla') {
    return (
      <div className={`${styles.grupo} ${className}`}>
        <label className={styles.grupoCasilla} htmlFor={idControl}>
          <input
            type="checkbox"
            id={idControl}
            name={nombreFinal}
            className={styles.casilla}
            required={esObligatorio}
            disabled={deshabilitado}
            autoFocus={autoFocus}
            checked={typeof valor === 'boolean' ? valor : undefined}
            defaultChecked={typeof valorPorDefecto === 'boolean' ? valorPorDefecto : undefined}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby={describedBy}
          />
          <span className={styles.etiqueta}>
            {etiqueta}
            {!esObligatorio && <span className={styles.opcional}>(opcional)</span>}
          </span>
        </label>
        {ayuda && (
          <p id={idAyuda} className={styles.ayuda}>
            {ayuda}
          </p>
        )}
        {error && (
          <p id={idError} className={styles.mensajeError} role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`${styles.grupo} ${className}`}>
      <label htmlFor={idControl} className={styles.etiqueta}>
        {etiqueta}
        {!esObligatorio && <span className={styles.opcional}>(opcional)</span>}
      </label>

      {tipo === 'area' ? (
        <textarea
          id={idControl}
          name={nombreFinal}
          rows={lineas}
          className={`${styles.control} ${styles.area} ${error ? styles.controlError : ''}`}
          required={esObligatorio}
          disabled={deshabilitado}
          autoFocus={autoFocus}
          placeholder={placeholder}
          autoComplete={autoComplete}
          enterKeyHint={enterKeyHint}
          value={typeof valor === 'string' ? valor : undefined}
          defaultValue={typeof valorPorDefecto === 'string' ? valorPorDefecto : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
        />
      ) : tipo === 'seleccion' ? (
        <select
          id={idControl}
          name={nombreFinal}
          className={`${styles.control} ${error ? styles.controlError : ''}`}
          required={esObligatorio}
          disabled={deshabilitado}
          autoFocus={autoFocus}
          value={typeof valor === 'string' ? valor : undefined}
          defaultValue={typeof valorPorDefecto === 'string' ? valorPorDefecto : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {opciones.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={tipo === 'correo' ? 'email' : tipo === 'telefono' ? 'tel' : 'text'}
          id={idControl}
          name={nombreFinal}
          className={`${styles.control} ${error ? styles.controlError : ''}`}
          required={esObligatorio}
          disabled={deshabilitado}
          autoFocus={autoFocus}
          placeholder={placeholder}
          autoComplete={autoComplete}
          enterKeyHint={enterKeyHint}
          autoCapitalize={tipo === 'correo' ? 'none' : undefined}
          value={typeof valor === 'string' ? valor : undefined}
          defaultValue={typeof valorPorDefecto === 'string' ? valorPorDefecto : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
        />
      )}

      {ayuda && !error && (
        <p id={idAyuda} className={styles.ayuda}>
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className={styles.mensajeError} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

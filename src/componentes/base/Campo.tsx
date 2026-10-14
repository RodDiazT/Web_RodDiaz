import React, { useId } from 'react'
import styles from './Campo.module.css'

export type TipoCampo = 'texto' | 'correo' | 'telefono' | 'area' | 'seleccion' | 'casilla'

interface OpcionSeleccion {
  label: string
  value: string
}

interface CampoProps {
  tipo?: TipoCampo
  nombre: string
  etiqueta: string
  ayuda?: string
  error?: string
  obligatorio?: boolean
  valor?: string | boolean
  valorPorDefecto?: string | boolean
  opciones?: OpcionSeleccion[]
  placeholder?: string
  className?: string
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
}

export function Campo({
  tipo = 'texto',
  nombre,
  etiqueta,
  ayuda,
  error,
  obligatorio = false,
  valor,
  valorPorDefecto,
  opciones = [],
  placeholder,
  className = '',
  onChange,
}: CampoProps) {
  const idUnico = useId()
  const idControl = `campo-${nombre}-${idUnico}`
  const idAyuda = ayuda ? `${idControl}-ayuda` : undefined
  const idError = error ? `${idControl}-error` : undefined
  const describedBy = [idError, idAyuda].filter(Boolean).join(' ') || undefined

  if (tipo === 'casilla') {
    return (
      <div className={`${styles.grupo} ${className}`}>
        <label className={styles.grupoCasilla} htmlFor={idControl}>
          <input
            type="checkbox"
            id={idControl}
            name={nombre}
            className={styles.casilla}
            required={obligatorio}
            checked={typeof valor === 'boolean' ? valor : undefined}
            defaultChecked={typeof valorPorDefecto === 'boolean' ? valorPorDefecto : undefined}
            onChange={onChange}
            aria-describedby={describedBy}
          />
          <span className={styles.etiqueta}>
            {etiqueta}
            {!obligatorio && <span className={styles.opcional}>(opcional)</span>}
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
        {!obligatorio && <span className={styles.opcional}>(opcional)</span>}
      </label>

      {tipo === 'area' ? (
        <textarea
          id={idControl}
          name={nombre}
          className={`${styles.control} ${styles.area} ${error ? styles.controlError : ''}`}
          required={obligatorio}
          placeholder={placeholder}
          value={typeof valor === 'string' ? valor : undefined}
          defaultValue={typeof valorPorDefecto === 'string' ? valorPorDefecto : undefined}
          onChange={onChange}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
        />
      ) : tipo === 'seleccion' ? (
        <select
          id={idControl}
          name={nombre}
          className={`${styles.control} ${error ? styles.controlError : ''}`}
          required={obligatorio}
          value={typeof valor === 'string' ? valor : undefined}
          defaultValue={typeof valorPorDefecto === 'string' ? valorPorDefecto : undefined}
          onChange={onChange}
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
          name={nombre}
          className={`${styles.control} ${error ? styles.controlError : ''}`}
          required={obligatorio}
          placeholder={placeholder}
          autoCapitalize={tipo === 'correo' ? 'none' : undefined}
          value={typeof valor === 'string' ? valor : undefined}
          defaultValue={typeof valorPorDefecto === 'string' ? valorPorDefecto : undefined}
          onChange={onChange}
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

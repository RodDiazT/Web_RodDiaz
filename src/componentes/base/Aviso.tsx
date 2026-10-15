import React from 'react'
import styles from './Aviso.module.css'

export type TipoAviso = 'info' | 'informativo' | 'error' | 'exito'

interface AvisoProps {
  id?: string
  tipo?: TipoAviso
  titulo?: string
  accion?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Aviso({
  id,
  tipo = 'info',
  titulo,
  accion,
  children,
  className = '',
}: AvisoProps) {
  const variante = tipo === 'informativo' ? 'info' : tipo
  const role = variante === 'error' ? 'alert' : 'status'

  return (
    <div id={id} className={`${styles.aviso} ${styles[variante]} ${className}`} role={role}>
      {titulo && <h3 className={styles.titulo}>{titulo}</h3>}
      <div>{children}</div>
      {accion && <div className={styles.accion}>{accion}</div>}
    </div>
  )
}

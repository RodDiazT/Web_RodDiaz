import React from 'react'
import styles from './Aviso.module.css'

export type TipoAviso = 'info' | 'error' | 'exito'

interface AvisoProps {
  tipo?: TipoAviso
  titulo?: string
  accion?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Aviso({
  tipo = 'info',
  titulo,
  accion,
  children,
  className = '',
}: AvisoProps) {
  const role = tipo === 'error' ? 'alert' : 'status'

  return (
    <div className={`${styles.aviso} ${styles[tipo]} ${className}`} role={role}>
      {titulo && <h3 className={styles.titulo}>{titulo}</h3>}
      <div>{children}</div>
      {accion && <div className={styles.accion}>{accion}</div>}
    </div>
  )
}

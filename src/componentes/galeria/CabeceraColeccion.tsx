import React from 'react'
import styles from './CabeceraColeccion.module.css'
import { Retorno } from '@/componentes/base/Retorno'

interface CabeceraColeccionProps {
  nombre: string
  descripcion?: string | null
  totalFotos: number
  retorno?: {
    etiqueta: string
    href: string
  }
  className?: string
}

export function CabeceraColeccion({
  nombre,
  descripcion,
  totalFotos,
  retorno,
  className = '',
}: CabeceraColeccionProps) {
  const conteoTexto = `${totalFotos} ${totalFotos === 1 ? 'foto' : 'fotos'}`

  return (
    <header className={`${styles.cabecera} ${className}`}>
      {retorno && <Retorno etiqueta={retorno.etiqueta} href={retorno.href} />}

      <h1 className={styles.titulo}>{nombre}</h1>

      {descripcion && <p className={styles.descripcion}>{descripcion}</p>}

      <div className={styles.conteo}>{conteoTexto}</div>
    </header>
  )
}

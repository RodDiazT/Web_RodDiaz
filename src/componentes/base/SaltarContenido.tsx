import React from 'react'
import styles from './SaltarContenido.module.css'

export function SaltarContenido() {
  return (
    <a href="#contenido-principal" className={styles.saltar}>
      Saltar al contenido principal
    </a>
  )
}

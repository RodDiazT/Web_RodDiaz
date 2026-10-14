import React from 'react'
import styles from './GrillaFotos.module.css'
import { ItemGrilla } from './ItemGrilla'
import { ItemFotoPublica } from '@/lib/contenido'

interface GrillaFotosProps {
  fotos: ItemFotoPublica[]
  prioridadPrimeras?: number
  className?: string
}

export function GrillaFotos({
  fotos,
  prioridadPrimeras = 4,
  className = '',
}: GrillaFotosProps) {
  if (!fotos || fotos.length === 0) return null

  return (
    <div className={`${styles.contenedorGrilla} ${className}`}>
      <div className={styles.grilla}>
        {fotos.map((foto, index) => (
          <ItemGrilla
            key={foto.slug}
            foto={foto}
            prioridad={index < prioridadPrimeras}
          />
        ))}
      </div>
    </div>
  )
}

'use client'
import React, { useState, useEffect } from 'react'
import styles from './CorreoProtegido.module.css'

interface CorreoProtegidoProps {
  correo: string
  className?: string
}

export function CorreoProtegido({ correo, className }: CorreoProtegidoProps) {
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  const partes = correo.split('@')
  const usuario = partes[0] || ''
  const dominio = partes[1] || ''

  if (!montado) {
    // Renderizado en servidor / sin JavaScript: texto con [arroba] y data attributes separados
    return (
      <span
        className={`${styles.protegido} ${className || ''}`}
        data-u={usuario}
        data-d={dominio}
      >
        {usuario} [arroba] {dominio}
      </span>
    )
  }

  // Al hidratar: enlace mailto interactivo para el visitante humano
  return (
    <a
      href={`mailto:${usuario}@${dominio}`}
      className={`${styles.enlace} ${className || ''}`}
    >
      {usuario}@{dominio}
    </a>
  )
}

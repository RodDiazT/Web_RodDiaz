import React from 'react'
import Link from 'next/link'
import styles from './Boton.module.css'

export type VarianteBoton = 'primario' | 'secundario' | 'enlace'

interface BotonBaseProps {
  variante?: VarianteBoton
  cargando?: boolean
  icono?: React.ReactNode
  children: React.ReactNode
  className?: string
}

type BotonComoBoton = BotonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type BotonComoEnlace = BotonBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

export type BotonProps = BotonComoBoton | BotonComoEnlace

export function Boton({
  variante = 'primario',
  cargando = false,
  icono,
  children,
  className = '',
  href,
  ...props
}: BotonProps) {
  const clases = [
    styles.boton,
    styles[variante],
    cargando ? styles.cargando : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const contenido = (
    <>
      {cargando ? <span className={styles.indicadorCarga} aria-hidden="true" /> : icono}
      <span>{children}</span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={clases}
        aria-busy={cargando}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {contenido}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={clases}
      aria-busy={cargando}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {contenido}
    </button>
  )
}

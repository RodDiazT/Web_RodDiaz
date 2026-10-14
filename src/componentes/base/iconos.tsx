import React from 'react'

/**
 * Íconos SVG oficiales del sistema de diseño (DocumentosTecnicos/identidad/sistema-de-diseno.md §5.4).
 * Dibujados en 20x20 px, trazo de 1.5 px y currentColor.
 */

interface IconoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function IconoMenu({ size = 20, ...props }: IconoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="3" y1="6" x2="17" y2="6" />
      <line x1="3" y1="14" x2="17" y2="14" />
    </svg>
  )
}

export function IconoCerrar({ size = 20, ...props }: IconoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="4" y1="4" x2="16" y2="16" />
      <line x1="16" y1="4" x2="4" y2="16" />
    </svg>
  )
}

export function IconoFlechaIzquierda({ size = 20, ...props }: IconoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="16" y1="10" x2="4" y2="10" />
      <polyline points="9 5 4 10 9 15" />
    </svg>
  )
}

export function IconoFlechaDerecha({ size = 20, ...props }: IconoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="4" y1="10" x2="16" y2="10" />
      <polyline points="11 5 16 10 11 15" />
    </svg>
  )
}

export function IconoAmpliar({ size = 20, ...props }: IconoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polyline points="13 3 17 3 17 7" />
      <polyline points="7 17 3 17 3 13" />
      <line x1="17" y1="3" x2="11" y2="9" />
      <line x1="3" y1="17" x2="9" y2="11" />
    </svg>
  )
}

export function IconoCheck({ size = 14, ...props }: IconoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polyline points="4 10 8 14 16 6" />
    </svg>
  )
}

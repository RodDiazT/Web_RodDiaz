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

export function IconoCompartir({ size = 20, ...props }: IconoProps) {
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
      <circle cx="15" cy="5" r="2.5" />
      <circle cx="5" cy="10" r="2.5" />
      <circle cx="15" cy="15" r="2.5" />
      <line x1="7.2" y1="8.9" x2="12.8" y2="6.1" />
      <line x1="7.2" y1="11.1" x2="12.8" y2="13.9" />
    </svg>
  )
}

export function IconoWhatsApp({ size = 20, ...props }: IconoProps) {
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
      <path d="M10 2.5a7.5 7.5 0 0 0-6.4 11.4L2.5 17.5l3.8-1a7.5 7.5 0 1 0 3.7-14z" />
      <path d="M7.5 7.2c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.1 1.8 2.8 4.4 3.9 2.1.9 2.6.7 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.4s-1.5-.7-1.7-.8c-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.1.1-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.1-.2 0-.4.1-.5.1-.1.3-.3.4-.4.1-.1.2-.3.3-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.5-.8-2z" />
    </svg>
  )
}


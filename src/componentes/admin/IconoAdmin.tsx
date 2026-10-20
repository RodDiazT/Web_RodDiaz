import React from 'react'

/**
 * Monograma / Ícono de Rod Díaz para la barra de navegación del panel Payload (/admin).
 * Basado en el Manual de Marca 2026 (§03 Monograma y símbolo).
 */
export function IconoAdmin() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/marca/RodDiaz-RD-icono-oscuro.svg"
      alt="RD"
      width={28}
      height={28}
      style={{
        width: '28px',
        height: '28px',
        display: 'block',
        borderRadius: '4px',
      }}
    />
  )
}

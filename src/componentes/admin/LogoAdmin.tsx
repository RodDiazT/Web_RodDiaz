import React from 'react'

/**
 * Logotipo principal apilado de Rod Díaz para la pantalla de acceso de Payload (/admin/login).
 * Respeta el tamaño mínimo en pantalla (≥ 160 px de ancho) del Manual de Marca 2026 (§02).
 */
export function LogoAdmin() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 0',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/marca/RodDiaz-logo-apilado-blanco.svg"
        alt="Rod Díaz"
        width={220}
        height={68}
        style={{
          width: '220px',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  )
}

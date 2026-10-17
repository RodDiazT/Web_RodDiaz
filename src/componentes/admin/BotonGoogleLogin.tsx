'use client'

/**
 * Botón "Entrar con Google" en /admin/login (§3.3, §4, §5.3, §9.17).
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md.
 */

import React, { useEffect, useState } from 'react'

export function BotonGoogleLogin() {
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setErrorCodigo(params.get('error'))
    }
  }, [])

  const mensajeError =
    errorCodigo === 'no_autorizado'
      ? 'Esta cuenta no tiene acceso'
      : errorCodigo
        ? 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.'
        : null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px',
        width: '100%',
      }}
    >
      <style>{`.login__form { display: none !important; }`}</style>
      {mensajeError && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.14)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            color: '#fca5a5',
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {mensajeError}
        </div>
      )}

      <a
        href="/api/oauth/google"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 20px',
          backgroundColor: '#ffffff',
          color: '#151515',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
          cursor: 'pointer',
          boxSizing: 'border-box',
          transition: 'opacity 0.15s ease',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
        Entrar con Google
      </a>
    </div>
  )
}

'use client'

/**
 * Estado de éxito tras el envío de la consulta (§3.6).
 * Animación sobria de celebración (✓ de 20px en 300ms, respeta prefers-reduced-motion) y foco en título.
 */

import React, { useEffect, useRef } from 'react'
import styles from './ExitoConsulta.module.css'
import { Boton } from '@/componentes/base/Boton'

interface ExitoConsultaProps {
  resumen: {
    nombre: string
    correo: string
    tipo: 'copia' | 'general'
    items: Array<{
      tituloFoto: string
      slugFoto: string
      formato?: string
      papel?: string
    }>
    aceptaPromociones: boolean
  }
  textoConsultaRecibida?: string
  correoContacto?: string
  fotoOrigen?: {
    titulo: string
    slug: string
  } | null
}

export function ExitoConsulta({
  resumen,
  textoConsultaRecibida = 'Te respondo a {correo} en los próximos días. Si no ves mi respuesta, revisa la carpeta de spam.',
  correoContacto = 'rodrigodiaztapia@gmail.com',
  fotoOrigen,
}: ExitoConsultaProps) {
  const tituloRef = useRef<HTMLHeadingElement>(null)

  // Desplazar foco al título para lectores de pantalla (§3.6)
  useEffect(() => {
    tituloRef.current?.focus()
  }, [])

  const mensajeLimpio = textoConsultaRecibida.replace(/{correo}/g, resumen.correo)
  const esCopia = resumen.tipo === 'copia' && resumen.items.length > 0

  return (
    <div className={styles.contenedorExito} role="status">
      <div className={styles.cabeceraExito}>
        {/* ✓ animado de 20px trazado en 300ms (§3.6) */}
        <div className={styles.iconoCheckCirculo} aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.checkSvg}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1
          ref={tituloRef}
          tabIndex={-1}
          className={styles.titulo}
          style={{ outline: 'none' }}
        >
          {esCopia ? 'Recibimos tu consulta' : 'Recibimos tu mensaje'}
        </h1>
      </div>

      <p className={styles.textoConfirmacion}>{mensajeLimpio}</p>

      {/* Resumen de obras solicitadas (§3.6) */}
      {esCopia && (
        <div className={styles.resumenObras}>
          <div className={styles.tituloResumen}>Obras incluidas en tu consulta:</div>
          <ul className={styles.listaResumen}>
            {resumen.items.map((it, idx) => (
              <li key={`${it.slugFoto}-${idx}`} className={styles.itemResumen}>
                <span className={styles.itemNombre}>{it.tituloFoto}</span>
                {it.formato && <span> · {it.formato}</span>}
                {it.papel && <span> · {it.papel}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mensaje de suscripción a novedades si marcó casilla (§3.6) */}
      {resumen.aceptaPromociones && (
        <p className={styles.textoNovedades}>
          También te sumé a las novedades. Puedes darte de baja cuando quieras escribiendo a{' '}
          <a
            href={`mailto:${correoContacto}?subject=BAJA`}
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            {correoContacto}
          </a>
          .
        </p>
      )}

      {/* Acciones principales */}
      <div className={styles.acciones}>
        <Boton variante="primario" href="/fotos">
          Seguir mirando fotos
        </Boton>

        {fotoOrigen && (
          <Boton variante="secundario" href={`/fotos/${fotoOrigen.slug}`}>
            Volver a {fotoOrigen.titulo}
          </Boton>
        )}
      </div>
    </div>
  )
}

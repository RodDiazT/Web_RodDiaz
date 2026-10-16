import React from 'react'
import Link from 'next/link'
import styles from './Pie.module.css'

interface PieProps {
  nombreSitio?: string
  textoDerechos?: string
  instagramUrl?: string
  enlacesLegales?: {
    contacto?: boolean
    privacidad?: boolean
    condiciones?: boolean
  }
}

export function Pie({
  nombreSitio = 'Rod Díaz',
  textoDerechos = 'Todos los derechos reservados',
  instagramUrl = 'https://instagram.com/roddiazt',
  enlacesLegales,
}: PieProps) {
  const anio = new Date().getFullYear()

  const mostrarContacto = enlacesLegales ? Boolean(enlacesLegales.contacto) : true
  const mostrarPrivacidad = enlacesLegales ? Boolean(enlacesLegales.privacidad) : true
  const mostrarCondiciones = enlacesLegales ? Boolean(enlacesLegales.condiciones) : true

  return (
    <footer className={styles.pie}>
      <div className={styles.contenedor}>
        <div className={styles.derechos}>
          © {anio} {nombreSitio} · {textoDerechos}
        </div>

        <nav aria-label="Enlaces secundarios y legales">
          <ul className={styles.enlaces}>
            {instagramUrl && (
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="me noopener"
                  className={styles.enlace}
                >
                  Instagram
                </a>
              </li>
            )}
            {mostrarContacto && (
              <li>
                <Link href="/contacto" className={styles.enlace}>
                  Contacto
                </Link>
              </li>
            )}
            {mostrarPrivacidad && (
              <li>
                <Link href="/privacidad" className={styles.enlace}>
                  Privacidad
                </Link>
              </li>
            )}
            {mostrarCondiciones && (
              <li>
                <Link href="/condiciones" className={styles.enlace}>
                  Condiciones
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

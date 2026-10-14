import React from 'react'
import Link from 'next/link'
import styles from './Pie.module.css'

interface PieProps {
  nombreSitio?: string
  textoDerechos?: string
  instagramUrl?: string
}

export function Pie({
  nombreSitio = 'Rod Díaz',
  textoDerechos = 'Todos los derechos reservados',
  instagramUrl = 'https://instagram.com/roddiazt',
}: PieProps) {
  const anio = new Date().getFullYear()

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
                  rel="noopener noreferrer"
                  className={styles.enlace}
                >
                  Instagram
                </a>
              </li>
            )}
            <li>
              <Link href="/contacto" className={styles.enlace}>
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className={styles.enlace}>
                Privacidad
              </Link>
            </li>
            <li>
              <Link href="/condiciones" className={styles.enlace}>
                Condiciones
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}

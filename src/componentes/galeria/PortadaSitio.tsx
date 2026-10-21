import React from 'react'
import Link from 'next/link'
import styles from './PortadaSitio.module.css'
import { MarcoFoto } from '@/componentes/base/MarcoFoto'
import { Boton } from '@/componentes/base/Boton'
import { ItemFotoPublica } from '@/lib/contenido'

interface PortadaSitioProps {
  foto: ItemFotoPublica
  nombreSitio?: string
  className?: string
}

export function PortadaSitio({
  foto,
  nombreSitio = 'Rod Díaz',
  className = '',
}: PortadaSitioProps) {
  const pieFoto = [foto.titulo, foto.lugar].filter(Boolean).join(' · ')
  const ratio = foto.ancho && foto.alto ? foto.ancho / foto.alto : 1.5

  return (
    <section className={`${styles.seccionPortada} ${className}`} aria-label="Apertura y fotografía de portada">
      {/* 1. Hero Editorial (Apertura de autor con storytelling e intención clara) */}
      <div className={styles.cabeceraHero}>
        <p className={styles.eyebrow}>{nombreSitio} · Fotografía Fine Art</p>
        <h1 className={styles.tituloHero}>El papel detiene el tiempo.</h1>
        <p className={styles.bajadaHero}>
          Fotografías de paisaje y naturaleza en el sur del mundo y cordilleras remotas. Obras de autor concebidas para cobrar vida en copias impresas en taller propio en papeles de algodón de calidad museo.
        </p>
        <div className={styles.accionesHero}>
          <Boton variante="secundario" href="#seccion-colecciones">
            Explorar colecciones ↓
          </Boton>
          <Boton variante="enlace" href="/fotos">
            Ver catálogo de fotos →
          </Boton>
        </div>
      </div>

      {/* 2. La fotografía protagonista con respiro y marco de autor */}
      <div className={styles.marcoHero}>
        <Link
          href={foto.href}
          className={styles.enlacePortada}
          aria-label={`Ver ficha de la fotografía ${foto.titulo}`}
        >
          <div
            className={styles.contenedorFoto}
            style={{ ['--ratio-portada' as any]: ratio.toFixed(3) }}
          >
            <MarcoFoto
              foto={foto}
              modo="portada"
              prioridad
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1400px"
            />
          </div>

          <div className={styles.pieFoto}>
            <div className={styles.infoFoto}>
              <span className={styles.tituloObra}>{foto.titulo}</span>
              {foto.lugar && <span className={styles.lugarObra}> · {foto.lugar}</span>}
            </div>
            <span className={styles.enlaceFicha}>
              Ver detalles de la obra & opciones de copia <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}

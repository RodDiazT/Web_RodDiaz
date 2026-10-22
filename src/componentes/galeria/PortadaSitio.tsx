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
  const posX = typeof foto.focalX === 'number' ? `${foto.focalX}%` : 'center'
  const posY = typeof foto.focalY === 'number' ? `${foto.focalY}%` : 'center'

  return (
    <section
      className={`${styles.seccionPortada} ${className}`}
      aria-label="Apertura y fotografía de portada"
    >
      {/* 1. Fondo inmersivo: Fotografía a pantalla completa nítida */}
      <div
        className={styles.marcoFondo}
        style={{ ['--posicion-focal' as any]: `${posX} ${posY}` }}
      >
        <MarcoFoto
          foto={foto}
          modo="portada"
          prioridad
          ajustarContenedor
          sizes="100vw"
        />
      </div>

      {/* 2. Velo cinemático oscuro para contraste y legibilidad impecable */}
      <div className={styles.velo} aria-hidden="true" />

      {/* 3. Contenido editorial centrado */}
      <div className={styles.contenidoHero}>
        <p className={styles.eyebrow}>{nombreSitio} · Fotografía Fine Art</p>
        <h1 className={styles.tituloHero}>El papel detiene el tiempo.</h1>
        <p className={styles.bajadaHero}>
          Fotografías de paisaje y naturaleza en el sur del mundo y cordilleras remotas.
          Obras de autor concebidas para cobrar vida en copias impresas en taller propio en papeles de algodón de calidad museo.
        </p>

        <div className={styles.accionesHero}>
          <Boton variante="secundario" href="#seccion-colecciones">
            Explorar colecciones ↓
          </Boton>
          <Boton variante="enlace" href="/fotos" style={{ color: '#FFFFFF' }}>
            Ver catálogo de fotos →
          </Boton>
        </div>
      </div>

      {/* 4. Pie de obra flotante sutil con acceso a su ficha técnica */}
      {pieFoto && (
        <div className={styles.pieHero}>
          <Link
            href={foto.href}
            className={styles.enlaceObra}
            aria-label={`Ver detalles y ficha de la obra ${foto.titulo}`}
          >
            <span>Obra en portada: {pieFoto}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </section>
  )
}

import React from 'react'
import styles from './BloqueTaller.module.css'
import { Boton } from '@/componentes/base/Boton'

interface BloqueTallerProps {
  nombreSitio?: string
}

export function BloqueTaller({ nombreSitio = 'Rod Díaz' }: BloqueTallerProps) {
  return (
    <section className={styles.seccion} aria-labelledby="titulo-taller-fineart">
      <div className={styles.contenedor}>
        <div className={styles.cabecera}>
          <span className={styles.kicker}>El oficio & la materia</span>
          <h2 id="titulo-taller-fineart" className={styles.titulo}>
            De la luz a la copia de museo
          </h2>
          <blockquote className={styles.cita}>
            «Una fotografía no termina en la pantalla; termina en el papel. El papel detiene el ruido digital y le devuelve al paisaje su escala, su textura y su permanencia.»
            <span className={styles.citaAutor}>— {nombreSitio}</span>
          </blockquote>
        </div>

        <div className={styles.grillaPilares}>
          <div className={styles.tarjetaPilar}>
            <span className={styles.numeroPilar} aria-hidden="true">01</span>
            <h3 className={styles.tituloPilar}>Taller propio</h3>
            <p className={styles.textoPilar}>
              Cada copia es calibrada, impresa y revisada a mano personalmente por mí. Sin intermediarios ni laboratorios comerciales; el mismo ojo que capturó la luz cuida la fidelidad de cada sombra y matiz.
            </p>
          </div>

          <div className={styles.tarjetaPilar}>
            <span className={styles.numeroPilar} aria-hidden="true">02</span>
            <h3 className={styles.tituloPilar}>Papeles de algodón 100%</h3>
            <p className={styles.textoPilar}>
              Impresión Giclée con tintas minerales sobre papeles de museo Hahnemühle y Canson libres de ácido, asegurando una durabilidad y conservación cromática superior a un siglo.
            </p>
          </div>

          <div className={styles.tarjetaPilar}>
            <span className={styles.numeroPilar} aria-hidden="true">03</span>
            <h3 className={styles.tituloPilar}>Asesoría & Colección</h3>
            <p className={styles.textoPilar}>
              Formatos y proporciones concebidos para dialogar con espacios particulares y colecciones privadas. Orientación personalizada en enmarcación, acabados y despacho protegido.
            </p>
          </div>
        </div>

        <div className={styles.cierre}>
          <Boton variante="secundario" href="/sobre-mi">
            Conoce la historia y el taller
          </Boton>
          <Boton variante="enlace" href="/contacto">
            Consultar por una obra →
          </Boton>
        </div>
      </div>
    </section>
  )
}

import React from 'react'
import styles from './paginas.module.css'
import { TextoEnriquecido } from './TextoEnriquecido'
import { MarcoFoto } from '@/componentes/base/MarcoFoto'
import { GrillaFotos } from '@/componentes/galeria/GrillaFotos'
import { Boton } from '@/componentes/base/Boton'
import { ItemFotoPublica } from '@/lib/contenido'

interface PlantillaSobreMiProps {
  pagina: {
    titulo: string
    contenido: any
    imagen?: any
  }
  destacadas?: ItemFotoPublica[]
  contactoPublicado?: boolean
  correoContacto?: string
}

export function PlantillaSobreMi({
  pagina,
  destacadas = [],
  contactoPublicado = true,
  correoContacto,
}: PlantillaSobreMiProps) {
  const tieneImagen = Boolean(pagina.imagen && (pagina.imagen.url || pagina.imagen.sizes))

  return (
    <article className={styles.contenedor}>
      <div className={styles.disposicionSobreMi}>
        {tieneImagen && (
          <aside className={styles.columnaFotoPerfil} aria-label="Fotografía de perfil de Rod Díaz">
            <MarcoFoto
              foto={{
                url: pagina.imagen.url,
                ancho: pagina.imagen.width,
                alto: pagina.imagen.height,
                textoAlternativo: pagina.imagen.textoAlternativo || pagina.titulo,
                sizes: pagina.imagen.sizes,
              }}
              modo="ficha"
              prioridad={true}
              sizes="(max-width: 1024px) 100vw, 400px"
            />
          </aside>
        )}

        <div className={styles.columnaTextoPerfil}>
          <h1 className={styles.titulo}>{pagina.titulo}</h1>
          <TextoEnriquecido contenido={pagina.contenido} correoContacto={correoContacto} />
        </div>
      </div>

      {destacadas.length > 0 && (
        <section className={styles.seccionDestacadas} aria-label="Fotografías destacadas">
          <h2 className={styles.tituloSeccion}>Algunas fotos</h2>
          <GrillaFotos fotos={destacadas} />
        </section>
      )}

      <footer className={styles.cierreSobreMi}>
        <p className={styles.textoCierre}>¿Quieres escribirme?</p>
        <Boton
          variante="secundario"
          href={contactoPublicado ? '/contacto' : '/consulta'}
        >
          Escríbeme
        </Boton>
      </footer>
    </article>
  )
}

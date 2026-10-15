import React from 'react'
import styles from './paginas.module.css'
import { TextoEnriquecido } from './TextoEnriquecido'
import { MarcoFoto } from '@/componentes/base/MarcoFoto'
import { Boton } from '@/componentes/base/Boton'

interface PlantillaContactoProps {
  pagina: {
    titulo: string
    contenido: any
    imagen?: any
  }
  redes?: Array<{ red: string; url: string; [key: string]: any }> | null
  correoContacto?: string
}

export function PlantillaContacto({
  pagina,
  redes = [],
  correoContacto,
}: PlantillaContactoProps) {
  const tieneImagen = Boolean(pagina.imagen && (pagina.imagen.url || pagina.imagen.sizes))

  return (
    <article className={styles.contenedor}>
      <div className={styles.plantillaContacto}>
        {tieneImagen && (
          <div className={styles.imagenContacto}>
            <MarcoFoto
              foto={{
                url: pagina.imagen.url,
                ancho: pagina.imagen.width,
                alto: pagina.imagen.height,
                textoAlternativo: pagina.imagen.textoAlternativo || pagina.titulo,
                sizes: pagina.imagen.sizes,
              }}
              modo="ficha"
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>
        )}

        <h1 className={styles.titulo}>{pagina.titulo}</h1>

        <TextoEnriquecido contenido={pagina.contenido} correoContacto={correoContacto} />

        <div className={styles.bloqueAccionContacto}>
          <Boton variante="primario" href="/consulta">
            Escríbeme
          </Boton>
        </div>

        {Array.isArray(redes) && redes.length > 0 && (
          <div className={styles.lineaRedes}>
            {redes.map((item, idx) => {
              const nombreRed = item.red === 'instagram' ? 'Instagram' : 'Red social'
              const textoEnlace = item.url.replace(/^https?:\/\/(www\.)?/, '')

              return (
                <div key={idx} style={{ marginTop: 'var(--esp-2)' }}>
                  También estoy en {nombreRed}:{' '}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className={styles.enlaceRed}
                  >
                    @{textoEnlace.split('/')[1] || textoEnlace}
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </article>
  )
}

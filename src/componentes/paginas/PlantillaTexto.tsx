import React from 'react'
import styles from './paginas.module.css'
import { TextoEnriquecido } from './TextoEnriquecido'
import { MarcoFoto } from '@/componentes/base/MarcoFoto'
import { Retorno } from '@/componentes/base/Retorno'

interface PlantillaTextoProps {
  pagina: {
    titulo: string
    contenido: any
    imagen?: any
    contenidoActualizadoEn?: string
    updatedAt?: string
    slug: string
  }
  mostrarFecha?: boolean
  correoContacto?: string
  retorno?: { etiqueta: string; href: string }
}

export function PlantillaTexto({
  pagina,
  mostrarFecha = false,
  correoContacto,
  retorno = { etiqueta: 'Volver', href: '/' },
}: PlantillaTextoProps) {
  const tieneImagen = Boolean(
    pagina.slug !== 'privacidad' &&
      pagina.slug !== 'condiciones' &&
      pagina.imagen &&
      (pagina.imagen.url || pagina.imagen.sizes)
  )

  // Formato largo de fecha en español chileno (§3.3, §5.2.7)
  let fechaLegible: string | null = null
  if (mostrarFecha) {
    const fechaCruda = pagina.contenidoActualizadoEn || pagina.updatedAt
    if (fechaCruda) {
      try {
        fechaLegible = new Intl.DateTimeFormat('es-CL', {
          dateStyle: 'long',
          timeZone: 'America/Santiago',
        }).format(new Date(fechaCruda))
      } catch {
        fechaLegible = null
      }
    }
  }

  return (
    <article className={styles.contenedor}>
      <div className={styles.plantillaTexto}>
        {tieneImagen && (
          <div className={styles.imagenPaginaLibre}>
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

        {fechaLegible && (
          <p className={styles.fechaActualizacion}>
            Actualizada el {fechaLegible}
          </p>
        )}

        <TextoEnriquecido contenido={pagina.contenido} correoContacto={correoContacto} />

        <div className={styles.retornoFinal}>
          <Retorno etiqueta={retorno.etiqueta} href={retorno.href} />
        </div>
      </div>
    </article>
  )
}

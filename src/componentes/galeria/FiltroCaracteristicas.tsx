import React from 'react'
import styles from './FiltroCaracteristicas.module.css'
import { ChipFiltro } from '@/componentes/base/ChipFiltro'

interface CaracteristicaItem {
  slug: string
  nombre: string
}

interface FiltroCaracteristicasProps {
  caracteristicas: CaracteristicaItem[]
  slugActivo?: string | null
  baseHref: string // '/fotos' o '/colecciones/[slug]'
  className?: string
}

export function FiltroCaracteristicas({
  caracteristicas,
  slugActivo,
  baseHref,
  className = '',
}: FiltroCaracteristicasProps) {
  if (!caracteristicas || caracteristicas.length === 0) return null

  const esTodasActivo = !slugActivo

  return (
    <nav className={`${styles.contenedorFiltros} ${className}`} aria-label="Filtrar por característica">
      <div className={styles.itemChip}>
        <ChipFiltro
          etiqueta="Todas"
          href={baseHref}
          activo={esTodasActivo}
        />
      </div>

      {caracteristicas.map((c) => {
        const activo = slugActivo === c.slug
        const separador = baseHref.includes('?') ? '&' : '?'
        const href = `${baseHref}${separador}caracteristica=${encodeURIComponent(c.slug)}`

        return (
          <div key={c.slug} className={styles.itemChip}>
            <ChipFiltro
              etiqueta={c.nombre}
              href={href}
              activo={activo}
            />
          </div>
        )
      })}
    </nav>
  )
}

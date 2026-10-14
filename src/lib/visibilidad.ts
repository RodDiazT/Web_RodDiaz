/**
 * Reglas de visibilidad pública del catálogo y portafolio.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§5.2.5).
 * 
 * Fuente única de verdad para determinar qué fotos y colecciones son visibles en la web pública.
 */

export interface ColeccionLike {
  id: number | string
  estado?: 'borrador' | 'publicada'
  padre?: (number | string) | ColeccionLike | null
  visibleSola?: boolean | null
  orden?: number | null
}

export interface FotoLike {
  id: number | string
  estado?: 'borrador' | 'publicada' | 'despublicada'
  coleccion?: (number | string) | ColeccionLike | null
  orden?: number | null
  fijada?: boolean | null
  ordenFijada?: number | null
}

/**
 * Determina si una foto es visible públicamente según el estado de su colección y de su colección madre.
 */
export function esFotoVisible(
  foto: FotoLike,
  obtenerColeccionPorId: (id: number | string) => ColeccionLike | null | undefined
): boolean {
  if (foto.estado !== 'publicada') {
    return false
  }

  if (!foto.coleccion) {
    return false
  }

  // Resolver la colección de la foto
  const colObj: ColeccionLike | null | undefined =
    typeof foto.coleccion === 'object'
      ? foto.coleccion
      : obtenerColeccionPorId(foto.coleccion)

  if (!colObj || colObj.estado !== 'publicada') {
    return false
  }

  // Si la colección tiene padre, el padre también DEBE estar publicado
  if (colObj.padre) {
    const padreObj: ColeccionLike | null | undefined =
      typeof colObj.padre === 'object'
        ? colObj.padre
        : obtenerColeccionPorId(colObj.padre)

    if (!padreObj || padreObj.estado !== 'publicada') {
      return false
    }
  }

  return true
}

/**
 * Determina si una colección madre debe listarse en la vista pública (/colecciones).
 * Debe estar publicada y tener al menos una foto visible (propia o de sus hijas).
 */
export function esColeccionMadreListable(
  coleccion: ColeccionLike,
  tieneFotosVisibles: boolean
): boolean {
  if (coleccion.estado !== 'publicada') return false
  if (coleccion.padre) return false // Es hija, no madre
  return tieneFotosVisibles
}

/**
 * Determina si una colección hija debe listarse con página propia (/colecciones/[slug]).
 * Requiere: publicada, madre publicada, visibleSola = true, y al menos una foto visible.
 */
export function esColeccionHijaListable(
  hija: ColeccionLike,
  madre: ColeccionLike | null | undefined,
  tieneFotosVisibles: boolean
): boolean {
  if (hija.estado !== 'publicada') return false
  if (!hija.padre) return false // No es hija
  if (!hija.visibleSola) return false
  if (!madre || madre.estado !== 'publicada') return false
  return tieneFotosVisibles
}

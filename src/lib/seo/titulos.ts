/**
 * Generador de títulos SEO y para buscadores — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§5.2.1, §4).
 */

export interface DatosTituloFoto {
  titulo: string
  lugar?: string | null
}

export interface DatosTituloColeccion {
  nombre: string
  esHija?: boolean
  nombreMadre?: string | null
  pagina?: number | null
}

export interface DatosTituloCaracteristica {
  nombre: string
  pagina?: number | null
}

export interface DatosTituloLista {
  tipo: 'fotos' | 'colecciones'
  pagina?: number | null
}

export interface DatosTituloPagina {
  titulo: string
}

export type TipoTitulo =
  | 'portada'
  | 'fotos'
  | 'foto'
  | 'foto_amable'
  | 'colecciones'
  | 'coleccion'
  | 'caracteristica'
  | 'pagina'
  | 'no_encontrada'

export interface AjustesTitulo {
  nombreSitio?: string | null
  seo?: {
    tituloPortada?: string | null
  } | null
  tituloPortada?: string | null
}

const MAX_TITULO = 65
const SEPARADOR = ' · '

function normalizarParaComparacion(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Trunca un texto en la última palabra completa permitiendo un carácter para '…'.
 */
function cortarPalabraCompleta(texto: string, maxLongitud: number): string {
  if (texto.length <= maxLongitud) return texto
  const tope = Math.max(0, maxLongitud - 1)
  const recortado = texto.slice(0, tope)
  const ultimoEspacio = recortado.lastIndexOf(' ')
  if (ultimoEspacio > 0) {
    return recortado.slice(0, ultimoEspacio).trim() + '…'
  }
  return recortado.trim() + '…'
}

/**
 * Genera el título para buscadores según el tipo de ruta y sus datos.
 */
export function tituloPara(
  tipo: TipoTitulo,
  datos?: any,
  ajustes?: AjustesTitulo | null
): string {
  const S = ajustes?.nombreSitio?.trim() || 'Rod Díaz'
  const sufijoSitio = `${SEPARADOR}${S}`

  switch (tipo) {
    case 'portada': {
      const personalizado =
        ajustes?.seo?.tituloPortada?.trim() ||
        ajustes?.tituloPortada?.trim()
      return personalizado || `${S}${SEPARADOR}Fotografía`
    }

    case 'fotos': {
      const pagina = Number(datos?.pagina) || 1
      if (pagina >= 2) {
        return `Fotos${SEPARADOR}Página ${pagina}${sufijoSitio}`
      }
      return `Fotos${sufijoSitio}`
    }

    case 'caracteristica': {
      const nombre = (datos?.nombre || '').trim()
      const pagina = Number(datos?.pagina) || 1
      if (pagina >= 2) {
        return `${nombre}${SEPARADOR}Fotos${SEPARADOR}Página ${pagina}${sufijoSitio}`
      }
      return `${nombre}${SEPARADOR}Fotos${sufijoSitio}`
    }

    case 'colecciones': {
      const pagina = Number(datos?.pagina) || 1
      if (pagina >= 2) {
        return `Colecciones${SEPARADOR}Página ${pagina}${sufijoSitio}`
      }
      return `Colecciones${sufijoSitio}`
    }

    case 'coleccion': {
      const nombre = (datos?.nombre || '').trim()
      const nombreMadre = (datos?.nombreMadre || '').trim()
      const pagina = Number(datos?.pagina) || 1
      const sufijoPagina = pagina >= 2 ? `${SEPARADOR}Página ${pagina}` : ''

      if (datos?.esHija && nombreMadre) {
        // "<hija>, <madre> · S" si cabe en 65 caracteres; si no, "<hija> · S"
        const candidataCompleta = `${nombre}, ${nombreMadre}${sufijoPagina}${sufijoSitio}`
        if (candidataCompleta.length <= MAX_TITULO) {
          return candidataCompleta
        }
      }

      // Si no es hija o la combinación no cupo
      const base = `${nombre}${sufijoPagina}${sufijoSitio}`
      if (base.length <= MAX_TITULO) {
        return base
      }
      const presupuesto = MAX_TITULO - (sufijoPagina + sufijoSitio).length
      return `${cortarPalabraCompleta(nombre, presupuesto)}${sufijoPagina}${sufijoSitio}`
    }

    case 'foto': {
      const titulo = (datos?.titulo || '').trim()
      const lugar = (datos?.lugar || '').trim()

      const tituloNorm = normalizarParaComparacion(titulo)
      const lugarNorm = normalizarParaComparacion(lugar)

      // Regla §4: Si el título ya contiene el lugar, no se repite
      const contieneLugar = Boolean(lugar && tituloNorm.includes(lugarNorm))

      if (lugar && !contieneLugar) {
        const conLugar = `${titulo}, ${lugar}${sufijoSitio}`
        if (conLugar.length <= MAX_TITULO) {
          return conLugar
        }
      }

      // Si no hay lugar, ya estaba incluido o no cabe: omitir lugar
      const soloTitulo = `${titulo}${sufijoSitio}`
      if (soloTitulo.length <= MAX_TITULO) {
        return soloTitulo
      }

      // Si el título solo supera 65 caracteres, cortar en última palabra completa con '…'
      const presupuesto = MAX_TITULO - sufijoSitio.length
      return `${cortarPalabraCompleta(titulo, presupuesto)}${sufijoSitio}`
    }

    case 'foto_amable': {
      return `Foto no disponible${sufijoSitio}`
    }

    case 'pagina': {
      const titulo = (datos?.titulo || '').trim()
      const base = `${titulo}${sufijoSitio}`
      if (base.length <= MAX_TITULO) {
        return base
      }
      const presupuesto = MAX_TITULO - sufijoSitio.length
      return `${cortarPalabraCompleta(titulo, presupuesto)}${sufijoSitio}`
    }

    case 'no_encontrada': {
      return `Página no encontrada${sufijoSitio}`
    }

    default:
      return `${S}${SEPARADOR}Fotografía`
  }
}

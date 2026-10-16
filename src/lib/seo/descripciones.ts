/**
 * Generador de descripciones SEO y para buscadores — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/seo.md (§5.2.2, §4).
 */

import { fechaVisible } from '../ficha.ts'

export type TipoDescripcion =
  | 'portada'
  | 'fotos'
  | 'foto'
  | 'foto_amable'
  | 'colecciones'
  | 'coleccion'
  | 'caracteristica'
  | 'pagina'
  | 'no_encontrada'

export interface AjustesDescripcion {
  nombreSitio?: string | null
  descripcion?: string | null
}

const MAX_DESCRIPCION = 155

/**
 * Extrae texto plano a partir de una estructura Lexical, nodos anidados o texto crudo.
 */
export function extraerTextoPlanoLexical(contenido: any): string {
  if (!contenido) return ''
  if (typeof contenido === 'string') return contenido

  const root = contenido.root || contenido
  if (Array.isArray(root?.children)) {
    return extraerNodos(root.children)
  }
  return ''
}

function extraerNodos(nodos: any[]): string {
  if (!Array.isArray(nodos)) return ''
  return nodos
    .map((nodo) => {
      if (!nodo) return ''
      if (nodo.type === 'text') return nodo.text || ''
      if (Array.isArray(nodo.children)) return extraerNodos(nodo.children)
      return ''
    })
    .join(' ')
}

/**
 * Normaliza espacios y elimina saltos de línea.
 */
export function normalizarEspacios(texto: string): string {
  return texto
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Corta el texto en la última palabra completa antes de maxLongitud (por defecto 155),
 * añadiendo '…' si fue cortado (§5.2.2).
 */
export function cortarTextoEnPalabra(texto: string, maxLongitud: number = MAX_DESCRIPCION): string {
  const limpio = normalizarEspacios(texto)
  if (limpio.length <= maxLongitud) {
    return limpio
  }

  const tope = Math.max(0, maxLongitud - 1) // reserva para '…'
  const sub = limpio.slice(0, tope)
  const ultimoEspacio = sub.lastIndexOf(' ')

  if (ultimoEspacio > 0) {
    return sub.slice(0, ultimoEspacio).replace(/[,.:;]+$/, '').trim() + '…'
  }

  return sub.trim() + '…'
}

/**
 * Genera la meta-descripción en texto plano cortada a palabra completa (≤ 155 caracteres).
 */
export function descripcionPara(
  tipo: TipoDescripcion,
  datos?: any,
  ajustes?: AjustesDescripcion | null
): string {
  const S = ajustes?.nombreSitio?.trim() || 'Rod Díaz'

  switch (tipo) {
    case 'portada':
    case 'fotos':
    case 'colecciones': {
      const descGeneral = ajustes?.descripcion?.trim()
      if (descGeneral) {
        return cortarTextoEnPalabra(descGeneral)
      }
      return `Fotografías de ${S}.`
    }

    case 'foto': {
      // 1. Foto.seo.descripcion
      const seoDesc = datos?.seo?.descripcion?.trim()
      if (seoDesc) {
        return cortarTextoEnPalabra(seoDesc)
      }

      // 2. Historia en texto plano
      const textoHistoria = datos?.historia ? extraerTextoPlanoLexical(datos.historia) : ''
      if (textoHistoria && normalizarEspacios(textoHistoria).length > 0) {
        return cortarTextoEnPalabra(textoHistoria)
      }

      // 3. Automática: "Fotografía de <lugar>, <mes de año>." + " Disponible como copia impresa."
      const lugar = datos?.lugar?.trim()
      const fecha = fechaVisible(datos?.fecha)
      const mesAnio = fecha?.legible

      let fraseBase = ''
      if (lugar && mesAnio) {
        fraseBase = `Fotografía de ${lugar}, ${mesAnio}.`
      } else if (lugar) {
        fraseBase = `Fotografía de ${lugar}.`
      } else if (mesAnio) {
        fraseBase = `Fotografía de ${mesAnio}.`
      } else {
        fraseBase = `Fotografía de ${S}.`
      }

      // Evaluar si ofrece copia
      const ofreceCopia = Boolean(
        datos?.ofreceCopia !== false &&
        Array.isArray(datos?.formatos) &&
        datos.formatos.length > 0
      )

      if (ofreceCopia) {
        fraseBase = `${fraseBase} Disponible como copia impresa.`
      }

      return cortarTextoEnPalabra(fraseBase)
    }

    case 'coleccion': {
      // 1. Coleccion.descripcion
      const desc = datos?.descripcion?.trim()
      if (desc) {
        return cortarTextoEnPalabra(desc)
      }

      // 2. "<n> fotografías de S en <nombre>."
      const n = typeof datos?.totalFotos === 'number' ? datos.totalFotos : 0
      const sustantivo = n === 1 ? 'fotografía' : 'fotografías'
      const nombreCol = datos?.nombre?.trim() || 'esta serie'
      const texto = `${n} ${sustantivo} de ${S} en ${nombreCol}.`
      return cortarTextoEnPalabra(texto)
    }

    case 'caracteristica': {
      // "<n> fotografías de S: <nombre de c>."
      const n = typeof datos?.totalFotos === 'number' ? datos.totalFotos : 0
      const sustantivo = n === 1 ? 'fotografía' : 'fotografías'
      const nombreCar = datos?.nombre?.trim() || ''
      const texto = `${n} ${sustantivo} de ${S}: ${nombreCar}.`
      return cortarTextoEnPalabra(texto)
    }

    case 'pagina': {
      // 1. Pagina.seo.descripcion
      const seoDesc = datos?.seo?.descripcion?.trim()
      if (seoDesc) {
        return cortarTextoEnPalabra(seoDesc)
      }

      // 2. Inicio del contenido Lexical
      const textoContenido = datos?.contenido ? extraerTextoPlanoLexical(datos.contenido) : ''
      if (textoContenido && normalizarEspacios(textoContenido).length > 0) {
        return cortarTextoEnPalabra(textoContenido)
      }

      const descGeneral = ajustes?.descripcion?.trim()
      if (descGeneral) {
        return cortarTextoEnPalabra(descGeneral)
      }
      return `Página de ${S}.`
    }

    case 'foto_amable': {
      return `Fotografía no disponible actualmente en el catálogo de ${S}.`
    }

    default:
      return `Fotografías de ${S}.`
  }
}

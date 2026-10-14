/**
 * Utilidades para cálculo, normalización y validación de proporciones de fotos y formatos.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§4, §5.1 y §5.2)
 * y DocumentosTecnicos/marco-general/marco-general-proyecto.md (§6.2.4).
 */

export type Orientacion = 'horizontal' | 'vertical' | 'cuadrada'

export interface ProporcionCalculada {
  etiqueta: string
  valor: number
  orientacion: Orientacion
  manual: boolean
}

export interface ProporcionEstandar {
  etiqueta: string
  ratio: number
}

// Proporciones estándar oficiales del marco
export const PROPORCIONES_ESTANDAR: ProporcionEstandar[] = [
  { etiqueta: '1:1', ratio: 1.0 },
  { etiqueta: '5:4', ratio: 5 / 4 }, // 1.25
  { etiqueta: '4:3', ratio: 4 / 3 }, // ~1.3333
  { etiqueta: '3:2', ratio: 3 / 2 }, // 1.5
  { etiqueta: '16:9', ratio: 16 / 9 }, // ~1.7778
  { etiqueta: '2:1', ratio: 2.0 },
  { etiqueta: '3:1', ratio: 3.0 },
]

/**
 * Calcula la orientación a partir del ancho y alto en píxeles.
 */
export function obtenerOrientacion(ancho: number, alto: number): Orientacion {
  if (ancho === alto) return 'cuadrada'
  if (ancho > alto) return 'horizontal'
  return 'vertical'
}

/**
 * Calcula la proporción normalizada a partir de dimensiones físicas o en píxeles.
 * Aplica una tolerancia de ±2% frente a estándares. Si no encaja, genera etiqueta personalizada.
 */
export function calcularProporcion(ancho: number, alto: number, manual: boolean = false): ProporcionCalculada {
  if (ancho <= 0 || alto <= 0) {
    throw new Error(`Dimensiones inválidas para cálculo de proporción: ${ancho}x${alto}`)
  }

  const orientacion = obtenerOrientacion(ancho, alto)
  const ladoLargo = Math.max(ancho, alto)
  const ladoCorto = Math.min(ancho, alto)
  const ratioReal = ladoLargo / ladoCorto

  // Tolerancia del ±2% frente a razones estándar
  const TOLERANCIA = 0.02
  let etiquetaEncontrada: string | null = null

  for (const estandar of PROPORCIONES_ESTANDAR) {
    const diferenciaRelativa = Math.abs(ratioReal - estandar.ratio) / estandar.ratio
    if (diferenciaRelativa <= TOLERANCIA) {
      etiquetaEncontrada = estandar.etiqueta
      break
    }
  }

  // Si no coincide con ninguna estándar dentro del ±2%, se genera etiqueta personalizada (ej. "3,4:1")
  const etiqueta =
    etiquetaEncontrada ||
    `${(Math.round(ratioReal * 10) / 10).toString().replace('.', ',')}:1`

  return {
    etiqueta,
    valor: Math.round(ratioReal * 1000) / 1000,
    orientacion,
    manual,
  }
}

/**
 * Comprueba si dos proporciones son compatibles dentro del margen de tolerancia (±2%).
 */
export function sonProporcionesCompatibles(
  ratioA: number,
  ratioB: number,
  tolerancia: number = 0.02
): boolean {
  if (ratioA <= 0 || ratioB <= 0) return false
  const dif = Math.abs(ratioA - ratioB) / Math.max(ratioA, ratioB)
  return dif <= tolerancia
}

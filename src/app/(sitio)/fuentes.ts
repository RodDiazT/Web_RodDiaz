import { Cormorant_Garamond, Manrope } from 'next/font/google'

/**
 * Tipografías oficiales del sistema de diseño (DocumentosTecnicos/identidad/sistema-de-diseno.md §5.2.2).
 * - Cormorant Garamond: Marca y títulos editoriales (pesos 400 y 500).
 * - Manrope: Lectura e interfaz funcional (pesos 400 y 500).
 * Ambas se sirven de forma autoalojada por Next.js sin solicitudes externas en runtime.
 */

export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-cormorant',
})

export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-manrope',
})

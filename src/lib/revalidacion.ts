/**
 * Revalidación segura de rutas y etiquetas en Next.js.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§5.2.12).
 */

import { revalidatePath, revalidateTag } from 'next/cache'

export function revalidarRutasSeguras(rutas: string[], tags: string[] = []): void {
  try {
    try {
      revalidatePath('/', 'layout')
    } catch {
      // En entornos sin contexto de servidor Next.js (ej. scripts o build), se ignora silenciosamente
    }

    for (const r of rutas) {
      if (!r) continue
      try {
        revalidatePath(r)
      } catch {
        // En entornos sin contexto de servidor Next.js (ej. scripts o build), se ignora silenciosamente
      }
    }

    for (const t of tags) {
      if (!t) continue
      try {
        revalidateTag(t)
      } catch {
        // Ignora silenciosamente si no hay contexto Next.js
      }
    }
  } catch {
    // Protección global
  }
}

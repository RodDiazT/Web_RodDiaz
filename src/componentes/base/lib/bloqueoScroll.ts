/**
 * Bloqueo de scroll accesible y blindado para iOS Safari.
 * Especificado en DocumentosTecnicos/identidad/sistema-de-diseno.md (§5.6).
 */

let scrollYGuardado = 0
let bloqueosActivos = 0

export function bloquearScroll(): void {
  if (typeof window === 'undefined') return

  bloqueosActivos++
  if (bloqueosActivos > 1) return // Ya está bloqueado por otro modal/visor

  scrollYGuardado = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollYGuardado}px`
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
}

export function desbloquearScroll(): void {
  if (typeof window === 'undefined') return

  bloqueosActivos = Math.max(0, bloqueosActivos - 1)
  if (bloqueosActivos > 0) return // Aún queda otro modal abierto

  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  window.scrollTo(0, scrollYGuardado)
}

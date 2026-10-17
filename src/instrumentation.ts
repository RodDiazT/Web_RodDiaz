/**
 * Calentamiento automático de rutas tras el inicio del servidor — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/despliegue.md (§5.2.6, §5.4).
 */

export async function register() {
  // Ejecutar únicamente en el entorno de ejecución Node.js (servidor)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Si estamos en compilación de producción (build), no realizar calentamiento
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return
    }

    // Esperar 5 segundos tras el inicio para permitir que el listener HTTP esté listo (§5.2.6)
    setTimeout(async () => {
      const puerto = process.env.PORT || 3000
      const hostLocal = `http://127.0.0.1:${puerto}`

      console.log('[Calentamiento] Iniciando calentamiento de rutas principales...')

      const rutasBase = [
        '/api/salud',
        '/',
        '/fotos',
        '/colecciones',
        '/sobre-mi',
        '/contacto',
      ]

      for (const ruta of rutasBase) {
        try {
          const res = await fetch(`${hostLocal}${ruta}`, {
            headers: {
              'User-Agent': 'Web_RodDiaz_Warmup/1.0',
            },
          })
          console.log(`[Calentamiento] ${ruta} -> ${res.status}`)
        } catch (err: any) {
          console.warn(`[Calentamiento] No se pudo calentar ${ruta}: ${err.message}`)
        }
      }

      // Calentar fotos destacadas
      try {
        const resFotos = await fetch(`${hostLocal}/datos/fotos?limit=6`, {
          headers: { 'User-Agent': 'Web_RodDiaz_Warmup/1.0' },
        })
        if (resFotos.ok) {
          const data = await resFotos.json()
          if (Array.isArray(data.fotos)) {
            for (const f of data.fotos) {
              if (f.slug) {
                try {
                  const resFicha = await fetch(`${hostLocal}/fotos/${f.slug}`, {
                    headers: { 'User-Agent': 'Web_RodDiaz_Warmup/1.0' },
                  })
                  console.log(`[Calentamiento] /fotos/${f.slug} -> ${resFicha.status}`)
                } catch {
                  // Continuar con la siguiente
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.warn(`[Calentamiento] Fichas destacadas no disponibles: ${err.message}`)
      }

      console.log('[Calentamiento] Calentamiento completado.')
    }, 5000)
  }
}

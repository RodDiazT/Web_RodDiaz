/**
 * Validación y acceso tipado a variables de entorno de la aplicación.
 * Especificado en DocumentosTecnicos/plataforma/despliegue.md (§5.5).
 */

function obtenerVariable(nombre: string, obligatoria: boolean = true): string {
  const valor = process.env[nombre]
  if (obligatoria && (!valor || valor.trim() === '')) {
    // Si estamos en proceso de build (compilación estática sin DB), no rompemos si faltan variables operativas
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return ''
    }
    throw new Error(
      `[Configuración] Falta la variable de entorno obligatoria: "${nombre}". Revisa .env.ejemplo y tu configuración en Railway.`
    )
  }
  return valor ? valor.trim() : ''
}

export const entorno = {
  get DATABASE_URL(): string {
    return obtenerVariable('DATABASE_URL')
  },
  get PAYLOAD_SECRET(): string {
    return obtenerVariable('PAYLOAD_SECRET')
  },
  get URL_SITIO(): string {
    return obtenerVariable('URL_SITIO')
  },
  get ENTORNO(): 'pruebas' | 'produccion' {
    const val = (obtenerVariable('ENTORNO', false) || 'pruebas').toLowerCase()
    if (val === 'production' || val === 'produccion') {
      return 'produccion'
    }
    return 'pruebas'
  },
  get CORREOS_ADMIN(): string {
    return obtenerVariable('CORREOS_ADMIN', false) || obtenerVariable('CORREO_ADMIN', false) || 'rodrigodiaztapia@gmail.com'
  },
  get listaCorreosAdmin(): string[] {
    return this.CORREOS_ADMIN.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean)
  },
  get RUTA_MEDIOS(): string {
    return obtenerVariable('RUTA_MEDIOS', false) || './medios'
  },
  get TAREAS_AUTOMATICAS(): boolean {
    const val = obtenerVariable('TAREAS_AUTOMATICAS', false)
    return val === 'true' || val === '1'
  },
  get GOOGLE_CLIENT_ID(): string | undefined {
    const val = obtenerVariable('GOOGLE_CLIENT_ID', false)
    return val || undefined
  },
  get GOOGLE_CLIENT_SECRET(): string | undefined {
    const val = obtenerVariable('GOOGLE_CLIENT_SECRET', false)
    return val || undefined
  },
  get TELEGRAM_BOT_TOKEN(): string | undefined {
    const val = obtenerVariable('TELEGRAM_BOT_TOKEN', false)
    return val || undefined
  },
  get TELEGRAM_CHAT_ID(): string | undefined {
    const val = obtenerVariable('TELEGRAM_CHAT_ID', false)
    return val || undefined
  },
  get esProduccion(): boolean {
    return this.ENTORNO === 'produccion'
  },
  get esPruebas(): boolean {
    return this.ENTORNO === 'pruebas'
  },
}

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Foto } from './colecciones/Foto.ts'
import { Coleccion } from './colecciones/Coleccion.ts'
import { Caracteristica } from './colecciones/Caracteristica.ts'
import { FormatoImpresion } from './colecciones/FormatoImpresion.ts'
import { TipoPapel } from './colecciones/TipoPapel.ts'
import { Pagina } from './colecciones/Pagina.ts'
import { Medio } from './colecciones/Medio.ts'
import { Consulta } from './colecciones/Consulta.ts'
import { Suscriptor } from './colecciones/Suscriptor.ts'
import { Usuario } from './colecciones/Usuario.ts'
import { IntentoAcceso } from './colecciones/IntentoAcceso.ts'

import { AjustesSitio } from './globales/AjustesSitio.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },
  admin: {
    user: Usuario.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Rod Díaz',
    },
    components: {
      beforeLogin: ['/componentes/admin/BotonGoogleLogin#BotonGoogleLogin'],
      beforeDashboard: [
        '/componentes/admin/TarjetaConsultasNuevas#TarjetaConsultasNuevas',
        '/componentes/admin/TarjetaConsultasPorMes#TarjetaConsultasPorMes',
        '/componentes/admin/TarjetaRespaldo#TarjetaRespaldo',
      ],
      beforeNavLinks: ['/componentes/admin/ContadorConsultas#ContadorConsultas'],
    },
  },
  collections: [
    Foto,
    Coleccion,
    Caracteristica,
    FormatoImpresion,
    TipoPapel,
    Pagina,
    Medio,
    Consulta,
    Suscriptor,
    Usuario,
    IntentoAcceso,
  ],
  globals: [AjustesSitio],
  editor: lexicalEditor(),
  sharp,
  secret: process.env.PAYLOAD_SECRET || 'secreto_provisional_build_min_32_caracteres_1234567890',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  onInit: async (payload) => {
    if (process.env.NEXT_PHASE === 'phase-production-build') return
    try {
      // 1. Asegurar esquema de tablas en PostgreSQL (aditivo y sin prompts interactivos)
      const adapter = payload.db as any
      if (adapter && typeof adapter.requireDrizzleKit === 'function' && adapter.drizzle) {
        const { pushSchema } = adapter.requireDrizzleKit()
        const { apply } = await pushSchema(
          adapter.schema,
          adapter.drizzle,
          adapter.schemaName ? [adapter.schemaName] : undefined,
          adapter.tablesFilter,
          adapter.extensions?.postgis ? ['postgis'] : undefined
        )
        await apply()
        console.log('[Payload] Esquema PostgreSQL sincronizado correctamente.')
      }

      // 2. Asegurar usuario administrador autorizado para habilitar /admin/login con Google OAuth
      const existentes = await payload.find({
        collection: 'usuarios',
        limit: 1,
        overrideAccess: true,
      })
      if (existentes.totalDocs === 0) {
        const correos = (process.env.CORREOS_ADMIN || 'rodrigodiaztapia@gmail.com')
          .split(',')
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean)
        const correoPrincipal = correos[0]
        if (correoPrincipal) {
          const crypto = await import('crypto')
          await payload.create({
            collection: 'usuarios',
            data: {
              email: correoPrincipal,
              password: crypto.randomBytes(32).toString('hex'),
              nombre: 'Rod Díaz',
              proveedorAcceso: 'google',
            },
            overrideAccess: true,
          })
          console.log(`[Payload] Usuario administrador inicializado para ${correoPrincipal}`)
        }
      }

      // 3. Sembrar páginas reservadas y ajustes iniciales si la base está recién creada
      const paginasExistentes = await payload.find({
        collection: 'paginas',
        limit: 1,
        overrideAccess: true,
      })
      if (paginasExistentes.totalDocs === 0) {
        const { sembrarDatos } = await import('./semilla/semilla.ts')
        await sembrarDatos(payload)
      }
    } catch (err: any) {
      console.warn('[Payload/onInit] Aviso en inicialización:', err?.message || err)
    }
  },
})

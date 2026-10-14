import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { Usuario } from './colecciones/Usuario'
import { AjustesSitio } from './globales/AjustesSitio'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Usuario.slug,
    meta: {
      titleSuffix: '— Rod Díaz',
    },
  },
  collections: [Usuario],
  globals: [AjustesSitio],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'secreto_provisional_build_min_32_caracteres_1234567890',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
})

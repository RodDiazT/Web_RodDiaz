import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Foto } from './colecciones/Foto'
import { Coleccion } from './colecciones/Coleccion'
import { Caracteristica } from './colecciones/Caracteristica'
import { FormatoImpresion } from './colecciones/FormatoImpresion'
import { TipoPapel } from './colecciones/TipoPapel'
import { Pagina } from './colecciones/Pagina'
import { Medio } from './colecciones/Medio'
import { Consulta } from './colecciones/Consulta'
import { Suscriptor } from './colecciones/Suscriptor'
import { Usuario } from './colecciones/Usuario'
import { IntentoAcceso } from './colecciones/IntentoAcceso'

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
})

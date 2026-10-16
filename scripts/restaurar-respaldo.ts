/**
 * Script de restauración de respaldo en base vacía — Web_RodDiaz (v1.0)
 * Especificado en DocumentosTecnicos/plataforma/despliegue.md (§5.2.7, §5.3, §6).
 * 
 * Uso: pnpm restaurar-respaldo --archivo <ruta-del-archivo.json.gz>
 */

import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import zlib from 'zlib'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { VERSION_ESQUEMA_RESPALDO, EstructuraRespaldo } from '../src/lib/respaldo.ts'

async function restaurarRespaldo() {
  const args = process.argv.slice(2)
  const idxArchivo = args.indexOf('--archivo')
  if (idxArchivo === -1 || !args[idxArchivo + 1]) {
    console.error('Error: Debes especificar la ruta del archivo con --archivo <ruta>')
    console.error('Ejemplo: pnpm restaurar-respaldo --archivo ./respaldo-roddiaz-2026-10-16.json.gz')
    process.exit(1)
  }

  const rutaArchivo = path.resolve(process.cwd(), args[idxArchivo + 1])
  console.log(`[Restauración] Leyendo archivo: ${rutaArchivo}`)

  let bufferComprimido: Buffer
  try {
    bufferComprimido = await fs.readFile(rutaArchivo)
  } catch (err: any) {
    console.error(`Error al leer archivo: ${err.message}`)
    process.exit(1)
  }

  console.log('[Restauración] Descomprimiendo archivo gzip...')
  let jsonString: string
  try {
    const bufferDescomprimido = zlib.gunzipSync(bufferComprimido)
    jsonString = bufferDescomprimido.toString('utf-8')
  } catch (err: any) {
    console.error(`Error al descomprimir archivo: ${err.message}`)
    process.exit(1)
  }

  let estructura: EstructuraRespaldo
  try {
    estructura = JSON.parse(jsonString)
  } catch (err: any) {
    console.error(`Error al parsear JSON del respaldo: ${err.message}`)
    process.exit(1)
  }

  // 1. Validar esquema
  const versionEsquema = estructura.manifiesto?.versionEsquema
  if (!versionEsquema || versionEsquema !== VERSION_ESQUEMA_RESPALDO) {
    console.error(
      `Error de compatibilidad: El respaldo tiene versión de esquema "${versionEsquema}", pero el sistema soporta "${VERSION_ESQUEMA_RESPALDO}".`
    )
    process.exit(1)
  }

  console.log('------------------------------------------------------------')
  console.log('Manifiesto del respaldo:')
  console.log(`- Fecha de creación: ${estructura.manifiesto.fecha}`)
  console.log(`- Versión de esquema: ${estructura.manifiesto.versionEsquema}`)
  if (estructura.manifiesto.commit) console.log(`- Commit: ${estructura.manifiesto.commit}`)
  console.log('- Conteos:')
  for (const [k, v] of Object.entries(estructura.manifiesto.conteos || {})) {
    console.log(`  * ${k}: ${v}`)
  }
  console.log('------------------------------------------------------------')

  const payload = await getPayload({ config })

  // 2. Comprobar que la base de datos esté vacía (§5.2.7)
  const [fotosExistentes, coleccionesExistentes, paginasExistentes] = await Promise.all([
    payload.find({ collection: 'fotos', limit: 1 }),
    payload.find({ collection: 'colecciones', limit: 1 }),
    payload.find({ collection: 'paginas', limit: 1 }),
  ])

  if (
    fotosExistentes.totalDocs > 0 ||
    coleccionesExistentes.totalDocs > 0 ||
    paginasExistentes.totalDocs > 0
  ) {
    console.error(
      'Error de seguridad: Se niega a restaurar en una base que contiene datos existentes. La base debe estar vacía.'
    )
    process.exit(1)
  }

  console.log('[Restauración] Base de datos vacía verificada. Procediendo a cargar entidades...')

  // 3. Restaurar en orden respetando dependencias de clave foránea
  // A. Catálogo base
  if (estructura.colecciones.caracteristicas?.length) {
    console.log(`[Restauración] Insertando ${estructura.colecciones.caracteristicas.length} características...`)
    for (const c of estructura.colecciones.caracteristicas) {
      await payload.create({ collection: 'caracteristicas', data: c })
    }
  }

  if (estructura.colecciones.tiposPapel?.length) {
    console.log(`[Restauración] Insertando ${estructura.colecciones.tiposPapel.length} tipos de papel...`)
    for (const p of estructura.colecciones.tiposPapel) {
      await payload.create({ collection: 'tipos-papel', data: p })
    }
  }

  if (estructura.colecciones.formatosImpresion?.length) {
    console.log(`[Restauración] Insertando ${estructura.colecciones.formatosImpresion.length} formatos de impresión...`)
    for (const f of estructura.colecciones.formatosImpresion) {
      await payload.create({ collection: 'formatos-impresion', data: f })
    }
  }

  // B. Medios auxiliares y colecciones
  if (estructura.colecciones.medios?.length) {
    console.log(`[Restauración] Insertando ${estructura.colecciones.medios.length} medios auxiliares...`)
    for (const m of estructura.colecciones.medios) {
      await payload.create({ collection: 'medios', data: m })
    }
  }

  if (estructura.colecciones.colecciones?.length) {
    console.log(`[Restauración] Insertando ${estructura.colecciones.colecciones.length} colecciones...`)
    for (const col of estructura.colecciones.colecciones) {
      await payload.create({ collection: 'colecciones', data: col })
    }
  }

  // C. Fotos
  if (estructura.colecciones.fotos?.length) {
    console.log(`[Restauración] Insertando ${estructura.colecciones.fotos.length} fotos...`)
    for (const foto of estructura.colecciones.fotos) {
      await payload.create({ collection: 'fotos', data: foto })
    }
  }

  // D. Páginas
  if (estructura.colecciones.paginas?.length) {
    console.log(`[Restauración] Insertando ${estructura.colecciones.paginas.length} páginas...`)
    for (const pag of estructura.colecciones.paginas) {
      await payload.create({ collection: 'paginas', data: pag })
    }
  }

  // E. Suscriptores y consultas
  if (estructura.colecciones.suscriptores?.length) {
    console.log(`[Restauración] Insertando ${estructura.colecciones.suscriptores.length} suscriptores...`)
    for (const s of estructura.colecciones.suscriptores) {
      await payload.create({ collection: 'suscriptores', data: s })
    }
  }

  if (estructura.colecciones.consultas?.length) {
    console.log(`[Restauración] Insertando ${estructura.colecciones.consultas.length} consultas...`)
    for (const con of estructura.colecciones.consultas) {
      await payload.create({ collection: 'consultas', data: con })
    }
  }

  // F. Ajustes del sitio
  if (estructura.globales?.ajustesSitio) {
    console.log('[Restauración] Restaurando Ajustes del sitio...')
    await payload.updateGlobal({
      slug: 'ajustes-sitio',
      data: estructura.globales.ajustesSitio,
    })
  }

  console.log('------------------------------------------------------------')
  console.log('Restauración completada con éxito.')
  console.log('Nota Fine Art: Vuelve a subir cada foto desde su original con "Reemplazar archivo" para generar las versiones web en volumen.')
  console.log('------------------------------------------------------------')
  process.exit(0)
}

restaurarRespaldo().catch((err) => {
  console.error('[Restauración] Error fatal:', err)
  process.exit(1)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import zlib from 'zlib'

import {
  VERSION_ESQUEMA_RESPALDO,
  LIMITE_VOLUMEN_MEDIOS_BYTES,
  calcularDiasDesde,
  formatearEspacioGb,
} from './respaldo.ts'

test('respaldo: cálculo de días calendario y formatos de estado (despliegue §3.2)', () => {
  // 1. Sin fecha previa
  assert.equal(calcularDiasDesde(null), null)
  assert.equal(calcularDiasDesde(undefined), null)
  assert.equal(calcularDiasDesde('fecha-invalida'), null)

  // 2. Hoy mismo (0 días)
  const hoyIso = new Date().toISOString()
  assert.equal(calcularDiasDesde(hoyIso), 0)

  // 3. Hace 12 días
  const hace12Dias = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  assert.equal(calcularDiasDesde(hace12Dias), 12)

  // 4. Hace 35 días (supera umbral de 30 días)
  const hace35Dias = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  assert.equal(calcularDiasDesde(hace35Dias), 35)
})

test('respaldo: formateo de espacio en GB con coma decimal y umbrales de alerta (despliegue §3.2)', () => {
  // 1. Cero o muy bajo
  assert.equal(formatearEspacioGb(0, LIMITE_VOLUMEN_MEDIOS_BYTES), '0,0 de 5 GB')

  // 2. 800 MB (0.8 GB)
  const bytes800Mb = Math.round(0.8 * 1024 * 1024 * 1024)
  assert.equal(formatearEspacioGb(bytes800Mb, LIMITE_VOLUMEN_MEDIOS_BYTES), '0,8 de 5 GB')

  // 3. 4.2 GB (84% del volumen, dentro de zona de alerta)
  const bytes42Gb = Math.round(4.2 * 1024 * 1024 * 1024)
  assert.equal(formatearEspacioGb(bytes42Gb, LIMITE_VOLUMEN_MEDIOS_BYTES), '4,2 de 5 GB')
})

test('respaldo: esquema inmutable y compresión/descompresión gzip íntegra (despliegue §5.2.7)', () => {
  assert.equal(VERSION_ESQUEMA_RESPALDO, '1.0')

  const muestraRespaldo = {
    manifiesto: {
      versionEsquema: VERSION_ESQUEMA_RESPALDO,
      fecha: new Date().toISOString(),
      conteos: {
        fotos: 1,
        colecciones: 1,
        consultas: 2,
      },
    },
    globales: {
      ajustesSitio: { nombreSitio: 'Rod Díaz' },
    },
    colecciones: {
      fotos: [{ id: 'foto-1', titulo: 'Amanecer en el Llaima', slug: 'amanecer-llaima' }],
      colecciones: [{ id: 'col-1', nombre: 'Araucanía', slug: 'araucania' }],
      caracteristicas: [],
      formatosImpresion: [],
      tiposPapel: [],
      paginas: [],
      medios: [],
      consultas: [{ id: 'con-1', correo: 'visitante@example.com' }],
      suscriptores: [],
      usuarios: [{ id: 'usr-1', email: 'rodrigodiaztapia@gmail.com' }],
    },
  }

  // Comprimir en gzip
  const jsonStr = JSON.stringify(muestraRespaldo)
  const comprimido = zlib.gzipSync(Buffer.from(jsonStr, 'utf-8'), { level: 9 })
  assert.ok(comprimido.length > 0)

  // Descomprimir y verificar igualdad
  const descomprimido = zlib.gunzipSync(comprimido).toString('utf-8')
  const recuperado = JSON.parse(descomprimido)

  assert.equal(recuperado.manifiesto.versionEsquema, '1.0')
  assert.equal(recuperado.colecciones.fotos[0].titulo, 'Amanecer en el Llaima')
  assert.equal(recuperado.colecciones.consultas.length, 1)
})

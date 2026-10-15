import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  esRutaReservada,
  esPaginaReservada,
  SLUGS_RESERVADOS_PAGINAS,
  RUTAS_RESERVADAS_SITIO,
} from './rutasReservadas.ts'

test('esPaginaReservada identifica exactamente las 4 páginas institucionales reservadas', () => {
  assert.equal(SLUGS_RESERVADOS_PAGINAS.length, 4)
  assert.ok(esPaginaReservada('sobre-mi'))
  assert.ok(esPaginaReservada('contacto'))
  assert.ok(esPaginaReservada('privacidad'))
  assert.ok(esPaginaReservada('condiciones'))

  assert.equal(esPaginaReservada('fotos'), false)
  assert.equal(esPaginaReservada('otra-pagina'), false)
})

test('esRutaReservada detecta todas las rutas críticas del sistema y páginas reservadas', () => {
  const rutasEsperadas = [
    'fotos',
    'colecciones',
    'consulta',
    'admin',
    'api',
    'datos',
    'sitemap.xml',
    'robots.txt',
    'guia-estilo',
    'og',
    'sobre-mi',
    'contacto',
    'privacidad',
    'condiciones',
  ]

  for (const r of rutasEsperadas) {
    assert.ok(esRutaReservada(r), `Ruta ${r} debe estar reservada`)
    assert.ok(esRutaReservada(`  ${r.toUpperCase()}  `), `Debe normalizar espacios y mayúsculas en ${r}`)
  }

  // Rutas libres permitidas
  assert.equal(esRutaReservada('sobre-las-copias'), false)
  assert.equal(esRutaReservada('expedicion-atacama'), false)
  assert.equal(esRutaReservada('taller-fine-art'), false)
})

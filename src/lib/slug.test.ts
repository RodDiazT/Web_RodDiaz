import assert from 'node:assert'
import { test } from 'node:test'
import { generarSlug, actualizarSlugsAnteriores } from './slug.ts'

test('generarSlug normaliza correctamente tildes y caracteres especiales', () => {
  assert.strictEqual(generarSlug('Ñuble al alba'), 'nuble-al-alba')
  assert.strictEqual(generarSlug('Volcán Villarrica — Atardecer'), 'volcan-villarrica-atardecer')
  assert.strictEqual(generarSlug('   ¿Cómo fotografiar en el Sur?   '), 'como-fotografiar-en-el-sur')
  assert.strictEqual(generarSlug('Foto 100% Fine-Art & Calidad!'), 'foto-100-fine-art-calidad')
})

test('generarSlug respeta el límite máximo de caracteres', () => {
  const largo = 'este-es-un-titulo-sumamente-largo-que-deberia-ser-truncado-de-forma-limpia-y-sin-dejar-guiones-al-final-del-texto-generado'
  const slug = generarSlug(largo, 30)
  assert.ok(slug.length <= 30)
  assert.ok(!slug.endsWith('-'))
})

test('actualizarSlugsAnteriores guarda slugs previos sin duplicados', () => {
  const previos = ['antiguo-slug']
  const actualizados = actualizarSlugsAnteriores('slug-nuevo', 'antiguo-slug-2', previos)
  assert.deepStrictEqual(actualizados.sort(), ['antiguo-slug', 'antiguo-slug-2'].sort())

  // Si el slug nuevo ya estaba en los anteriores, se remueve
  const sinCiclo = actualizarSlugsAnteriores('antiguo-slug', 'slug-nuevo', actualizados)
  assert.ok(!sinCiclo.includes('antiguo-slug'))
})

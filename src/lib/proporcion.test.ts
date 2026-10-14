import assert from 'node:assert'
import { test } from 'node:test'
import {
  calcularProporcion,
  obtenerOrientacion,
  sonProporcionesCompatibles,
} from './proporcion.ts'

test('obtenerOrientacion identifica correctamente horizontal, vertical y cuadrada', () => {
  assert.strictEqual(obtenerOrientacion(6000, 4000), 'horizontal')
  assert.strictEqual(obtenerOrientacion(4000, 6000), 'vertical')
  assert.strictEqual(obtenerOrientacion(3000, 3000), 'cuadrada')
})

test('calcularProporcion asigna 3:2 nativo y tolera variaciones de sensor (±2%)', () => {
  // 6000x4000 exacto
  const propExacta = calcularProporcion(6000, 4000)
  assert.strictEqual(propExacta.etiqueta, '3:2')
  assert.strictEqual(propExacta.orientacion, 'horizontal')
  assert.strictEqual(propExacta.valor, 1.5)

  // Vertical 4000x6000
  const propVertical = calcularProporcion(4000, 6000)
  assert.strictEqual(propVertical.etiqueta, '3:2')
  assert.strictEqual(propVertical.orientacion, 'vertical')

  // Variación típica de exportación (ej. 4000 x 2667 -> 1.4998, dentro del ±2%)
  const propTolerancia = calcularProporcion(4000, 2667)
  assert.strictEqual(propTolerancia.etiqueta, '3:2')
})

test('calcularProporcion reconoce otros estándares aprobados', () => {
  assert.strictEqual(calcularProporcion(2000, 2000).etiqueta, '1:1')
  assert.strictEqual(calcularProporcion(5000, 4000).etiqueta, '5:4')
  assert.strictEqual(calcularProporcion(4000, 3000).etiqueta, '4:3')
  assert.strictEqual(calcularProporcion(1920, 1080).etiqueta, '16:9')
  assert.strictEqual(calcularProporcion(6000, 3000).etiqueta, '2:1')
  assert.strictEqual(calcularProporcion(9000, 3000).etiqueta, '3:1')
})

test('calcularProporcion genera etiqueta personalizada para panorámicas fuera de estándar', () => {
  // Panorámica 3.4 : 1
  const propPano = calcularProporcion(6800, 2000)
  assert.strictEqual(propPano.etiqueta, '3,4:1')
  assert.strictEqual(propPano.valor, 3.4)
})

test('sonProporcionesCompatibles evalúa correctamente la compatibilidad', () => {
  // 3:2 con 3:2
  assert.ok(sonProporcionesCompatibles(1.5, 1.5))
  // 3:2 con 1.499 (dentro de 2%)
  assert.ok(sonProporcionesCompatibles(1.5, 1.499))
  // 3:2 (1.5) con 4:5 (1.25) NO es compatible
  assert.strictEqual(sonProporcionesCompatibles(1.5, 1.25), false)
})

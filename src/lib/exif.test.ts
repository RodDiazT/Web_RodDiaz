import assert from 'node:assert'
import { test } from 'node:test'
import {
  normalizarVelocidad,
  normalizarApertura,
  normalizarDistanciaFocal,
  normalizarIso,
  normalizarFechaDia,
} from './exif.ts'

test('normalizarVelocidad formatea fracciones y segundos completos', () => {
  assert.strictEqual(normalizarVelocidad(0.004), '1/250 s')
  assert.strictEqual(normalizarVelocidad(0.0125), '1/80 s')
  assert.strictEqual(normalizarVelocidad(0.5), '1/2 s')
  assert.strictEqual(normalizarVelocidad(1), '1 s')
  assert.strictEqual(normalizarVelocidad(2.5), '2.5 s')
  assert.strictEqual(normalizarVelocidad(15), '15 s')
  assert.strictEqual(normalizarVelocidad(undefined), undefined)
})

test('normalizarApertura formatea con un decimal máximo', () => {
  assert.strictEqual(normalizarApertura(2.8), 2.8)
  assert.strictEqual(normalizarApertura(7.1002), 7.1)
  assert.strictEqual(normalizarApertura(11), 11)
  assert.strictEqual(normalizarApertura(undefined), undefined)
})

test('normalizarDistanciaFocal redondea a entero', () => {
  assert.strictEqual(normalizarDistanciaFocal(50), 50)
  assert.strictEqual(normalizarDistanciaFocal(24.3), 24)
  assert.strictEqual(normalizarDistanciaFocal(199.8), 200)
  assert.strictEqual(normalizarDistanciaFocal(undefined), undefined)
})

test('normalizarIso convierte valores numéricos y arreglos XMP a entero positivo', () => {
  assert.strictEqual(normalizarIso(100), 100)
  assert.strictEqual(normalizarIso([400]), 400)
  assert.strictEqual(normalizarIso('1600'), 1600)
  assert.strictEqual(normalizarIso(undefined), undefined)
})

test('normalizarFechaDia fija el mediodía en Chile Continental (15:00 UTC)', () => {
  const fecha = new Date('2026-03-15T08:30:00Z')
  const normalizada = normalizarFechaDia(fecha)
  assert.strictEqual(normalizada, '2026-03-15T15:00:00.000Z')

  // Soporta formato EXIF clásico (YYYY:MM:DD HH:MM:SS)
  assert.strictEqual(
    normalizarFechaDia('2024:10:14 21:30:00'),
    '2024-10-14T15:00:00.000Z'
  )

  // Soporta formato ISO fecha simple (YYYY-MM-DD)
  assert.strictEqual(
    normalizarFechaDia('2025-01-20'),
    '2025-01-20T15:00:00.000Z'
  )

  assert.strictEqual(normalizarFechaDia(undefined), undefined)
})

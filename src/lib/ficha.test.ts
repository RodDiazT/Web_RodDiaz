import test from 'node:test'
import assert from 'node:assert/strict'
import {
  orientarFormato,
  etiquetaProporcion,
  resumenCopias,
  fechaVisible,
  datosTecnicosVisibles,
  hrefConsulta,
  masDeCircular,
} from './ficha.ts'


test('orientarFormato orienta correctamente según la orientación de la foto', () => {
  const formato = {
    id: 1,
    nombre: '30x45 cm',
    ladoCortoCm: 30,
    ladoLargoCm: 45,
    margenMinimoCm: 2.0,
  }

  // Horizontal: Ancho = 45, Alto = 30
  const horizontal = orientarFormato(formato, 'horizontal')
  assert.equal(horizontal.anchoCm, 45)
  assert.equal(horizontal.altoCm, 30)
  assert.equal(horizontal.etiquetaDimensiones, '45 × 30 cm')

  // Vertical: Ancho = 30, Alto = 45
  const vertical = orientarFormato(formato, 'vertical')
  assert.equal(vertical.anchoCm, 30)
  assert.equal(vertical.altoCm, 45)
  assert.equal(vertical.etiquetaDimensiones, '30 × 45 cm')

  // Cuadrada: 30 × 30 cm
  const cuadrada = orientarFormato(formato, 'cuadrada')
  assert.equal(cuadrada.anchoCm, 30)
  assert.equal(cuadrada.altoCm, 30)
  assert.equal(cuadrada.etiquetaDimensiones, '30 × 30 cm')

  // Con decimales (ej. A3: 29.7 × 42)
  const formatoA3 = {
    id: 2,
    ladoCortoCm: 29.7,
    ladoLargoCm: 42,
  }
  const vertA3 = orientarFormato(formatoA3, 'vertical')
  assert.equal(vertA3.etiquetaDimensiones, '29,7 × 42 cm')
})

test('etiquetaProporcion invierte proporciones verticales', () => {
  assert.equal(etiquetaProporcion('3:2', 'horizontal'), '3:2')
  assert.equal(etiquetaProporcion('3:2', 'vertical'), '2:3')
  assert.equal(etiquetaProporcion('4:5', 'vertical'), '4:5')
  assert.equal(etiquetaProporcion('3:2', 'cuadrada'), '1:1')
})

test('resumenCopias calcula rangos y conteo de papeles', () => {
  const papel1 = { id: 'p1', nombre: 'Algodón mate' }
  const papel2 = { id: 'p2', nombre: 'Baryta brillante' }

  // 1 formato con 1 papel
  const f1 = orientarFormato({ id: 1, ladoCortoCm: 30, ladoLargoCm: 45, papeles: [papel1] }, 'vertical')
  assert.equal(resumenCopias([f1]), 'Copia de 30 × 45 cm · Algodón mate')

  // 1 formato con varios papeles
  const f1Varios = orientarFormato({ id: 1, ladoCortoCm: 30, ladoLargoCm: 45, papeles: [papel1, papel2] }, 'vertical')
  assert.equal(resumenCopias([f1Varios]), 'Copia de 30 × 45 cm · 2 papeles')

  // Varios formatos con varios papeles
  const f2 = orientarFormato({ id: 2, ladoCortoCm: 60, ladoLargoCm: 90, papeles: [papel1, papel2] }, 'vertical')
  assert.equal(resumenCopias([f1, f2]), 'Copias de 30 × 45 a 60 × 90 cm · 2 papeles')

  // Vitrina (sin formatos)
  assert.equal(resumenCopias([], 'Obra no disponible para copia'), 'Obra no disponible para copia')
  assert.equal(resumenCopias([], null), '')
})

test('fechaVisible formatea a mes y año en español chileno', () => {
  const res = fechaVisible('2025-03-14T15:00:00.000Z')
  assert.ok(res)
  assert.equal(res?.legible, 'marzo de 2025')
  assert.equal(res?.datetime, '2025-03-14')
})

test('datosTecnicosVisibles concatena solo campos con valor', () => {
  assert.equal(
    datosTecnicosVisibles({ distanciaFocal: '35', apertura: '8', velocidad: '1/250 s' }),
    '35 mm · f/8 · 1/250 s'
  )
  assert.equal(
    datosTecnicosVisibles({ distanciaFocal: 44, apertura: 9, velocidad: '1/400 s', iso: 100 }),
    '44 mm · f/9 · 1/400 s · ISO 100'
  )
  assert.equal(
    datosTecnicosVisibles({ apertura: '5.6', velocidad: '1/125 s' }),
    'f/5,6 · 1/125 s'
  )
  assert.equal(datosTecnicosVisibles({}), null)
  assert.equal(datosTecnicosVisibles(undefined), null)
})

test('hrefConsulta respeta el contrato de URL de consulta', () => {
  assert.equal(hrefConsulta('araucaria'), '/consulta?foto=araucaria&origen=ficha')
  assert.equal(hrefConsulta('araucaria', 'fmt-1'), '/consulta?foto=araucaria&formato=fmt-1&origen=ficha')
  assert.equal(hrefConsulta('araucaria', 'fmt-1', 'visor'), '/consulta?foto=araucaria&formato=fmt-1&origen=visor')
})

test('masDeCircular devuelve hasta N fotos de la colección en orden circular sin la actual', () => {
  const lista = [
    { slug: 'foto-1' },
    { slug: 'foto-2' },
    { slug: 'foto-3' },
    { slug: 'foto-4' },
  ]

  const circ = masDeCircular(lista, 'foto-2', 2)
  assert.deepEqual(circ, [{ slug: 'foto-3' }, { slug: 'foto-4' }])

  const finCircular = masDeCircular(lista, 'foto-4', 2)
  assert.deepEqual(finCircular, [{ slug: 'foto-1' }, { slug: 'foto-2' }])
})

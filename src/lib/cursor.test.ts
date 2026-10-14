import test from 'node:test'
import assert from 'node:assert/strict'
import { codificarCursor, decodificarCursor } from './cursor.ts'


test('codificarCursor y decodificarCursor serializan y deserializan datos correctamente', () => {
  const datos = {
    id: 'foto-123',
    publicadaEn: '2026-10-14T15:00:00.000Z',
    ordenFijada: 1,
    esFijada: true,
  }

  const cursor = codificarCursor(datos)
  assert.equal(typeof cursor, 'string')
  assert.ok(cursor.length > 0)

  const decodificado = decodificarCursor(cursor)
  assert.deepEqual(decodificado, datos)
})

test('decodificarCursor rechaza cursores inválidos o corruptos', () => {
  assert.equal(decodificarCursor(''), null)
  assert.equal(decodificarCursor('invalido_no_base64!!!'), null)
  assert.equal(decodificarCursor(Buffer.from('texto plano', 'utf8').toString('base64url')), null)
  assert.equal(decodificarCursor(Buffer.from(JSON.stringify({ sinId: true }), 'utf8').toString('base64url')), null)
})

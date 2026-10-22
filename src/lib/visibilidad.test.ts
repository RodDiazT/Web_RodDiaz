import assert from 'node:assert'
import { test } from 'node:test'
import {
  esFotoVisible,
  esColeccionMadreListable,
  esColeccionHijaListable,
  type ColeccionLike,
  type FotoLike,
} from './visibilidad.ts'

test('esFotoVisible respeta estados de foto y colecciones', () => {
  const colecciones: Record<string, ColeccionLike> = {
    c1: { id: 'c1', estado: 'publicada' },
    c2: { id: 'c2', estado: 'borrador' },
    hija1: { id: 'hija1', estado: 'publicada', padre: 'c1' },
    hija2: { id: 'hija2', estado: 'publicada', padre: 'c2' }, // madre en borrador
  }

  const obtenerCol = (id: string | number) => colecciones[String(id)]

  // Foto publicada en colección publicada -> visible
  const f1: FotoLike = { id: 'f1', estado: 'publicada', coleccion: 'c1' }
  assert.strictEqual(esFotoVisible(f1, obtenerCol), true)

  // Foto en borrador en colección publicada -> NO visible
  const f2: FotoLike = { id: 'f2', estado: 'borrador', coleccion: 'c1' }
  assert.strictEqual(esFotoVisible(f2, obtenerCol), false)

  // Foto publicada en colección en borrador -> NO visible
  const f3: FotoLike = { id: 'f3', estado: 'publicada', coleccion: 'c2' }
  assert.strictEqual(esFotoVisible(f3, obtenerCol), false)

  // Foto publicada en hija publicada con madre publicada -> visible
  const f4: FotoLike = { id: 'f4', estado: 'publicada', coleccion: 'hija1' }
  assert.strictEqual(esFotoVisible(f4, obtenerCol), true)

  // Foto publicada en hija publicada pero madre en borrador -> NO visible
  const f5: FotoLike = { id: 'f5', estado: 'publicada', coleccion: 'hija2' }
  assert.strictEqual(esFotoVisible(f5, obtenerCol), false)
})

test('esColeccionMadreListable y esColeccionHijaListable', () => {
  const madrePub: ColeccionLike = { id: 'm1', estado: 'publicada' }
  const madreBorr: ColeccionLike = { id: 'm2', estado: 'borrador' }

  assert.strictEqual(esColeccionMadreListable(madrePub, true), true)
  assert.strictEqual(esColeccionMadreListable(madrePub, false), false) // Sin fotos no se lista
  assert.strictEqual(esColeccionMadreListable(madreBorr, true), false)

  const hijaVisible: ColeccionLike = {
    id: 'h1',
    estado: 'publicada',
    padre: 'm1',
    visibleSola: true,
  }
  const hijaOcultaSola: ColeccionLike = {
    id: 'h2',
    estado: 'publicada',
    padre: 'm1',
    visibleSola: false,
  }

  assert.strictEqual(esColeccionHijaListable(hijaVisible, madrePub, true), true)
  assert.strictEqual(esColeccionHijaListable(hijaOcultaSola, madrePub, true), false)
  assert.strictEqual(esColeccionHijaListable(hijaVisible, madreBorr, true), false)
})

test('fotos en colecciones en borrador son excluidas de portada y destacadas', () => {
  const colecciones: Record<string, ColeccionLike> = {
    colBorrador: { id: 'colBorrador', estado: 'borrador' },
    colPublicada: { id: 'colPublicada', estado: 'publicada' },
  }
  const obtenerCol = (id: string | number) => colecciones[String(id)]

  // Foto destacada pero en colección borrador -> NO visible
  const fotoEnCatalogoBorrador: FotoLike = {
    id: 'f10',
    estado: 'publicada',
    coleccion: 'colBorrador',
  }
  assert.strictEqual(esFotoVisible(fotoEnCatalogoBorrador, obtenerCol), false)

  // Foto destacada en colección publicada -> visible
  const fotoEnCatalogoPublicado: FotoLike = {
    id: 'f11',
    estado: 'publicada',
    coleccion: 'colPublicada',
  }
  assert.strictEqual(esFotoVisible(fotoEnCatalogoPublicado, obtenerCol), true)
})

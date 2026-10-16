import { test } from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'

import { tituloPara } from './titulos.ts'
import { descripcionPara, cortarTextoEnPalabra } from './descripciones.ts'
import { canonicaPara } from './canonica.ts'
import {
  validarRobotExcluido,
  normalizarRobotsExcluidos,
  ROBOTS_BUSCADORES_PROHIBIDOS,
} from './robots.ts'
import { jsonLdPara, serializarJsonLdSeguro } from './jsonld.ts'
import { generarLienzoOg, versionOg } from './lienzo-og.ts'
import { metadatosPara } from './metadatos.ts'

test('titulos: reglas oficiales de generación, lugares repetidos y corte de palabras (Criterio 1)', () => {
  const ajustes = { nombreSitio: 'Rod Díaz' }

  // 1. Título normal con lugar
  const t1 = tituloPara('foto', { titulo: 'Amanecer en el Llaima', lugar: 'Conguillío' }, ajustes)
  assert.equal(t1, 'Amanecer en el Llaima, Conguillío · Rod Díaz')
  assert.ok(t1.length <= 65)

  // 2. Título que ya contiene el lugar (insensible a mayúsculas y tildes)
  const t2 = tituloPara('foto', { titulo: 'Atardecer en Conguillío', lugar: 'Conguillío' }, ajustes)
  assert.equal(t2, 'Atardecer en Conguillío · Rod Díaz')

  const t2Tildes = tituloPara('foto', { titulo: 'Niebla en la Araucanía', lugar: 'Araucania' }, ajustes)
  assert.equal(t2Tildes, 'Niebla en la Araucanía · Rod Díaz')

  // 3. Título largo de 100 caracteres: omite lugar y corta con '…' sin romper palabras
  const tituloLargo = 'Este es un título excepcionalmente largo de una fotografía tomada en una remota cumbre andina durante el atardecer'
  const t3 = tituloPara('foto', { titulo: tituloLargo, lugar: 'Patagonia' }, ajustes)
  assert.ok(t3.length <= 65, `Longitud ${t3.length} debe ser <= 65`)
  assert.ok(!t3.includes('Patagonia'), 'Debe omitir lugar al exceder longitud')
  assert.ok(t3.endsWith('… · Rod Díaz'), 'Debe terminar en … · Rod Díaz')

  // 4. Colección hija con madre si cabe vs si no cabe
  const tHijaCorta = tituloPara(
    'coleccion',
    { nombre: 'Araucanía', esHija: true, nombreMadre: 'Sur' },
    ajustes
  )
  assert.equal(tHijaCorta, 'Araucanía, Sur · Rod Díaz')

  const tHijaLarga = tituloPara(
    'coleccion',
    {
      nombre: 'Expediciones botánicas del bosque templado húmedo',
      esHija: true,
      nombreMadre: 'Territorios Australes',
    },
    ajustes
  )
  assert.ok(tHijaLarga.length <= 65)
  assert.ok(!tHijaLarga.includes('Territorios Australes'))

  // 5. Paginación y listas
  assert.equal(tituloPara('fotos', { pagina: 1 }, ajustes), 'Fotos · Rod Díaz')
  assert.equal(tituloPara('fotos', { pagina: 2 }, ajustes), 'Fotos · Página 2 · Rod Díaz')
  assert.equal(
    tituloPara('caracteristica', { nombre: 'Araucanía', pagina: 1 }, ajustes),
    'Araucanía · Fotos · Rod Díaz'
  )
  assert.equal(
    tituloPara('caracteristica', { nombre: 'Araucanía', pagina: 3 }, ajustes),
    'Araucanía · Fotos · Página 3 · Rod Díaz'
  )

  // Característica muy larga (presupuesto estricto de 65 caracteres)
  const carLarga = tituloPara(
    'caracteristica',
    { nombre: 'Fotografía nocturna astronómica de larga exposición en cielos limpios', pagina: 1 },
    ajustes
  )
  assert.ok(carLarga.length <= 65, `Longitud ${carLarga.length} debe ser <= 65`)
  assert.ok(carLarga.endsWith('… · Fotos · Rod Díaz'))

  // 6. Estados especiales
  assert.equal(tituloPara('foto_amable', {}, ajustes), 'Foto no disponible · Rod Díaz')
  assert.equal(tituloPara('no_encontrada', {}, ajustes), 'Página no encontrada · Rod Díaz')
})

test('descripciones: reglas oficiales, fotos de vitrina y corte ≤ 155 caracteres (Criterio 2)', () => {
  const ajustes = { nombreSitio: 'Rod Díaz', descripcion: 'Fotografía Fine Art de naturaleza.' }

  // 1. Automática con copia ofrecida
  const dConCopia = descripcionPara(
    'foto',
    {
      lugar: 'Conguillío',
      fecha: '2025-03-14T15:00:00.000Z',
      ofreceCopia: true,
      formatos: [{ id: '1' }],
    },
    ajustes
  )
  assert.equal(dConCopia, 'Fotografía de Conguillío, marzo de 2025. Disponible como copia impresa.')
  assert.ok(dConCopia.length <= 155)

  // 2. Automática en foto de vitrina (sin copia)
  const dVitrina = descripcionPara(
    'foto',
    {
      lugar: 'Conguillío',
      fecha: '2025-03-14T15:00:00.000Z',
      ofreceCopia: false,
    },
    ajustes
  )
  assert.equal(dVitrina, 'Fotografía de Conguillío, marzo de 2025.')
  assert.ok(!dVitrina.includes('Disponible como copia impresa'))

  // 3. Con historia larga: corta en palabra completa ≤ 155 con '…'
  const historiaLarga =
    'Caminamos durante más de siete horas a través de los escoriales volcánicos del Llaima mientras caía una neblina densa que lo cubría absolutamente todo hasta que el viento abrió la cumbre en un resplandor dorado irrepetible.'
  const dHistoria = descripcionPara('foto', { historia: historiaLarga }, ajustes)
  assert.ok(dHistoria.length <= 155, `Longitud ${dHistoria.length} debe ser <= 155`)
  assert.ok(dHistoria.endsWith('…'))
  assert.ok(!dHistoria.includes('\n'))

  // 4. Colecciones y características con conteo singular/plural
  assert.equal(
    descripcionPara('coleccion', { nombre: 'Araucanía', totalFotos: 1 }, ajustes),
    '1 fotografía de Rod Díaz en Araucanía.'
  )
  assert.equal(
    descripcionPara('coleccion', { nombre: 'Araucanía', totalFotos: 8 }, ajustes),
    '8 fotografías de Rod Díaz en Araucanía.'
  )
  assert.equal(
    descripcionPara('caracteristica', { nombre: 'Bosques', totalFotos: 1 }, ajustes),
    '1 fotografía de Rod Díaz: Bosques.'
  )
})

test('canonica: normalización, descarte de parámetros de campaña y preservación oficial (Criterio 3)', () => {
  const base = 'https://rod-diaz.up.railway.app'

  // 1. Ficha de foto descarta coleccion y parámetros de tracking
  assert.equal(
    canonicaPara('/fotos/araucaria-milenaria', { coleccion: 'araucania', fbclid: '123' }, base),
    'https://rod-diaz.up.railway.app/fotos/araucaria-milenaria'
  )

  // 2. /fotos con caracteristica y pagina=1 (omite pagina=1)
  assert.equal(
    canonicaPara('/fotos', { caracteristica: 'bosques', pagina: 1, utm_source: 'ig' }, base),
    'https://rod-diaz.up.railway.app/fotos?caracteristica=bosques'
  )

  // 3. /fotos con caracteristica y pagina >= 2
  assert.equal(
    canonicaPara('/fotos', { caracteristica: 'bosques', pagina: 2 }, base),
    'https://rod-diaz.up.railway.app/fotos?caracteristica=bosques&pagina=2'
  )

  // 4. Colección con filtro: descarta filtro caracteristica y preserva sólo pagina si >= 2
  assert.equal(
    canonicaPara('/colecciones/sur', { caracteristica: 'bosques', fbclid: 'xyz' }, base),
    'https://rod-diaz.up.railway.app/colecciones/sur'
  )
  assert.equal(
    canonicaPara('/colecciones/sur', { caracteristica: 'bosques', pagina: 2 }, base),
    'https://rod-diaz.up.railway.app/colecciones/sur?pagina=2'
  )

  // 5. Portada
  assert.equal(canonicaPara('/', { ref: 'instagram' }, base), 'https://rod-diaz.up.railway.app/')
})

test('robots: validación estricta de buscadores protegidos y normalización de formatos (Criterio 13)', () => {
  // 1. Prohibir bloquear buscadores esenciales
  for (const bot of ROBOTS_BUSCADORES_PROHIBIDOS) {
    assert.throws(
      () => validarRobotExcluido(bot),
      /Ese robot es de un buscador; bloquearlo te sacaría de las búsquedas\./
    )
    assert.throws(
      () => validarRobotExcluido(`  ${bot.toUpperCase()}  `),
      /Ese robot es de un buscador; bloquearlo te sacaría de las búsquedas\./
    )
  }

  // 2. Permitir bots de entrenamiento de IA
  assert.doesNotThrow(() => validarRobotExcluido('GPTBot'))
  assert.doesNotThrow(() => validarRobotExcluido('ClaudeBot'))
  assert.doesNotThrow(() => validarRobotExcluido('CCBot'))

  // 3. Normalizar diferentes entradas (array, JSON, texto)
  const normArray = normalizarRobotsExcluidos(['GPTBot', 'ClaudeBot'])
  assert.deepEqual(normArray, ['GPTBot', 'ClaudeBot'])

  const normTexto = normalizarRobotsExcluidos('GPTBot\nClaudeBot, CCBot')
  assert.deepEqual(normTexto, ['GPTBot', 'ClaudeBot', 'CCBot'])

  const normJson = normalizarRobotsExcluidos(JSON.stringify(['Google-Extended', 'Applebot-Extended']))
  assert.deepEqual(normJson, ['Google-Extended', 'Applebot-Extended'])
})

test('jsonld: grafo @graph, licenciamiento Fine Art y serialización segura contra XSS (Criterios 9, 10)', () => {
  const ajustes = {
    nombreSitio: 'Rod Díaz',
    descripcion: 'Fotógrafo de naturaleza',
    redes: [{ red: 'instagram', url: 'https://instagram.com/roddiazt' }],
  }

  const foto = {
    slug: 'volcan-llaima',
    titulo: 'Amanecer en el Llaima',
    lugar: 'Conguillío',
    fecha: '2025-03-14T15:00:00.000Z',
    publicadaEn: '2025-03-15T12:00:00.000Z',
    url: '/medios/fotos/llaima.jpg',
    width: 2048,
    height: 1365,
    ofreceCopia: true,
    formatos: [{ id: 'fmt-1' }],
    coleccion: {
      nombre: 'Araucanía',
      slug: 'araucania',
    },
  }

  const jsonLd = jsonLdPara({
    tipo: 'foto',
    datos: foto,
    ajustes,
    ruta: '/fotos/volcan-llaima',
    condicionesPublicada: true,
  })

  assert.equal(jsonLd['@context'], 'https://schema.org')
  assert.ok(Array.isArray(jsonLd['@graph']))

  const nodos = jsonLd['@graph']
  const nodoWebSite = nodos.find((n: any) => n['@type'] === 'WebSite')
  const nodoPerson = nodos.find((n: any) => n['@type'] === 'Person')
  const nodoImage = nodos.find((n: any) => n['@type'] === 'ImageObject')
  const nodoBreadcrumb = nodos.find((n: any) => n['@type'] === 'BreadcrumbList')

  assert.ok(nodoWebSite, 'Debe incluir WebSite')
  assert.ok(nodoPerson, 'Debe incluir Person')
  assert.ok(nodoImage, 'Debe incluir ImageObject')
  assert.ok(nodoBreadcrumb, 'Debe incluir BreadcrumbList')

  // Verificación de licencia Fine Art (§5.2.8, Criterio 10)
  assert.equal(nodoImage.creditText, 'Rod Díaz')
  assert.equal(nodoImage.copyrightNotice, '© 2025 Rod Díaz')
  assert.ok(nodoImage.license.endsWith('/condiciones'))
  assert.ok(nodoImage.acquireLicensePage.includes('origen=licencia'))
  assert.ok(nodoImage.acquireLicensePage.includes('foto=volcan-llaima'))

  // Sin coordenadas GPS ni cámara
  assert.equal(nodoImage.geo, undefined)
  assert.equal(nodoImage.exifData, undefined)

  // Serialización segura
  const objetoConScript = { texto: '</script><script>alert("xss")</script>' }
  const seguro = serializarJsonLdSeguro(objetoConScript)
  assert.ok(!seguro.includes('</script>'))
  assert.ok(seguro.includes('\\u003c/script\\u003e'))
})

test('lienzo-og: generación de imagen 1200x630, marca inferior y peso < 300 KB (Criterios 6, 7)', async () => {
  // Crear una imagen horizontal de prueba 1200x800 con Sharp
  const imgHorizontal = await sharp({
    create: {
      width: 1200,
      height: 800,
      channels: 3,
      background: { r: 50, g: 80, b: 120 },
    },
  })
    .jpeg()
    .toBuffer()

  const lienzoHorizontal = await generarLienzoOg({
    bufferImagen: imgHorizontal,
    anchoOriginal: 1200,
    altoOriginal: 800,
    nombreSitio: 'Rod Díaz',
  })

  const metaH = await sharp(lienzoHorizontal).metadata()
  assert.equal(metaH.width, 1200)
  assert.equal(metaH.height, 630)
  assert.equal(metaH.format, 'jpeg')
  assert.ok(lienzoHorizontal.length < 300 * 1024, `Peso ${lienzoHorizontal.length} bytes debe ser < 300 KB`)

  // Crear una imagen vertical de prueba 800x1200 (desenfoque adaptativo WhatsApp §5.2.6.3)
  const imgVertical = await sharp({
    create: {
      width: 800,
      height: 1200,
      channels: 3,
      background: { r: 120, g: 60, b: 40 },
    },
  })
    .jpeg()
    .toBuffer()

  const lienzoVertical = await generarLienzoOg({
    bufferImagen: imgVertical,
    anchoOriginal: 800,
    altoOriginal: 1200,
    nombreSitio: 'Rod Díaz',
  })

  const metaV = await sharp(lienzoVertical).metadata()
  assert.equal(metaV.width, 1200)
  assert.equal(metaV.height, 630)
  assert.equal(metaV.format, 'jpeg')
  assert.ok(lienzoVertical.length < 300 * 1024, `Peso ${lienzoVertical.length} bytes debe ser < 300 KB`)

  // Perfil ICC sRGB presente (§5.2.6.5)
  assert.ok(metaH.icc, 'Debe incluir perfil de color ICC')
  assert.ok(metaV.icc, 'Debe incluir perfil de color ICC')

  // Parámetro versionOg
  const v1 = versionOg('2026-10-15T12:00:00Z', '2026-10-14T10:00:00Z')
  const v2 = versionOg('2026-10-16T12:00:00Z', '2026-10-14T10:00:00Z')
  assert.equal(v1.length, 8)
  assert.notEqual(v1, v2, 'Cambio de fecha debe cambiar el hash v')
})

test('metadatosPara: omisión estricta de canónica en estados no indexables (foto_amable, 404)', () => {
  const ajustes = { nombreSitio: 'Rod Díaz' }

  // 1. Ficha normal: lleva canonical
  const metaFoto = metadatosPara({
    tipo: 'foto',
    datos: { slug: 'foto-1', titulo: 'Foto 1' },
    ajustes,
    ruta: '/fotos/foto-1',
  })
  assert.ok(metaFoto.alternates?.canonical)

  // 2. Foto amable (no disponible): NO debe llevar canonical
  const metaAmable = metadatosPara({
    tipo: 'foto_amable',
    datos: { slug: 'foto-despublicada' },
    ajustes,
    ruta: '/fotos/foto-despublicada',
  })
  assert.equal(metaAmable.alternates?.canonical, undefined)
  assert.equal(metaAmable.robots?.index, false)
  assert.equal(metaAmable.robots?.follow, true)

  // 3. Página 404: NO debe llevar canonical
  const meta404 = metadatosPara({
    tipo: 'no_encontrada',
    ajustes,
    ruta: '/ruta-inexistente',
  })
  assert.equal(meta404.alternates?.canonical, undefined)
  assert.equal(meta404.robots?.index, false)
})


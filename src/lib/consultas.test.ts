import test from 'node:test'
import assert from 'node:assert/strict'
import {
  sugerirCorreo,
  firmarEmision,
  verificarEmision,
  clasificarSpam,
  validarConsulta,
  limpiarItems,
  calcularEliminarDespuesDe,
  urlRespuestaGmail,
  indicadorMensual,
  exportarDatosCorreo,
} from './consultas.ts'
import { verificarLimiteIp, reiniciarLimitesPruebas } from './limiteEnvios.ts'

test('sugerirCorreo detecta errores comunes de tipeo en proveedores frecuentes', () => {
  assert.equal(sugerirCorreo('contacto@gmial.com'), 'contacto@gmail.com')
  assert.equal(sugerirCorreo('usuario@hotmial.com'), 'usuario@hotmail.com')
  assert.equal(sugerirCorreo('test@outlok.com'), 'test@outlook.com')
  assert.equal(sugerirCorreo('cliente@yaho.com'), 'cliente@yahoo.com')
  assert.equal(sugerirCorreo('persona@iclud.com'), 'persona@icloud.com')

  // No sugiere nada si el dominio es correcto
  assert.equal(sugerirCorreo('contacto@gmail.com'), null)
  assert.equal(sugerirCorreo('contacto@hotmail.com'), null)
  assert.equal(sugerirCorreo('contacto@dominio-propio.cl'), null)
})

test('firmarEmision y verificarEmision calibran antispam a 1.8 segundos y toleran > 24h', () => {
  const secret = 'mi-secreto-de-prueba'
  const ahora = 1000000

  // 1. Envío legítimo tras 2.5 segundos
  const emitidoValido = ahora - 2500
  const firmaValida = firmarEmision(emitidoValido, secret)
  const resValida = verificarEmision(emitidoValido, firmaValida, secret, ahora)
  assert.equal(resValida.valido, true)

  // 2. Envío ultra rápido de bot en 800 ms (< 1.8s)
  const emitidoRapido = ahora - 800
  const firmaRapida = firmarEmision(emitidoRapido, secret)
  const resRapida = verificarEmision(emitidoRapido, firmaRapida, secret, ahora)
  assert.equal(resRapida.valido, false)
  assert.equal(resRapida.motivo, 'tiempo_insuficiente')

  // 3. Firma adulterada
  const resAdulterada = verificarEmision(emitidoValido, 'firma-falsa-invalida', secret, ahora)
  assert.equal(resAdulterada.valido, false)
  assert.equal(resAdulterada.motivo, 'firma_invalida')

  // 4. Pestaña abierta más de 24 horas (se acepta según §5.2.5)
  const emitidoViejo = ahora - 30 * 60 * 60 * 1000 // 30 horas
  const firmaVieja = firmarEmision(emitidoViejo, secret)
  const resVieja = verificarEmision(emitidoViejo, firmaVieja, secret, ahora)
  assert.equal(resVieja.valido, true)
})

test('clasificarSpam identifica honeypot y tiempos anómalos', () => {
  const secret = 'secreto'
  const ahora = 5000000
  const emitidoValido = ahora - 3000
  const firmaValida = firmarEmision(emitidoValido, secret)

  // Envío limpio
  assert.equal(
    clasificarSpam({ trampa: '', emitidoEn: emitidoValido, firma: firmaValida }, ahora, secret),
    false
  )

  // Bot que completó campo trampa
  assert.equal(
    clasificarSpam(
      { trampa: 'http://spam.ru', emitidoEn: emitidoValido, firma: firmaValida },
      ahora,
      secret
    ),
    true
  )

  // Bot que envió sin firma o muy rápido
  assert.equal(
    clasificarSpam({ trampa: '', emitidoEn: ahora - 200, firma: 'invalida' }, ahora, secret),
    true
  )
})

test('validarConsulta aplica reglas estrictas de negocio y sanitización', () => {
  // Inválido por falta de campos obligatorios
  const invalido = validarConsulta({})
  assert.equal(invalido.valido, false)
  assert.ok(invalido.errores.nombre)
  assert.ok(invalido.errores.correo)
  assert.ok(invalido.errores.acepta)

  // Válido completo
  const valido = validarConsulta({
    nombre: ' Francisca Valenzuela ',
    correo: 'FRAN@DOMINIO.CL ',
    telefono: '+56 9 1234 5678',
    ciudad: 'Santiago',
    mensaje: 'Hola, me interesa saber las medidas disponibles.',
    acepta: 'on',
    promociones: '1',
    items: [
      { foto: 'araucaria-milenaria', tituloFoto: 'Araucaria milenaria' },
      { foto: 'torres-del-paine', tituloFoto: 'Torres del Paine' },
    ],
  })

  assert.equal(valido.valido, true)
  assert.equal(valido.valores.nombre, 'Francisca Valenzuela')
  assert.equal(valido.valores.correo, 'fran@dominio.cl')
  assert.equal(valido.valores.acepta, true)
  assert.equal(valido.valores.promociones, true)
  assert.equal(valido.valores.items.length, 2)
})

test('limpiarItems deduplica fotos repetidas y limita a 5 ítems', () => {
  const duplicados = [
    { foto: 'foto-1', tituloFoto: 'Foto 1' },
    { foto: 'foto-2', tituloFoto: 'Foto 2' },
    { foto: 'foto-1', tituloFoto: 'Foto 1 Repetida' },
    { foto: 'foto-3', tituloFoto: 'Foto 3' },
    { foto: 'foto-4', tituloFoto: 'Foto 4' },
    { foto: 'foto-5', tituloFoto: 'Foto 5' },
    { foto: 'foto-6', tituloFoto: 'Foto 6 fuera de límite' },
  ]

  const resultado = limpiarItems(duplicados)
  assert.equal(resultado.length, 5)
  assert.equal(resultado[0].slugFoto, 'foto-1')
  assert.equal(resultado[1].slugFoto, 'foto-2')
  assert.equal(resultado[2].slugFoto, 'foto-3')
  assert.equal(resultado[3].slugFoto, 'foto-4')
  assert.equal(resultado[4].slugFoto, 'foto-5')
})

test('calcularEliminarDespuesDe aplica 30 días para spam y 12 meses para legítimas', () => {
  const fechaBase = new Date('2026-10-15T12:00:00Z')

  const consultaSpam = {
    estado: 'spam',
    createdAt: fechaBase.toISOString(),
  }
  const purgaSpam = new Date(calcularEliminarDespuesDe(consultaSpam, fechaBase))
  const diffDiasSpam = Math.round((purgaSpam.getTime() - fechaBase.getTime()) / (24 * 60 * 60 * 1000))
  assert.equal(diffDiasSpam, 30)

  const consultaNormal = {
    estado: 'nueva',
    ultimaActividad: fechaBase.toISOString(),
  }
  const purgaNormal = new Date(calcularEliminarDespuesDe(consultaNormal, fechaBase))
  const diffDiasNormal = Math.round((purgaNormal.getTime() - fechaBase.getTime()) / (24 * 60 * 60 * 1000))
  assert.equal(diffDiasNormal, 365)
})

test('urlRespuestaGmail arma URLs de Gmail y mailto con sustitución de variables', () => {
  const consulta = {
    nombre: 'Camila',
    correo: 'camila@ejemplo.com',
    items: [
      {
        tituloFoto: 'Volcán Llaima',
        nombreFormatoSnapshot: '40 × 60 cm',
        nombrePapelSnapshot: 'Hahnemühle Photo Rag',
      },
    ],
  }

  const res = urlRespuestaGmail(consulta, null, 'roddiaz@gmail.com')
  assert.ok(res.urlGmail.includes('view=cm'))
  assert.ok(res.urlGmail.includes('authuser=roddiaz%40gmail.com'))
  assert.ok(res.urlGmail.includes('to=camila%40ejemplo.com'))
  assert.ok(res.urlGmail.includes('Volc%C3%A1n%20Llaima'))
  assert.ok(res.urlMailto.startsWith('mailto:camila@ejemplo.com'))
})

test('indicadorMensual agrupa 12 meses en America/Santiago excluyendo spam y generales', () => {
  const ref = new Date('2026-10-15T15:00:00Z')
  const consultas = [
    { tipo: 'copia', estado: 'nueva', createdAt: '2026-10-10T12:00:00Z' },
    { tipo: 'copia', estado: 'respondida', createdAt: '2026-10-05T12:00:00Z', respondidaEn: '2026-10-06T12:00:00Z' },
    { tipo: 'copia', estado: 'spam', createdAt: '2026-10-02T12:00:00Z' }, // Excluido
    { tipo: 'general', estado: 'nueva', createdAt: '2026-10-01T12:00:00Z' }, // Cuenta en generales
  ]

  const indicador = indicadorMensual(consultas, ref)
  assert.equal(indicador.meses.length, 12)
  assert.equal(indicador.generales, 1)

  const mesActual = indicador.meses[indicador.meses.length - 1]
  assert.equal(mesActual.recibidas, 2)
  assert.equal(mesActual.respondidas, 1)
})

test('exportarDatosCorreo genera informe de transparencia Ley 21.719', () => {
  const consultas = [
    {
      id: 'c-100',
      createdAt: '2026-10-14T10:00:00Z',
      nombre: 'Rodrigo P.',
      correo: 'titular@correo.cl',
      telefono: '+56987654321',
      ciudad: 'Temuco',
      tipo: 'copia',
      estado: 'nueva',
      consentimientoEn: '2026-10-14T10:00:00Z',
      versionPolitica: '2026-10-14T09:00:00Z',
      aceptaPromociones: true,
      mensaje: 'Consulta de prueba Fine Art',
      items: [
        {
          tituloFoto: 'Bosque de Niebla',
          nombreFormatoSnapshot: '30 × 45 cm',
          nombrePapelSnapshot: 'Algodón mate',
        },
      ],
    },
  ]

  const informe = exportarDatosCorreo(consultas, 'titular@correo.cl')
  assert.ok(informe.includes('INFORME DE DATOS PERSONALES'))
  assert.ok(informe.includes('titular@correo.cl'))
  assert.ok(informe.includes('Ley 21.719'))
  assert.ok(informe.includes('Bosque de Niebla'))
  assert.ok(informe.includes('30 × 45 cm'))
})

test('verificarLimiteIp limita a 5 peticiones por hora por IP', () => {
  reiniciarLimitesPruebas()
  const ip = '192.168.1.50'

  for (let i = 1; i <= 5; i++) {
    const res = verificarLimiteIp(ip)
    assert.equal(res.permitido, true)
    assert.equal(res.restantes, 5 - i)
  }

  // 6ta petición debe ser rechazada
  const rechazada = verificarLimiteIp(ip)
  assert.equal(rechazada.permitido, false)
  assert.equal(rechazada.restantes, 0)
})

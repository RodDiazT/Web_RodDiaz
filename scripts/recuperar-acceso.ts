/**
 * Script de recuperación de acceso de emergencia al panel de administración.
 * Especificado en DocumentosTecnicos/plataforma/despliegue.md (§3.3 y §5.2.11).
 * 
 * Se ejecuta en Railway mediante `railway ssh` o comando de consola.
 * Genera un enlace de un solo uso válido por 15 minutos para el administrador principal.
 */

import 'dotenv/config'
import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { entorno } from '../src/lib/entorno.ts'

async function recuperarAcceso() {
  const correoAdmin = entorno.listaCorreosAdmin[0] || 'rodrigodiaztapia@gmail.com'
  const payload = await getPayload({ config })

  console.log(`[Recuperación] Buscando usuario administrador para: ${correoAdmin}`)

  let usuario = (
    await payload.find({
      collection: 'usuarios',
      where: {
        email: { equals: correoAdmin },
      },
      limit: 1,
    })
  ).docs[0]

  // Generar token criptográfico aleatorio de 32 bytes (64 caracteres hex)
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const vencimiento = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutos

  if (!usuario) {
    console.log(`[Recuperación] Creando usuario administrador inicial: ${correoAdmin}`)
    usuario = await payload.create({
      collection: 'usuarios',
      data: {
        nombre: 'Rod Díaz',
        email: correoAdmin,
        password: crypto.randomBytes(32).toString('hex'), // Clave inaccesible aleatoria (acceso solo vía Google o token)
        proveedorAcceso: 'local',
        recuperacionHash: tokenHash,
        recuperacionVence: vencimiento,
      },
    })
  } else {
    await payload.update({
      collection: 'usuarios',
      id: usuario.id,
      data: {
        recuperacionHash: tokenHash,
        recuperacionVence: vencimiento,
      },
    })
  }

  const urlSitio = entorno.URL_SITIO || 'http://localhost:3000'
  const enlace = `${urlSitio}/admin/recuperar?token=${token}`

  console.log('------------------------------------------------------------')
  console.log(`Enlace de recuperación generado para ${correoAdmin}:`)
  console.log(enlace)
  console.log('Validez: 15 minutos. De un solo uso.')
  console.log('------------------------------------------------------------')
  process.exit(0)
}

recuperarAcceso().catch((err) => {
  console.error('[Recuperación] Error:', err)
  process.exit(1)
})

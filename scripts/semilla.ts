import 'dotenv/config'
import { sembrarDatos } from '../src/semilla/semilla'

async function ejecutar() {
  try {
    await sembrarDatos()
    process.exit(0)
  } catch (error) {
    console.error('[Semilla] Error al ejecutar semilla:', error)
    process.exit(1)
  }
}

ejecutar()

'use client'

/**
 * Formulario público de consultas 1:1 Fine Art y mensajes generales (§3, §5.4).
 * Funciona sin JavaScript con Server Action y se mejora progresivamente.
 */

import React, { useState, useActionState, useRef, useId } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import styles from './FormularioConsulta.module.css'
import { Campo } from '@/componentes/base/Campo'
import { Boton } from '@/componentes/base/Boton'
import { Aviso } from '@/componentes/base/Aviso'
import { Retorno } from '@/componentes/base/Retorno'
import { ItemsConsulta } from './ItemsConsulta'
import { ItemConsultaDatos } from './ItemConsulta'
import { SugerenciaCorreo } from './SugerenciaCorreo'
import { ExitoConsulta } from './ExitoConsulta'
import { enviarConsulta, EstadoAccionConsulta } from '@/app/(sitio)/consulta/acciones'
import { FotoConsultableItem } from './BuscadorFotos'

// Carga diferida del modal BuscadorFotos solo al hacer clic en "Agregar otra foto" (§5.4)
const BuscadorFotos = dynamic(
  () => import('./BuscadorFotos').then((mod) => mod.BuscadorFotos),
  { ssr: false }
)

interface FormularioConsultaProps {
  itemsIniciales: ItemConsultaDatos[]
  fotoOrigen?: { titulo: string; slug: string } | null
  origen?: 'ficha' | 'visor' | 'general' | 'licencia'
  textoIntroConsulta: string
  textoConsultaRecibida: string
  textoConsentimiento?: string
  textoPromociones?: string
  correoContacto: string
  claveEnvioInicial: string
  emitidoEnInicial: number
  firmaInicial: string
  avisoInformativo?: string | null
  retorno: { etiqueta: string; href: string }
}

const estadoInicial: EstadoAccionConsulta = {
  estado: 'inicial',
}

export function FormularioConsulta({
  itemsIniciales,
  fotoOrigen,
  origen = 'general',
  textoIntroConsulta,
  textoConsultaRecibida,
  textoConsentimiento = 'Acepto la {politica} y que Rod Díaz me contacte por correo, teléfono u otro medio que indiqué, para responder esta consulta.',
  textoPromociones = 'Quiero recibir novedades y promociones de Rod Díaz (fotos nuevas, ofertas de copias). Puedo darme de baja cuando quiera.',
  correoContacto,
  claveEnvioInicial,
  emitidoEnInicial,
  firmaInicial,
  avisoInformativo,
  retorno,
}: FormularioConsultaProps) {
  const [state, formAction, isPending] = useActionState(enviarConsulta, estadoInicial)

  const [items, setItems] = useState<ItemConsultaDatos[]>(itemsIniciales)
  const [buscadorAbierto, setBuscadorAbierto] = useState(false)

  // Valores de los campos para control y validación al salir (§3.5)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [acepta, setAcepta] = useState(false)
  const [promociones, setPromociones] = useState(false)

  // Errores por campo validados en el navegador al desenfocar (§3.5)
  const [erroresLocales, setErroresLocales] = useState<Record<string, string>>({})
  const [tocado, setTocado] = useState<Record<string, boolean>>({})

  const idAlertaErrores = useId()
  const formRef = useRef<HTMLFormElement>(null)

  // Identificar si el formulario contiene texto para que enlaces abran en otra pestaña (§3.3)
  const formularioConDatos = Boolean(
    nombre.trim() || correo.trim() || telefono.trim() || ciudad.trim() || mensaje.trim()
  )

  // Validación de campo individual al salir (onBlur) (§3.5)
  const validarCampo = (campo: string, valor: any) => {
    const nuevos = { ...erroresLocales }

    if (campo === 'nombre') {
      const v = String(valor || '').trim()
      if (!v) {
        nuevos.nombre = 'Escribe tu nombre'
      } else if (v.length < 2) {
        nuevos.nombre = 'El nombre debe tener al menos 2 caracteres'
      } else {
        delete nuevos.nombre
      }
    }

    if (campo === 'correo') {
      const v = String(valor || '').trim().toLowerCase()
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!v) {
        nuevos.correo = 'Escribe tu correo'
      } else if (!regex.test(v)) {
        nuevos.correo = 'Revisa el correo: falta algo como nombre@dominio.cl'
      } else {
        delete nuevos.correo
      }
    }

    if (campo === 'acepta') {
      if (!valor) {
        nuevos.acepta = 'Marca la casilla para poder enviar'
      } else {
        delete nuevos.acepta
      }
    }

    setErroresLocales(nuevos)
  }

  // Manejo de ítems
  const handleCambiarFormato = (indice: number, formatoId: string | null, snapshot?: string) => {
    setItems((prev) => {
      const copia = [...prev]
      if (copia[indice]) {
        copia[indice] = {
          ...copia[indice],
          formatoSeleccionado: formatoId,
          nombreFormatoSnapshot: snapshot,
          papelSeleccionado: null, // Reset de papel al cambiar formato
          nombrePapelSnapshot: undefined,
        }
      }
      return copia
    })
  }

  const handleCambiarPapel = (indice: number, papelId: string | null, snapshot?: string) => {
    setItems((prev) => {
      const copia = [...prev]
      if (copia[indice]) {
        copia[indice] = {
          ...copia[indice],
          papelSeleccionado: papelId,
          nombrePapelSnapshot: snapshot,
        }
      }
      return copia
    })
  }

  const handleQuitarItem = (indice: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== indice))
  }

  const handleSeleccionarFotoBuscador = (foto: FotoConsultableItem) => {
    const esUnico = foto.formatos.length === 1
    const formatoInicial = esUnico ? foto.formatos[0] : null
    const esPapelUnico = formatoInicial && formatoInicial.papeles.length === 1
    const papelInicial = esPapelUnico ? formatoInicial.papeles[0] : null

    const nuevoItem: ItemConsultaDatos = {
      foto: foto.slug,
      slugFoto: foto.slug,
      tituloFoto: foto.titulo,
      miniaturaUrl: foto.miniatura.webp,
      formatosDisponibles: foto.formatos,
      formatoSeleccionado: formatoInicial ? formatoInicial.id : null,
      nombreFormatoSnapshot: formatoInicial ? formatoInicial.nombre : undefined,
      papelSeleccionado: papelInicial ? papelInicial.id : null,
      nombrePapelSnapshot: papelInicial ? papelInicial.nombre : undefined,
    }

    setItems((prev) => [...prev, nuevoItem])
  }

  // Si la acción terminó con éxito (§3.6)
  if (state.estado === 'exito' && state.resumen) {
    return (
      <div className={styles.contenedorPagina}>
        <ExitoConsulta
          resumen={state.resumen}
          textoConsultaRecibida={textoConsultaRecibida}
          correoContacto={correoContacto}
          fotoOrigen={fotoOrigen}
        />
      </div>
    )
  }

  const erroresServidor = state.errores || {}
  const hayErrores = Object.keys(erroresLocales).length > 0 || Object.keys(erroresServidor).length > 0
  const esConsultaCopia = items.length > 0

  return (
    <div className={styles.contenedorPagina}>
      <div className={styles.retornoContenedor}>
        <Retorno etiqueta={retorno.etiqueta} href={retorno.href} />
      </div>

      {avisoInformativo && (
        <div style={{ marginBottom: 'var(--esp-6)' }}>
          <Aviso tipo="informativo" titulo="Información de la obra">
            {avisoInformativo}
          </Aviso>
        </div>
      )}

      {/* Resumen de errores en alert si falló el envío (§3.5) */}
      {hayErrores && (
        <div style={{ marginBottom: 'var(--esp-6)' }}>
          <Aviso id={idAlertaErrores} tipo="error" titulo="Revisa los campos del formulario">
            <ul style={{ margin: 0, paddingLeft: 'var(--esp-4)', fontSize: 'var(--texto-sm)' }}>
              {erroresServidor.guardado && <li>{erroresServidor.guardado}</li>}
              {erroresServidor.limite && <li>{erroresServidor.limite}</li>}
              {(erroresLocales.nombre || erroresServidor.nombre) && (
                <li>
                  <a href="#campo-consulta-nombre" style={{ color: 'inherit' }}>
                    {erroresLocales.nombre || erroresServidor.nombre}
                  </a>
                </li>
              )}
              {(erroresLocales.correo || erroresServidor.correo) && (
                <li>
                  <a href="#campo-consulta-correo" style={{ color: 'inherit' }}>
                    {erroresLocales.correo || erroresServidor.correo}
                  </a>
                </li>
              )}
              {(erroresLocales.acepta || erroresServidor.acepta) && (
                <li>
                  <a href="#campo-consulta-acepta" style={{ color: 'inherit' }}>
                    {erroresLocales.acepta || erroresServidor.acepta}
                  </a>
                </li>
              )}
            </ul>
          </Aviso>
        </div>
      )}

      <div className={styles.disposicionDosColumnas}>
        {/* Columna Izquierda: Tu consulta / Obras seleccionadas (§3.2) */}
        <aside className={styles.columnaIzquierda} aria-label="Resumen de obras consultadas">
          <h2 className={styles.tituloColumna}>
            {esConsultaCopia ? 'Tu consulta' : '¿Te interesa una copia?'}
          </h2>

          {items.length === 0 ? (
            <div className={styles.bloqueVacioConsulta}>
              <p style={{ font: 'var(--texto-sm)', color: 'var(--color-texto-secundario)', margin: 0 }}>
                Puedes agregar una o más fotografías a tu consulta si deseas encargar copias Fine Art.
              </p>
              <Boton variante="secundario" onClick={() => setBuscadorAbierto(true)}>
                Agregar una foto
              </Boton>
            </div>
          ) : (
            <ItemsConsulta
              items={items}
              formularioConDatos={formularioConDatos}
              alCambiarFormato={handleCambiarFormato}
              alCambiarPapel={handleCambiarPapel}
              alQuitarItem={handleQuitarItem}
              alAbrirBuscador={() => setBuscadorAbierto(true)}
            />
          )}
        </aside>

        {/* Columna Derecha: Formulario de datos (§3.2) */}
        <main className={styles.columnaDerecha}>
          <form
            ref={formRef}
            action={formAction}
            className={styles.formulario}
            noValidate
          >
            {/* Campos ocultos de antispam, sesión e idempotencia (§5.2, §5.3) */}
            <input type="hidden" name="claveEnvio" value={claveEnvioInicial} />
            <input type="hidden" name="emitidoEn" value={emitidoEnInicial} />
            <input type="hidden" name="firma" value={firmaInicial} />
            <input type="hidden" name="origen" value={origen} />
            <input
              type="hidden"
              name="itemsJson"
              value={JSON.stringify(
                items.map((i) => ({
                  foto: i.foto,
                  slugFoto: i.slugFoto,
                  tituloFoto: i.tituloFoto,
                  formato: i.formatoSeleccionado,
                  papel: i.papelSeleccionado,
                  nombreFormatoSnapshot: i.nombreFormatoSnapshot,
                  nombrePapelSnapshot: i.nombrePapelSnapshot,
                }))
              )}
            />

            {/* Campo trampa Honeypot (§5.2.5) */}
            <div className={styles.campoTrampa} aria-hidden="true">
              <label htmlFor="campo-sitio-web">No completes este campo si eres humano</label>
              <input
                id="campo-sitio-web"
                type="text"
                name="sitio_web"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <p className={styles.textoIntro}>{textoIntroConsulta}</p>

            <div className={styles.grupoCampos}>
              {/* Nombre (obligatorio) */}
              <div>
                <Campo
                  tipo="texto"
                  etiqueta="Nombre"
                  id="campo-consulta-nombre"
                  name="nombre"
                  valor={nombre}
                  requerido
                  error={tocado.nombre ? erroresLocales.nombre || erroresServidor.nombre : undefined}
                  alCambiar={(e) => setNombre(e.target.value)}
                  alDesenfocar={() => {
                    setTocado((t) => ({ ...t, nombre: true }))
                    validarCampo('nombre', nombre)
                  }}
                  autoComplete="name"
                  enterKeyHint="next"
                />
              </div>

              {/* Correo (obligatorio) */}
              <div>
                <Campo
                  tipo="correo"
                  etiqueta="Correo electrónico"
                  id="campo-consulta-correo"
                  name="correo"
                  valor={correo}
                  requerido
                  error={tocado.correo ? erroresLocales.correo || erroresServidor.correo : undefined}
                  alCambiar={(e) => setCorreo(e.target.value)}
                  alDesenfocar={() => {
                    setTocado((t) => ({ ...t, correo: true }))
                    validarCampo('correo', correo)
                  }}
                  autoComplete="email"
                  enterKeyHint="next"
                />
                <SugerenciaCorreo correo={correo} alAceptar={(sug) => setCorreo(sug)} />
              </div>

              {/* Teléfono (opcional) */}
              <div>
                <Campo
                  tipo="texto"
                  etiqueta="Teléfono (opcional)"
                  id="campo-consulta-telefono"
                  name="telefono"
                  valor={telefono}
                  error={erroresServidor.telefono}
                  alCambiar={(e) => setTelefono(e.target.value)}
                  autoComplete="tel"
                  enterKeyHint="next"
                />
              </div>

              {/* Ciudad (opcional) con ayuda para despacho */}
              <div>
                <Campo
                  tipo="texto"
                  etiqueta="Ciudad / Región (opcional)"
                  ayuda="Para estimar el envío"
                  id="campo-consulta-ciudad"
                  name="ciudad"
                  valor={ciudad}
                  error={erroresServidor.ciudad}
                  alCambiar={(e) => setCiudad(e.target.value)}
                  autoComplete="address-level2"
                  enterKeyHint="next"
                />
              </div>

              {/* Mensaje (opcional) */}
              <div>
                <Campo
                  tipo="area"
                  etiqueta="Mensaje (opcional)"
                  id="campo-consulta-mensaje"
                  name="mensaje"
                  valor={mensaje}
                  lineas={4}
                  error={erroresServidor.mensaje}
                  alCambiar={(e) => setMensaje(e.target.value)}
                  enterKeyHint="send"
                />
                {mensaje.length >= 1800 && (
                  <div className={styles.contadorMensaje}>
                    {mensaje.length} / 2000 caracteres
                  </div>
                )}
              </div>
            </div>

            {/* Casillas de consentimiento y promociones (§3.2, §6) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-3)', marginTop: 'var(--esp-2)' }}>
              {/* Casilla obligatoria de privacidad y contacto */}
              <label className={styles.casillaContenedor}>
                <input
                  id="campo-consulta-acepta"
                  type="checkbox"
                  name="acepta"
                  checked={acepta}
                  onChange={(e) => {
                    setAcepta(e.target.checked)
                    validarCampo('acepta', e.target.checked)
                  }}
                  className={styles.casillaInput}
                  required
                />
                <span>
                  {textoConsentimiento.includes('{politica}') ? (
                    <>
                      {textoConsentimiento.split('{politica}')[0]}
                      <Link
                        href="/privacidad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.enlaceLegal}
                      >
                        política de privacidad (se abre en una pestaña nueva)
                      </Link>
                      {textoConsentimiento.split('{politica}').slice(1).join('{politica}')}
                    </>
                  ) : (
                    <>
                      {textoConsentimiento}{' '}
                      <Link
                        href="/privacidad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.enlaceLegal}
                      >
                        (ver política de privacidad)
                      </Link>
                    </>
                  )}
                </span>
              </label>
              {(tocado.acepta || erroresServidor.acepta) && (erroresLocales.acepta || erroresServidor.acepta) && (
                <div style={{ color: 'var(--color-error)', fontSize: 'var(--texto-xs)' }}>
                  {erroresLocales.acepta || erroresServidor.acepta}
                </div>
              )}

              {/* Casilla opcional de novedades y promociones */}
              <label className={styles.casillaContenedor}>
                <input
                  id="campo-consulta-promociones"
                  type="checkbox"
                  name="promociones"
                  checked={promociones}
                  onChange={(e) => setPromociones(e.target.checked)}
                  className={styles.casillaInput}
                />
                <span>
                  {textoPromociones}
                </span>
              </label>
            </div>

            {/* Botón de envío principal */}
            <div style={{ marginTop: 'var(--esp-4)' }}>
              <Boton
                id="boton-enviar-consulta"
                tipo="submit"
                variante="primario"
                cargando={isPending}
                disabled={isPending}
                style={{ width: '100%' }}
              >
                {isPending ? 'Enviando…' : esConsultaCopia ? 'Enviar consulta' : 'Enviar mensaje'}
              </Boton>
            </div>
          </form>
        </main>
      </div>

      {/* Modal BuscadorFotos */}
      <BuscadorFotos
        abierto={buscadorAbierto}
        slugsYaAgregados={items.map((it) => it.slugFoto)}
        alCerrar={() => setBuscadorAbierto(false)}
        alSeleccionar={handleSeleccionarFotoBuscador}
      />
    </div>
  )
}

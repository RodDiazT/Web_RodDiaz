'use client'

/**
 * Tarjeta individual de obra seleccionada en el formulario de consulta (§3.3).
 */

import React from 'react'
import Link from 'next/link'
import styles from './ItemConsulta.module.css'
import { Campo } from '@/componentes/base/Campo'
import { Boton } from '@/componentes/base/Boton'

export interface FormatoDisponible {
  id: string
  nombre: string
  papeles: Array<{
    id: string
    nombre: string
    descripcion?: string
  }>
}

export interface ItemConsultaDatos {
  foto: string | number
  slugFoto: string
  tituloFoto: string
  miniaturaUrl?: string
  formatosDisponibles?: FormatoDisponible[]
  formatoSeleccionado?: string | null
  papelSeleccionado?: string | null
  nombreFormatoSnapshot?: string
  nombrePapelSnapshot?: string
}

interface ItemConsultaProps {
  item: ItemConsultaDatos
  indice: number
  formularioConDatos: boolean
  alCambiarFormato: (formatoId: string | null, snapshot?: string) => void
  alCambiarPapel: (papelId: string | null, snapshot?: string) => void
  alQuitar: () => void
}

export function ItemConsulta({
  item,
  indice,
  formularioConDatos,
  alCambiarFormato,
  alCambiarPapel,
  alQuitar,
}: ItemConsultaProps) {
  const formatos = item.formatosDisponibles || []
  const esFormatoUnico = formatos.length === 1
  const formatoActual = formatos.find((f) => String(f.id) === String(item.formatoSeleccionado)) || (esFormatoUnico ? formatos[0] : null)

  const papeles = formatoActual ? formatoActual.papeles : []
  const esPapelUnico = papeles.length === 1
  const papelActual = papeles.find((p) => String(p.id) === String(item.papelSeleccionado)) || (esPapelUnico ? papeles[0] : null)

  return (
    <li className={styles.tarjetaItem}>
      {/* Miniatura de 480px a 72px de alto sin recortes (§3.3) */}
      <div className={styles.miniaturaContenedor}>
        {item.miniaturaUrl ? (
          <img
            src={item.miniaturaUrl}
            alt=""
            className={styles.miniaturaImg}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-linea)' }} />
        )}
      </div>

      <div className={styles.cuerpoItem}>
        <div className={styles.cabeceraItem}>
          <Link
            href={`/fotos/${item.slugFoto}`}
            className={styles.tituloEnlace}
            target={formularioConDatos ? '_blank' : undefined}
            rel={formularioConDatos ? 'noopener noreferrer' : undefined}
            title={item.tituloFoto}
          >
            {item.tituloFoto}
          </Link>

          <Boton
            variante="enlace"
            onClick={alQuitar}
            aria-label={`Quitar ${item.tituloFoto}`}
            style={{ fontSize: 'var(--texto-xs)', color: 'var(--color-texto-secundario)', padding: 0 }}
          >
            Quitar
          </Boton>
        </div>

        {/* Formato y Papel */}
        <div className={styles.selectoresContenedor}>
          {esFormatoUnico ? (
            <div className={styles.textoInformativo}>
              Copia de {formatos[0].nombre}
            </div>
          ) : formatos.length > 1 ? (
            <Campo
              tipo="seleccion"
              etiqueta="Tamaño (opcional)"
              id={`formato-item-${indice}`}
              name={`items[${indice}][formato]`}
              valor={item.formatoSeleccionado || ''}
              alCambiar={(e) => {
                const val = e.target.value || null
                const doc = formatos.find((f) => String(f.id) === val)
                alCambiarFormato(val, doc?.nombre)
              }}
              opciones={[
                { label: 'Aún no lo sé', value: '' },
                ...formatos.map((f) => ({ label: f.nombre, value: String(f.id) })),
              ]}
            />
          ) : null}

          {/* Selector de Papel según formato seleccionado */}
          {formatoActual && (
            <>
              {esPapelUnico ? (
                <div className={styles.textoInformativo}>
                  Papel: {papeles[0].nombre}
                </div>
              ) : papeles.length > 1 ? (
                <Campo
                  tipo="seleccion"
                  etiqueta="Papel (opcional)"
                  id={`papel-item-${indice}`}
                  name={`items[${indice}][papel]`}
                  valor={item.papelSeleccionado || ''}
                  alCambiar={(e) => {
                    const val = e.target.value || null
                    const doc = papeles.find((p) => String(p.id) === val)
                    alCambiarPapel(val, doc?.nombre)
                  }}
                  opciones={[
                    { label: 'Me ayudas a elegir', value: '' },
                    ...papeles.map((p) => ({
                      label: p.descripcion ? `${p.nombre} (${p.descripcion})` : p.nombre,
                      value: String(p.id),
                    })),
                  ]}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </li>
  )
}

'use client'

/**
 * Lista accesible de obras seleccionadas en el formulario de consulta (§3.3, §3.9).
 */

import React, { useState } from 'react'
import { ItemConsulta, ItemConsultaDatos } from './ItemConsulta'
import { Boton } from '@/componentes/base/Boton'

interface ItemsConsultaProps {
  items: ItemConsultaDatos[]
  formularioConDatos: boolean
  alCambiarFormato: (indice: number, formatoId: string | null, snapshot?: string) => void
  alCambiarPapel: (indice: number, papelId: string | null, snapshot?: string) => void
  alQuitarItem: (indice: number) => void
  alAbrirBuscador: () => void
}

export function ItemsConsulta({
  items,
  formularioConDatos,
  alCambiarFormato,
  alCambiarPapel,
  alQuitarItem,
  alAbrirBuscador,
}: ItemsConsultaProps) {
  const [mensajeAnuncio, setMensajeAnuncio] = useState('')

  const manejarQuitar = (indice: number) => {
    const item = items[indice]
    if (item) {
      setMensajeAnuncio(`Quitaste ${item.tituloFoto}`)
    }
    alQuitarItem(indice)
  }

  const puedeAgregarMas = items.length < 5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
      {/* Región aria-live para anuncios de lectores de pantalla al quitar (§3.9) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {mensajeAnuncio}
      </div>

      {items.length > 0 && (
        <ul
          aria-label="Fotos de tu consulta"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--esp-3)',
          }}
        >
          {items.map((item, idx) => (
            <ItemConsulta
              key={`${item.slugFoto}-${idx}`}
              item={item}
              indice={idx}
              formularioConDatos={formularioConDatos}
              alCambiarFormato={(formatoId, snapshot) => alCambiarFormato(idx, formatoId, snapshot)}
              alCambiarPapel={(papelId, snapshot) => alCambiarPapel(idx, papelId, snapshot)}
              alQuitar={() => manejarQuitar(idx)}
            />
          ))}
        </ul>
      )}

      {/* Botón "Agregar otra foto", oculto al llegar a 5 (§3.2, §3.4) */}
      {puedeAgregarMas && (
        <div>
          <Boton
            id="boton-agregar-otra-foto"
            variante="secundario"
            onClick={alAbrirBuscador}
            style={{ width: '100%' }}
          >
            {items.length === 0 ? 'Agregar una foto' : 'Agregar otra foto'}
          </Boton>
        </div>
      )}
    </div>
  )
}

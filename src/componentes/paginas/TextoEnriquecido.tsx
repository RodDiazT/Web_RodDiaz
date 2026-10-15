import React from 'react'
import Link from 'next/link'
import styles from './TextoEnriquecido.module.css'
import { CorreoProtegido } from './CorreoProtegido'
import { generarSlug } from '@/lib/slug'

interface TextoEnriquecidoProps {
  contenido: any
  correoContacto?: string
  className?: string
}

/**
 * Renderiza de forma segura la estructura de nodos Lexical de Payload 3.
 * Transforma marcadores {correo} en componentes CorreoProtegido (§5.2.6)
 * y asigna identificadores anclables a los encabezados h2 (§3.3).
 */
export function TextoEnriquecido({
  contenido,
  correoContacto = 'rodrigodiaztapia@gmail.com',
  className,
}: TextoEnriquecidoProps) {
  if (!contenido) return null

  const root = contenido.root || contenido

  return (
    <div className={`${styles.contenido} ${className || ''}`}>
      {renderizarNodos(root.children || [], correoContacto)}
    </div>
  )
}

function renderizarNodos(nodos: any[], correoContacto: string): React.ReactNode {
  if (!Array.isArray(nodos)) return null

  return nodos.map((nodo, idx) => {
    return renderizarNodo(nodo, idx, correoContacto)
  })
}

function extraerTextoPlano(nodo: any): string {
  if (!nodo) return ''
  if (nodo.type === 'text') return nodo.text || ''
  if (Array.isArray(nodo.children)) {
    return nodo.children.map(extraerTextoPlano).join('')
  }
  return ''
}

function renderizarNodo(nodo: any, key: number | string, correoContacto: string): React.ReactNode {
  if (!nodo) return null

  switch (nodo.type) {
    case 'paragraph': {
      // Párrafo vacío
      if (!nodo.children || nodo.children.length === 0) {
        return <p key={key} className={styles.parrafo}>&nbsp;</p>
      }
      return (
        <p key={key} className={styles.parrafo}>
          {renderizarNodos(nodo.children, correoContacto)}
        </p>
      )
    }

    case 'heading': {
      const textoPlano = extraerTextoPlano(nodo)
      const tag = nodo.tag || 'h2'

      if (tag === 'h2') {
        const id = generarSlug(textoPlano) || `seccion-${key}`
        return (
          <h2 key={key} id={id} className={styles.h2}>
            {renderizarNodos(nodo.children, correoContacto)}
          </h2>
        )
      }

      if (tag === 'h3') {
        return (
          <h3 key={key} className={styles.h3}>
            {renderizarNodos(nodo.children, correoContacto)}
          </h3>
        )
      }

      return (
        <h4 key={key} className={styles.h4}>
          {renderizarNodos(nodo.children, correoContacto)}
        </h4>
      )
    }

    case 'list': {
      const esOrdenada = nodo.listType === 'number'
      const Componente = esOrdenada ? 'ol' : 'ul'
      const claseLista = esOrdenada ? styles.listaOrdenada : styles.lista
      return (
        <Componente key={key} className={claseLista}>
          {renderizarNodos(nodo.children, correoContacto)}
        </Componente>
      )
    }

    case 'listitem': {
      return (
        <li key={key} className={styles.itemLista}>
          {renderizarNodos(nodo.children, correoContacto)}
        </li>
      )
    }

    case 'quote': {
      return (
        <blockquote key={key} className={styles.cita}>
          {renderizarNodos(nodo.children, correoContacto)}
        </blockquote>
      )
    }

    case 'link': {
      const url = nodo.fields?.url || nodo.url || '#'
      const esExterno = url.startsWith('http://') || url.startsWith('https://')
      const newTab = Boolean(nodo.fields?.newTab)

      if (esExterno) {
        const esRedSocial = url.includes('instagram.com')
        const rel = esRedSocial ? 'me noopener noreferrer' : 'noopener noreferrer'
        return (
          <a
            key={key}
            href={url}
            target={newTab ? '_blank' : undefined}
            rel={rel}
            className={styles.enlace}
          >
            {renderizarNodos(nodo.children, correoContacto)}
          </a>
        )
      }

      return (
        <Link key={key} href={url} className={styles.enlace}>
          {renderizarNodos(nodo.children, correoContacto)}
        </Link>
      )
    }

    case 'text': {
      const texto = nodo.text || ''
      const format = nodo.format || 0

      // Reemplazo del marcador {correo} por CorreoProtegido (§5.2.6)
      let contenidoTexto: React.ReactNode = texto
      if (texto.includes('{correo}')) {
        const partes = texto.split('{correo}')
        const fragmentos: React.ReactNode[] = []
        partes.forEach((parte: string, pIdx: number) => {
          if (pIdx > 0) {
            fragmentos.push(<CorreoProtegido key={`correo-${pIdx}`} correo={correoContacto} />)
          }
          if (parte) {
            fragmentos.push(parte)
          }
        })
        contenidoTexto = <>{fragmentos}</>
      }

      // Bitmask format en Lexical: 1=Bold, 2=Italic, 4=Strikethrough, 8=Underline, 16=Code
      if (format & 16) {
        contenidoTexto = <code className={styles.codigo}>{contenidoTexto}</code>
      }
      if (format & 1) {
        contenidoTexto = <strong>{contenidoTexto}</strong>
      }
      if (format & 2) {
        contenidoTexto = <em>{contenidoTexto}</em>
      }
      if (format & 4) {
        contenidoTexto = <s>{contenidoTexto}</s>
      }
      if (format & 8) {
        contenidoTexto = <u>{contenidoTexto}</u>
      }

      return <React.Fragment key={key}>{contenidoTexto}</React.Fragment>
    }

    default: {
      if (Array.isArray(nodo.children)) {
        return <React.Fragment key={key}>{renderizarNodos(nodo.children, correoContacto)}</React.Fragment>
      }
      return null
    }
  }
}

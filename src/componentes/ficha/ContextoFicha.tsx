'use client'

/**
 * Componente cliente para resolver el contexto dinámico de navegación en la ficha de foto,
 * gestionar teclado (← →), el enlace Retorno y la apertura diferida del Visor.
 * Especificado en DocumentosTecnicos/portafolio/ficha-foto.md (§3.5, §3.6, §5.2.2, §5.4).
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Retorno } from '@/componentes/base/Retorno'
import { NavegacionFotos, ItemNavegacionFoto } from '@/componentes/base/NavegacionFotos'
import { Boton } from '@/componentes/base/Boton'
import { usarEleccionCopia } from './EleccionCopia'
import { FotoMarco } from '@/componentes/base/MarcoFoto'

// Carga diferida del Visor a pantalla completa solo al abrirlo (§5.4)
const Visor = dynamic(
  () => import('@/componentes/base/Visor').then((mod) => mod.Visor),
  { ssr: false }
)

interface ContextoFichaProps {
  fotoSlug: string
  fotoActual: FotoMarco
  retornoPorDefecto: { etiqueta: string; href: string }
  navegacionPorDefecto: {
    anterior: ItemNavegacionFoto | null
    siguiente: ItemNavegacionFoto | null
  }
  ofreceCopia: boolean
  textoLlamadaCopia?: string
  children: (props: {
    alAbrirVisor: () => void
    retornoElemento: React.ReactNode
    navegacionElemento: React.ReactNode
  }) => React.ReactNode
}

export function ContextoFicha({
  fotoSlug,
  fotoActual,
  retornoPorDefecto,
  navegacionPorDefecto,
  ofreceCopia,
  textoLlamadaCopia = 'Pedir una copia',
  children,
}: ContextoFichaProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const coleccionParam = searchParams.get('coleccion')
  const caracteristicaParam = searchParams.get('caracteristica')

  const [retorno, setRetorno] = useState(retornoPorDefecto)
  const [navegacion, setNavegacion] = useState(navegacionPorDefecto)
  const [fotosVisor, setFotosVisor] = useState<FotoMarco[]>([fotoActual])
  const [indiceVisor, setIndiceVisor] = useState(0)
  const [visorAbierto, setVisorAbierto] = useState(false)

  const { hrefVisor } = usarEleccionCopia()

  // Consultar contexto dinámico si hay parámetros de URL (§5.2.2)
  useEffect(() => {
    if (!coleccionParam && !caracteristicaParam) {
      setRetorno(retornoPorDefecto)
      setNavegacion(navegacionPorDefecto)
      setFotosVisor([fotoActual])
      return
    }

    const abortController = new AbortController()

    const params = new URLSearchParams({ foto: fotoSlug })
    if (coleccionParam) params.set('coleccion', coleccionParam)
    if (caracteristicaParam) params.set('caracteristica', caracteristicaParam)

    fetch(`/datos/contexto?${params.toString()}`, { signal: abortController.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((datos) => {
        if (!datos) return

        if (datos.contexto?.retorno) {
          setRetorno(datos.contexto.retorno)
        }

        setNavegacion({
          anterior: datos.anterior,
          siguiente: datos.siguiente,
        })

        if (Array.isArray(datos.fotos) && datos.fotos.length > 0) {
          setFotosVisor(datos.fotos)
          setIndiceVisor(datos.indice >= 0 ? datos.indice : 0)
        }
      })
      .catch(() => {
        // En caso de error de red, se mantiene el contexto por defecto
      })

    return () => abortController.abort()
  }, [fotoSlug, coleccionParam, caracteristicaParam, retornoPorDefecto, navegacionPorDefecto, fotoActual])

  // Navegación por teclado en la página fuera del visor (← →) (§3.5)
  useEffect(() => {
    if (visorAbierto) return

    const manejarTeclas = (e: KeyboardEvent) => {
      // Ignorar si el foco está en un campo, radio o diálogo
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      if (e.key === 'ArrowLeft' && navegacion.anterior) {
        e.preventDefault()
        router.push(navegacion.anterior.href)
      } else if (e.key === 'ArrowRight' && navegacion.siguiente) {
        e.preventDefault()
        router.push(navegacion.siguiente.href)
      }
    }

    window.addEventListener('keydown', manejarTeclas)
    return () => window.removeEventListener('keydown', manejarTeclas)
  }, [visorAbierto, navegacion, router])

  const abrirVisor = useCallback(() => {
    // Si la lista aún no tiene más fotos y no se ha consultado contexto, pedir /datos/contexto
    if (fotosVisor.length <= 1) {
      const params = new URLSearchParams({ foto: fotoSlug })
      if (coleccionParam) params.set('coleccion', coleccionParam)
      if (caracteristicaParam) params.set('caracteristica', caracteristicaParam)

      fetch(`/datos/contexto?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((datos) => {
          if (datos && Array.isArray(datos.fotos)) {
            setFotosVisor(datos.fotos)
            setIndiceVisor(datos.indice >= 0 ? datos.indice : 0)
          }
        })
        .catch(() => {})
    }

    setVisorAbierto(true)
  }, [fotoSlug, coleccionParam, caracteristicaParam, fotosVisor.length])

  // Retorno accesible con soporte de history.back() si el referrer coincide (§3.5)
  const retornoElemento = (
    <Retorno etiqueta={retorno.etiqueta} href={retorno.href} />
  )

  const navegacionElemento = (
    <NavegacionFotos
      anterior={navegacion.anterior || undefined}
      siguiente={navegacion.siguiente || undefined}
    />
  )

  // CTA del visor dinámico según la foto activa en el carrusel (§3.6)
  const fotoEnVisor = fotosVisor[indiceVisor] || fotoActual
  const esFotoActual = !fotoEnVisor.slug || fotoEnVisor.slug === fotoSlug
  const ofreceCopiaEnVisor = esFotoActual ? ofreceCopia : Boolean(fotoEnVisor.ofreceCopia)
  const hrefVisorActual = esFotoActual || !fotoEnVisor.slug
    ? hrefVisor
    : `/consulta?foto=${encodeURIComponent(fotoEnVisor.slug)}&origen=visor`

  const accionVisor = ofreceCopiaEnVisor ? (
    <Boton variante="primario" href={hrefVisorActual}>
      {textoLlamadaCopia}
    </Boton>
  ) : undefined

  return (
    <>
      {children({
        alAbrirVisor: abrirVisor,
        retornoElemento,
        navegacionElemento,
      })}

      {visorAbierto && (
        <Visor
          fotos={fotosVisor}
          indiceInicial={indiceVisor}
          abierto={visorAbierto}
          alCerrar={() => setVisorAbierto(false)}
          alCambiar={(nuevoIndice) => setIndiceVisor(nuevoIndice)}
          accion={accionVisor}
        />
      )}
    </>
  )
}

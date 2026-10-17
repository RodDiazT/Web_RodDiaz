import React from 'react'
import type { Metadata } from 'next'
import crypto from 'crypto'
import { fotoPorSlug, ajustes, formatosOfrecidos } from '@/lib/contenido'
import { firmarEmision } from '@/lib/consultas'
import { FormularioConsulta } from '@/componentes/consulta/FormularioConsulta'
import { ItemConsultaDatos } from '@/componentes/consulta/ItemConsulta'
import { orientarFormato } from '@/lib/ficha'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const configGlobal = await ajustes()
  const nombreSitio = configGlobal?.nombreSitio?.trim() || 'Rod Díaz'
  return {
    title: `Consulta · ${nombreSitio}`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

interface PaginaConsultaProps {
  searchParams: Promise<{
    foto?: string
    formato?: string
    origen?: 'ficha' | 'visor' | 'general' | 'licencia'
  }>
}

export default async function PaginaConsulta({ searchParams }: PaginaConsultaProps) {
  const { foto: fotoSlug, formato: formatoParam, origen = 'general' } = await searchParams

  const configGlobal = await ajustes()

  const textoIntroConsulta =
    configGlobal?.textoIntroConsulta ||
    'Cuéntame cómo contactarte y te respondo con los detalles y el valor de la copia.'
  const textoConsultaRecibida =
    configGlobal?.textoConsultaRecibida ||
    'Te respondo a {correo} en los próximos días. Si no ves mi respuesta, revisa la carpeta de spam.'
  const textoConsentimiento =
    configGlobal?.textoConsentimiento ||
    'Acepto la {politica} y que Rod Díaz me contacte por correo, teléfono u otro medio que indiqué, para responder esta consulta.'
  const textoPromociones =
    configGlobal?.textoPromociones ||
    'Quiero recibir novedades y promociones de Rod Díaz (fotos nuevas, ofertas de copias). Puedo darme de baja cuando quiera.'
  const correoContacto = configGlobal?.correoContacto || 'rodrigodiaztapia@gmail.com'

  let avisoInformativo: string | null = null
  let itemsIniciales: ItemConsultaDatos[] = []
  let fotoOrigen: { titulo: string; slug: string } | null = null
  let retorno = { etiqueta: 'Volver', href: '/' }

  if (fotoSlug) {
    const resFoto = await fotoPorSlug(fotoSlug)

    if (!resFoto || resFoto.tipo !== 'exito' || !resFoto.foto) {
      // Caso borde: foto despublicada, eliminada o inexistente (§4)
      avisoInformativo = 'Esa foto ya no está disponible. Puedes elegir otra o escribirme igual.'
    } else {
      const fotoDoc = resFoto.foto
      const orientacion = fotoDoc.proporcion?.orientacion || 'horizontal'
      const formatosCrudos = Array.isArray(fotoDoc.formatos) ? fotoDoc.formatos : []

      const formatosOrientados = formatosCrudos
        .map((f: any) => (typeof f === 'object' ? orientarFormato(f, orientacion) : null))
        .filter((f: any) => f && f.activo !== false && f.papeles && f.papeles.length > 0)

      if (formatosOrientados.length === 0) {
        // Caso borde: foto de vitrina (§4)
        avisoInformativo = 'Esa foto no está disponible como copia.'
      } else {
        fotoOrigen = { titulo: fotoDoc.titulo, slug: fotoDoc.slug }
        retorno = { etiqueta: `Volver a ${fotoDoc.titulo}`, href: `/fotos/${fotoDoc.slug}` }

        // Validar formato solicitado en URL (§4, §5.2.1)
        let formatoElegidoId: string | null = null
        let formatoDocElegido: any = null

        if (formatoParam) {
          formatoDocElegido = formatosOrientados.find((f: any) => String(f.id) === String(formatoParam))
          if (formatoDocElegido) {
            formatoElegidoId = String(formatoDocElegido.id)
          }
        }

        // Si la foto tiene un único formato disponible, seleccionarlo automáticamente
        if (!formatoElegidoId && formatosOrientados.length === 1) {
          formatoDocElegido = formatosOrientados[0]
          formatoElegidoId = String(formatoDocElegido.id)
        }

        const papelesElegidos = formatoDocElegido ? formatoDocElegido.papeles : []
        const papelUnico = papelesElegidos.length === 1 ? papelesElegidos[0] : null

        const sizes = fotoDoc.sizes || {}

        itemsIniciales.push({
          foto: fotoDoc.slug,
          slugFoto: fotoDoc.slug,
          tituloFoto: fotoDoc.titulo,
          miniaturaUrl: sizes.pequena_webp?.url || fotoDoc.url,
          formatosDisponibles: formatosOrientados.map((f: any) => ({
            id: String(f.id),
            nombre: f.etiquetaDimensiones,
            papeles: f.papeles.map((p: any) => ({
              id: String(typeof p === 'object' ? p.id : p),
              nombre: typeof p === 'object' ? p.nombre : 'Papel Fine Art',
              descripcion: typeof p === 'object' ? p.descripcion || undefined : undefined,
            })),
          })),
          formatoSeleccionado: formatoElegidoId,
          nombreFormatoSnapshot: formatoDocElegido?.etiquetaDimensiones,
          papelSeleccionado: papelUnico ? String(papelUnico.id) : null,
          nombrePapelSnapshot: papelUnico ? papelUnico.nombre : undefined,
        })
      }
    }
  }

  // Tokens de sesión e idempotencia para antispam (§5.1, §5.2.4, §5.2.5)
  const emitidoEn = Date.now()
  const firma = firmarEmision(emitidoEn)
  const claveEnvio = crypto.randomUUID()

  return (
    <FormularioConsulta
      itemsIniciales={itemsIniciales}
      fotoOrigen={fotoOrigen}
      origen={origen}
      textoIntroConsulta={textoIntroConsulta}
      textoConsultaRecibida={textoConsultaRecibida}
      textoConsentimiento={textoConsentimiento}
      textoPromociones={textoPromociones}
      correoContacto={correoContacto}
      claveEnvioInicial={claveEnvio}
      emitidoEnInicial={emitidoEn}
      firmaInicial={firma}
      avisoInformativo={avisoInformativo}
      retorno={retorno}
    />
  )
}

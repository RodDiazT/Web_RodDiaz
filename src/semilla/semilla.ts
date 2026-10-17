/**
 * Semilla de inicialización de datos para Web_RodDiaz (Etapa 2).
 * Crea el catálogo inicial Fine Art, las cuatro páginas reservadas y los ajustes del sitio.
 * Especificado en DocumentosTecnicos/contenido/modelo-contenido-panel.md (§5.4 y §8, Paso 10).
 */

import { getPayload, type BasePayload } from 'payload'
import config from '../payload.config'
import {
  contenidoSobreMi,
  contenidoContacto,
  contenidoPrivacidad,
  contenidoCondiciones,
} from './paginas'

export function crearParrafoLexical(texto: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          children: [
            {
              mode: 'normal' as const,
              text: texto,
              type: 'text',
              style: '',
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

export async function sembrarDatos(payloadInstance?: BasePayload) {
  const payload = payloadInstance || (await getPayload({ config }))
  console.log('[Semilla] Iniciando carga de datos iniciales...')

  // 1. Ajustes del sitio
  await payload.updateGlobal({
    slug: 'ajustes-sitio',
    data: {
      nombreSitio: 'Rod Díaz',
      descripcion:
        'Portafolio fotográfico Fine Art con impresión artesanal en taller propio sobre papeles de algodón y baritados.',
      correoContacto: 'rodrigodiaztapia@gmail.com',
      textoLlamadaCopia: 'Pedir una copia',
      textoDerechos: 'Todos los derechos reservados',
      redes: [
        {
          red: 'instagram',
          url: 'https://instagram.com/roddiazt',
        },
      ],
      textoIntroConsulta:
        'Cada copia se imprime artesanalmente en taller sobre papeles Fine Art 100% algodón o baritados con tintas minerales de conservación. Deja tus datos y te responderé a la brevedad con la disponibilidad y detalles.',
      textoConsultaRecibida:
        'Gracias por tu interés en mi obra. He recibido tu consulta y te responderé directamente a tu correo.',
      textoConsentimiento:
        'Acepto ser contactado por los medios indicados para responder a esta consulta, conforme a la política de privacidad.',
      textoPromociones:
        'Deseo recibir ocasionalmente novedades de nuevas expediciones y ediciones.',
      seo: {
        tituloPortada: 'Rod Díaz — Fotografía Fine Art',
      },
    },
  })
  console.log('[Semilla] Ajustes del sitio configurados.')

  // 2. Catálogo de papeles Fine Art (T-006)
  const papelesConfig = [
    {
      nombre: 'Hahnemühle Photo Rag 308',
      fabricante: 'Hahnemühle',
      base: 'algodon' as const,
      acabado: 'mate_liso' as const,
      gramajeGsm: 308,
      libreDeAcido: true,
      descripcion:
        '100% algodón, superficie suave y tacto afelpado característico. Tonos profundos y negros intensos.',
      activo: true,
    },
    {
      nombre: 'Canson Infinity Platine Fibre Rag 310',
      fabricante: 'Canson Infinity',
      base: 'baritado' as const,
      acabado: 'satinado_lustre' as const,
      gramajeGsm: 310,
      libreDeAcido: true,
      descripcion:
        'Papel baritado 100% algodón sin blanqueadores ópticos. Rendimiento excepcional para blanco y negro y color.',
      activo: true,
    },
    {
      nombre: 'Hahnemühle German Etching 310',
      fabricante: 'Hahnemühle',
      base: 'algodon' as const,
      acabado: 'mate_texturado' as const,
      gramajeGsm: 310,
      libreDeAcido: true,
      descripcion:
        'Textura sutil de grabado tradicional en cobre que aporta volumen y profundidad pictórica.',
      activo: true,
    },
  ]

  const papelesCreados: Record<string, number> = {}

  for (const p of papelesConfig) {
    const existente = await payload.find({
      collection: 'tipos-papel',
      where: { nombre: { equals: p.nombre } },
      limit: 1,
    })

    if (existente.totalDocs === 0) {
      const doc = await payload.create({
        collection: 'tipos-papel',
        data: p,
      })
      papelesCreados[p.nombre] = doc.id
      console.log(`[Semilla] Papel creado: ${p.nombre}`)
    } else {
      papelesCreados[p.nombre] = existente.docs[0].id
    }
  }

  // 3. Catálogo de formatos de impresión (T-006)
  const formatosConfig = [
    {
      nombre: '30 × 45 cm',
      ladoCortoCm: 30,
      ladoLargoCm: 45,
      margenMinimoCm: 2.0,
      activo: true,
      orden: 1,
      papeles: [papelesCreados['Hahnemühle Photo Rag 308'], papelesCreados['Canson Infinity Platine Fibre Rag 310']].filter(Boolean),
    },
    {
      nombre: '40 × 60 cm',
      ladoCortoCm: 40,
      ladoLargoCm: 60,
      margenMinimoCm: 2.5,
      activo: true,
      orden: 2,
      papeles: [
        papelesCreados['Hahnemühle Photo Rag 308'],
        papelesCreados['Canson Infinity Platine Fibre Rag 310'],
        papelesCreados['Hahnemühle German Etching 310'],
      ].filter(Boolean),
    },
    {
      nombre: '50 × 75 cm',
      ladoCortoCm: 50,
      ladoLargoCm: 75,
      margenMinimoCm: 3.0,
      activo: true,
      orden: 3,
      papeles: [papelesCreados['Hahnemühle Photo Rag 308'], papelesCreados['Canson Infinity Platine Fibre Rag 310']].filter(Boolean),
    },
  ]

  for (const f of formatosConfig) {
    const existente = await payload.find({
      collection: 'formatos-impresion',
      where: { nombre: { equals: f.nombre } },
      limit: 1,
    })

    if (existente.totalDocs === 0) {
      await payload.create({
        collection: 'formatos-impresion',
        data: f,
      })
      console.log(`[Semilla] Formato creado: ${f.nombre}`)
    }
  }

  // 4. Las cuatro páginas reservadas obligatorias (§5.2.9, Anexos A y B)
  const paginasReservadas = [
    {
      titulo: 'Sobre mí',
      slug: 'sobre-mi',
      estado: 'borrador' as const,
      contenido: contenidoSobreMi(),
    },
    {
      titulo: 'Contacto',
      slug: 'contacto',
      estado: 'borrador' as const,
      contenido: contenidoContacto(),
    },
    {
      titulo: 'Política de privacidad',
      slug: 'privacidad',
      estado: 'borrador' as const,
      contenido: contenidoPrivacidad(),
    },
    {
      titulo: 'Condiciones de uso',
      slug: 'condiciones',
      estado: 'borrador' as const,
      contenido: contenidoCondiciones(),
    },
  ]

  for (const pag of paginasReservadas) {
    const existente = await payload.find({
      collection: 'paginas',
      where: { slug: { equals: pag.slug } },
      limit: 1,
    })

    if (existente.totalDocs === 0) {
      await payload.create({
        collection: 'paginas',
        data: pag,
      })
      console.log(`[Semilla] Página reservada creada: ${pag.slug}`)
    }
  }

  console.log('[Semilla] Carga de datos iniciales completada exitosamente.')
}

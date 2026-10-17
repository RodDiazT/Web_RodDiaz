import type { CollectionConfig } from 'payload'
import { generarSlug, actualizarSlugsAnteriores } from '../lib/slug'
import { revalidarRutasSeguras } from '../lib/revalidacion'
import { esRutaReservada, esPaginaReservada, SLUGS_RESERVADOS_PAGINAS } from '../lib/rutasReservadas'

export const SLUGS_RESERVADOS = SLUGS_RESERVADOS_PAGINAS

export const Pagina: CollectionConfig = {
  slug: 'paginas',
  labels: {
    singular: 'Página',
    plural: 'Páginas',
  },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'slug', 'estado', 'contenidoActualizadoEn'],
    group: 'Sitio',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        estado: {
          equals: 'publicada',
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      async ({ req, data, originalDoc }) => {
        if (!data) return data

        const slugOriginal = originalDoc?.slug
        const esReservadaOriginal = slugOriginal && esPaginaReservada(slugOriginal)

        // Si es una página reservada, su slug nunca puede modificarse
        if (esReservadaOriginal) {
          data.slug = slugOriginal
        } else if (!data.slug && data.titulo) {
          data.slug = generarSlug(data.titulo)
        } else if (data.slug) {
          data.slug = generarSlug(data.slug)
        }

        // Validación: una página libre no puede colisionar con rutas del sitio (§4, §5.1)
        if (!esReservadaOriginal && data.slug && esRutaReservada(data.slug)) {
          if (!originalDoc && esPaginaReservada(data.slug)) {
            const yaExiste = await req.payload.find({
              collection: 'paginas',
              where: { slug: { equals: data.slug } },
              limit: 1,
              overrideAccess: true,
            })
            if (yaExiste.totalDocs > 0) {
              throw new Error('Ese nombre ya lo usa el sitio. Elige otro.')
            }
          } else {
            throw new Error('Ese nombre ya lo usa el sitio. Elige otro.')
          }
        }

        // Validación: publicar exige título y contenido (§5.2.2)
        if (data.estado === 'publicada') {
          if (!data.titulo || !String(data.titulo).trim()) {
            throw new Error('Para publicar la página debes ingresar un título.')
          }
          if (!data.contenido) {
            throw new Error('Para publicar la página debes ingresar contenido.')
          }
        }

        // Si una página libre cambia de slug, registrar en slugsAnteriores
        if (!esReservadaOriginal && originalDoc && originalDoc.slug && data.slug && originalDoc.slug !== data.slug) {
          data.slugsAnteriores = actualizarSlugsAnteriores(
            data.slug,
            originalDoc.slug,
            originalDoc.slugsAnteriores as string[]
          )
        }

        // Reglas específicas de privacidad (Ley 21.719 y paginas.md)
        if (data.slug === 'privacidad') {
          if (data.estado === 'publicada') {
            const ajustes = await req.payload.findGlobal({ slug: 'ajustes-sitio' })
            if (!ajustes?.correoContacto) {
              throw new Error(
                'La política de privacidad no se puede publicar sin definir un correo de contacto en Ajustes del sitio.'
              )
            }
          }
          if (originalDoc?.estado === 'publicada' && data.estado === 'borrador') {
            throw new Error('La política de privacidad debe estar visible mientras el formulario reciba consultas.')
          }
        }

        // Actualizar fecha de contenido si cambió título o contenido
        const cambioTexto =
          (data.titulo && data.titulo !== originalDoc?.titulo) ||
          (data.contenido && JSON.stringify(data.contenido) !== JSON.stringify(originalDoc?.contenido))

        if (cambioTexto || !originalDoc?.contenidoActualizadoEn) {
          data.contenidoActualizadoEn = new Date().toISOString()
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({ collection: 'paginas', id })
        if (doc && SLUGS_RESERVADOS.includes(doc.slug as any)) {
          throw new Error('Esta página es parte del sitio y no se puede borrar. Puedes dejarla en borrador.')
        }
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        const rutas = ['/', '/sitemap.xml']
        if (doc?.slug) rutas.push(`/${doc.slug}`)
        if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
          rutas.push(`/${previousDoc.slug}`)
        }
        revalidarRutasSeguras(rutas, ['paginas'])
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const rutas = ['/', '/sitemap.xml']
        if (doc?.slug) rutas.push(`/${doc.slug}`)
        revalidarRutasSeguras(rutas, ['paginas'])
      },
    ],
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      required: true,
      label: 'Título de la página',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Ruta / slug',
      admin: {
        description: 'Identificador URL. En páginas reservadas (sobre-mi, contacto, privacidad, condiciones) es fijo.',
      },
    },
    {
      name: 'reservada',
      type: 'checkbox',
      admin: {
        readOnly: true,
        description: 'Indica si es una página institucional reservada.',
      },
      hooks: {
        afterRead: [
          ({ data }) => {
            return Boolean(data?.slug && SLUGS_RESERVADOS.includes(data.slug as any))
          },
        ],
      },
    },
    {
      name: 'contenido',
      type: 'richText',
      required: true,
      label: 'Contenido editorial',
    },
    {
      name: 'imagen',
      type: 'relationship',
      relationTo: 'medios',
      filterOptions: {
        uso: {
          equals: 'pagina',
        },
      },
      label: 'Imagen destacada (ej. foto de perfil en Sobre mí)',
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'borrador',
      options: [
        { label: 'Borrador', value: 'borrador' },
        { label: 'Publicada', value: 'publicada' },
      ],
      label: 'Estado de publicación',
    },
    {
      name: 'contenidoActualizadoEn',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Fecha de la última modificación editorial de título o texto.',
      },
    },
    {
      name: 'slugsAnteriores',
      type: 'json',
      defaultValue: [],
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'descripcion',
          type: 'textarea',
          maxLength: 160,
          label: 'Descripción para buscadores (opcional)',
        },
      ],
    },
  ],
}

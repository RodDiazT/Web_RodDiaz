import type { CollectionConfig } from 'payload'
import { generarSlug, actualizarSlugsAnteriores } from '../lib/slug'
import { revalidarRutasSeguras } from '../lib/revalidacion'

export const Coleccion: CollectionConfig = {
  slug: 'colecciones',
  labels: {
    singular: 'Colección',
    plural: 'Colecciones',
  },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'slug', 'padre', 'estado', 'orden'],
    group: 'Obra',
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
      async ({ req, data, originalDoc, operation }) => {
        if (!data) return data

        // Generación y normalización de slug
        if (data.slug) {
          data.slug = generarSlug(data.slug)
        } else if (!originalDoc?.slug && data.nombre) {
          data.slug = generarSlug(data.nombre)
        }

        if (originalDoc && originalDoc.slug && data.slug && originalDoc.slug !== data.slug) {
          data.slugsAnteriores = actualizarSlugsAnteriores(
            data.slug,
            originalDoc.slug,
            originalDoc.slugsAnteriores as string[]
          )
        }

        // Validación de jerarquía estricta de dos niveles en servidor (modelo §4 y §5.2.9)
        const idActual = originalDoc?.id || (operation === 'update' ? data.id : null)
        const idPadre = typeof data.padre === 'object' && data.padre ? data.padre.id : data.padre

        if (idPadre) {
          // 1. No puede ser su propio padre
          if (idActual && String(idPadre) === String(idActual)) {
            throw new Error('Una colección no puede ser su propio padre.')
          }

          // 2. Si la colección actual ya tiene hijas, no puede asignarse un padre
          if (idActual) {
            const hijas = await req.payload.find({
              collection: 'colecciones',
              where: {
                padre: {
                  equals: idActual,
                },
              },
              limit: 1,
            })
            if (hijas.totalDocs > 0) {
              throw new Error(
                'Las colecciones admiten solo dos niveles. Una colección madre con sub-colecciones hijas no puede tener padre.'
              )
            }
          }

          // 3. El padre no puede tener a su vez otro padre (máximo 2 niveles)
          const docPadre = await req.payload.findByID({
            collection: 'colecciones',
            id: idPadre,
          })
          if (docPadre && docPadre.padre) {
            throw new Error(
              'Las colecciones admiten solo dos niveles. No se puede asignar como padre a una sub-colección que ya es hija.'
            )
          }
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Bloquear eliminación si tiene fotos o hijas asociadas (modelo §4)
        const fotosEnColeccion = await req.payload.find({
          collection: 'fotos',
          where: {
            coleccion: {
              equals: id,
            },
          },
          limit: 1,
        })

        const hijasEnColeccion = await req.payload.find({
          collection: 'colecciones',
          where: {
            padre: {
              equals: id,
            },
          },
          limit: 1,
        })

        if (fotosEnColeccion.totalDocs > 0 || hijasEnColeccion.totalDocs > 0) {
          throw new Error(
            `Tiene ${fotosEnColeccion.totalDocs} foto(s) y ${hijasEnColeccion.totalDocs} sub-colección(es). Muévelas a otra colección antes de borrarla.`
          )
        }
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        const rutas = ['/', '/fotos', '/colecciones', '/sitemap.xml']
        if (doc?.slug) rutas.push(`/colecciones/${doc.slug}`)
        if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
          rutas.push(`/colecciones/${previousDoc.slug}`)
        }
        revalidarRutasSeguras(rutas, ['colecciones'])
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const rutas = ['/', '/fotos', '/colecciones', '/sitemap.xml']
        if (doc?.slug) rutas.push(`/colecciones/${doc.slug}`)
        revalidarRutasSeguras(rutas, ['colecciones'])
      },
    ],
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
      maxLength: 80,
      label: 'Nombre de la colección',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Identificador URL (slug)',
    },
    {
      name: 'descripcion',
      type: 'textarea',
      maxLength: 300,
      label: 'Descripción breve de la colección (opcional)',
    },
    {
      name: 'padre',
      type: 'relationship',
      relationTo: 'colecciones',
      index: true,
      label: 'Colección madre (opcional, máximo 2 niveles)',
      admin: {
        description: 'Déjalo vacío si es una colección principal. Selecciona una madre si es una sub-colección hija.',
      },
    },
    {
      name: 'visibleSola',
      type: 'checkbox',
      defaultValue: true,
      label: 'Visible con página propia (solo hijas)',
      admin: {
        description:
          'Solo aplica si tiene colección madre. Si se desmarca, no tiene página propia y sus fotos se muestran agregadas en la madre y en Todas las fotos.',
      },
    },
    {
      name: 'orden',
      type: 'number',
      defaultValue: 0,
      label: 'Orden de presentación entre hermanas',
      admin: {
        description: 'Determina la posición en la grilla y en el listado de colecciones.',
      },
    },
    {
      name: 'portada',
      type: 'relationship',
      relationTo: 'fotos',
      label: 'Foto de portada de la colección',
      admin: {
        description:
          'En las tarjetas, la portada se ve recortada en formato vertical 4:5. Marca el punto focal en la foto para elegir el centro.',
      },
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'borrador',
      options: [
        { label: 'Borrador (oculta)', value: 'borrador' },
        { label: 'Publicada', value: 'publicada' },
      ],
      label: 'Estado de publicación',
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
      name: 'fotos',
      type: 'join',
      collection: 'fotos',
      on: 'coleccion',
      admin: {
        allowCreate: false,
        description: 'Fotos pertenecientes a esta colección.',
      },
    },
    {
      name: 'hijas',
      type: 'join',
      collection: 'colecciones',
      on: 'padre',
      admin: {
        allowCreate: false,
        description: 'Sub-colecciones hijas pertenecientes a esta colección madre.',
      },
    },
  ],
}

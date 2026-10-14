import type { CollectionConfig } from 'payload'
import { generarSlug, actualizarSlugsAnteriores } from '../lib/slug'

export const Caracteristica: CollectionConfig = {
  slug: 'caracteristicas',
  labels: {
    singular: 'Característica (etiqueta)',
    plural: 'Características (etiquetas)',
  },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'slug'],
    group: 'Obra',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (data) {
          if (!data.slug && data.nombre) {
            data.slug = generarSlug(data.nombre)
          } else if (data.slug) {
            data.slug = generarSlug(data.slug)
          }

          if (originalDoc && originalDoc.slug && data.slug && originalDoc.slug !== data.slug) {
            data.slugsAnteriores = actualizarSlugsAnteriores(
              data.slug,
              originalDoc.slug,
              originalDoc.slugsAnteriores as string[]
            )
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 40,
      label: 'Nombre de la característica',
      admin: {
        description: 'Etiqueta transversal para filtrar obras (ej. Blanco y negro, Paisaje, Nocturna, Araucanía).',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Identificador URL (slug)',
      admin: {
        description: 'Se genera automáticamente sin tildes ni caracteres especiales.',
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
  ],
}

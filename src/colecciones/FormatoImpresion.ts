import type { CollectionConfig } from 'payload'

export const FormatoImpresion: CollectionConfig = {
  slug: 'formatos-impresion',
  labels: {
    singular: 'Formato de impresión',
    plural: 'Formatos de impresión',
  },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'ladoCortoCm', 'ladoLargoCm', 'margenMinimoCm', 'activo', 'orden'],
    group: 'Catálogo de copias',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data) {
          // Asegura que ladoCortoCm sea menor o igual que ladoLargoCm
          if (data.ladoCortoCm && data.ladoLargoCm && data.ladoCortoCm > data.ladoLargoCm) {
            const temp = data.ladoCortoCm
            data.ladoCortoCm = data.ladoLargoCm
            data.ladoLargoCm = temp
          }

          // Si el nombre viene vacío, autogenerar con formato "X × Y cm"
          if (!data.nombre && data.ladoCortoCm && data.ladoLargoCm) {
            data.nombre = `${data.ladoCortoCm} × ${data.ladoLargoCm} cm`
          }
        }
        return data
      },
    ],
    beforeChange: [
      async ({ req, data, originalDoc, operation }) => {
        // Bloquear cambio de medidas si ya tiene fotos asociadas (modelo §4 y §5.1)
        if (operation === 'update' && originalDoc) {
          const cambioMedidas =
            (data.ladoCortoCm !== undefined && data.ladoCortoCm !== originalDoc.ladoCortoCm) ||
            (data.ladoLargoCm !== undefined && data.ladoLargoCm !== originalDoc.ladoLargoCm)

          if (cambioMedidas) {
            const fotosConFormato = await req.payload.find({
              collection: 'fotos',
              where: {
                formatos: {
                  contains: originalDoc.id,
                },
              },
              limit: 1,
            })

            if (fotosConFormato.totalDocs > 0) {
              throw new Error(
                `Este tamaño está asociado a ${fotosConFormato.totalDocs} foto(s). Para preservar la compatibilidad Fine Art, crea un nuevo formato y desactiva este.`
              )
            }
          }
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Bloquear eliminación si tiene fotos asociadas
        const fotosConFormato = await req.payload.find({
          collection: 'fotos',
          where: {
            formatos: {
              contains: id,
            },
          },
          limit: 1,
        })

        if (fotosConFormato.totalDocs > 0) {
          throw new Error(
            `No se puede eliminar este formato porque está ofrecido en ${fotosConFormato.totalDocs} foto(s). Desactívalo marcando "activo = false" en su lugar.`
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
      label: 'Nombre comercial (ej. 30 × 45 cm)',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ladoCortoCm',
          type: 'number',
          required: true,
          label: 'Lado corto de la hoja (cm)',
          admin: {
            width: '50%',
            description: 'Medida del lado menor en centímetros (ej. 30, 40, 50).',
          },
        },
        {
          name: 'ladoLargoCm',
          type: 'number',
          required: true,
          label: 'Lado largo de la hoja (cm)',
          admin: {
            width: '50%',
            description: 'Medida del lado mayor en centímetros (ej. 45, 60, 75).',
          },
        },
      ],
    },
    {
      name: 'margenMinimoCm',
      type: 'number',
      defaultValue: 2.0,
      required: true,
      label: 'Margen perimetral blanco de conservación (cm)',
      admin: {
        description:
          'Margen mínimo alrededor de la imagen viva para firma autógrafa a lápiz grafito y enmarcado con paspartú de conservación.',
      },
    },
    {
      name: 'papeles',
      type: 'relationship',
      relationTo: 'tipos-papel',
      hasMany: true,
      required: true,
      label: 'Papeles Fine Art disponibles para este formato',
      admin: {
        description: 'Selecciona al menos un papel del catálogo disponible para este tamaño.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'activo',
          type: 'checkbox',
          defaultValue: true,
          label: 'Disponible para ofrecer en fotos',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'orden',
          type: 'number',
          defaultValue: 0,
          label: 'Orden en selector',
          admin: {
            width: '50%',
            description: 'Menor número se muestra primero (ej. orden por tamaño).',
          },
        },
      ],
    },
  ],
}

import type { CollectionConfig } from 'payload'

export const TipoPapel: CollectionConfig = {
  slug: 'tipos-papel',
  labels: {
    singular: 'Tipo de papel',
    plural: 'Tipos de papel',
  },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'fabricante', 'base', 'acabado', 'gramajeGsm', 'activo'],
    group: 'Catálogo de copias',
  },
  access: {
    read: () => true, // Lectura pública para la ficha y consulta
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        // Bloquear borrado si está asociado a formatos de impresión existentes
        const formatosAsociados = await req.payload.find({
          collection: 'formatos-impresion',
          where: {
            papeles: {
              contains: id,
            },
          },
          limit: 1,
        })

        if (formatosAsociados.totalDocs > 0) {
          throw new Error(
            `No se puede eliminar este papel porque está asociado a ${formatosAsociados.totalDocs} formato(s) de impresión. Desactívalo marcando "activo = false" en su lugar.`
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
      unique: true,
      label: 'Nombre del papel',
      admin: {
        description: 'Ejemplo: Hahnemühle Photo Rag 308, Canson Platine Fibre Rag.',
      },
    },
    {
      name: 'fabricante',
      type: 'text',
      label: 'Fabricante',
      admin: {
        description: 'Hahnemühle, Canson Infinity, Canon, etc.',
      },
    },
    {
      name: 'base',
      type: 'select',
      required: true,
      label: 'Base del papel',
      options: [
        { label: '100% Algodón', value: 'algodon' },
        { label: 'Baritado', value: 'baritado' },
        { label: 'Alfa-celulosa', value: 'celulosa' },
      ],
      defaultValue: 'algodon',
    },
    {
      name: 'acabado',
      type: 'select',
      required: true,
      label: 'Acabado y textura',
      options: [
        { label: 'Mate liso', value: 'mate_liso' },
        { label: 'Mate texturado', value: 'mate_texturado' },
        { label: 'Satinado / Lustre', value: 'satinado_lustre' },
        { label: 'Brillo baritado', value: 'brillo_baritado' },
      ],
      defaultValue: 'mate_liso',
    },
    {
      name: 'gramajeGsm',
      type: 'number',
      label: 'Gramaje (g/m²)',
      admin: {
        description: 'Gramaje en gramos por metro cuadrado (ej. 308, 310, 350).',
      },
    },
    {
      name: 'libreDeAcido',
      type: 'checkbox',
      defaultValue: true,
      label: 'Libre de ácido y lignina (conservación museográfica)',
    },
    {
      name: 'descripcion',
      type: 'text',
      maxLength: 160,
      label: 'Descripción breve de textura y tonos',
      admin: {
        description: 'Máximo 160 caracteres. Explica al interesado la sensación táctil y visual.',
      },
    },
    {
      name: 'activo',
      type: 'checkbox',
      defaultValue: true,
      label: 'Disponible para copias',
    },
  ],
}

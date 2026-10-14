import type { CollectionConfig } from 'payload'

export const Consulta: CollectionConfig = {
  slug: 'consultas',
  labels: {
    singular: 'Consulta',
    plural: 'Consultas',
  },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'correo', 'tipo', 'estado', 'createdAt'],
    group: 'Consultas',
  },
  access: {
    // Interesados envían consultas de forma pública a través del formulario/Server Action
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'nombre',
          type: 'text',
          required: true,
          label: 'Nombre del interesado',
          admin: { width: '50%' },
        },
        {
          name: 'correo',
          type: 'email',
          required: true,
          label: 'Correo de contacto',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'telefono',
          type: 'text',
          label: 'Teléfono (opcional)',
          admin: { width: '50%' },
        },
        {
          name: 'ciudad',
          type: 'text',
          label: 'Ciudad / Región (opcional, para estimar despacho)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'mensaje',
      type: 'textarea',
      label: 'Mensaje o requerimiento particular',
    },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      defaultValue: 'copia',
      options: [
        { label: 'Copia Fine Art', value: 'copia' },
        { label: 'Mensaje general', value: 'general' },
      ],
      label: 'Tipo de consulta',
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'nueva',
      options: [
        { label: 'Nueva (sin responder)', value: 'nueva' },
        { label: 'Respondida', value: 'respondida' },
        { label: 'Cerrada', value: 'cerrada' },
        { label: 'Spam', value: 'spam' },
      ],
      label: 'Estado de gestión',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Obras consultadas (hasta 5)',
      maxRows: 5,
      fields: [
        {
          name: 'foto',
          type: 'relationship',
          relationTo: 'fotos',
          label: 'Fotografía',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'tituloFoto',
              type: 'text',
              label: 'Título de la foto (snapshot)',
              admin: { width: '50%' },
            },
            {
              name: 'slugFoto',
              type: 'text',
              label: 'Slug de la foto (snapshot)',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'formato',
              type: 'relationship',
              relationTo: 'formatos-impresion',
              label: 'Formato solicitado',
              admin: { width: '50%' },
            },
            {
              name: 'papel',
              type: 'relationship',
              relationTo: 'tipos-papel',
              label: 'Papel seleccionado',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'nombreFormatoSnapshot',
              type: 'text',
              label: 'Nombre formato inmutable',
              admin: {
                width: '50%',
                description: 'Preserva las medidas y nombre tal como se solicitaron ante futuros cambios de catálogo.',
              },
            },
            {
              name: 'nombrePapelSnapshot',
              type: 'text',
              label: 'Nombre papel inmutable',
              admin: {
                width: '50%',
                description: 'Preserva el tipo de papel tal como se solicitó ante futuros cambios de catálogo.',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'respondidaEn',
          type: 'date',
          label: 'Fecha de respuesta',
          admin: { width: '33%' },
        },
        {
          name: 'ultimaActividad',
          type: 'date',
          label: 'Última actividad',
          admin: { width: '33%' },
        },
        {
          name: 'eliminarDespuesDe',
          type: 'date',
          label: 'Fecha de purga programada',
          admin: {
            width: '33%',
            description: '12 meses desde la última actividad (o 30 días si es marcada como spam).',
          },
        },
      ],
    },
    {
      name: 'notasInternas',
      type: 'textarea',
      label: 'Notas internas de taller de Rod (privadas)',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'consentimientoEn',
          type: 'date',
          required: true,
          label: 'Fecha de consentimiento (Ley 21.719)',
          admin: { width: '50%' },
        },
        {
          name: 'versionPolitica',
          type: 'text',
          label: 'Versión de política aceptada',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'aceptaPromociones',
          type: 'checkbox',
          defaultValue: false,
          label: 'Aceptó recibir novedades y promociones',
          admin: { width: '50%' },
        },
        {
          name: 'origen',
          type: 'text',
          label: 'Origen de la consulta (ficha, visor, contacto)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'claveEnvio',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],
}

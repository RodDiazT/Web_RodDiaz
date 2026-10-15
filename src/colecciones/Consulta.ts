import type { CollectionConfig } from 'payload'
import { calcularEliminarDespuesDe } from '../lib/consultas'

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
    // La creación pública pasa únicamente por el Server Action enviarConsulta con overrideAccess (§5.4)
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const ahoraIso = new Date().toISOString()

        // 1. Cálculo de tipo según presencia de ítems (§5.1)
        if (Array.isArray(data.items) && data.items.length > 0) {
          data.tipo = 'copia'
        } else {
          data.tipo = 'general'
        }

        // 2. Registro de última actividad
        data.ultimaActividad = ahoraIso

        // 3. Fijar respondidaEn la primera vez que pasa a respondida (§5.2.7)
        if (data.estado === 'respondida' && !originalDoc?.respondidaEn && !data.respondidaEn) {
          data.respondidaEn = ahoraIso
        }

        // 4. Cálculo de fecha de purga programada (12 meses o 30 días spam)
        data.eliminarDespuesDe = calcularEliminarDespuesDe({
          estado: data.estado,
          ultimaActividad: data.ultimaActividad,
          createdAt: originalDoc?.createdAt || ahoraIso,
        })

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // Promoción de spam a nueva con casilla de novedades marcada (§4, §5.2.13)
        if (
          previousDoc?.estado === 'spam' &&
          doc.estado === 'nueva' &&
          doc.aceptaPromociones &&
          doc.correo
        ) {
          try {
            const existente = await req.payload.find({
              collection: 'suscriptores',
              where: { correo: { equals: doc.correo } },
              limit: 1,
              overrideAccess: true,
            })

            const ahoraIso = new Date().toISOString()
            if (existente.totalDocs > 0) {
              await req.payload.update({
                collection: 'suscriptores',
                id: existente.docs[0].id,
                data: {
                  nombre: doc.nombre,
                  consentimientoEn: doc.consentimientoEn || ahoraIso,
                  versionPolitica: doc.versionPolitica,
                },
                overrideAccess: true,
              })
            } else {
              await req.payload.create({
                collection: 'suscriptores',
                data: {
                  nombre: doc.nombre,
                  correo: doc.correo,
                  consentimientoEn: doc.consentimientoEn || ahoraIso,
                  versionPolitica: doc.versionPolitica,
                  origen: doc.id,
                },
                overrideAccess: true,
              })
            }
          } catch (err: any) {
            console.warn('[Consulta/afterChange] Error al registrar suscriptor:', err.message)
          }
        }
      },
    ],
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
          index: true,
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
      admin: {
        readOnly: true,
      },
      label: 'Tipo de consulta',
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'nueva',
      index: true,
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
          index: true,
          label: 'Fecha de purga programada',
          admin: {
            width: '33%',
            readOnly: true,
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
          admin: { width: '50%', readOnly: true },
        },
        {
          name: 'versionPolitica',
          type: 'text',
          label: 'Versión de política aceptada',
          admin: { width: '50%', readOnly: true },
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
          admin: { width: '50%', readOnly: true },
        },
        {
          name: 'origen',
          type: 'select',
          defaultValue: 'general',
          options: [
            { label: 'Ficha de foto', value: 'ficha' },
            { label: 'Visor de foto', value: 'visor' },
            { label: 'General (Contacto)', value: 'general' },
            { label: 'Licencia (Google Imágenes)', value: 'licencia' },
          ],
          label: 'Origen de la consulta',
          admin: { width: '50%', readOnly: true },
        },
      ],
    },
    {
      name: 'claveEnvio',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],
}

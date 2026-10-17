import type { CollectionConfig } from 'payload'

export const Suscriptor: CollectionConfig = {
  slug: 'suscriptores',
  labels: {
    singular: 'Suscriptor a novedades',
    plural: 'Suscriptores a novedades',
  },
  admin: {
    useAsTitle: 'correo',
    defaultColumns: ['nombre', 'correo', 'consentimientoEn', 'createdAt'],
    group: 'Consultas',
    description:
      'Personas que marcaron voluntariamente la casilla opcional para recibir novedades de nuevas expediciones y obras.',
    components: {
      beforeListTable: ['/componentes/admin/AccionesSuscriptores#AccionesSuscriptores'],
    },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
      label: 'Nombre completo',
    },
    {
      name: 'correo',
      type: 'email',
      required: true,
      unique: true,
      label: 'Correo electrónico',
    },
    {
      name: 'consentimientoEn',
      type: 'date',
      required: true,
      label: 'Fecha y hora del consentimiento explícito (Ley 21.719)',
    },
    {
      name: 'versionPolitica',
      type: 'text',
      label: 'Versión de política de privacidad vigente al suscribir',
    },
    {
      name: 'origen',
      type: 'relationship',
      relationTo: 'consultas',
      label: 'Consulta original de procedencia',
    },
  ],
}

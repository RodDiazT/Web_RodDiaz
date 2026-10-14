import type { CollectionConfig } from 'payload'

export const Usuario: CollectionConfig = {
  slug: 'usuarios',
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  auth: {
    // Permite acceso mediante sesiones autenticadas
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 1000 * 60 * 15, // 15 minutos
  },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'correo', 'ultimoAcceso'],
    hidden: ({ user }) => user?.email !== 'rodrigodiaztapia@gmail.com',
  },
  access: {
    // Solo el usuario administrador puede acceder a la gestión de usuarios
    create: () => false, // No se crean usuarios nuevos en v1.0 (marco §3)
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: () => false,
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
      name: 'proveedorAcceso',
      type: 'select',
      options: [
        { label: 'Google OAuth', value: 'google' },
        { label: 'Local / Recuperación de emergencia', value: 'local' },
      ],
      defaultValue: 'google',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'idGoogle',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'ultimoAcceso',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'recuperacionHash',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'recuperacionVence',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
  ],
}

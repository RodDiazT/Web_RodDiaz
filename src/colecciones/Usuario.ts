import type { CollectionConfig } from 'payload'
import { esCorreoAutorizado } from '../lib/acceso'

export const Usuario: CollectionConfig = {
  slug: 'usuarios',
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  auth: {
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 1000 * 60 * 15, // 15 minutos
  },
  admin: {
    useAsTitle: 'nombre',
    // Oculto de la navegación según modelo §5.3 (un solo usuario administrador)
    hidden: true,
  },
  access: {
    // Solo el usuario administrador autorizado puede acceder
    create: () => false, // No se crean usuarios nuevos en v1.0 (marco §3)
    read: ({ req: { user } }) => Boolean(user && esCorreoAutorizado(user.email)),
    update: ({ req: { user } }) => Boolean(user && esCorreoAutorizado(user.email)),
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

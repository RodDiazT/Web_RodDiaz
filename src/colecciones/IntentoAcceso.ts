import type { CollectionConfig } from 'payload'

export const IntentoAcceso: CollectionConfig = {
  slug: 'intentos-acceso',
  labels: {
    singular: 'Intento de acceso',
    plural: 'Intentos de acceso',
  },
  admin: {
    useAsTitle: 'correo',
    defaultColumns: ['correo', 'fecha', 'motivo'],
    group: 'Seguridad',
    description:
      'Registro de seguridad de intentos de inicio de sesión no autorizados en el panel. Se conservan durante 90 días conforme al marco normativo.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => false, // Solo el backend registra intentos rechazados
    update: () => false, // Registros inmutables
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'correo',
      type: 'text',
      required: true,
      index: true,
      label: 'Correo de la cuenta rechazada',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'fecha',
      type: 'date',
      required: true,
      index: true,
      label: 'Fecha y hora (UTC)',
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'motivo',
      type: 'select',
      required: true,
      options: [
        { label: 'Correo no autorizado', value: 'correo_no_autorizado' },
        { label: 'Error de proveedor de autenticación', value: 'error_proveedor' },
      ],
      label: 'Motivo del rechazo',
      admin: {
        readOnly: true,
      },
    },
  ],
}

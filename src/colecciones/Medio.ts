import type { CollectionConfig } from 'payload'
import { revalidarRutasSeguras } from '../lib/revalidacion'

export const Medio: CollectionConfig = {
  slug: 'medios',
  labels: {
    singular: 'Medio auxiliar',
    plural: 'Medios auxiliares',
  },
  admin: {
    useAsTitle: 'textoAlternativo',
    defaultColumns: ['filename', 'uso', 'textoAlternativo', 'createdAt'],
    group: 'Sitio',
    description:
      'Imágenes auxiliares institucionales que no son obra: logotipo y foto de perfil. No aparecen en galerías ni catálogos de copias.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      ({ req, data }) => {
        if (!data) return data

        if (req.file) {
          const tiposOriginalesPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml']
          if (req.file.mimetype && !tiposOriginalesPermitidos.includes(req.file.mimetype)) {
            throw new Error('Solo se aceptan archivos JPG, PNG o SVG para medios auxiliares.')
          }
        }

        if (req.file && req.file.size) {
          const LIMITE_LOGO = 200 * 1024 // 200 KB
          const LIMITE_GENERAL = 20 * 1024 * 1024 // 20 MB

          if (data.uso === 'logo') {
            if (req.file.size > LIMITE_LOGO) {
              throw new Error('El archivo del logotipo no puede superar los 200 KB.')
            }
          } else {
            if (req.file.size > LIMITE_GENERAL) {
              throw new Error('El archivo auxiliar supera el límite máximo de 20 MB.')
            }
          }
        }

        if (data.uso !== 'logo' && (!data.textoAlternativo || data.textoAlternativo.trim() === '')) {
          throw new Error('El texto alternativo es obligatorio para imágenes de páginas.')
        }

        return data
      },
    ],
    afterChange: [
      ({ doc }) => {
        const rutas = [
          '/',
          '/sobre-mi',
          '/contacto',
          '/sitemap.xml',
          doc?.id ? `/og/medio/${doc.id}` : '',
        ].filter(Boolean) as string[]
        const tags = ['ajustes', 'medios', 'paginas', doc?.id ? `medio:${doc.id}` : ''].filter(Boolean) as string[]
        revalidarRutasSeguras(rutas, tags)
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const rutas = [
          '/',
          '/sobre-mi',
          '/contacto',
          '/sitemap.xml',
          doc?.id ? `/og/medio/${doc.id}` : '',
        ].filter(Boolean) as string[]
        const tags = ['ajustes', 'medios', 'paginas', doc?.id ? `medio:${doc.id}` : ''].filter(Boolean) as string[]
        revalidarRutasSeguras(rutas, tags)
      },
    ],
  },
  upload: {
    staticDir: './medios/auxiliares',
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'],
    imageSizes: [
      {
        name: 'pequena',
        width: 480,
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
      {
        name: 'mediana',
        width: 1200,
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
    ],
    adminThumbnail: 'pequena',
  },
  fields: [
    {
      name: 'uso',
      type: 'select',
      required: true,
      defaultValue: 'pagina',
      options: [
        { label: 'Logo del sitio', value: 'logo' },
        { label: 'Imagen de página (Sobre mí / Editorial)', value: 'pagina' },
      ],
      label: 'Tipo de uso institucional',
    },
    {
      name: 'textoAlternativo',
      type: 'text',
      label: 'Texto alternativo accesible (alt)',
      admin: {
        description: 'Descripción de la imagen para lectores de pantalla. Si es el logo, se usa la marca del sitio.',
      },
    },
  ],
}

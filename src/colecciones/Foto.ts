import type { CollectionConfig } from 'payload'
import { generarSlug, actualizarSlugsAnteriores } from '../lib/slug'
import { leerExifSeguro } from '../lib/exif'
import { procesarImagenFoto } from '../lib/imagenes'
import { revalidarRutasSeguras } from '../lib/revalidacion'

export const Foto: CollectionConfig = {
  slug: 'fotos',
  labels: {
    singular: 'Foto',
    plural: 'Fotos',
  },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'coleccion', 'estado', 'fecha', 'faltantes'],
    group: 'Obra',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        estado: {
          equals: 'publicada',
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: './medios/fotos',
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/webp', 'image/avif'],
    focalPoint: true,
    crop: false,
    imageSizes: [
      {
        name: 'pequena_avif',
        width: 480,
        formatOptions: { format: 'avif', options: { effort: 3 } },
      },
      {
        name: 'pequena_webp',
        width: 480,
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
      {
        name: 'mediana_avif',
        width: 1200,
        formatOptions: { format: 'avif', options: { effort: 3 } },
      },
      {
        name: 'mediana_webp',
        width: 1200,
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
      {
        name: 'mediana_jpg',
        width: 1200,
        formatOptions: { format: 'jpeg', options: { quality: 85 } },
      },
      {
        name: 'grande_avif',
        width: 2048,
        formatOptions: { format: 'avif', options: { effort: 3 } },
      },
      {
        name: 'grande_webp',
        width: 2048,
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
    ],
    adminThumbnail: 'pequena_webp',
  },
  hooks: {
    beforeOperation: [
      async ({ args, operation, req }) => {
        if ((operation === 'create' || operation === 'update') && req.file && req.file.data) {
          const bufferOriginal = req.file.data
          const nombreArchivoOriginal = req.file.name

          // Leer EXIF acotado antes de limpiar metadatos y validar/procesar con Sharp
          const exif = await leerExifSeguro(bufferOriginal)
          const procesado = await procesarImagenFoto(bufferOriginal)

          // Reemplazar buffer antes de generateFileData para que el archivo principal
          // guardado en disco quede a máximo 2048 px, en sRGB y sin EXIF/GPS
          req.file.data = procesado.bufferPrincipal
          req.file.size = procesado.bufferPrincipal.length
          req.file.mimetype = 'image/jpeg'

          req.context = req.context || {}
          req.context.fotoProcesada = {
            procesado,
            exif,
            nombreArchivoOriginal,
          }
        }
        return args
      },
    ],
    beforeValidate: [
      async ({ req, data, originalDoc }) => {
        if (!data) return data

        const ctxFoto = req.context?.fotoProcesada as
          | {
              procesado: Awaited<ReturnType<typeof procesarImagenFoto>>
              exif: Awaited<ReturnType<typeof leerExifSeguro>>
              nombreArchivoOriginal: string
            }
          | undefined

        if (ctxFoto?.exif) {
          if (ctxFoto.exif.fecha && !data.fecha) {
            data.fecha = ctxFoto.exif.fecha
          }
          if (ctxFoto.exif.datosTecnicos) {
            data.datosTecnicos = data.datosTecnicos || {}
            if (!data.datosTecnicos.distanciaFocal && ctxFoto.exif.datosTecnicos.distanciaFocal !== undefined) {
              data.datosTecnicos.distanciaFocal = ctxFoto.exif.datosTecnicos.distanciaFocal
            }
            if (!data.datosTecnicos.apertura && ctxFoto.exif.datosTecnicos.apertura !== undefined) {
              data.datosTecnicos.apertura = ctxFoto.exif.datosTecnicos.apertura
            }
            if (!data.datosTecnicos.velocidad && ctxFoto.exif.datosTecnicos.velocidad !== undefined) {
              data.datosTecnicos.velocidad = ctxFoto.exif.datosTecnicos.velocidad
            }
          }
        }

        const fuePublicada = Boolean(originalDoc?.publicadaEn)
        if (fuePublicada) {
          // Si ya fue publicada, el slug NO cambia automáticamente al modificar el título
          if (data.slug && data.slug !== originalDoc?.slug) {
            data.slug = generarSlug(data.slug)
          } else {
            data.slug = originalDoc?.slug
          }
        } else {
          // Mientras no haya sido publicada, se deriva del título si no se especificó un slug explícito
          if (data.slug) {
            data.slug = generarSlug(data.slug)
          } else if (data.titulo) {
            data.slug = generarSlug(data.titulo)
          }
        }

        // Si se renombró el slug tras haber sido publicada, guardar en slugsAnteriores
        if (originalDoc && originalDoc.slug && data.slug && originalDoc.slug !== data.slug) {
          data.slugsAnteriores = actualizarSlugsAnteriores(
            data.slug,
            originalDoc.slug,
            originalDoc.slugsAnteriores as string[]
          )
        }

        // Validación de mínimos indispensables para publicar (modelo §5.2.4)
        const estadoFinal = data.estado || originalDoc?.estado
        if (estadoFinal === 'publicada') {
          const tituloFinal = data.titulo !== undefined ? data.titulo : originalDoc?.titulo
          const lugarFinal = data.lugar !== undefined ? data.lugar : originalDoc?.lugar
          const fechaFinal = data.fecha !== undefined ? data.fecha : originalDoc?.fecha
          const coleccionFinal = data.coleccion !== undefined ? data.coleccion : originalDoc?.coleccion

          const faltantes: string[] = []
          if (!tituloFinal || String(tituloFinal).trim() === '') faltantes.push('título')
          if (!lugarFinal || String(lugarFinal).trim() === '') faltantes.push('lugar')
          if (!fechaFinal) faltantes.push('fecha')
          if (!coleccionFinal) faltantes.push('colección')

          if (faltantes.length > 0) {
            throw new Error(`Para publicar falta: ${faltantes.join(', ')}`)
          }
        }

        return data
      },
    ],
    beforeChange: [
      async ({ req, data, originalDoc }) => {
        // Registrar fecha de primera publicación
        if (data.estado === 'publicada' && !data.publicadaEn && !originalDoc?.publicadaEn) {
          data.publicadaEn = new Date().toISOString()
        }

        // Procesamiento en la subida de un nuevo archivo
        const ctxFoto = req.context?.fotoProcesada as
          | {
              procesado: Awaited<ReturnType<typeof procesarImagenFoto>>
              exif: Awaited<ReturnType<typeof leerExifSeguro>>
              nombreArchivoOriginal: string
            }
          | undefined

        if (ctxFoto || (req.file && req.file.data)) {
          const procesado = ctxFoto
            ? ctxFoto.procesado
            : await procesarImagenFoto(req.file!.data)
          const exif = ctxFoto
            ? ctxFoto.exif
            : await leerExifSeguro(req.file!.data)
          const nombreArchivoOriginal = ctxFoto
            ? ctxFoto.nombreArchivoOriginal
            : req.file!.name

          data.nombreArchivoOriginal = nombreArchivoOriginal
          data.ancho = procesado.ancho
          data.alto = procesado.alto
          data.colorDominante = procesado.colorDominante
          data.huella = procesado.huella

          if (!ctxFoto && req.file) {
            req.file.data = procesado.bufferPrincipal
            req.file.size = procesado.bufferPrincipal.length
          }

          // Si la proporción no fue ajustada a mano, asignar la calculada
          if (!data.proporcion?.manual) {
            data.proporcion = {
              etiqueta: procesado.proporcion.etiqueta,
              valor: procesado.proporcion.valor,
              orientacion: procesado.proporcion.orientacion,
              manual: false,
            }
          }

          // Detección de duplicados por huella SHA-256
          const posibleDuplicado = await req.payload.find({
            collection: 'fotos',
            where: {
              and: [
                {
                  huella: {
                    equals: procesado.huella,
                  },
                },
                ...(originalDoc?.id
                  ? [
                      {
                        id: {
                          not_equals: originalDoc.id,
                        },
                      },
                    ]
                  : []),
              ],
            },
            limit: 1,
          })

          if (posibleDuplicado.totalDocs > 0) {
            data.posibleDuplicado = posibleDuplicado.docs[0].id
          } else {
            data.posibleDuplicado = null
          }

          // Lectura de EXIF acotada (rellena cada subcampo si está vacío)
          if (exif.fecha && !data.fecha) {
            data.fecha = exif.fecha
          }
          if (exif.datosTecnicos) {
            data.datosTecnicos = data.datosTecnicos || {}
            if (!data.datosTecnicos.distanciaFocal && exif.datosTecnicos.distanciaFocal !== undefined) {
              data.datosTecnicos.distanciaFocal = exif.datosTecnicos.distanciaFocal
            }
            if (!data.datosTecnicos.apertura && exif.datosTecnicos.apertura !== undefined) {
              data.datosTecnicos.apertura = exif.datosTecnicos.apertura
            }
            if (!data.datosTecnicos.velocidad && exif.datosTecnicos.velocidad !== undefined) {
              data.datosTecnicos.velocidad = exif.datosTecnicos.velocidad
            }
          }
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        const rutas = ['/', '/fotos', '/sitemap.xml', '/robots.txt']
        if (doc?.slug) rutas.push(`/fotos/${doc.slug}`)
        if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
          rutas.push(`/fotos/${previousDoc.slug}`)
        }
        const tags = [
          'fotos',
          'portada',
          doc?.id ? `foto:${doc.id}` : '',
          doc?.slug ? `foto:${doc.slug}` : '',
          previousDoc?.slug ? `foto:${previousDoc.slug}` : '',
        ].filter(Boolean) as string[]

        revalidarRutasSeguras(rutas, tags)
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const rutas = ['/', '/fotos', '/sitemap.xml', '/robots.txt']
        if (doc?.slug) rutas.push(`/fotos/${doc.slug}`)
        const tags = [
          'fotos',
          'portada',
          doc?.id ? `foto:${doc.id}` : '',
          doc?.slug ? `foto:${doc.slug}` : '',
        ].filter(Boolean) as string[]

        revalidarRutasSeguras(rutas, tags)
      },
    ],
  },
  fields: [
    {
      name: 'detectorExif',
      type: 'ui',
      admin: {
        components: {
          Field: '/componentes/admin/DetectorExifCliente#DetectorExifCliente',
        },
      },
    },
    {
      name: 'titulo',
      type: 'text',
      maxLength: 120,
      label: 'Título de la obra',
      admin: {
        description: 'Obligatorio para publicar. Máximo 120 caracteres.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'Identificador URL (slug)',
      admin: {
        description: 'Se genera del título mientras no se publique. Tras publicar solo cambia si se edita manualmente.',
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
    {
      type: 'row',
      fields: [
        {
          name: 'lugar',
          type: 'text',
          label: 'Lugar de la toma',
          admin: {
            width: '50%',
            description: 'Ubicación geográfica visible (ej. Parque Nacional Conguillío, Araucanía). Obligatorio para publicar.',
          },
        },
        {
          name: 'fecha',
          type: 'date',
          label: 'Fecha de la toma (día calendario)',
          admin: {
            width: '50%',
            description: 'Precargada de la captura EXIF o ingresada a mano. Obligatoria para publicar.',
          },
        },
      ],
    },
    {
      name: 'coleccion',
      type: 'relationship',
      relationTo: 'colecciones',
      index: true,
      label: 'Colección a la que pertenece',
      admin: {
        description: 'Cada foto pertenece a una única colección. Obligatoria para publicar.',
      },
    },
    {
      name: 'orden',
      type: 'number',
      defaultValue: 0,
      label: 'Orden dentro de su colección',
      admin: {
        description: 'Determina la posición en la grilla de la colección.',
      },
    },
    {
      name: 'caracteristicas',
      type: 'relationship',
      relationTo: 'caracteristicas',
      hasMany: true,
      label: 'Características (etiquetas transversales)',
      admin: {
        description: 'Etiquetas temáticas como Blanco y negro, Paisaje, Nocturna, etc.',
      },
    },
    {
      name: 'formatos',
      type: 'relationship',
      relationTo: 'formatos-impresion',
      hasMany: true,
      label: 'Formatos de impresión ofrecidos',
      admin: {
        description:
          'Selecciona los tamaños disponibles para esta obra. Si no se asocia ningún formato, la foto se publica como vitrina (sin botón de pedir copia).',
      },
    },
    {
      name: 'historia',
      type: 'richText',
      label: 'Historia o contexto de la toma (opcional)',
      admin: {
        description: 'Texto editorial sobre el momento, expedición o significado de la fotografía.',
      },
    },
    {
      name: 'textoAlternativo',
      type: 'text',
      label: 'Texto alternativo para accesibilidad',
      admin: {
        description: 'Si se deja vacío, se utilizará automáticamente el título de la foto.',
      },
    },
    {
      name: 'nombreArchivoOriginal',
      type: 'text',
      label: 'Nombre de archivo original (Lightroom)',
      admin: {
        readOnly: true,
        description: 'Trazabilidad privada para ubicar el master RAW en Lightroom al momento de imprimir en taller.',
      },
    },
    {
      name: 'datosTecnicos',
      type: 'group',
      label: 'Datos técnicos de la toma (visibles en ficha)',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'distanciaFocal',
              type: 'number',
              label: 'Distancia focal (mm)',
              admin: { width: '33%' },
            },
            {
              name: 'apertura',
              type: 'number',
              label: 'Apertura (f/)',
              admin: { width: '33%' },
            },
            {
              name: 'velocidad',
              type: 'text',
              label: 'Velocidad de obturación',
              admin: { width: '33%', description: 'Ejemplo: 1/250 s, 2 s' },
            },
          ],
        },
      ],
    },
    {
      name: 'proporcion',
      type: 'group',
      label: 'Proporción y orientación',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'etiqueta',
              type: 'text',
              label: 'Etiqueta (3:2, 4:5, 1:1, etc.)',
              admin: { width: '25%' },
            },
            {
              name: 'valor',
              type: 'number',
              label: 'Razón decimal (≥ 1.0)',
              admin: { width: '25%' },
            },
            {
              name: 'orientacion',
              type: 'select',
              options: [
                { label: 'Horizontal', value: 'horizontal' },
                { label: 'Vertical', value: 'vertical' },
                { label: 'Cuadrada', value: 'cuadrada' },
              ],
              label: 'Orientación',
              admin: { width: '25%' },
            },
            {
              name: 'manual',
              type: 'checkbox',
              defaultValue: false,
              label: 'Modificada manualmente',
              admin: { width: '25%' },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'estado',
          type: 'select',
          required: true,
          defaultValue: 'borrador',
          options: [
            { label: 'Borrador', value: 'borrador' },
            { label: 'Publicada', value: 'publicada' },
            { label: 'Despublicada', value: 'despublicada' },
          ],
          label: 'Estado de la foto',
          admin: { width: '33%' },
        },
        {
          name: 'destacada',
          type: 'checkbox',
          defaultValue: false,
          label: 'Aparece en portada',
          admin: { width: '33%' },
        },
        {
          name: 'filete',
          type: 'checkbox',
          defaultValue: false,
          label: 'Filete perimetral sutil',
          admin: {
            width: '33%',
            description: 'Úsalo en fotos muy oscuras que se pierden con el fondo oscuro.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'fijada',
          type: 'checkbox',
          defaultValue: false,
          label: 'Fijada en Todas las fotos',
          admin: { width: '50%' },
        },
        {
          name: 'ordenFijada',
          type: 'number',
          label: 'Orden entre fijadas',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'publicadaEn',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Fecha y hora en que se publicó por primera vez.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ancho',
          type: 'number',
          admin: { readOnly: true, width: '33%' },
          label: 'Ancho (px)',
        },
        {
          name: 'alto',
          type: 'number',
          admin: { readOnly: true, width: '33%' },
          label: 'Alto (px)',
        },
        {
          name: 'colorDominante',
          type: 'text',
          admin: { readOnly: true, width: '33%' },
          label: 'Color dominante (#hex)',
        },
      ],
    },
    {
      name: 'huella',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'SHA-256 del archivo subido.',
      },
      label: 'Huella digital',
    },
    {
      name: 'posibleDuplicado',
      type: 'relationship',
      relationTo: 'fotos',
      admin: {
        readOnly: true,
        description: 'Aviso si esta foto tiene el mismo contenido que otra subida previamente.',
      },
      label: 'Posible duplicado',
    },
    {
      name: 'faltantes',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          ({ data }) => {
            if (!data) return ''
            const falta: string[] = []
            if (!data.titulo) falta.push('Título')
            if (!data.lugar) falta.push('Lugar')
            if (!data.fecha) falta.push('Fecha')
            if (!data.coleccion) falta.push('Colección')
            return falta.length > 0 ? `Falta: ${falta.join(', ')}` : 'Completa'
          },
        ],
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'Optimización para motores de búsqueda (SEO)',
      fields: [
        {
          name: 'descripcion',
          type: 'textarea',
          maxLength: 160,
          label: 'Descripción para buscadores (opcional)',
          admin: {
            description:
              'Máximo 160 caracteres. Si se deja en blanco, se generará automáticamente a partir del título, lugar y año.',
          },
        },
      ],
    },
  ],
}

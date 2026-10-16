import type { GlobalConfig } from 'payload'
import { revalidarRutasSeguras } from '../lib/revalidacion'

export const AjustesSitio: GlobalConfig = {
  slug: 'ajustes-sitio',
  label: 'Ajustes del sitio',
  admin: {
    group: 'Sitio',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        if (data.seo) {
          // Extraer y validar verificacionGoogle (§4, §5.1)
          if (data.seo.verificacionGoogle) {
            let codigo = String(data.seo.verificacionGoogle).trim()
            const matchMeta = codigo.match(/content=["']([^"']+)["']/i)
            if (matchMeta) {
              codigo = matchMeta[1].trim()
            }
            if (!/^[a-zA-Z0-9_-]{20,100}$/.test(codigo)) {
              throw new Error('Pega solo el código, sin <meta> ni comillas. Por ejemplo: AbC123…')
            }
            data.seo.verificacionGoogle = codigo
          }

          // Validar robots excluidos (§4, §5.1)
          if (data.seo.robotsExcluidos) {
            const robots = Array.isArray(data.seo.robotsExcluidos)
              ? data.seo.robotsExcluidos
              : typeof data.seo.robotsExcluidos === 'string'
              ? data.seo.robotsExcluidos.split(/[\n,]/).map((r: string) => r.trim()).filter(Boolean)
              : []

            const CRAWLERS_BUSCADORES = [
              '*',
              'googlebot',
              'googlebot-image',
              'bingbot',
              'oai-searchbot',
              'chatgpt-user',
              'claude-searchbot',
              'claude-user',
              'perplexitybot',
            ]

            for (const r of robots) {
              const limpio = String(r).trim().toLowerCase()
              if (CRAWLERS_BUSCADORES.includes(limpio)) {
                throw new Error('Ese robot es de un buscador; bloquearlo te sacaría de las búsquedas.')
              }
            }
          }
        }

        return data
      },
    ],
    afterChange: [
      () => {
        revalidarRutasSeguras(['/', '/sitemap.xml', '/robots.txt'], ['ajustes'])
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'nombreSitio',
              type: 'text',
              defaultValue: 'Rod Díaz',
              required: true,
              label: 'Nombre del sitio / Marca',
            },
            {
              name: 'logo',
              type: 'relationship',
              relationTo: 'medios',
              label: 'Logotipo institucional (opcional)',
              admin: {
                description: 'Archivo SVG o PNG. Reemplaza el texto de la marca en la cabecera.',
              },
            },
            {
              name: 'fotoPortada',
              type: 'relationship',
              relationTo: 'fotos',
              label: 'Fotografía principal de portada',
              admin: {
                description:
                  'Foto que recibe al visitante a gran impacto. Si no se selecciona, se usará la primera foto destacada o la más reciente.',
              },
            },
            {
              name: 'descripcion',
              type: 'textarea',
              maxLength: 160,
              label: 'Descripción del sitio',
              admin: {
                description: 'Máximo 160 caracteres. Describe qué fotografías y dónde para buscadores.',
              },
            },
            {
              name: 'correoContacto',
              type: 'email',
              required: true,
              label: 'Correo de contacto principal',
              admin: {
                description: 'Dirección oficial para responder consultas y solicitudes de derechos de autor.',
              },
            },
            {
              name: 'redes',
              type: 'array',
              label: 'Redes sociales',
              fields: [
                {
                  name: 'red',
                  type: 'select',
                  options: [
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'Otra', value: 'otra' },
                  ],
                  defaultValue: 'instagram',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: 'Enlace (URL)',
                },
              ],
            },
            {
              name: 'textoLlamadaCopia',
              type: 'text',
              defaultValue: 'Pedir una copia',
              label: 'Texto llamada a consulta de copia',
            },
            {
              name: 'textoDerechos',
              type: 'text',
              defaultValue: 'Todos los derechos reservados',
              label: 'Texto de derechos de autor',
            },
            {
              name: 'textoVitrina',
              type: 'text',
              label: 'Texto explicativo para fotos de vitrina (opcional)',
              admin: {
                description: 'Mensaje que se muestra en fichas de fotografías que no ofrecen copia impresa.',
              },
            },
          ],
        },
        {
          label: 'Consultas',
          fields: [
            {
              name: 'textoIntroConsulta',
              type: 'textarea',
              label: 'Texto de introducción al formulario',
              defaultValue:
                'Cuéntame cómo contactarte y te respondo con los detalles y el valor de la copia.',
            },
            {
              name: 'textoConsultaRecibida',
              type: 'textarea',
              label: 'Mensaje de confirmación de envío',
              defaultValue:
                'Te respondo a {correo} en los próximos días. Si no ves mi respuesta, revisa la carpeta de spam.',
            },
            {
              name: 'textoConsentimiento',
              type: 'textarea',
              label: 'Texto de consentimiento obligatorio (Ley 21.719)',
              defaultValue:
                'Acepto la {politica} y que Rod Díaz me contacte por correo, teléfono u otro medio que indiqué, para responder esta consulta.',
            },
            {
              name: 'textoPromociones',
              type: 'textarea',
              label: 'Texto de suscripción opcional a novedades',
              defaultValue:
                'Quiero recibir novedades y promociones de Rod Díaz (fotos nuevas, ofertas de copias). Puedo darme de baja cuando quiera.',
            },
            {
              name: 'plantillaRespuesta',
              type: 'textarea',
              label: 'Plantilla de respuesta rápida a consultas',
              defaultValue:
                'Hola {nombre}:\n\nGracias por escribirme.\n\n{detalle}\n\nQuedo a tu disposición para coordinar detalles de impresión y despacho.\n\nSaludos cordiales,\nRod Díaz',
              admin: {
                description:
                  'Borrador predefinido para agilizar la respuesta 1:1 desde Gmail con los datos de tiraje y despacho.',
              },
            },
            {
              name: 'plantillaNovedades',
              type: 'textarea',
              label: 'Plantilla de novedades para suscriptores',
              defaultValue:
                'Recibes este correo porque te suscribiste en Rod Díaz. Si no quieres recibir más, responde BAJA a este correo.',
              admin: {
                description: 'Estructura base para envíos de correo con nuevas colecciones.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: 'Motores de búsqueda y robots',
              fields: [
                {
                  name: 'tituloPortada',
                  type: 'text',
                  maxLength: 60,
                  defaultValue: 'Rod Díaz · Fotografía',
                  label: 'Título en buscadores para la portada',
                  admin: {
                    description: 'Máximo 60 caracteres. Valor inicial: "Rod Díaz · Fotografía".',
                  },
                },
                {
                  name: 'verificacionGoogle',
                  type: 'text',
                  label: 'Código de verificación de Google Search Console',
                  admin: {
                    description:
                      'Pega el código alfanumérico (o la etiqueta <meta> completa). Solo se publica en la portada.',
                  },
                },
                {
                  name: 'robotsExcluidos',
                  type: 'json',
                  defaultValue: [
                    'GPTBot',
                    'ClaudeBot',
                    'anthropic-ai',
                    'Google-Extended',
                    'Applebot-Extended',
                    'CCBot',
                  ],
                  label: 'Robots de IA excluidos de entrenamiento',
                  admin: {
                    description:
                      'Robots que entrenan inteligencias artificiales. No afecta tu aparición en Google ni en asistentes que buscan en la web.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Sistema',
          admin: {
            hidden: true,
          },
          fields: [
            {
              name: 'ultimoRespaldoEn',
              type: 'date',
            },
            {
              name: 'supresionesRecientes',
              type: 'json',
            },
          ],
        },
      ],
    },
  ],
}

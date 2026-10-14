import type { GlobalConfig } from 'payload'

export const AjustesSitio: GlobalConfig = {
  slug: 'ajustes-sitio',
  label: 'Ajustes del sitio',
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
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
              name: 'descripcion',
              type: 'textarea',
              maxLength: 160,
              label: 'Descripción del sitio',
              admin: {
                description: 'Máximo 160 caracteres. Describe la temática y ubicaciones de la obra para buscadores.',
              },
            },
            {
              name: 'correoContacto',
              type: 'email',
              defaultValue: 'rodrigodiaztapia@gmail.com',
              required: true,
              label: 'Correo de contacto principal',
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
              defaultValue: 'Cada copia se imprime artesanalmente en taller sobre papeles Fine Art 100% algodón o baritados con tintas minerales de conservación. Deja tus datos y te responderé a la brevedad con la disponibilidad y detalles.',
            },
            {
              name: 'textoConsultaRecibida',
              type: 'textarea',
              label: 'Mensaje de confirmación de envío',
              defaultValue: 'Gracias por tu interés en mi obra. He recibido tu consulta y te responderé directamente a tu correo.',
            },
            {
              name: 'textoConsentimiento',
              type: 'textarea',
              label: 'Texto de consentimiento obligatorio (Ley 21.719)',
              defaultValue: 'Acepto ser contactado por los medios indicados para responder a esta consulta, conforme a la política de privacidad.',
            },
            {
              name: 'textoPromociones',
              type: 'textarea',
              label: 'Texto de suscripción opcional a novedades',
              defaultValue: 'Deseo recibir ocasionalmente novedades de nuevas expediciones y ediciones.',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'tituloPortada',
              type: 'text',
              label: 'Título en buscadores para la portada',
              admin: {
                description: 'Por defecto: "Rod Díaz — Fotografía Fine Art".',
              },
            },
            {
              name: 'verificacionGoogle',
              type: 'text',
              label: 'Código de verificación de Google Search Console',
            },
            {
              name: 'robotsExcluidos',
              type: 'textarea',
              label: 'Rutas excluidas de indexación (robots.txt)',
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

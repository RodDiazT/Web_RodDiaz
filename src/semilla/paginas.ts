/**
 * Contenidos iniciales estructurados en formato Lexical para las páginas reservadas (§3.2, §5.2.9, Anexos A y B).
 * Especificado en DocumentosTecnicos/paginas/paginas.md.
 */

function crearTexto(texto: string, formato: number = 0) {
  return {
    mode: 'normal' as const,
    text: texto,
    type: 'text',
    style: '',
    detail: 0,
    format: formato,
    version: 1,
  }
}

function crearParrafo(texto: string | ReturnType<typeof crearTexto>[]) {
  const children = typeof texto === 'string' ? [crearTexto(texto)] : texto
  return {
    type: 'paragraph',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children,
  }
}

function crearEncabezado(texto: string, tag: 'h2' | 'h3' = 'h2') {
  return {
    type: 'heading',
    tag,
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [crearTexto(texto)],
  }
}

function crearLista(items: string[], ordenada: boolean = false) {
  return {
    type: 'list',
    listType: ordenada ? ('number' as const) : ('bullet' as const),
    start: 1,
    tag: ordenada ? 'ol' : 'ul',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: items.map((it) => ({
      type: 'listitem',
      value: 1,
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [crearTexto(it)],
    })),
  }
}

function envolverLexical(children: any[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children,
    },
  }
}

/**
 * Contenido inicial para "Sobre mí" (/sobre-mi) (§5.2.9, T-007).
 */
export function contenidoSobreMi() {
  return envolverLexical([
    crearParrafo(
      'Fotógrafo de naturaleza y expediciones en Chile y Sudamérica. Mi trabajo busca documentar la fuerza y la soledad de paisajes remotos mediante la luz natural y la contemplación silenciosa.'
    ),
    crearParrafo(
      'Cada fotografía nace de largas jornadas en terreno, esperando las condiciones justas de atmósfera y viento. Las copias de autor se producen en mi propio taller bajo estándares museográficos Fine Art, con tintas minerales de alta estabilidad y papeles 100% algodón seleccionados meticulosamente para cada obra.'
    ),
    crearParrafo(
      '[Reemplaza este texto con tu trayectoria, visión y motivación fotográfica antes de lanzar a producción].'
    ),
  ])
}

/**
 * Contenido inicial para "Contacto" (/contacto) (§3.2).
 */
export function contenidoContacto() {
  return envolverLexical([
    crearParrafo(
      '¿Te interesa una copia, una colaboración o solo quieres saludar? Escríbeme y te respondo personalmente.'
    ),
  ])
}

/**
 * Anexo A: Texto completo de la Política de Privacidad (/privacidad) (Ley 21.719 / 19.628).
 */
export function contenidoPrivacidad() {
  return envolverLexical([
    crearParrafo(
      'En este sitio muestro mis fotografías y recibo consultas de quienes quieren una copia impresa o simplemente escribirme. Aquí te cuento qué datos pido, para qué los uso y cómo puedes decidir sobre ellos.'
    ),
    crearEncabezado('Quién es responsable'),
    crearParrafo('Rod Díaz. Puedes escribirme a {correo} para cualquier tema de esta política.'),
    crearEncabezado('Qué datos pido y para qué'),
    crearParrafo(
      'Cuando envías una consulta te pido tu nombre y tu correo, y de forma opcional tu teléfono, tu ciudad (para estimar el envío) y un mensaje. También guardo las fotos, tamaños y papeles que elegiste. Uso estos datos solo para responder tu consulta, y al enviarla aceptas que te contacte por correo, teléfono u otro medio que me hayas indicado para ese fin.'
    ),
    crearParrafo(
      'Si además marcas la casilla de novedades, guardo tu nombre y tu correo para enviarte, de vez en cuando, fotos y colecciones nuevas y promociones de copias. Es opcional: tu consulta no depende de esa casilla.'
    ),
    crearParrafo(
      'No guardo tu dirección IP ni uso cookies de rastreo, analítica de visitas ni publicidad.'
    ),
    crearEncabezado('Por qué puedo tratarlos'),
    crearParrafo(
      'Porque tú lo autorizas al enviar el formulario. Puedes retirar tu autorización cuando quieras escribiéndome a {correo}, tan fácil como la diste.'
    ),
    crearEncabezado('Cuánto tiempo los guardo'),
    crearLista([
      'Consultas: 12 meses desde el último contacto contigo. Después se borran de forma automática.',
      'Mensajes marcados como spam: 30 días.',
      'Las copias de respaldo del sitio pueden conservar un dato borrado hasta 45 días; después desaparece también de ellas.',
      'Novedades: hasta que pidas la baja.',
    ]),
    crearEncabezado('Con quién se comparten'),
    crearParrafo(
      'No vendo ni cedo tus datos. Solo los procesan dos servicios que uso para operar el sitio:'
    ),
    crearLista([
      'Railway, que aloja el sitio y su base de datos.',
      'Google (Gmail), desde donde respondo las consultas y envío las novedades.',
    ]),
    crearParrafo(
      'Sus servidores pueden estar fuera de Chile, así que tus datos pueden almacenarse o transmitirse en el extranjero bajo las condiciones de seguridad de esos proveedores.'
    ),
    crearEncabezado('Tus derechos'),
    crearParrafo(
      'Puedes pedirme acceder a tus datos, corregirlos, borrarlos, oponerte a su uso, recibirlos en un formato que puedas llevarte o bloquearlos temporalmente. Escríbeme a {correo} desde el correo con el que enviaste la consulta y te respondo a la brevedad y dentro de los plazos legales vigentes. Si no recibes respuesta o no estás de acuerdo con ella, puedes reclamar ante la autoridad que corresponda según la ley vigente.'
    ),
    crearEncabezado('Novedades y promociones'),
    crearParrafo(
      'Solo las recibes si marcaste la casilla. Para darte de baja basta con responder cualquiera de esos correos o escribirme a {correo}, y dejo de enviártelos desde ese momento. También respeto las solicitudes hechas a través del registro "No Molestar" del Sernac.'
    ),
    crearEncabezado('Acceso al panel del sitio'),
    crearParrafo(
      'Por seguridad, si alguien intenta entrar al panel de administración con una cuenta no autorizada, guardo el correo usado y la fecha durante 90 días.'
    ),
    crearEncabezado('Seguridad'),
    crearParrafo(
      'El sitio funciona solo con conexión cifrada (HTTPS) y únicamente yo tengo acceso al panel donde se ven las consultas.'
    ),
    crearEncabezado('Cambios a esta política'),
    crearParrafo(
      'Si cambio esta política, la fecha de actualización arriba lo indica. Cada consulta guarda la versión que aceptaste.'
    ),
  ])
}

/**
 * Anexo B: Texto completo de las Condiciones de Uso (/condiciones) (Ley 17.336).
 */
export function contenidoCondiciones() {
  return envolverLexical([
    crearEncabezado('Las fotografías'),
    crearParrafo(
      'Todas las fotografías de este sitio son obra de Rod Díaz y están protegidas por la Ley 17.336 de Propiedad Intelectual. Todos los derechos reservados.'
    ),
    crearParrafo(
      'No está permitido descargarlas, copiarlas, reproducirlas, modificarlas, publicarlas en otros sitios o redes, usarlas con fines comerciales ni usarlas para entrenar sistemas de inteligencia artificial sin mi autorización por escrito.'
    ),
    crearParrafo(
      'Sí puedes compartir el enlace a una foto o a una colección: me encanta que lo hagas.'
    ),
    crearParrafo(
      'Si quieres usar una foto para un proyecto, una publicación o una marca, escríbeme desde la página de contacto y lo conversamos.'
    ),
    crearEncabezado('Las copias impresas'),
    crearParrafo(
      'Lo que ves en el sitio no es una oferta de venta: los tamaños y papeles indican lo que se puede pedir. Cada copia se conversa uno a uno: te respondo con el valor, el plazo y la forma de envío antes de que decidas.'
    ),
    crearParrafo(
      'Las copias se imprimen bajo estándares Fine Art con tintas de pigmento mineral de alta durabilidad y papeles libres de ácido de calidad de museo. Para preservar la obra a lo largo de décadas, se recomienda manipular la copia tomándola exclusivamente por los bordes (o utilizando guantes limpios de algodón) y realizar su enmarcado con materiales libres de ácido y vidrio con protección UV.'
    ),
    crearParrafo(
      'Los colores en pantalla dependen de cada dispositivo, así que la copia impresa puede verse algo distinta.'
    ),
    crearEncabezado('El sitio'),
    crearParrafo(
      'Hago lo posible por que el sitio funcione siempre y la información esté al día, pero puede tener interrupciones o errores. Puedo cambiar estas condiciones; la fecha de actualización arriba lo indica.'
    ),
    crearParrafo('Para cualquier duda, escríbeme desde la página de contacto.'),
  ])
}

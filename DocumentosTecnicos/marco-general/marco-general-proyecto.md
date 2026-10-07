# Marco general del proyecto — Fotos de Rod

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/marco-general/marco-general-proyecto.md` |
| Tipo | Marco general |
| Versión | 0.1 |
| Estado | En revisión |
| Fecha | 2026-10-07 |
| Padre | — |
| Dependencias | — |
| Versión del producto | v1.0 (define también v1.x y v2) |

## Índice

1. Contexto y objetivo
2. Alcance por versión
3. Actores y permisos
4. Flujo central y principios de UX/UI
5. Casos borde transversales
6. Especificación técnica
   - 6.1 Modelo de dominio y nombres oficiales
   - 6.2 Reglas de negocio transversales
   - 6.3 Interfaces (rutas públicas y panel)
   - 6.4 Carpetas y estructura de código
   - 6.5 Rendimiento y seguridad
   - 6.6 Stack
7. Cumplimiento normativo transversal
8. Elementos obsoletos
9. Plan de acción y documentos hijos
10. Métricas y criterios de aceptación del marco
11. Riesgos
12. Decisiones abiertas y tareas del dueño
13. Control de cambios

---

## 1. Contexto y objetivo

**Fotos de Rod** es el sitio de portafolio fotográfico de Rod Díaz. El sitio tiene dos objetivos:

1. **Mostrar la obra.** El visitante que llega por primera vez, desde Google, Instagram o un enlace compartido, debe quedar con ganas de seguir mirando.
2. **Dejar claro que cada foto se puede pedir como copia impresa.** El visitante debe poder consultar sin fricción por una copia.

Hoy Rod no tiene un lugar propio donde mostrar su trabajo ni recibir interesados. El sitio viene a resolver eso.

**Resultado esperado de la v1.0:** un sitio rápido, de fondo oscuro, donde la foto es protagonista. Cada foto tiene una ficha con sus tamaños y papeles disponibles, y desde ahí se envía una consulta que Rod recibe en su panel y en su correo. Rod administra todo el contenido sin tocar código.

Este documento es la **fuente de verdad** de las definiciones transversales. Los documentos de componente referencian sus secciones y no las reescriben.

## 2. Alcance por versión

| Versión | Incluye |
|---|---|
| **v1.0 — Portafolio con consulta 1:1** | Galería pública con colecciones y filtro por características. Ficha de foto con proporción, tamaños y papeles, sin precio. Formulario de consulta. Panel exclusivo de Rod para fotos, colecciones, características, formatos, papeles, páginas, ajustes del sitio y consultas. Aviso de consultas en el panel y por correo. Páginas "Sobre mí" y "Contacto". SEO con Open Graph, enlace a Instagram y analítica básica. |
| **v1.x — Mejoras** | Aviso por bot de Telegram. Cloudflare Turnstile si el spam supera las defensas de la v1. Dominio propio. Lo que surja del uso real. |
| **v2 — Venta automatizada** | Conexión con Shopify u otra plataforma para venta directa. **Se activa solo cuando Rod lo decida** (§2.1). |
| **Futuro** | Ediciones limitadas, terminaciones de impresión, otros idiomas, curso de fotografía. Nada de esto se construye sin una solicitud explícita de Rod. |

**Fuera de alcance de la v1:** precios publicados, carrito, pagos en línea, ediciones limitadas, terminaciones de impresión, WhatsApp, otros idiomas, curso de fotografía, y todo lo tributario o comercial (inicio de actividades, boletas, proveedor de impresión).

### 2.1 Criterio de activación de la v2

La v2 se activa **por decisión explícita de Rod**, sin un umbral automático. Para que la decisión tenga datos, el panel muestra un **indicador de consultas por mes**: consultas recibidas y consultas en estado `respondida`, de los últimos 12 meses (§10).

Mientras la v2 no se active, los componentes de la v1 se diseñan para **no bloquearla**. Por ejemplo, `FormatoImpresion` y `TipoPapel` son catálogos reutilizables como variantes de producto. Aun así, **no se construye nada de la v2**.

## 3. Actores y permisos

| Actor | Quién es | Puede | No puede |
|---|---|---|---|
| **Administrador** | Rod. Es el único usuario del panel. | Todo en el panel `/admin`: crear, editar, publicar y despublicar fotos y demás contenido, y ver, responder y borrar consultas. | — |
| **Visitante** | Persona anónima. No hay registro de visitantes. | Ver lo publicado, navegar y filtrar. | Acceder al panel. Ver contenido despublicado. Descargar versiones de alta resolución, porque no existen en el sitio. |
| **Interesado** | Visitante que envía una consulta. | Enviar consultas. Ejercer sus derechos sobre sus datos por correo (§7). | Ver otras consultas. Tener una cuenta. |

**Regla:** existe un solo `Usuario` en el sistema, Rod. El panel no permite crear otros usuarios en la v1. La colección `Usuario` queda con creación bloqueada después del primer usuario.

## 4. Flujo central y principios de UX/UI

### 4.1 Flujo central

```
Administración de contenido ──► Galería y colecciones ──► Ficha de foto ──► Consulta de copia ──► Gestión de consultas
            (panel)                  (público)              (público)          (público)               (panel)
                    apoyado en: Identidad visual y sistema de diseño · Páginas · Plataforma (SEO, analítica, despliegue)
```

### 4.2 Principios de UX/UI (obligatorios para todo componente visible)

1. **La foto es la protagonista.** Fondo oscuro, casi negro, y no negro puro. Poco texto, sin ruido visual. La interfaz se retira.
2. **Los primeros segundos.** En la portada el visitante ve una foto de gran impacto y, de inmediato, el camino a más fotos. Cada componente visible responde: qué ve primero, si lo maravilla, si quiere seguir, si encuentra fotos fácilmente y si entiende que puede pedir una copia.
3. **La copia es evidente sin ser comercial.** En cada ficha hay una llamada clara y cálida, por ejemplo "Pedir una copia". No hay lenguaje de tienda ni precios.
4. **El escritorio es el máximo potencial y el móvil es impecable.** El escritorio aprovecha fotos grandes y composición. En móvil el sitio funciona perfecto, incluido el navegador interno de Instagram, que suele tener poca memoria y no tener sesión.
5. **Carga rápida y progresiva.** Formatos AVIF y WebP, `srcset` por tamaño, carga diferida, marcador de color o desenfoque mientras carga, y dimensiones reservadas para evitar saltos de diseño.
6. **Navegación evidente.** Colecciones, filtro por características y un acceso a "todas las fotos". No hay más de dos clics desde la portada a cualquier ficha.
7. **Movimiento sobrio.** Transiciones cortas, de 150 a 300 ms, que acompañan sin distraer. Se respeta `prefers-reduced-motion`.
8. **Accesibilidad.** Contraste AA en texto, foco visible, navegación completa con teclado, texto alternativo en cada foto (tomado del título si Rod no escribe uno) y objetivos táctiles de al menos 44 px.
9. **Textos breves y cálidos en español de Chile**, sin jerga técnica.

El detalle visual (tipografía, color, espaciado, componentes) lo define el documento transversal `identidad/sistema-de-diseno.md`.

## 5. Casos borde transversales

Cada componente resuelve los suyos. Estos aplican a todo el proyecto y aquí se fija la regla:

| Caso | Regla transversal |
|---|---|
| Fotos verticales, horizontales, cuadradas y panorámicas mezcladas | Ninguna vista recorta la foto en la ficha. En la grilla se permite un recorte solo si el documento de galería lo define, y siempre se muestra la foto completa al abrirla. La proporción se calcula al subir (§6.2). |
| Original muy pesado (45 MP o más), TIFF, HEIC o RAW | Se aceptan JPEG, PNG, WebP y TIFF hasta 60 MB. HEIC y RAW se rechazan con un mensaje claro ("Exporta la foto como JPEG"). |
| Perfil de color distinto de sRGB (Adobe RGB, Display P3) | Siempre se convierte a sRGB al generar las versiones web. |
| EXIF ausente, incompleto o con GPS | Los datos técnicos se precargan si existen y quedan editables. **Todas** las versiones publicadas se generan sin metadatos (§7.2). |
| Foto despublicada con consultas o enlaces compartidos | Las consultas se conservan con su referencia. El enlace público muestra una página amable: "Esta foto ya no está disponible", con acceso a la galería. No se muestra un 404 seco. |
| Eliminar una colección, característica, formato o papel con fotos asociadas | No se borra en duro mientras tenga fotos asociadas. El panel avisa cuántas fotos tiene y ofrece desasociarlas. Al renombrar se conserva el `slug` anterior como redirección. |
| Falla el correo de aviso | La consulta **se guarda primero** y se avisa después. Si el correo falla, se reintenta y la consulta queda visible en el panel como "aviso pendiente" (§6.2). |
| Sitio recién lanzado con pocas fotos | El lanzamiento exige al menos 12 fotos publicadas (tarea T-005). La portada no muestra colecciones vacías. |
| Navegador interno de Instagram o conexión lenta | Primera carga liviana: la foto de portada tiene una versión de 1200 px como máximo en móvil y no se carga JavaScript pesado. |

## 6. Especificación técnica

### 6.1 Modelo de dominio y nombres oficiales

Estos son los **nombres oficiales**. En el código van sin tildes, con el dominio en español y los términos técnicos del framework en inglés. No se usan sinónimos: nada de "imagen", "álbum", "tag", "pedido" ni "mensaje" para estas entidades.

| Entidad (colección Payload) | Qué es | Campos principales |
|---|---|---|
| `Foto` | Obra publicada. Es una colección *upload*: guarda solo las versiones web, nunca el original (§6.2). | `titulo` (obligatorio, máx. 120), `slug` (único), `lugar` (obligatorio), `fecha` (obligatoria; fecha de la toma), `historia` (opcional, texto enriquecido), `textoAlternativo` (opcional; si falta se usa `titulo`), `datosTecnicos` (grupo opcional: cámara, lente, distancia focal, apertura, velocidad, ISO, cada uno con su propio interruptor `visible`), `proporcion` (calculada: `3:2`, `4:5`, `1:1`, `16:9`, `panoramica`… y el valor decimal), `ancho` y `alto` (px de la versión mayor), `colorDominante` (para el marcador de carga), `colecciones` (relación con `Coleccion`, varias), `caracteristicas` (relación con `Caracteristica`, varias), `formatos` (relación con `FormatoImpresion`, varias, filtrada por proporción compatible), `papeles` (relación con `TipoPapel`, varias), `estado` (`borrador`, `publicada`, `despublicada`), `destacada` (booleano, para la portada), `huella` (hash del archivo, para detectar duplicados). |
| `Coleccion` | Serie o proyecto que agrupa fotos. | `nombre`, `slug`, `descripcion` (opcional), `portada` (relación con `Foto`), `orden` (lista ordenada de `Foto`), `estado` (`publicada`, `oculta`), `slugsAnteriores`. |
| `Caracteristica` | Etiqueta transversal que sirve de filtro, por ejemplo "Blanco y negro", "Paisaje", "Nocturna" o "Araucanía". | `nombre`, `slug`, `slugsAnteriores`. |
| `FormatoImpresion` | Tamaño de copia disponible, del catálogo global. | `nombre` (por ejemplo "30 × 45 cm"), `anchoCm`, `altoCm`, `proporcion` (calculada), `activo`. |
| `TipoPapel` | Papel de impresión del catálogo global. | `nombre`, `descripcion` breve (por ejemplo "Algodón mate, textura suave"), `activo`. |
| `Pagina` | Página editable: "Sobre mí", "Contacto" y páginas libres. | `titulo`, `slug`, `contenido` (bloques), `imagen` (opcional), `estado`, campos SEO. |
| `Consulta` | Solicitud de un interesado por una o más copias. | `nombre`, `correo`, `telefono` (opcional), `mensaje`, `fotos` (relación con `Foto`, una o más), `formatoPreferido` y `papelPreferido` (opcionales), `estado` (`nueva`, `respondida`, `cerrada`, `spam`), `avisoEnviado` (booleano), `intentosAviso`, `ultimaActividad`, `eliminarDespuesDe` (calculado), `notasInternas`. |
| `Usuario` | Cuenta del panel. Solo existe Rod. | `correo`, `contrasena` (gestionada por Payload). |
| `AjustesSitio` (global Payload) | Datos del sitio que no van en el código. | `nombreSitio` ("Fotos de Rod"), `descripcion`, `correoContacto`, `correoAviso`, `redes` (Instagram, etc.), `fotoPortada` (relación con `Foto`, opcional), textos de la llamada a consulta y aviso de derechos de autor. |

Relaciones clave:

- Una `Foto` pertenece a cero o más `Coleccion` y tiene cero o más `Caracteristica`.
- Una `Foto` ofrece cero o más `FormatoImpresion` (solo los de proporción compatible) y cero o más `TipoPapel`.
- Una `Consulta` referencia una o más `Foto`.

`FormatoImpresion` y `TipoPapel` se modelan como catálogos independientes asociados por foto, para que en la v2 puedan convertirse en las variantes de producto (formato × papel) sin migrar datos.

### 6.2 Reglas de negocio transversales

1. **Originales.** El sitio **no conserva el original**. Al subir, `sharp` genera las versiones web y el archivo subido se descarta. Rod mantiene sus originales fuera del sitio.
   *Alternativa descartada:* guardar el original en un directorio privado del volumen. Ocupa espacio con costo, abre la puerta a una fuga y el sitio no lo necesita.
2. **Versiones web.** Se generan versiones de 480, 1200 y **2048 px como tope en el lado largo**, en AVIF y WebP, con fallback JPEG de 1200 px. Todas van en sRGB y sin metadatos. 2048 px equivale a unos 17 cm de lado largo a 300 ppp, insuficiente para una copia de calidad. Ese tope es la protección efectiva de la obra.
3. **Captura y descarga.** Se disuade la descarga: sin menú contextual sobre la foto, sin arrastre y sin URL a un archivo grande, porque no existe. **No se promete** bloquear las capturas de pantalla, porque en la web no es posible. No se usa marca de agua.
4. **Proporción y formatos.** La proporción se calcula del ancho y alto en píxeles y se normaliza a la proporción estándar más cercana con ±2 % de tolerancia. Una foto solo puede ofrecer formatos cuya proporción sea compatible dentro de esa tolerancia. Si Rod intenta asociar uno incompatible, el panel lo impide con un mensaje. Una foto sin formatos se puede publicar, y su ficha dice "Tamaños a pedido".
5. **Publicación.** Solo se ven en público las `Foto` con `estado = publicada`. Una `Coleccion` sin fotos publicadas no se muestra.
6. **Duplicados.** Al subir una foto cuya `huella` ya existe, el panel avisa y pide confirmación.
7. **Consultas: guardar primero, avisar después.** La consulta se guarda en la base de datos y recién entonces se envía el aviso por correo. Si el envío falla, se reintenta hasta 5 veces con espera creciente. Si sigue fallando, la consulta queda con `avisoEnviado = false` y se destaca en el panel. Ninguna consulta se pierde por una falla de correo.
8. **Conservación de consultas.** Se conservan **12 meses desde `ultimaActividad`**. Un proceso diario borra las vencidas. Las marcadas `spam` se borran a los 30 días.
9. **Antispam (v1).** Campo trampa oculto, tiempo mínimo de llenado (3 s), límite de 5 consultas por hora por IP y validación del formato del correo. No se usa captcha en la v1. Turnstile queda como opción v1.x.
10. **Datos, no código.** Textos, nombre del sitio, enlaces a redes y correos se administran desde `AjustesSitio` y `Pagina`. Nunca se escriben en el código.
11. **Fechas.** Se guardan como instantes UTC y se muestran en America/Santiago. Las medidas de impresión se expresan en cm (ancho × alto) con su proporción explícita.

### 6.3 Interfaces (rutas)

| Ruta | Qué muestra |
|---|---|
| `/` | Portada: foto destacada, colecciones y acceso a todas las fotos. |
| `/fotos` | Todas las fotos publicadas, con filtro por `Caracteristica` (`?caracteristica=<slug>`). |
| `/colecciones/[slug]` | Una colección, en el orden definido por Rod. |
| `/fotos/[slug]` | Ficha de foto con la llamada a "Pedir una copia". |
| `/consulta` (o modal en la ficha) | Formulario de consulta. Se define en su documento. |
| `/sobre-mi`, `/contacto`, `/[slug]` | Páginas. |
| `/admin` | Panel Payload, solo para Rod. |
| `/api/...` | API de Payload y endpoint de envío de consultas. |
| `/sitemap.xml`, `/robots.txt` | SEO. |

Los contratos detallados (campos del formulario, respuestas y errores) los define cada documento de componente.

### 6.4 Carpetas y estructura de código

```
Web_RodDiaz/
├── CLAUDE.md
├── README.md
├── DocumentosTecnicos/          # raíz documental (ver §9)
└── src/
    ├── app/
    │   ├── (sitio)/             # rutas públicas
    │   └── (payload)/           # panel y API de Payload
    ├── colecciones/             # Foto.ts, Coleccion.ts, Caracteristica.ts, FormatoImpresion.ts, TipoPapel.ts, Pagina.ts, Consulta.ts, Usuario.ts
    ├── globales/                # AjustesSitio.ts
    ├── componentes/             # UI del sitio público
    ├── lib/                     # imagenes (sharp), proporcion, correo, antispam
    ├── tareas/                  # trabajos programados (aviso pendiente, borrado de consultas)
    └── payload.config.ts
```

Carpetas de dominio documental confirmadas: `identidad/`, `contenido/`, `portafolio/`, `consultas/`, `paginas/`, `plataforma/` y `decisiones/`.

### 6.5 Rendimiento y seguridad

- **Rendimiento:** LCP menor a 2,5 s en móvil 4G, CLS menor a 0,1 y página de ficha menor a 300 KB en la primera carga (sin contar la foto). Las páginas públicas se generan de forma estática o con revalidación al publicar.
- **Seguridad:** panel en `/admin` con la autenticación de Payload, contraseña robusta y bloqueo tras intentos fallidos. Secretos (base de datos, Gmail, clave de Payload) solo en variables de entorno de Railway, nunca en el repositorio. HTTPS obligatorio. Cabeceras de seguridad básicas (CSP, `X-Frame-Options`, `Referrer-Policy`). Las versiones de imagen se sirven desde la ruta de medios de Payload, sin listado de directorios.

### 6.6 Stack

| Pieza | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Aplicación | **Next.js + TypeScript con Payload CMS 3**, en un solo servicio | Payload 3 vive dentro de la app Next.js: panel, colecciones, medios y páginas se definen en código y quedan versionados en el repo. | WordPress, por el diseño limitado por temas, la mantención de plugins y la configuración fuera del repo. Construir el panel desde cero, porque serían semanas reinventando un CMS. |
| Base de datos | **PostgreSQL** en Railway | Adaptador oficial de Payload y servicio administrado en la misma cuenta. | SQLite: más simple, pero frágil con despliegues y volúmenes. |
| Imágenes | **Volumen de Railway** montado en la app, procesado con `sharp` | Menos piezas: no se suma ningún servicio de almacenamiento y el tamaño es acotado, porque solo se guardan versiones web. | Bucket S3 o R2: otra cuenta y otra configuración, sin necesidad con este volumen de fotos. |
| Correo de aviso | **Gmail SMTP** con contraseña de aplicación (adaptador nodemailer de Payload) | Rod ya tiene Gmail, sin costo y sin servicios nuevos. El volumen esperado está muy por debajo del límite diario de Gmail. | Resend: más robusto, pero es otra cuenta. |
| Analítica | **Cloudflare Web Analytics** | Gratis, sin cookies (no requiere banner), una línea de código y sin mantención. La misma cuenta servirá para el DNS del dominio. | Umami autoalojado: consume recursos de Railway y requiere mantención. GA4: usa cookies, exige consentimiento y pesa más. |
| Hosting | **Cuenta Railway existente de Rod** | Costo hundido. | Vercel: separaría la app del volumen y la base de datos. |
| Dominio | Subdominio de Railway en la v1. Dominio propio en v1.x. | Costo cero en la v1. | — |

**Costo incremental de la v1: cero**, siempre que el consumo de Railway quede dentro del plan vigente de Rod (riesgo R-02).

## 7. Cumplimiento normativo transversal

### 7.1 Datos personales de los interesados

- **Normativa:** Ley 19.628 (vigente) y **Ley 21.719**, con entrada en vigencia el **1 de diciembre de 2026**. El 1 de septiembre de 2026 ingresó un proyecto (Boletín N° 18.623-07) para postergarla al 1 de diciembre de 2027. Aún no es ley y sigue en tramitación (fuente: [Alerta legal Cariola, septiembre 2026](https://www.cariola.cl/app/uploads/2026/09/Alerta-legal_-2septiembre.pdf), consultada el 2026-10-07). **El sitio se diseña para cumplir la Ley 21.719 desde el lanzamiento**, sin importar la prórroga. Esta fecha se reverifica en cada componente que trate datos personales.
- **Datos:** nombre, correo, teléfono (opcional) y mensaje. Son los mínimos para responder.
- **Finalidad:** responder la consulta por una copia. No se usan para marketing ni se agregan a listas.
- **Base de licitud:** consentimiento del interesado al enviar el formulario, con un texto breve y un enlace a la política de privacidad.
- **Responsable:** Rod. Correo de contacto para ejercer derechos: el de `AjustesSitio.correoContacto`.
- **Conservación:** 12 meses desde la última actividad, y luego borrado automático (§6.2.8).
- **Derechos (acceso, rectificación, supresión, oposición):** por correo a Rod, que los ejecuta desde el panel. El documento `consultas/consulta-copia.md` define el procedimiento.
- **Terceros:** Railway (hosting y base de datos), Google (Gmail, para el aviso a Rod; los datos viajan en el correo) y Cloudflare (analítica sin datos personales ni cookies). La política de privacidad los menciona.
- **Política de privacidad:** es una `Pagina` obligatoria antes del lanzamiento.

### 7.2 Metadatos de las fotos

Ninguna versión publicada lleva EXIF, IPTC, XMP, coordenadas GPS ni número de serie de la cámara. Los datos técnicos que se muestran salen **solo** de los campos de `Foto.datosTecnicos` que Rod deja visibles.

### 7.3 Propiedad intelectual

Rige la Ley 17.336. El pie de página muestra "© <año> Rod Díaz. Todos los derechos reservados". Una página breve de condiciones indica que las fotos no se pueden reproducir sin autorización.

### 7.4 Cookies y analítica

La v1 no usa cookies de rastreo, por lo que no requiere banner. Si un componente futuro introduce cookies no esenciales, deberá agregar consentimiento y marcar este marco para revisión.

### 7.5 Consumo y tributario

Fuera de alcance mientras la venta sea 1:1. Se revisa al activar la v2.

## 8. Elementos obsoletos

No aplica: es el primer documento del proyecto y no hay código ni documentos previos. La instrucción del proyecto queda como contexto. Desde la aprobación de este marco, su §1.1 ("resumen provisional") deja de regir y se reemplaza por este documento.

## 9. Plan de acción y documentos hijos

### 9.1 Documentos (en orden)

| # | Documento | Ruta | Tipo | Fase | Depende de |
|---|---|---|---|---|---|
| 1 | Identidad visual y sistema de diseño | `identidad/sistema-de-diseno.md` | Transversal | v1.0 | Marco |
| 2 | Modelo de contenido y panel de administración | `contenido/modelo-contenido-panel.md` | Componente | v1.0 | Marco |
| 3 | Galería y colecciones | `portafolio/galeria-colecciones.md` | Componente | v1.0 | 1, 2 |
| 4 | Ficha de foto | `portafolio/ficha-foto.md` | Componente | v1.0 | 1, 2, 3 |
| 5 | Consulta de copia y avisos | `consultas/consulta-copia.md` | Componente | v1.0 | 2, 4 |
| 6 | Páginas (sobre mí, contacto, privacidad, condiciones) | `paginas/paginas.md` | Componente | v1.0 | 1, 2 |
| 7 | SEO y analítica | `plataforma/seo-analitica.md` | Transversal | v1.0 | 3, 4, 6 |
| 8 | Despliegue y dominio | `plataforma/despliegue.md` | Transversal | v1.0 | 2 |

Los documentos 1 y 2 quedan desbloqueados en paralelo al aprobar el marco. Se recomienda partir por el 1, porque la identidad condiciona todo lo visible.

### 9.2 Plan de implementación (para Claude Code, una vez aprobados los documentos)

1. **Base del proyecto.** Next.js + Payload 3 + Postgres local, estructura del §6.4 y `AjustesSitio`. *Terminado cuando:* `/admin` levanta en local y existe el usuario de Rod.
2. **Modelo de contenido** (doc 2). *Terminado cuando:* todas las colecciones del §6.1 existen y la subida de una foto genera sus versiones sin metadatos.
3. **Sistema de diseño** (doc 1). *Terminado cuando:* existen los tokens y los componentes base.
4. **Galería y ficha** (docs 3 y 4). *Terminado cuando:* se puede navegar de la portada a una ficha en dos clics.
5. **Consulta** (doc 5). *Terminado cuando:* una consulta se guarda aunque el correo falle.
6. **Páginas** (doc 6).
7. **SEO y analítica** (doc 7).
8. **Despliegue** (doc 8). *Terminado cuando:* el sitio está público en Railway con las 12 fotos de lanzamiento.

## 10. Métricas y criterios de aceptación del marco

**Métricas del producto**

| Métrica | Dónde se mide |
|---|---|
| Consultas por mes y respondidas por mes (indicador de la v2) | Panel (resumen en `Consulta`) |
| Visitas, páginas más vistas y origen (Instagram, Google, directo) | Cloudflare Web Analytics |
| Velocidad (LCP, CLS) | Cloudflare Web Analytics y Lighthouse |

**Criterios de aceptación de este documento**

- Rod confirma actores, nombres oficiales de entidad, alcance por versión, criterio de la v2 y stack.
- Cada documento hijo del §9.1 tiene ruta, fase y dependencias.
- No quedan decisiones abiertas que bloqueen los documentos 1 y 2.

## 11. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R-01 | El correo de Gmail cae en spam o falla la contraseña de aplicación. | Media | Medio | Se guarda primero, se reintenta y se marca "aviso pendiente" en el panel. Telegram queda en v1.x. |
| R-02 | El consumo de Railway supera el plan o crédito vigente y genera costo. | Baja | Medio | Solo se guardan versiones web, un solo servicio de app y alerta de uso en Railway (T-004). |
| R-03 | Pérdida del volumen o de la base de datos. | Baja | Alto | Respaldo periódico de la base de datos y del volumen, a definir en `plataforma/despliegue.md`. Rod tiene los originales. |
| R-04 | Copia no autorizada por captura de pantalla. | Alta | Bajo | Tope de 2048 px y aviso de derechos. Se asume como riesgo aceptado. |
| R-05 | Mala experiencia en el navegador de Instagram (memoria o tiempos). | Media | Alto | Presupuesto de peso y pruebas en el navegador de Instagram como criterio de aceptación de galería y ficha. |
| R-06 | Spam en el formulario. | Media | Bajo | Defensas de §6.2.9. Turnstile en v1.x. |
| R-07 | Cambio de fecha de la Ley 21.719. | Media | Bajo | Se diseña para cumplirla desde el inicio y se reverifica en cada componente. |
| R-08 | Portada pobre al lanzar. | Media | Alto | Mínimo de 12 fotos publicadas para lanzar (T-005). |

## 12. Decisiones abiertas y tareas del dueño

**Decisiones abiertas (no bloquean los documentos 1 y 2)**

- D-01. ¿El formulario de consulta va en un modal dentro de la ficha o en una página propia? Se decide en `consultas/consulta-copia.md`.
- D-02. Política de respaldo (frecuencia y destino gratuito). Se decide en `plataforma/despliegue.md`.

**Tareas del dueño**

| Id | Categoría | Tarea | Bloquea |
|---|---|---|---|
| T-001 | desarrollo | Crear el repositorio privado `RodDiazT/Web_RodDiaz` en GitHub y dar acceso a la app de Claude. | Todo (subir documentos) |
| T-002 | desarrollo | Crear una contraseña de aplicación de Gmail para los avisos de consulta. | Implementación del doc 5 |
| T-003 | desarrollo | Crear una cuenta gratis de Cloudflare y activar Web Analytics. | Implementación del doc 7 |
| T-004 | desarrollo | Confirmar el plan o crédito vigente de Railway y activar la alerta de uso. | Doc 8 |
| T-005 | contenido | Seleccionar al menos 12 fotos de lanzamiento con título, lugar y fecha. | Lanzamiento |
| T-006 | contenido | Definir el catálogo inicial de tamaños (cm) y tipos de papel. | Implementación del doc 2 |
| T-007 | contenido | Escribir el texto de "Sobre mí" y elegir una foto de perfil. | Doc 6 |

## 13. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 2026-10-07 | Borrador inicial. Decisiones de Rod: Característica como etiqueta transversal, v2 por decisión de Rod con indicador de consultas en el panel, sin marca de agua, analítica lo más simple posible (Cloudflare Web Analytics), aviso por Gmail, conservación de consultas por 12 meses, nombre del sitio "Fotos de Rod". |

# SEO

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/plataforma/seo.md` |
| Tipo | Transversal |
| Versión | 1.2 |
| Estado | Aprobado |
| Fecha | 2026-10-20 |
| Padre | `marco-general/marco-general-proyecto.md` (1.9) |
| Dependencias | `portafolio/galeria-colecciones.md` (1.2), `portafolio/ficha-foto.md` (1.3), `paginas/paginas.md` (1.2) |
| Versión del producto | v1.0 |

## Índice

1. Contexto y objetivo
2. Alcance
3. Flujo de usuario y UX/UI cuestionado
4. Casos borde
5. Especificación técnica
   - 5.1 Modelo de datos
   - 5.2 Reglas de negocio específicas
   - 5.3 Interfaces
   - 5.4 Componentes y estructura de código
   - 5.5 Rendimiento y seguridad
   - 5.6 Stack
6. Cumplimiento normativo
7. Elementos obsoletos
8. Plan de acción
9. Criterios de aceptación y pruebas
10. Riesgos
11. Decisiones abiertas y tareas del dueño
12. Control de cambios

---

## 1. Contexto y objetivo

**Problema.** El marco (§1) define al Visitante como alguien que llega por primera vez desde Google, Instagram o un enlace compartido. Sin SEO, Google no sabe qué hay en cada foto ni de quién es, y un enlace pegado en WhatsApp aparece como un rectángulo gris sin foto. Ese primer contacto ocurre **fuera** del sitio, así que es donde la foto tiene que empezar a ser protagonista.

**Actores.** Visitante (encuentra y reconoce la foto antes de entrar) y Administrador (sabe qué búsquedas lo traen, sin tocar código).

**Resultado esperado.**

1. Cada ficha, colección y característica es una página que Google entiende y puede mostrar, con un título que dice qué es y dónde fue tomada.
2. Un enlace compartido en WhatsApp, Instagram, Facebook o X muestra **la foto completa** con la marca "Rod Díaz", sin recortes feos en verticales ni panorámicas.
3. Google sabe que las fotos son de Rod: autoría, © y etiqueta "Con licencia" en Google Imágenes, con un camino directo a la consulta.
4. Los asistentes de IA que buscan en la web pueden encontrar y citar el sitio; a los robots que solo entrenan modelos se les pide no entrar.
5. Rod ve en Google Search Console qué búsquedas lo encuentran, gratis y sin poner nada en el navegador del visitante.

**Filtro de valor (método §6).** (1) Problema real: el visitante desde Google y desde enlaces compartidos es el actor de referencia del marco. (2) Costo: cero en servicios; se apoya en la API de metadatos de Next.js y en `sharp`, que ya están. (3) Versión: el marco §2 lo pone en v1.0. **Pasa.**

Referencias al marco: rutas §6.3, entidades §6.1, metadatos de fotos §7.2, propiedad intelectual §7.3, cookies §7.4, rendimiento §6.5.

## 2. Alcance

**Incluye (v1.0)**

- Títulos, descripciones y URL canónica de todas las rutas públicas.
- Reglas de indexación (`index`/`noindex`) y códigos de estado para buscadores, incluida la página amable de foto no disponible (encargo de `ficha-foto` §11).
- Indexación de `?pagina=` y `?caracteristica=` (encargo de `galeria-colecciones` §11): cada característica es una página indexable de `/fotos`.
- Imagen de vista previa (Open Graph y X) en lienzo de 1200 × 630 con la foto completa y la `Marca`, y sus etiquetas.
- Datos estructurados JSON-LD: sitio y autor, fotos (`ImageObject` con licencia), colecciones, migas de pan y perfil en "Sobre mí".
- `/sitemap.xml` con imágenes y `/robots.txt` con la política de robots de IA de Rod (búsqueda sí, entrenamiento no), editable desde el panel.
- URL base del sitio en una variable de entorno y redirección 301 desde cualquier otro host, para el paso futuro al dominio propio.
- Preparación para Google Search Console: etiqueta de verificación pegada en Ajustes del sitio.

**No incluye**

- Analítica de visitas (marco §2: v1.x).
- La compra del dominio y el procedimiento de mudanza en Railway: `plataforma/despliegue.md` (v1.x). Este documento solo deja el código listo para ello (§5.2.4).
- Datos estructurados de producto u oferta (`Product`, `Offer`): exigen precio, y la v1 no publica precios (marco §2). Quedan para la v2.
- `hreflang` y otros idiomas (marco §2: futuro).
- Escribir los textos: la descripción del sitio la escribe Rod (T-011).

**Para versiones posteriores**

- *v1.x:* Bing Webmaster Tools (importa la verificación de Search Console; un clic). Propuesta P-S1 (§11).
- *v2:* `Product` y `Offer` en las fichas cuando haya precios.

## 3. Flujo de usuario y UX/UI cuestionado

### 3.1 Qué ve el visitante antes de entrar al sitio

**En Google (web).** Un resultado con el título "Amanecer en el Llaima, Conguillío · Rod Díaz", la descripción con el inicio de la historia (o "Fotografía de Conguillío, marzo de 2025. Disponible como copia impresa.") y el favicon "RD" del sistema de diseño.

**En Google Imágenes.** La foto, con "Rod Díaz" como crédito y la etiqueta "Con licencia". Al tocar la etiqueta, Google ofrece "Condiciones de uso" (`/condiciones`) y "Obtener esta imagen" (la consulta de esa foto).

**En WhatsApp, Instagram (mensajes directos), Facebook, LinkedIn y X.** Una tarjeta grande con la foto **entera** sobre el grafito del sitio y "Rod Díaz" pequeño abajo, más el título y la descripción. Una vertical se ve vertical, centrada; una panorámica, de lado a lado. Nada queda cortado por la red.

**En un asistente de IA con búsqueda.** Si alguien pregunta por fotógrafos de paisaje en la Araucanía, el asistente puede leer el sitio y enlazarlo, porque sus robots de búsqueda tienen paso libre.

### 3.2 La imagen de vista previa (decisión de Rod: foto completa + marca)

```
┌──────────────────────── 1200 × 630, fondo #151515 ────────────────────────┐
│                                                                            │
│                     ┌──────────────────────────────┐                       │
│                     │                              │   área de la foto:    │
│                     │      foto completa, sin      │   1104 × 494 px       │
│                     │     recorte, centrada en     │   (márgenes 48 px a   │
│                     │       el área disponible     │   los lados, 40 px    │
│                     │                              │   arriba)             │
│                     └──────────────────────────────┘                       │
│                                                                            │
│                                Rod Díaz                 franja de 96 px    │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Marca.** Sin `logo`: `nombreSitio` en Cormorant Garamond 500, 30 px, `#ECECEC`, centrado en la franja inferior. Con `logo`: el logo a 32 px de alto, máx. 200 px de ancho (las mismas medidas que la `Marca` del sistema de diseño §5.4).
- **Sin filete, sin sombras, sin texto adicional.** La interfaz se retira también aquí (marco §4.2.1).
- **Por qué no el título dentro de la imagen.** Las redes ya muestran el título debajo de la tarjeta; repetirlo encima de la foto le quita protagonismo y obliga a manejar títulos largos en una imagen.
- **Recorte de WhatsApp.** En la vista pequeña, WhatsApp recorta la imagen a un cuadrado central. Como la foto está centrada, ese cuadrado muestra el corazón de la foto, nunca solo fondo vacío, salvo en panorámicas muy alargadas (caso borde §4).

### 3.3 Objeciones planteadas al flujo y su resolución

| # | Objeción | Resolución |
|---|---|---|
| O-1 | Indexar el subdominio de Railway "ensucia" la mudanza al dominio propio. | Decisión de Rod: indexar desde el lanzamiento. La URL base vive en `URL_SITIO`; todo otro host responde 301 a ella (§5.2.4). Al llegar el dominio, Google traspasa lo ganado con la redirección y la herramienta de cambio de dirección de Search Console. |
| O-2 | La foto tal cual como `og:image` es cero trabajo. | Descartada por Rod: las redes recortan verticales y panorámicas al centro de 1,91:1 y la foto se ve mutilada, contra la regla de no recortar del marco §5. |
| O-3 | El lienzo con marca se podría generar al subir la foto, junto con sus versiones. | Se genera **al pedirlo** y queda en caché por etiquetas (§5.2.6). Así un cambio de `logo` o de `nombreSitio` no obliga a regenerar cientos de imágenes, y fotos que nadie comparte no ocupan volumen. |
| O-4 | La etiqueta "Con licencia" puede atraer pedidos de uso que no son copias. | Rod lo acepta: las consultas por licencia llegan marcadas con `origen = licencia` (§5.2.8), así se distinguen en el panel. Las condiciones ya invitan a escribir para usar una foto (`paginas` Anexo B). |
| O-5 | Bloquear todos los robots de IA protege más la obra. | Rod prefiere que la IA sepa que existe. Se distingue: robots de búsqueda y de consulta del usuario entran; robots de entrenamiento se excluyen (§5.2.10). Las fotos publicadas tienen como máximo 2048 px igual (marco §6.2.2). |
| O-6 | La página amable de foto no disponible debería responder 410. | Responde **200 con `noindex`**. Next.js no permite fijar 410 en una página generada estática sin abandonar la plantilla común, y un `notFound()` perdería el enlace "Ver <colección>" que exige `ficha-foto` §4. Con `noindex` Google la saca del índice igual; si Rod vuelve a publicar la foto, la URL recupera su lugar sin señales contradictorias. |
| O-7 | Las páginas siguientes (`?pagina=2`) son contenido repetido y deberían ir a la primera. | Cada página siguiente es canónica de sí misma e indexable, como recomienda Google para paginación, pero **no** entra al sitemap. Son el camino de rastreo hacia fichas antiguas; las fichas sí están todas en el sitemap. |
| O-8 | Una descripción obligatoria por foto da el mejor resultado. | Decisión de Rod: automática con campo opcional para reemplazarla. Publicar no suma pasos. |

### 3.4 Estados

No hay interfaz pública nueva: todo vive en el `<head>`, en imágenes generadas y en archivos para robots. En el panel, la pestaña **SEO** de Ajustes del sitio (§5.1) muestra:

- **Vacío:** "Pega aquí el código de verificación de Google Search Console" con un enlace de ayuda a la guía de §11 (T-010).
- **Error:** código mal pegado → "Pega solo el código, sin `<meta>` ni comillas. Por ejemplo: `AbC123…`".
- **Éxito:** guardado normal de Payload.

En la ficha de una `Foto` del panel, el campo opcional **Descripción para buscadores** muestra como ayuda (marcador de posición) la descripción automática que se usará si queda vacío, y un contador de caracteres hasta 160.

## 4. Casos borde

| Caso | Resolución |
|---|---|
| Foto sin historia | Descripción automática con lugar, mes y año, y "Disponible como copia impresa." si ofrece copia (§5.2.2). |
| Foto de vitrina (sin formatos ofrecibles) | Descripción sin la frase de copia. `acquireLicensePage` apunta a la consulta general con `origen = licencia` (la consulta no acepta fotos sin copia, `consulta-copia` §5.2.1). |
| Título muy largo | Si el título completo pasa de 65 caracteres, se omite el lugar; si aún pasa, se corta en la última palabra completa con "…" antes de " · Rod Díaz" (§5.2.1). |
| El título ya contiene el lugar ("Atardecer en Conguillío" en Conguillío) | No se repite: la comparación ignora mayúsculas y tildes. |
| Comillas, `&`, emojis o `</script>` en título o historia | Next.js escapa las etiquetas `<meta>`. El JSON-LD se serializa con `<`, `>` y `&` reemplazados por sus secuencias `<`, `>`, `&`, para que un texto nunca cierre el `<script>` (§5.5). |
| Foto despublicada que estuvo publicada | Página amable con **200** y `noindex, follow` (O-6), sin `og:image` propia (usa la del sitio) y fuera del sitemap. |
| Foto nunca publicada o inexistente | 404 (ya definido en `ficha-foto` §4). |
| Slug anterior de foto, colección o característica | 308 al vigente (ya definido). La canónica y el sitemap usan solo el slug vigente. |
| Hija con `visibleSola = false` | Redirige 308 a la madre (ya definido) y no entra al sitemap. |
| Característica sin fotos visibles | No entra al sitemap. Su URL muestra la plantilla de filtro sin resultados con `noindex`. |
| `?caracteristica=` desconocida | Plantilla de filtro sin resultados (ya definido) con `noindex`. |
| Colección con filtro (`/colecciones/x?caracteristica=y`) | Canónica a `/colecciones/x` sin parámetros: es una variante de la colección, no una puerta de entrada nueva (decisión de Rod: solo los filtros de `/fotos` se indexan). |
| Parámetros de campaña o de redes (`utm_*`, `fbclid`, `igshid`) o de contexto (`?coleccion=`) | La canónica los omite siempre. Solo conserva `caracteristica` y `pagina` en `/fotos`, y `pagina` en colecciones, en ese orden fijo. |
| `?pagina=1` explícito | Canónica sin `pagina`. |
| Sin `fotoPortada` | La imagen de vista previa del sitio usa la regla de respaldo de `modelo-contenido-panel` §4 (primera destacada visible; si no, la más reciente). Sin ninguna foto visible: lienzo grafito solo con la marca. |
| Panorámica muy alargada (3:1 o más) | Ocupa el ancho del área (1104 px) y queda baja. En el recorte cuadrado de WhatsApp se ve una franja central: aceptado, es la foto real. |
| Rod cambia `logo` o `nombreSitio` | Las imágenes de vista previa se invalidan por la etiqueta `ajustes` y cambian su parámetro de versión, así las redes piden la nueva (§5.2.6). |
| WhatsApp o Facebook guardan una vista previa vieja | La URL de `og:image` lleva `?v=<huella corta de la última modificación>`; cambiar la foto o la marca cambia la URL y fuerza a pedirla de nuevo. |
| Sitio sin `AjustesSitio.descripcion` | Se usa "Fotografías de Rod Díaz." (`nombreSitio`) y `plataforma/despliegue.md` exige la descripción en su lista de lanzamiento (T-011). |
| Código de Search Console mal pegado | Validación: solo letras, números, `-` y `_`, de 20 a 100 caracteres. Si Rod pega la etiqueta `<meta>` completa, se extrae el valor de `content` automáticamente. |
| Rod agrega `Googlebot` o `*` a los robots excluidos | Validación: no se admiten `*`, `Googlebot`, `Googlebot-Image`, `Bingbot`, ni robots de búsqueda de IA (`OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`): "Ese robot es de un buscador; bloquearlo te sacaría de las búsquedas." |
| Entorno de pruebas en Railway (si algún día existe) | Si `ENTORNO ≠ produccion`: `robots.txt` excluye todo y toda respuesta lleva `X-Robots-Tag: noindex`. |
| Respuestas JSON de `/api` o `/datos` | Llevan `X-Robots-Tag: noindex`; los archivos de imagen bajo `/api` **no** (Google Imágenes debe poder indexarlos) (§5.2.9). |
| `/consulta` | Rastreable (no se bloquea en `robots.txt`, para que Google vea su `noindex`), `noindex, nofollow` (ya definido en `consulta-copia`). |
| `/admin` | Excluido en `robots.txt` y `noindex` por cabecera. |
| Página libre publicada | Entra al sitemap y es indexable (decide lo que `paginas` §3.4 dejó abierto). Si Rod quiere una página sin buscadores, la deja en borrador o se agrega un interruptor en v1.x. |
| "Sobre mí" en borrador | 404 (ya definido) y fuera del sitemap; el JSON-LD `Person` del sitio sigue en la portada. |
| Muchas fotos (cientos) | Un solo sitemap; el límite de Google es 50.000 URL. |
| Un robot de IA ignora `robots.txt` | No hay bloqueo real (como con las capturas, marco §6.2.3); la protección efectiva sigue siendo el tope de 2048 px. Riesgo aceptado (SEO-03). |

## 5. Especificación técnica

### 5.1 Modelo de datos

Nombres oficiales del marco §6.1. **Marcados con ◆** los campos nuevos (cambio al marco 1.7 y a `modelo-contenido-panel` 1.4 al aprobar; §7).

#### `Foto`

| Campo | Tipo | Reglas |
|---|---|---|
| `seo` ◆ | grupo: `descripcion` (texto, máx. 160, opcional) | Etiqueta del panel: "Descripción para buscadores (opcional)". Si queda vacío, rige §5.2.2. Ayuda: muestra la automática. |

#### `AjustesSitio` (pestaña nueva **SEO** ◆)

| Campo | Tipo | Reglas |
|---|---|---|
| `seo.tituloPortada` ◆ | texto, máx. 60 | Valor inicial "Rod Díaz · Fotografía" (sistema de diseño §11). Título de la portada. |
| `seo.verificacionGoogle` ◆ | texto, opcional | Código de verificación de Search Console. Validación y extracción de §4. Se publica solo en la portada como `<meta name="google-site-verification">`. |
| `seo.robotsExcluidos` ◆ | lista de texto | Robots a los que `robots.txt` pide no entrar. Valor inicial: `GPTBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`, `Applebot-Extended`, `CCBot`. Validación de §4. Ayuda: "Robots que entrenan inteligencias artificiales. No afecta tu aparición en Google ni en asistentes que buscan en la web." |

`AjustesSitio.descripcion` (ya existe) pasa a ser la descripción de la portada y del autor; ayuda nueva: "Una o dos frases, máx. 160 caracteres: qué fotografías y dónde. Aparece en Google y al compartir el sitio." Se agrega la validación de máx. 160.

`Pagina.seo.descripcion`, `Coleccion.descripcion` y `Foto.textoAlternativo` ya existen y se usan tal cual. No hay campos nuevos en `Coleccion`, `Caracteristica` ni `Pagina`.

### 5.2 Reglas de negocio específicas

#### 5.2.1 Títulos

Separador " · " (punto medio con espacios). `S` = `nombreSitio`. Máximo objetivo: 65 caracteres.

| Ruta | Título |
|---|---|
| `/` | `seo.tituloPortada` |
| `/fotos` | "Fotos · S" |
| `/fotos?caracteristica=<c>` | "<nombre de c> · Fotos · S" |
| `/fotos?…&pagina=N` (N ≥ 2) | El de su lista más " · Página N" antes de " · S" |
| `/colecciones` | "Colecciones · S" |
| `/colecciones/[slug]` | "<nombre> · S" (la hija: "<hija>, <madre> · S" si cabe; si no, "<hija> · S") |
| `/fotos/[slug]` | "<titulo>, <lugar> · S" (decisión de Rod), con las reglas de §4: sin lugar si no cabe o ya está en el título; corte con "…" si el título solo no cabe |
| Página amable de foto | "Foto no disponible · S" |
| `/sobre-mi`, `/contacto`, `/[slug]` | "<titulo de la Pagina> · S" |
| 404 | "Página no encontrada · S" |

Los rótulos fijos ("Fotos", "Colecciones", "Página", "Foto no disponible", "Página no encontrada") son interfaz y viven en el código, como los de `ficha-foto` §5.2.10. El nombre del sitio y el título de portada son datos.

#### 5.2.2 Descripciones

Texto plano, sin saltos de línea, cortado en la última palabra completa antes de 155 caracteres, con "…" si se cortó.

| Ruta | Fuente, en orden |
|---|---|
| `/` | `AjustesSitio.descripcion` → "Fotografías de S." |
| `/fotos/[slug]` | `Foto.seo.descripcion` → texto plano de `historia` → "Fotografía de <lugar>, <mes de año>." + " Disponible como copia impresa." si ofrece copia (`modelo-contenido-panel` §5.2.7). Mes y año como en `ficha-foto` §5.2.6. |
| `/colecciones/[slug]` | `Coleccion.descripcion` → "<n> fotografías de S en <nombre>." |
| `/fotos?caracteristica=<c>` | "<n> fotografías de S: <nombre de c>." |
| `/fotos`, `/colecciones` | `AjustesSitio.descripcion` → "Fotografías de S." |
| Páginas | `Pagina.seo.descripcion` → texto plano del inicio de `contenido`. |

`n` es la cantidad de fotos visibles; con 1, en singular.

#### 5.2.3 Indexación y canónica

| Ruta | Robots | Canónica | Sitemap |
|---|---|---|---|
| `/`, `/fotos`, `/colecciones` | `index, follow` | Sí misma | Sí |
| `/fotos?caracteristica=<c>` con fotos | `index, follow` | `/fotos?caracteristica=<c>` | Sí (decisión de Rod) |
| `/fotos?…&pagina=N`, `/colecciones/x?pagina=N` | `index, follow` | Sí misma con sus parámetros válidos | No (O-7) |
| `/colecciones/[slug]` visible | `index, follow` | Sí misma | Sí (madres e hijas con `visibleSola`) |
| `/colecciones/x?caracteristica=<c>` | `index, follow` | `/colecciones/x` | No |
| Filtro sin resultados o desconocido | `noindex, follow` | — | No |
| `/fotos/[slug]` visible | `index, follow` | `/fotos/[slug]` sin parámetros (mínimo de `ficha-foto` §5.5) | Sí, con su imagen |
| Página amable de foto | `noindex, follow`, HTTP 200 (O-6) | — | No |
| Páginas publicadas (reservadas y libres) | `index, follow` | Sí misma | Sí |
| `/consulta` | `noindex, nofollow` (ya definido) | — | No |
| 404 | `noindex` | — | No |

Todas las canónicas son absolutas, con `URL_SITIO` como base (Next.js `metadataBase`).

#### 5.2.4 URL base y host único (decisión de Rod: indexar desde el lanzamiento)

1. `URL_SITIO` (variable de entorno, obligatoria en producción): por ejemplo `https://rod-diaz.up.railway.app`. La fija `plataforma/despliegue.md`. Es la base de canónicas, `og:url`, sitemap, `robots.txt` y JSON-LD.
2. El *middleware* compara el host de cada petición con el de `URL_SITIO`. Si difiere, responde **301** a la misma ruta y parámetros en `URL_SITIO`. Excepciones: `localhost`, el chequeo de salud que defina `despliegue` y el callback de OAuth mientras se ajusta (lo detalla `despliegue`).
3. **Mudanza al dominio propio (v1.x, procedimiento en `despliegue`):** se agrega el dominio en Railway, se cambia `URL_SITIO` y se redespliega. Desde ese momento el subdominio responde 301 al dominio, ruta por ruta, sin cambiar código. En Search Console se agrega la propiedad del dominio y se usa "Cambio de dirección".

#### 5.2.5 Open Graph y X

En toda ruta indexable:

- `og:site_name` = S; `og:locale` = `es_CL`; `og:type` = `website`; `og:url` = canónica; `og:title` = título **sin** " · S" (la red ya muestra el sitio); `og:description` = descripción de §5.2.2.
- `og:image` = URL del lienzo (§5.2.6), con `og:image:width` 1200, `og:image:height` 630, `og:image:type` `image/jpeg` y `og:image:alt` = `textoAlternativo` de la foto usada (o `titulo`).
- `twitter:card` = `summary_large_image`. Si `AjustesSitio.redes` tuviera X, no se agrega `twitter:site` en la v1 (no hay campo de usuario de X; se evita deducirlo de la URL).

Imagen según la ruta:

| Ruta | Foto del lienzo |
|---|---|
| `/fotos/[slug]` | La propia foto |
| `/colecciones/[slug]` | `portada` o su respaldo (`modelo-contenido-panel` §4) |
| `/fotos?caracteristica=<c>` | Primera foto visible de esa lista |
| `/`, `/fotos`, `/colecciones`, páginas sin `imagen`, página amable, 404 | `fotoPortada` o su respaldo |
| Páginas con `imagen` (por ejemplo, Sobre mí con la foto de perfil) | El `Medio` de la página |

#### 5.2.6 Generación del lienzo

1. Rutas `GET /og/foto/[slug]` y `GET /og/medio/[id]` (§5.3), que responden un JPEG de 1200 × 630.
2. Se parte de la versión de **1200 px** de la foto (marco §6.2.2) o del `Medio`, ya en sRGB y sin metadatos.
3. Con `sharp`: lienzo de 1200 × 630 px.
   - **Fotos horizontales:** la foto se escala con `fit: 'inside'` dentro de 1104 × 494 px sobre fondo `#151515`.
   - **Fotos verticales y cuadradas (optimización WhatsApp / redes móviles):** para evitar que la foto parezca una estampilla diminuta cuando WhatsApp o iMessage recortan la vista previa a un cuadrado central de 630 × 630 px, el lienzo de 1200 × 630 px se compone con un fondo atenuado y desenfocado de la propia obra (o centrado a escala completa útil) de modo que en el recuadro central de 630 × 630 px la obra sea la protagonista absoluta.
4. Marca: sin `logo`, el texto `nombreSitio` se rasteriza con la entrada `text` de `sharp` usando el archivo de Cormorant Garamond 500 que ya trae el sistema de diseño (`fontfile`), 30 px, `#ECECEC`, máx. 600 px de ancho; con `logo`, el logo rasterizado a 32 px de alto (SVG o PNG). Centrado en la franja inferior de 96 px.
5. Salida JPEG calidad 82, progresiva, `mozjpeg`, perfil ICC sRGB y ningún otro metadato (marco §7.2). Objetivo: menos de 200 KB; máximo aceptado: 300 KB.
6. **Caché:** la respuesta se guarda en la caché de datos de Next.js con las etiquetas `foto:<id>`, `foto:<slug>` (o `medio:<id>`) y `ajustes`, unificadas con los *hooks* de `modelo-contenido-panel` §5.2.12. Cabecera `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`.
7. **Versión en la URL:** las etiquetas `og:image` llevan `?v=` con los 8 primeros caracteres del SHA-1 de `updatedAt` de la foto (o `Medio`) más `updatedAt` de `AjustesSitio`. El parámetro no cambia el resultado; solo obliga a las redes a pedir de nuevo cuando algo cambió.
8. Solo se generan lienzos de fotos **visibles** y de `Medio` usados por páginas publicadas o por el sitio; cualquier otro pedido responde 404.

#### 5.2.7 Datos estructurados (JSON-LD)

Un solo `<script type="application/ld+json">` por página con un `@graph`. Identificadores estables: `<URL_SITIO>/#sitio` y `<URL_SITIO>/#autor`.

| Ruta | Nodos |
|---|---|
| Todas las indexables | `WebSite` (`@id` `#sitio`, `name` S, `url`, `inLanguage` `es-CL`, `publisher` → `#autor`) y `Person` (`@id` `#autor`, `name` S, `url` `URL_SITIO`, `description` `AjustesSitio.descripcion`, `sameAs` las URL de `AjustesSitio.redes`, `image` la `imagen` de Sobre mí si está publicada) |
| `/fotos/[slug]` | `ImageObject` de la foto (§5.2.8) y `BreadcrumbList`: Inicio → madre (si la hay) → colección → título |
| `/colecciones/[slug]` | `CollectionPage` (`name`, `description`, `url`, `primaryImageOfPage` → la portada) y `BreadcrumbList`: Inicio → Colecciones → madre (si la hay) → colección |
| `/fotos`, `/fotos?caracteristica=` , `/colecciones` | `CollectionPage` |
| `/sobre-mi` | `ProfilePage` con `mainEntity` → `#autor` |
| Otras páginas | `WebPage` |

No se emiten `Product`, `Offer`, `LocalBusiness` ni coordenadas (`geo`): no hay precios ni dirección pública, y el marco §7.2 prohíbe ubicación exacta.

#### 5.2.8 Autoría y licencia de cada foto (decisión de Rod: etiqueta "Con licencia" activada)

`ImageObject` de la ficha:

| Propiedad | Valor |
|---|---|
| `contentUrl` | URL absoluta de la versión WebP de 2048 px (o la mayor existente) |
| `thumbnailUrl` | Versión de 480 px |
| `width`, `height` | De esa versión |
| `name` | `titulo` |
| `description` | La descripción de §5.2.2 |
| `caption` | `textoAlternativo` o `titulo` |
| `dateCreated` | `fecha` (día, ISO) |
| `datePublished` | `publicadaEn` |
| `contentLocation` | `{ "@type": "Place", "name": lugar }`, solo texto |
| `creator` | → `#autor` |
| `creditText` | S |
| `copyrightNotice` | "© <año de `fecha`> S" |
| `copyrightHolder` | → `#autor` |
| `license` | `URL_SITIO/condiciones` (si la página está publicada; si no, se omiten `license` y `acquireLicensePage` y la foto queda sin etiqueta) |
| `acquireLicensePage` | Si ofrece copia: `URL_SITIO/consulta?foto=<slug>&origen=licencia`. Si es de vitrina: `URL_SITIO/consulta?origen=licencia` |
| `representativeOfPage` | `true` |

`origen = licencia` es un valor nuevo de `Consulta.origen` (cambio menor a `consulta-copia` 1.2, §7). La consulta lo acepta, lo guarda y lo muestra en el panel como "Licencia (Google Imágenes)"; el formulario no cambia.

#### 5.2.9 Sitemap y cabeceras de robots

- `/sitemap.xml` (generado, `app/sitemap.ts`): las URL marcadas "Sí" en §5.2.3, con `lastModified` = mayor `updatedAt` de lo que muestra la página (para listas, el de la foto visible más reciente o de la colección). Cada ficha agrega su imagen (`<image:loc>` con la versión de 2048 px). Sin `priority` ni `changefreq` (Google los ignora).
- Se revalida con las mismas etiquetas que las páginas (`fotos`, `colecciones`, `caracteristicas`, `paginas`, `ajustes`).
- `X-Robots-Tag: noindex` en `/admin/*`, `/datos/*` y en `/api/*` **excepto** las rutas de archivos de las colecciones *upload* `Foto` y `Medio` (patrón de `next.config` con exclusión de esas rutas de archivo).

#### 5.2.10 `robots.txt` (decisión de Rod: búsqueda sí, entrenamiento no)

Generado (`app/robots.ts`) desde `AjustesSitio`:

```
User-agent: *
Disallow: /admin
Disallow: /datos/

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: anthropic-ai
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
Disallow: /

Sitemap: <URL_SITIO>/sitemap.xml
```

- El segundo bloque se arma con `seo.robotsExcluidos`; si la lista está vacía, no se emite.
- No se excluyen `/api` (ahí viven los archivos de imagen) ni `/consulta` (Google debe ver su `noindex`).
- Robots de búsqueda y consulta de IA (`OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`) quedan cubiertos por `User-agent: *`. Las respuestas con IA de Google usan `Googlebot`, que también entra. `Google-Extended` solo controla el entrenamiento de Gemini, no la búsqueda.
- En entornos que no son de producción: `User-agent: *` / `Disallow: /` (§4).

Fuentes de la clasificación de robots (consultadas el 2026-10-14): [Anthropic: ClaudeBot, Claude-User y Claude-SearchBot](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler); [Robots for AI crawlers (specification.website)](https://www.specification.website/spec/agent-readiness/robots-for-ai-crawlers/). Los nombres cambian con el tiempo; por eso la lista es editable desde el panel.

#### 5.2.11 Search Console (decisión de Rod: v1.0)

- Propiedad de tipo "prefijo de URL" con `URL_SITIO`, verificada con la etiqueta `<meta>` de §5.1, que se publica solo en `/`.
- Rod envía `URL_SITIO/sitemap.xml` desde Search Console después de verificar (T-010).
- No agrega scripts, cookies ni llamadas desde el navegador del visitante: Google arma los datos desde su propio buscador.

### 5.3 Interfaces

| Ruta | Generación | Contenido |
|---|---|---|
| `GET /og/foto/[slug]` ◆ | Manejador de ruta, caché por etiquetas (§5.2.6) | JPEG 1200 × 630 de una foto visible; 404 si no lo es. |
| `GET /og/medio/[id]` ◆ | Igual | JPEG 1200 × 630 de un `Medio` en uso público; 404 si no. |
| `/sitemap.xml` | `app/sitemap.ts`, revalidación por etiquetas | §5.2.9. |
| `/robots.txt` | `app/robots.ts`, revalidación por `ajustes` | §5.2.10. |
| Todas las rutas públicas | `generateMetadata` de cada `page.tsx` | Título, descripción, canónica, robots, Open Graph y X según §5.2. |

`og` se agrega a las rutas reservadas de `paginas` §4 (una página libre no puede llamarse `og`; cambio menor, §7).

**Funciones (`src/lib/seo/`)**

- `tituloPara(tipo, datos, ajustes)` y `descripcionPara(tipo, datos, ajustes)`: reglas de §5.2.1 y §5.2.2.
- `canonicaPara(ruta, parametros)`: normaliza parámetros (§4) y devuelve la URL absoluta.
- `metadatosPara(tipo, datos, ajustes)`: arma el objeto `Metadata` completo de Next.js; todas las páginas lo usan.
- `jsonLdPara(tipo, datos, ajustes)` y `JsonLd` (componente que serializa con escape seguro).
- `lienzoOg(entrada, ajustes)`: composición de §5.2.6.
- `versionOg(...)`: parámetro `?v=` de §5.2.6.

### 5.4 Componentes y estructura de código

```
src/
├── middleware.ts                       # host único (§5.2.4); se suma a lo que ya haga el middleware
├── app/
│   ├── sitemap.ts
│   ├── robots.ts
│   └── (sitio)/
│       ├── layout.tsx                  # metadataBase = URL_SITIO, plantilla de títulos
│       ├── og/
│       │   ├── foto/[slug]/route.ts
│       │   └── medio/[id]/route.ts
│       └── …/page.tsx                  # cada página exporta generateMetadata con lib/seo
├── lib/seo/
│   ├── titulos.ts
│   ├── descripciones.ts
│   ├── canonica.ts
│   ├── metadatos.ts
│   ├── jsonld.ts
│   ├── lienzo-og.ts
│   └── robots.ts                       # listas de robots protegidos y validación
├── componentes/JsonLd.tsx
├── colecciones/Foto.ts                 # + grupo seo.descripcion
└── globales/AjustesSitio.ts            # + pestaña SEO
next.config.ts                          # cabeceras X-Robots-Tag (§5.2.9)
```

La fuente de Cormorant Garamond 500 se toma del mismo archivo local que usa `next/font` (sistema de diseño §5.7); no se duplica.

### 5.5 Rendimiento y seguridad

- **Peso:** las metaetiquetas y el JSON-LD suman menos de 4 KB por página y no agregan JavaScript al navegador. No afectan el presupuesto de 300 KB de la ficha (marco §6.5).
- **Lienzos:** se generan una vez por foto y quedan en caché; la primera petición de un lienzo tarda menos de 1 s en el servidor (una composición de `sharp` sobre una imagen de 1200 px).
- **Inyección:** el JSON-LD reemplaza `<`, `>` y `&` antes de insertarse; nunca se usa `dangerouslySetInnerHTML` con texto sin escapar.
- **Abuso de `/og`:** solo responde por fotos visibles o `Medio` en uso (§5.2.6.8) y queda en caché, así que pedir cientos de URL inventadas no genera trabajo.
- **Privacidad de la foto:** el lienzo parte de una versión web sin metadatos y sale sin metadatos (salvo ICC sRGB). El JSON-LD solo expone `lugar` como texto.

### 5.6 Stack

| Pieza | Decisión | Alternativa descartada |
|---|---|---|
| Metadatos | API de metadatos de Next.js (`generateMetadata`, `metadataBase`, `sitemap.ts`, `robots.ts`): heredado, sin dependencias nuevas. | `next-seo`: duplica lo que Next.js ya trae en App Router. |
| Lienzo Open Graph | `sharp` (ya en el proyecto) con la fuente local. JPEG liviano. | `next/og` (`ImageResponse`): genera PNG, que con una foto adentro pesa varias veces más, y obliga a fetch de la imagen. |
| Datos estructurados | Objetos TypeScript propios, tipados a mano. | `schema-dts`: útil pero es otra dependencia para menos de diez tipos. |
| Verificación de Google | Etiqueta `<meta>` desde Ajustes. | Archivo HTML de verificación: obliga a subir un archivo; registro DNS: no hay dominio propio en la v1. |

**Costo incremental:** cero. Search Console es gratis y usa la cuenta de Google que Rod ya tiene.

## 6. Cumplimiento normativo

Preguntas del método §8:

1. **Datos personales:** este componente no trata datos de visitantes ni de interesados. El JSON-LD publica el nombre del autor (`nombreSitio`), su descripción, sus redes y, si Rod la publica, su foto de perfil: datos de Rod, publicados por decisión suya. Como no trata datos de terceros, no corresponde reverificar la Ley 21.719 en este documento.
2. **Almacenamiento:** solo los campos de §5.1, administrados por Rod.
3. **Derechos del titular:** no aplica.
4. **Terceros:** Google Search Console recibe datos del propio buscador de Google; el sitio no le envía nada de los visitantes. No cambia la lista de terceros de la política de privacidad (marco §7.1).
5. **Cookies y rastreo:** ninguno (marco §7.4). Search Console no requiere script en el sitio.
6. **Propiedad intelectual (Ley 17.336):** `creator`, `copyrightNotice` y `license` declaran la autoría en cada foto. La exclusión de robots de entrenamiento es coherente con las condiciones, que prohíben usar las fotos para entrenar IA sin autorización (`paginas` Anexo B). **Metadatos (marco §7.2):** ni los lienzos ni el JSON-LD llevan GPS ni datos de cámara.
7. **Consumo (Ley 19.496):** sin precios ni ofertas en datos estructurados, coherente con "lo que ves no es una oferta de venta" (`paginas` Anexo B).

## 7. Elementos obsoletos

No hay código previo. Cambios a documentos aprobados que se aplican **al aprobar** este documento (cambios menores, sin cambio de alcance):

| Documento | Antes | Después |
|---|---|---|
| Marco 1.6 §6.1, `Foto` | Sin campos SEO | Agrega `seo.descripcion` (opcional). |
| Marco 1.6 §6.1, `AjustesSitio` | Sin campos SEO | Agrega `seo.tituloPortada`, `seo.verificacionGoogle` y `seo.robotsExcluidos`. |
| Marco 1.6 §6.3 | Sin rutas de imagen de vista previa | Agrega `GET /og/foto/[slug]` y `GET /og/medio/[id]`; precisa que `/sitemap.xml` y `/robots.txt` los define `plataforma/seo.md`. |
| Marco 1.6 §6.5 | Sin regla de host | Agrega `URL_SITIO` como URL base y la redirección 301 desde otros hosts. |
| Marco 1.6 §10 | "Visitas y origen: no se mide en la v1.0" | Agrega la métrica "Búsquedas en Google (impresiones y clics)" medida en Search Console; las visitas siguen en v1.x. |
| Marco 1.6 §6.6 | — | Agrega la fila "Buscadores: Google Search Console (gratis, sin script)". **Marco → 1.7.** |
| `modelo-contenido-panel` 1.3 §5.1 | — | `Foto.seo.descripcion`, pestaña SEO de `AjustesSitio` y validación de `AjustesSitio.descripcion` (máx. 160). §5.2.12: las rutas `/og/…`, `/sitemap.xml` y `/robots.txt` se revalidan con las etiquetas existentes. **→ 1.4.** |
| `consulta-copia` 1.1 §5.1, `Consulta.origen` | `ficha`, `visor`, `general` | Agrega `licencia`; en el panel, "Licencia (Google Imágenes)". **→ 1.2.** |
| `paginas` 1.0 §4 | Lista de rutas reservadas sin `og` | Agrega `og`. **→ 1.1.** |

`galeria-colecciones` y `ficha-foto` no cambian: sus encargos a este documento quedan resueltos en §5.2.3 y §5.2.5.

## 8. Plan de acción

| # | Paso | Depende de | Terminado cuando |
|---|---|---|---|
| 1 | Campos de §5.1 en `Foto.ts` y `AjustesSitio.ts` con sus validaciones y la extracción del código de Google. | `modelo-contenido-panel` paso 5 | Criterios 13 y 14 pasan. |
| 2 | `lib/seo/titulos.ts`, `descripciones.ts` y `canonica.ts` con pruebas unitarias de los casos de §4. | 1 | Criterios 1 a 3 pasan en pruebas. |
| 3 | `metadataBase` en el `layout` y `generateMetadata` en cada página pública con `metadatosPara`. | 2; páginas de galería, ficha y páginas | Criterios 1 a 5 pasan en el HTML. |
| 4 | Lienzo: `lienzo-og.ts`, rutas `/og/…` con caché por etiquetas y `?v=`. | 1 | Criterios 6 a 8 pasan. |
| 5 | `jsonld.ts` y `JsonLd` en todas las páginas. | 3 | Criterios 9 y 10 pasan. |
| 6 | `sitemap.ts`, `robots.ts` y cabeceras `X-Robots-Tag` en `next.config`. | 3 | Criterios 11, 12 y 15 pasan. |
| 7 | *Middleware* de host único con `URL_SITIO`. | — | Criterio 16 pasa. |
| 8 | `origen = licencia` en `Consulta` y `og` en rutas reservadas. | `consulta-copia`, `paginas` | Criterio 10 y 17 pasan. |
| 9 | Revisión con herramientas externas sobre el sitio publicado. | `despliegue` | Criterio 18 pasa. |

## 9. Criterios de aceptación y pruebas

1. Una ficha "Amanecer en el Llaima" con lugar "Conguillío" tiene el título "Amanecer en el Llaima, Conguillío · Rod Díaz"; con lugar ya incluido en el título, no se repite; con un título de 100 caracteres, se omite el lugar y se corta con "…".
2. Sin `seo.descripcion` ni historia, la descripción es "Fotografía de <lugar>, <mes de año>. Disponible como copia impresa."; en una foto de vitrina no lleva la segunda frase; con historia, es su inicio cortado en palabra completa ≤ 155 caracteres.
3. `/fotos/x?coleccion=y&fbclid=z` tiene canónica `/fotos/x`; `/fotos?pagina=1&caracteristica=c` tiene canónica `/fotos?caracteristica=c`; `/colecciones/x?caracteristica=c` tiene canónica `/colecciones/x`.
4. Las robots de cada ruta coinciden con la tabla §5.2.3, incluida la página amable (HTTP 200 con `noindex, follow`) y el filtro sin resultados (`noindex`).
5. Todas las canónicas, `og:url` y URL del sitemap usan `URL_SITIO` como base absoluta.
6. `/og/foto/<slug>` de una vertical 4:5, una horizontal 3:2, una cuadrada y una panorámica 3:1 devuelve JPEG 1200 × 630, la foto completa sin recorte dentro del área de §3.2, "Rod Díaz" en la franja inferior, menos de 300 KB y sin EXIF (verificado con `exiftool`).
7. Con un `logo` subido, el lienzo muestra el logo y no el wordmark; al cambiar el logo, `og:image` cambia su `?v=`.
8. `/og/foto/<slug>` de una foto en borrador o despublicada responde 404.
9. El JSON-LD de una ficha pasa la prueba de resultados enriquecidos de Google sin errores y declara `creator`, `creditText`, `copyrightNotice`, `license` y `acquireLicensePage`; no contiene coordenadas ni datos de cámara.
10. `acquireLicensePage` de una foto con copia abre `/consulta` con esa foto; enviada, la consulta queda con `origen = licencia` y el panel lo muestra como "Licencia (Google Imágenes)".
11. `/sitemap.xml` es XML válido y contiene exactamente: portada, `/fotos`, `/colecciones`, colecciones visibles, características con fotos, fichas visibles (cada una con su `<image:loc>`) y páginas publicadas. No contiene borradores, despublicadas, páginas siguientes ni `/consulta`.
12. `/robots.txt` coincide con §5.2.10 y refleja al instante (tras revalidar) un cambio en `seo.robotsExcluidos`.
13. El panel rechaza `*`, `Googlebot` y `OAI-SearchBot` en `seo.robotsExcluidos` con el mensaje de §4.
14. Pegar `<meta name="google-site-verification" content="AbC…">` completo en el campo guarda solo `AbC…`; la etiqueta aparece únicamente en el HTML de `/`.
15. Una respuesta JSON de `/api/fotos` y de `/datos/fotos` lleva `X-Robots-Tag: noindex`; un archivo de imagen de una foto no lo lleva.
16. Una petición con otro host (por ejemplo, el dominio por defecto si `URL_SITIO` es otro) responde 301 a la misma ruta y parámetros en `URL_SITIO`.
17. No se puede crear una página libre con `slug` `og`.
18. Sobre el sitio publicado: la prueba de resultados enriquecidos y la inspección de URL de Search Console no muestran errores en portada, una colección y una ficha; el depurador de Facebook (Sharing Debugger) y un mensaje real por WhatsApp muestran la tarjeta grande con la foto completa; Lighthouse SEO = 100 en portada, galería y ficha.

## 10. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| SEO-01 | Al mudarse al dominio propio se pierde parte del posicionamiento ganado en el subdominio. | Media | Medio | Host único y 301 ruta por ruta (§5.2.4), cambio de dirección en Search Console y el subdominio activo redirigiendo al menos 12 meses (`despliegue`). |
| SEO-02 | Google trata el subdominio compartido de Railway con menos confianza al principio. | Media | Bajo | Sitemap enviado, datos estructurados completos y enlaces desde Instagram. Se mide en Search Console. |
| SEO-03 | Un robot de IA ignora `robots.txt` y usa las fotos para entrenar. | Media | Bajo | No existe bloqueo real; tope de 2048 px y aviso en condiciones. Riesgo aceptado, como R-04 del marco. |
| SEO-04 | La etiqueta "Con licencia" trae consultas de uso comercial que Rod no quiere atender. | Baja | Bajo | Se distinguen por `origen = licencia`; si molestan, se quitan `license` y `acquireLicensePage` (cambio menor). |
| SEO-05 | Google deja de mostrar la etiqueta de licencia o cambia los requisitos. | Baja | Bajo | La autoría (`creator`, `copyrightNotice`) sigue valiendo; se revisa en Search Console. Requisitos vigentes según la [guía de metadatos de imagen de Google](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata?hl=es), consultada el 2026-10-14. |
| SEO-06 | WhatsApp no muestra la vista previa por peso o tiempo de respuesta. | Baja | Medio | JPEG < 300 KB, en caché y probado con un mensaje real (criterio 18). |
| SEO-07 | Cambian los nombres de los robots de IA. | Media | Bajo | Lista editable desde el panel (§5.1) sin tocar código. |

## 11. Decisiones abiertas y tareas del dueño

**Decisiones de Rod en este documento:** indexar el subdominio de Railway desde el lanzamiento; vista previa con la foto completa y la marca; títulos "título, lugar · Rod Díaz"; descripción automática con campo opcional; etiqueta "Con licencia" hacia la consulta; Search Console en la v1.0; cada característica indexable en `/fotos`; robots de búsqueda de IA sí, de entrenamiento no.

**Decisiones técnicas tomadas aquí** (se pueden discutir en la revisión): página amable con 200 y `noindex` en vez de 410 (O-6); páginas siguientes indexables fuera del sitemap (O-7); lienzo generado al pedirlo y no al subir (O-3); páginas libres siempre en el sitemap.

**Decisiones abiertas:** ninguna que bloquee la implementación.

**Tareas del dueño** (nacen al aprobar):

- **T-010** (`desarrollo`): al lanzar, verificar el sitio en Google Search Console con tu cuenta de Google (propiedad "Prefijo de URL" con la dirección del sitio, método "Etiqueta HTML"), pegar el código en *Ajustes del sitio → SEO* y enviar el sitemap. Unos 10 minutos; te guío cuando toque. No bloquea el lanzamiento.
- **T-011** (`contenido`): escribir la descripción del sitio en *Ajustes del sitio* (máx. 160 caracteres: qué fotografías y dónde, por ejemplo "Paisajes y fotografía nocturna del sur de Chile, de la Araucanía a la Patagonia. Copias impresas a pedido."). Bloquea el lanzamiento (`despliegue`).

**Propuestas (fuera de alcance; no se construyen sin tu aprobación)**

- **P-S1 (v1.x).** Bing Webmaster Tools importando la verificación de Search Console: Bing también alimenta a otros buscadores y asistentes. Costo: cero, un clic.
- **P-S2 (v1.x).** Archivo `llms.txt` con un resumen del sitio y sus colecciones para asistentes de IA. Costo: bajo, sin servicios nuevos; beneficio todavía incierto, por eso no entra en la v1.0.

**Para `plataforma/despliegue.md`:** valor de `URL_SITIO`, `ENTORNO = produccion`, excepciones del host único (chequeo de salud y callback OAuth), procedimiento de mudanza al dominio (§5.2.4) y en la lista de lanzamiento: descripción del sitio (T-011), `condiciones` publicada (para la etiqueta de licencia) y la verificación de Search Console (T-010).

## 12. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.2 | 2026-10-20 | Incorporación del logotipo horizontal oficial (`public/marca/RodDiaz-logo-horizontal-blanco.svg`) como marca por defecto en la franja inferior de 96 px de `generarLienzoOg` (`src/lib/seo/lienzo-og.ts`), manteniendo soporte para cualquier logotipo personalizado en `AjustesSitio.logo`. |
| 1.1 | 2026-10-14 | Optimización de lienzos Open Graph para fotos verticales adaptados al recorte cuadrado (630 × 630) de WhatsApp e iMessage (§5.2.6) y unificación de etiquetas de caché con `foto:<id>` y `foto:<slug>`. |
| 1.0 | 2026-10-14 | Aprobado por Rod. El marco general pasa a 1.7, el modelo de contenido a 1.4, la consulta de copia a 1.2 y páginas a 1.1 con los cambios del §7. Nacen T-010 y T-011. |
| 0.1 | 2026-10-14 | Borrador inicial. Decisiones de Rod: indexar desde el lanzamiento en el subdominio de Railway con `URL_SITIO` y 301; vista previa 1200 × 630 con la foto completa y la marca; títulos "título, lugar · Rod Díaz"; descripción automática con campo opcional `Foto.seo.descripcion`; etiqueta "Con licencia" con `acquireLicensePage` hacia la consulta (`origen = licencia`); Search Console en v1.0; características de `/fotos` indexables; robots de búsqueda de IA permitidos y de entrenamiento excluidos, lista editable. Requisitos de licencia de Google y clasificación de robots verificados el 2026-10-14. |

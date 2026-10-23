# Galería y colecciones

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/portafolio/galeria-colecciones.md` |
| Tipo | Componente |
| Versión | 1.10 |
| Estado | Aprobado |
| Fecha | 2026-10-23 |
| Padre | `marco-general/marco-general-proyecto.md` (1.3, que incorpora los cambios del §11) |
| Dependencias | `identidad/sistema-de-diseno.md` (1.0), `contenido/modelo-contenido-panel.md` (1.1) |
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

Este componente define todo lo que el **Visitante** (marco §3) recorre antes de abrir una ficha: la portada, la página de colecciones, la vista de una colección y "Todas las fotos". Es el segundo eslabón del flujo central (marco §4.1), entre la administración de contenido y la ficha de foto.

**Problema que resuelve.** Un visitante que llega por primera vez desde Instagram o Google tiene que quedar con ganas de seguir mirando y encontrar fotos sin esfuerzo. Rod necesita que su obra se vea completa, sin recortes y en el orden que él decide.

**Resultado esperado.**

- **Primeros segundos.** Una foto de gran impacto y, al bajar, las colecciones y una selección de destacadas.
- **Grillas sin recortes.** Ninguna grilla recorta una foto: todas usan filas justificadas que respetan la proporción real.
- **Pocos clics.** Desde la portada se llega a cualquier ficha en dos clics como máximo (marco §4.2.6).
- **Datos del panel.** Todo sale de las funciones de datos del modelo de contenido (`modelo-contenido-panel` §5.3) y de la regla única de visibilidad (§5.2.5 de ese documento).

Usa los tokens, patrones y componentes base del sistema de diseño (`TarjetaColeccion`, `ChipFiltro`, `MarcoFoto`, `PlantillaEstado`, `Retorno`, `Esqueleto`, `Boton`). No define colores, tipografías ni movimientos propios.

## 2. Alcance

**Incluye (v1.0)**

- Portada `/`: foto principal, colecciones, destacadas y acceso a todas las fotos.
- Página `/colecciones`: todas las colecciones madre.
- Vista de colección `/colecciones/[slug]`: madre agrupada por secciones o hija, con filtro por característica.
- Todas las fotos `/fotos`, con filtro por característica.
- Grilla de filas justificadas (`GrillaFotos`), carga por scroll infinito, recuperación de la posición al volver de una ficha y página siguiente sin JavaScript.
- Contexto de navegación que se entrega a la ficha (de qué lista viene la foto).
- Campos nuevos en `Foto`: `fijada`, `ordenFijada` y el punto focal nativo de Payload (§5.1).

**No incluye**

- La ficha, la navegación anterior/siguiente y el `Visor`: los define `portafolio/ficha-foto.md`, que consume el contexto de §5.3.
- Títulos SEO, descripciones, Open Graph, sitemap y la indexación de las páginas siguientes: `plataforma/seo.md`.
- Encabezado y pie: ya definidos en el sistema de diseño. Aquí solo se fijan los enlaces de la navegación (§3.6).
- Frase sobre copias en la portada o la galería: **Rod decidió que la invitación a pedir copia vive solo en la ficha** (riesgo GC-02).

**Para versiones posteriores**

- v1.x: búsqueda por texto, filtro combinado de varias características y destacadas con orden propio, si el uso lo pide.
- Futuro: vista "relato" (una foto por fila) para colecciones especiales.

## 3. Flujo de usuario y UX/UI cuestionado

### 3.1 Qué percibe el visitante en los primeros segundos (portada)

1. **Encabezado sobrio** (sistema de diseño §3.1).
2. **Hero Inmersivo de portada a pantalla completa**:
   - Fotografía nítida (100% de calidad, sin blur para preservar la textura y fidelidad Fine Art), ocupando la pantalla completa (`min-height: calc(100svh - var(--alto-encabezado))`).
   - Velo cinemático oscuro y gradiente radial (`rgba(21, 21, 21, 0.4)` a `0.85`), garantizando contraste tipográfico superior y legibilidad sin oscurecer los detalles del paisaje.
   - Declaración de autoría inmediata (*«Rod Díaz · Fotografía Fine Art»*), titular de impacto (*«El papel detiene el tiempo.»*) y bajada clara comunicando la mirada fotográfica y la disponibilidad de copias impresas en taller propio en papeles de algodón de museo.
   - Acciones directas sobrias: *«Explorar colecciones ↓»* y *«Ver catálogo de fotos →»*.
   - Pie de obra flotante sutil con título, lugar y enlace directo a la ficha técnica de la obra.

Al bajar, la portada sigue con un arco narrativo claro:

| Bloque | Contenido |
|---|---|
| Colecciones | Introducción contextual (*«Series fotográficas organizadas por atmósfera y geografía»*), título "Colecciones" (`--titulo-md`) y las tarjetas de las colecciones madre listadas, en el orden de Rod. Si hay más de 6, se muestran 6 y un `Boton` secundario "Ver todas las colecciones" lleva a `/colecciones`. |
| Taller Fine Art (`BloqueTaller`) | Puente de materialidad y oficio (*«De la luz a la copia de museo»*): cita de autor sobre el valor del papel impreso frente al ruido digital, 3 pilares de artesanía (taller propio, papeles 100% algodón Hahnemühle/Canson, formatos y asesoría) y llamadas a conocer la historia (`/sobre-mi`) o consultar por una obra (`/contacto`). |
| Destacadas | Introducción curatorial (*«Selección curada: instantes de cordillera, luz y fauna»*), título "Fotografías destacadas" y hasta 12 fotos `destacada` visibles en una `GrillaFotos`, de la más reciente publicada a la más antigua, con acceso directo a ver todo el catálogo. |
| Cierre | Invitación cálida al diálogo y asesoría en formatos y medidas especiales para espacios de vida, con botones secundarios a contactar o explorar el archivo completo. |

La portada no tiene botón primario: el único relleno claro del sitio vive en la ficha (sistema de diseño O-4).

### 3.2 Página de colecciones (`/colecciones`)

Título "Colecciones" (`--titulo-lg`) y una retícula con las tarjetas de **todas** las colecciones madre listadas, en el orden de Rod. Las hijas no tienen tarjeta aquí: se recorren desde su madre.

**Tarjetas** (`TarjetaColeccion`):

- **Proporción uniforme 3:2 con punto focal**: Las tarjetas de colecciones estándar (tanto obras verticales como horizontales) adoptan la proporción uniforme `3:2` para garantizar un equilibrio visual impecable, simetría en cuadrículas de 2 columnas y alineación perfecta de títulos y conteos. Las fotografías verticales se encuadran con `object-fit: cover` respetando el punto focal asignado en el panel, preservando la obra íntegra al 100% sin recortes para la vista dedicada de la colección o ficha.
- **Tratamiento panorámico expansivo**: Si la foto de portada es panorámica (`ratio >= 1.85`), la tarjeta toma automáticamente el ancho total (`grid-column: 1 / -1`), desplegando la obra en formato cinematográfico completo.
- **Micro-interacción**: Zoom sutil (`scale(1.025)`) al pasar el puntero sobre la fotografía y respuesta táctil inmediata (`scale(0.98)`) al presionar.
- El conteo suma las fotos visibles de la madre y de todas sus hijas ("1 foto", "12 fotos").

### 3.3 Vista de una colección (`/colecciones/[slug]`)

**Cabecera**

- `Retorno`: en una madre, "Colecciones" (→ `/colecciones`); en una hija, "Volver a <madre>".
- Nombre en `--titulo-lg`, `descripcion` en `--texto-lectura` (si existe) y el conteo en `--texto-sm` secundario.
- Chips de características, solo cuando sirven (§5.2.6).

**Cuerpo de una madre: comprimido en tarjetas de portada para sus sub-colecciones**

1. Primero, las fotos propias de la madre en una `CargaInfinita` / `GrillaFotos` (si existen).
2. Luego, las sub-colecciones hijas con fotos visibles se presentan comprimidas como tarjetas editoriales (`RejillaColecciones`), mostrando exactamente UNA foto de portada por cada sub-categoría (respetando la portada definida en Payload con fallback a la primera foto de la serie), junto con su título y total de fotos (ej. "6 fotos", "7 fotos").
3. Al hacer clic en la tarjeta de una sub-colección, el visitante navega a la URL dedicada de la hija (`/colecciones/[slug]`), donde se despliegan todas sus fotografías en cuadrícula completa con su botón de retorno jerárquico ("← Volver a <madre>").
4. Una madre sin fotos propias empieza directo por la rejilla de tarjetas de sub-colecciones.

**Cuerpo de una hija:** una sola `GrillaFotos` con sus fotos, en el orden de Rod.

### 3.4 Todas las fotos (`/fotos`)

- Título "Fotos" (`--titulo-lg`).
- Fila de chips: "Todas" y las características con al menos una foto visible, por nombre alfabético.
- `GrillaFotos` con todas las fotos visibles, en este orden:
  1. primero las **fijadas**, en el orden que Rod les dio;
  2. después el resto, de la publicada más recientemente a la más antigua.
- Con un filtro activo, se aplica el mismo orden a las fotos que tienen esa característica.

### 3.5 La grilla de filas justificadas (`GrillaFotos`)

- **Filas de alto parejo y foto completa.** Cada fila tiene el mismo alto y cada foto conserva su proporción real: nada se recorta (marco §5). El ancho de cada foto en la fila sale de su proporción, y la fila se estira hasta llenar el ancho.
- **Alto de referencia de fila** (`--alto-fila`, nuevo token de este componente): 200 px en móvil, 260 px en tableta, 320 px en escritorio y 360 px desde 1440 px. El alto real de una fila puede crecer hasta llenar el ancho.
- **Separación** entre fotos: `--esp-2` (8 px), lo mínimo del sistema de diseño.
- **Última fila:** no se estira. Queda a la izquierda con el alto de referencia.
- **Cada foto es un enlace a su ficha**, con el contexto de la lista (§5.3). No abre el `Visor`, porque la llamada a pedir copia vive en la ficha.
- **Título al pasar.** Solo en dispositivos con puntero fino, bajo cada foto hay una línea reservada de 28 px. Al pasar el mouse o con foco de teclado, ahí aparecen el título y el lugar en `--texto-sm` secundario, en una línea con puntos suspensivos si no cabe. Aparece con un fundido de opacidad de `--dur-rapida`. Como la línea está reservada, la grilla no salta. En táctil no hay línea ni título.
- **Nombre accesible:** el enlace se nombra con el título de la foto, y la imagen usa `textoAlternativo` (marco §4.2.8).

### 3.6 Navegación del encabezado

En orden: **Colecciones** (`/colecciones`) · **Fotos** (`/fotos`) · **Sobre mí** · **Contacto**. El enlace activo lleva `aria-current="page"`: "Colecciones" queda activo también dentro de una colección, y "Fotos" también con un filtro. Los rótulos de navegación son interfaz y van en el código; las rutas de páginas salen de `Pagina` (marco §6.2.10).

### 3.7 Carga de más fotos (scroll infinito)

**Al cargar la página**

- El servidor entrega las primeras **30 fotos** de la lista.
- Al final hay un enlace "Más fotos" a la página siguiente (`?pagina=2`).

**Con JavaScript activo**

- El enlace se reemplaza por un marcador invisible. Cuando queda a 1200 px del borde inferior de la pantalla, se piden 30 fotos más.
- Mientras llegan, se muestra una fila de `Esqueleto`. Las fotos nuevas aparecen sin animación de entrada: solo el fundido de `MarcoFoto` si aún no han cargado.
- Un anuncio en `aria-live="polite"` dice "Se sumaron 30 fotos".

**Al terminar la lista o fallar la carga**

- Si no quedan fotos, el marcador desaparece y se llega al pie.
- Si falla la carga, aparece un `Aviso` en línea: "No pudimos cargar más fotos", con un `Boton` secundario "Reintentar". No se reintenta solo.

**Al volver de una ficha.** Antes de navegar a la ficha, se guardan en la sesión del navegador (`sessionStorage`, por URL) cuántas fotos estaban cargadas y la foto abierta. Al volver atrás, se vuelve a pedir esa cantidad y se lleva la vista a esa foto, sin animación. Si la sesión no está disponible, la página parte arriba.

**Sin JavaScript:** "Más fotos" lleva a la página siguiente, que muestra sus 30 fotos y otro enlace "Más fotos" si quedan.

En una madre agrupada, las páginas recorren la secuencia completa (fotos propias y luego cada hija). Cuando una página empieza a mitad de una sección, la sección sigue sin repetir su subtítulo.

### 3.8 Estados de la interfaz

| Situación | Comportamiento |
|---|---|
| Cargando la página | Estática: llega completa. Las fotos muestran el `colorDominante` mientras cargan. |
| Cargando más fotos | Fila de `Esqueleto` y anuncio al terminar (§3.7). |
| Error al cargar más | `Aviso` con "Reintentar". |
| Foto que no carga | Estado de error de `MarcoFoto` (sistema de diseño §4). |
| Filtro sin resultados (enlace viejo o característica que se quedó sin fotos visibles) | `PlantillaEstado`: "No hay fotos con esta característica por ahora", con el botón "Ver todas las fotos". |
| Colección inexistente o no visible | `PlantillaEstado` con estado 404: "No encontramos esta colección", con el botón "Ver colecciones". |
| Sitio sin colecciones listadas | La portada omite el bloque y `/colecciones` muestra `PlantillaEstado`: "Pronto habrá colecciones", con el botón "Ver todas las fotos". |
| Éxito | No aplica: no hay acciones del visitante que confirmar. |

### 3.9 Escritorio y móvil

| Aspecto | Escritorio (≥ 1024 px) | Móvil (< 640 px) |
|---|---|---|
| Filas | 320 px de referencia (360 px desde 1440 px). Caben de 3 a 5 fotos por fila. | 200 px de referencia. Caben 1 o 2 fotos por fila, y una panorámica va sola. |
| Título al pasar | Sí, en la línea reservada. | No. |
| Tarjetas de colección | 3 columnas. | 1 columna, de ancho completo. |
| Chips | En una línea, con salto a una segunda si no caben. | En una fila con desplazamiento horizontal: `overflow-x: auto`, `scroll-snap` suave y sin barra visible; el chip activo se lleva a la vista al cargar. |
| Encabezado | Ocultable (sistema de diseño §5.4). | Ocultable. |

En tableta se usan filas de 260 px, tarjetas en 2 columnas y chips como en móvil.

### 3.10 Objeciones planteadas al flujo y su resolución

| # | Objeción | Resolución |
|---|---|---|
| O-1 | Una cuadrícula uniforme recorta verticales y panorámicas. | Filas justificadas en toda grilla de fotos (decisión de Rod). Solo se recortan las tarjetas de colección (O-5). |
| O-2 | Con scroll infinito, el pie (Instagram, Privacidad) queda inalcanzable y se pierde la posición al volver. | Decisión de Rod: scroll infinito. Se mitiga con la recuperación de la posición (§3.7), el enlace sin JavaScript y la navegación del encabezado siempre disponible al subir. El pie queda como riesgo aceptado (GC-01). |
| O-3 | Sin una frase sobre copias fuera de la ficha, quien solo mira la grilla podría no enterarse. | Decisión de Rod: la invitación vive solo en la ficha. Se registra el riesgo GC-02 y se revisará con el uso real. |
| O-4 | Si el título aparece al pasar el mouse bajo la foto, la grilla salta; si va sobre la foto, rompe el sistema de diseño. | Se reserva una línea de 28 px bajo cada foto, solo en puntero fino. |
| O-5 | Recortar la portada de una colección a 4:5 puede cortar lo importante. | El recorte se centra en el punto focal que Rod marca en la foto con la herramienta nativa de Payload. Dentro de la colección, la foto se ve completa. |
| O-6 | "Destacadas" (portada) y "Fijadas" (`/fotos`) son dos marcas parecidas y pueden confundir. | Tienen nombre, ayuda y uso distintos en el panel: "Destacada: aparece en la portada" y "Fijada: aparece primero en Todas las fotos". Una foto puede tener ambas. |
| O-7 | Chips dentro de una colección pequeña son ruido. | Solo aparecen si las fotos visibles de esa colección tienen al menos dos características distintas (§5.2.6). |
| O-8 | Abrir el `Visor` desde la grilla sería más rápido. | Se va a la ficha: ahí están el título, los tamaños y "Pedir una copia". El visor queda en la ficha (marco §4.2.10). |
| O-9 | Con cientos de fotos cargadas, el navegador de Instagram se queda sin memoria. | `content-visibility: auto` por fila, imágenes de 480 o 1200 px según el ancho real (nunca de 2048 px en la grilla) y carga diferida (§5.5). |

## 4. Casos borde

| Caso | Resolución |
|---|---|
| Fotos verticales, horizontales, cuadradas y panorámicas mezcladas | La fila justificada reparte el ancho según la proporción de cada una; todas quedan con el mismo alto y completas. |
| Panorámica 3:1 en móvil | No cabe a 200 px de alto (600 px de ancho): va sola en su fila y se reduce al ancho disponible, completa (unos 120 px de alto en 390 px). |
| Vertical sola entre panorámicas | Ocupa su fila sola y crece hasta el ancho disponible. En escritorio se limita a `calc(100svh - var(--alto-encabezado))` de alto para no ocupar varias pantallas. |
| Última fila con una sola foto | No se estira: queda a la izquierda con el alto de referencia. |
| Título de 120 caracteres en la línea al pasar | Una línea con puntos suspensivos; el título completo está en el nombre accesible y en la ficha. |
| Nombre de colección de 80 caracteres en una tarjeta | `line-clamp: 2` en la tarjeta; completo en la cabecera de la colección, con `text-wrap: balance`. |
| "1 foto" o "0 fotos" | Plural con `Intl.PluralRules` ("1 foto", "12 fotos"). Una colección con 0 fotos visibles no se lista (marco §6.2.5). |
| Colección sin `portada` o con la portada no visible | Se usa la primera foto visible de la colección y, en una madre, de sus hijas (`modelo-contenido-panel` §4). |
| Foto de portada sin punto focal marcado | El recorte 4:5 se centra (50 % / 50 %), que es el valor por defecto de Payload. |
| `fotoPortada` del sitio no visible o vacía | Primera foto `destacada` visible y, si no hay, la más reciente visible (`modelo-contenido-panel` §4). |
| Sitio con pocas fotos (12 al lanzar) | La portada se ve completa: foto principal, al menos una colección y la grilla de destacadas si Rod marca alguna. Se recomienda marcar 6 destacadas o más (T-009). |
| Una sola colección | Una tarjeta, sin "Ver todas las colecciones". |
| Hija con `visibleSola = false` | Su sección aparece en la madre sin enlace, y su URL redirige a la madre (`modelo-contenido-panel` §4). |
| Hija cuyas fotos no tienen la característica filtrada | Su sección se oculta mientras dura el filtro. |
| Madre filtrada que queda sin fotos | `PlantillaEstado` de filtro sin resultados, con un enlace a la colección sin filtro. |
| Característica renombrada (`?caracteristica=<slug anterior>`) | Redirección 308 al `slug` nuevo. |
| `?caracteristica=` desconocida | `PlantillaEstado` de filtro sin resultados. No se muestra un 404 seco. |
| Colección renombrada | Redirección 308 desde `slugsAnteriores` (marco §5). |
| `?pagina=` fuera de rango o no numérica | Mayor que la última: redirección a la última página válida. No numérica o menor que 1: redirección a la ruta sin `pagina`. |
| Se publica una foto mientras el visitante recorre `/fotos` | Las páginas se piden por cursor estable (§5.3), así que no se repiten ni se saltan fotos de lo ya cargado. La nueva aparece al recargar. |
| Se despublica una foto ya cargada en la grilla | Su enlace lleva a la página amable "Esta foto ya no está disponible" (marco §5). |
| Rod fija muchas fotos | No hay tope técnico. La ayuda del panel recomienda fijar pocas (hasta 12). |
| JavaScript desactivado | Grillas completas con enlaces "Más fotos"; los chips son enlaces. Sin título al pasar ni recuperación de posición. |
| `sessionStorage` bloqueado (navegación privada) | Sin recuperación de posición; todo lo demás funciona. Toda lectura y escritura va en `try/catch`. |
| Visitante que intenta descargar desde la grilla | Disuasión de `MarcoFoto` (sistema de diseño §5.4). En la grilla no se sirve la versión de 2048 px. |
| Zoom al 200 % | Las filas se recalculan con el ancho disponible y no hay scroll horizontal (sistema de diseño criterio 20). |

## 5. Especificación técnica

### 5.1 Modelo de datos

Campos que este componente agrega a `Foto` (los implementa `modelo-contenido-panel` 1.1 y el marco los incorpora en 1.3, §11):

| Entidad | Campo | Tipo | Regla |
|---|---|---|---|
| `Foto` | `fijada` | booleano, `false` | Ayuda: "Aparece primero en Todas las fotos". |
| `Foto` | `ordenFijada` | número, opcional | Orden entre las fijadas. Se asigna al final al fijarla y se cambia arrastrando en la lista filtrada "Fijadas". Se vacía al desfijar. |
| `Foto` | `focalX`, `focalY` | punto focal nativo de Payload (`focalPoint: true`, `crop: false` en la colección *upload*) | Porcentaje de 0 a 100, por defecto 50 / 50. Solo se usa para el recorte 4:5 de las tarjetas de colección. No genera archivos nuevos ni recorta las versiones. |

Ayuda del panel en `Coleccion.portada`: "En las tarjetas, la portada se ve recortada en formato vertical 4:5. Marca el punto focal en la foto para elegir el centro."

Índice nuevo: `Foto.fijada` + `Foto.ordenFijada`. Para el orden por defecto se usa el índice existente `Foto.estado` con `publicadaEn` (se agrega `publicadaEn` al índice compuesto).

Token nuevo de este componente (en `GrillaFotos.module.css`, a partir de los tokens del sistema de diseño): `--alto-fila` (§3.5).

### 5.2 Reglas de negocio específicas

1. **Visibilidad.** Toda lista usa `lib/visibilidad.ts` (`modelo-contenido-panel` §5.2.5). Este componente no vuelve a definir qué es visible.
2. **Orden de `/fotos`:** fijadas por `ordenFijada` ascendente; luego el resto por `publicadaEn` descendente; como desempate final, `id`. Si un filtro está activo, se aplica el mismo orden sobre el subconjunto.
3. **Orden de una colección:** fotos propias por `Foto.orden`; hijas por `Coleccion.orden` y, dentro de cada hija, fotos por `Foto.orden` (`modelo-contenido-panel` §5.2.5). Las marcas `fijada` y `destacada` no alteran el orden de una colección.
4. **Visualización de tarjetas y proporción uniforme.** `TarjetaColeccion` utiliza una proporción uniforme `3:2` para todas las colecciones estándar (tanto obras verticales como horizontales), garantizando un equilibrio visual perfecto, simetría en la cuadrícula de 2 columnas y alineación horizontal de títulos y conteos. Las obras verticales se encuadran en la caja con `object-fit: cover` respetando el punto focal asignado por Rod en el panel. Si la foto de portada es panorámica (`ratio >= 1.85`), la tarjeta toma el ancho completo (`grid-column: 1 / -1`) en formato cinematográfico. En la vista dedicada de cada colección y en su ficha individual, todas las fotografías se despliegan en su proporción nativa exacta con 0% de recorte.
5. **Destacadas en la portada:** hasta 12 fotos visibles con `destacada = true`, por `publicadaEn` descendente.
6. **Chips en una colección:** se muestran si el conjunto de fotos visibles de la colección (en una madre, propias más hijas) reúne **dos o más** características distintas. En `/fotos` se muestran siempre que exista al menos una característica con fotos visibles.
7. **Conteo de una tarjeta:** fotos visibles de la colección y, si es madre, de sus hijas publicadas, tengan o no página propia.
8. **Tamaño de página:** 30 fotos. Se pagina por **cursor** (la clave de orden de la última foto entregada), no por desplazamiento, para que las publicaciones nuevas no repitan ni salten fotos. La URL `?pagina=N` de la versión sin JavaScript se resuelve en el servidor contando desde el inicio.
9. **Contexto hacia la ficha.** El enlace de cada foto lleva el contexto de la lista de origen: `?coleccion=<slug>` desde una colección (y `&caracteristica=<slug>` si la colección tiene un filtro activo), `?caracteristica=<slug>` desde `/fotos` filtrado, y sin parámetro desde `/fotos`, la portada o las destacadas. El contexto de las destacadas es "todas las fotos". `ficha-foto` lo usa para "Anterior/Siguiente" y para el `Visor`. La URL canónica de la ficha no lleva parámetros (`plataforma/seo.md`).
10. **Datos, no código.** Los nombres, descripciones y conteos salen de los datos. Los rótulos de interfaz ("Colecciones", "Fotos", "Destacadas", "Más fotos", "Reintentar", "Ver colección" y los textos de estado vacío) son parte del código, como los del sistema de diseño (§5.4).

### 5.3 Interfaces

**Rutas públicas**

| Ruta | Generación | Contenido |
|---|---|---|
| `/` | Estática con revalidación por etiquetas | §3.1 |
| `/colecciones` (nueva) | Estática con revalidación | §3.2 |
| `/colecciones/[slug]` | Estática (`generateStaticParams` de las colecciones listadas, que devuelve una lista vacía durante la compilación: `plataforma/despliegue.md` §5.2.6) con revalidación | §3.3. Con `?caracteristica=` o `?pagina=` se genera a pedido y se guarda en caché con las mismas etiquetas. |
| `/fotos` | Estática con revalidación | §3.4. Con `?caracteristica=` o `?pagina=`, igual que arriba. |
| `GET /datos/fotos` (nueva) | Manejador de ruta con caché por etiquetas | Siguiente página para el scroll infinito. |

**Contrato de `GET /datos/fotos`**

- **Parámetros:** `lista` (`todas` o `coleccion`), `coleccion` (slug, obligatorio si `lista = coleccion`), `caracteristica` (slug, opcional), `despues` (cursor opaco, obligatorio) y `limite` (opcional, 30 por defecto y 60 como máximo; se usa al recuperar la posición).
- **Respuesta 200:**

  ```json
  {
    "fotos": [
      {
        "slug": "nuble-al-alba",
        "titulo": "Ñuble al alba",
        "lugar": "Ñuble",
        "textoAlternativo": "…",
        "ancho": 2048,
        "alto": 1365,
        "colorDominante": "#2b2a28",
        "filete": false,
        "versiones": { "avif": ["…480", "…1200"], "webp": ["…480", "…1200"], "jpeg": "…1200" },
        "seccion": { "slug": "nahuelbuta", "nombre": "Nahuelbuta", "conPagina": true },
        "href": "/fotos/nuble-al-alba?coleccion=salidas-outdoor"
      }
    ],
    "siguiente": "<cursor o null>"
  }
  ```

  `seccion` solo viene en una madre, y es `null` en las fotos propias. Las versiones de 2048 px no se incluyen.
- **Errores:** 400 si faltan parámetros o el cursor no es válido; 404 si la colección o la característica no existen o no son visibles. El cuerpo es `{ "error": "<código>" }`, sin datos internos.

**Funciones de datos** (amplían `lib/contenido.ts`, `modelo-contenido-panel` §5.3):

- `paginaFotos({ lista, coleccion?, caracteristica?, despues?, limite })` → `{ fotos, siguiente }`
- `paginaNumerada(params, pagina)` → `{ fotos, siguiente, ultima }`, para la versión sin JavaScript
- `vistaColeccion(slug)` → `{ coleccion, madre?, hijas, total }` o `{ redirigirA }` o `null`
- `caracteristicasConFotos({ coleccion? })` → `[{ slug, nombre }]`
- `fotosDestacadas(12)`, `fotoPortadaSitio()`
- `tarjetasColecciones()` → madres listadas con portada (incluido el punto focal) y conteo

**Revalidación.** Las etiquetas `fotos`, `colecciones` y `caracteristicas` se invalidan con los *hooks* de `modelo-contenido-panel` §5.2.12. Este componente solo agrega `revalidateTag` para los cambios en `fijada` y `ordenFijada`.

### 5.4 Componentes y estructura de código

```
src/
├── app/(sitio)/
│   ├── page.tsx                         # portada
│   ├── colecciones/page.tsx             # nueva
│   ├── colecciones/[slug]/page.tsx
│   ├── fotos/page.tsx
│   └── datos/fotos/route.ts             # siguiente página (JSON)
├── componentes/galeria/
│   ├── GrillaFotos.tsx                  # servidor: filas justificadas en CSS
│   ├── GrillaFotos.module.css           # --alto-fila, flex, línea al pasar
│   ├── ItemGrilla.tsx                   # enlace + MarcoFoto modo grilla + línea
│   ├── CargaInfinita.tsx                # cliente: marcador, estados, aria-live, sessionStorage
│   ├── SeccionHija.tsx
│   ├── CabeceraColeccion.tsx
│   ├── FiltroCaracteristicas.tsx        # ChipFiltro en fila, desplazable en móvil
│   ├── PortadaSitio.tsx                 # foto principal + línea de título
│   └── RejillaColecciones.tsx           # TarjetaColeccion 3/2/1
└── lib/
    ├── contenido.ts                     # funciones de §5.3
    └── cursor.ts                        # codificar y validar cursores (pruebas)
```

**Filas justificadas sin JavaScript.** Cada `ItemGrilla` es un elemento flexible con `flex-grow` igual a su proporción (ancho / alto) y `flex-basis: calc(<proporción> × var(--alto-fila))`. La imagen reserva su forma con `aspect-ratio`. El contenedor usa `display: flex; flex-wrap: wrap; gap: var(--esp-2)` y un `::after` con `flex-grow` muy alto, para que la última fila no se estire. Como el espacio sobrante se reparte en proporción a cada foto, todas las fotos de una fila quedan con el mismo alto. Cada item lleva además `max-width: calc(<proporción> × (100svh − var(--alto-encabezado)))`, para que una vertical sola en su fila no supere el alto de la pantalla (§4). La grilla se dibuja igual en el servidor y en el navegador, sin medir el ancho y sin saltos de diseño.

`MarcoFoto` (sistema de diseño) se usa en modo `grilla` sin recorte. `TarjetaColeccion` le pasa el recorte 4:5 y el punto focal. Las pruebas viven junto a `lib/` (`cursor.test.ts`, orden y conteos en `contenido.test.ts`).

### 5.5 Rendimiento y seguridad

- **Imágenes de la grilla:** `sizes` calculado del ancho aproximado de cada foto en su fila (`<proporción> × alto de fila`). Así el navegador elige la versión de 480 o 1200 px. La versión de 2048 px no se pide nunca en la grilla.
- **Prioridad:** en la portada, solo la foto principal lleva `prioridad` (sistema de diseño §5.3.2). En `/fotos` y en las colecciones, las primeras 4 fotos usan `loading="eager"`, sin `fetchpriority="high"`, y el resto, carga diferida.
- **Presupuesto:** la primera carga de `/fotos` en móvil pesa menos de 1,5 MB con las fotos visibles. El JavaScript propio de la galería (solo `CargaInfinita`) pesa menos de 8 KB comprimido. Se mantienen LCP < 2,5 s y CLS < 0,1 (marco §6.5).
- **Memoria:** filas con `content-visibility: auto` y `contain-intrinsic-size` igual al alto de fila. Las imágenes fuera de pantalla no se decodifican antes de tiempo (`decoding="async"`).
- **Caché:** las páginas y `/datos/fotos` se sirven desde caché, invalidada por etiquetas al publicar. Una visita no consulta la base de datos.
- **Seguridad:** `/datos/fotos` solo devuelve fotos visibles, con la misma función de visibilidad que la API, y valida todos los parámetros. Los cursores son opacos y se validan en el servidor. El endpoint no expone `huella`, `estado` ni datos de borradores.

### 5.6 Stack

| Pieza | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Filas justificadas | **CSS flex** con crecimiento proporcional | Sin JavaScript, sin medir, sin saltos de diseño; funciona en el navegador de Instagram y sin JS. | `react-photo-album` o `flickr-justified-layout`: exigen medir el contenedor en el navegador (salto inicial) y suman dependencias. |
| Scroll infinito | `IntersectionObserver` nativo en un componente cliente de unos 100 líneas | Cero dependencias. | `react-infinite-scroll-component` o virtualización (`react-virtuoso`): innecesarias con cientos de fotos y `content-visibility`. |
| Punto focal | Nativo de Payload (`focalPoint`) | Interfaz incluida en el panel, sin código propio. | Campo de recorte propio o versiones recortadas en el servidor: más archivos y más código. |

El resto se hereda del marco §6.6 y del sistema de diseño §5.7. **Costo incremental:** cero.

## 6. Cumplimiento normativo

Lo transversal está en el marco §7. Lo específico:

- **Datos personales:** este componente no trata datos personales. No hay formularios, cookies ni identificadores del visitante. Por eso no se reverifica la Ley 21.719 en este documento.
- **`sessionStorage`:** guarda solo cuántas fotos estaban cargadas y el `slug` de la foto abierta, por pestaña. No identifica al visitante, no se envía al servidor y se borra al cerrar la pestaña. No es una cookie ni rastreo, así que no requiere consentimiento (marco §7.4).
- **Metadatos:** la grilla y `/datos/fotos` usan solo las versiones web sin metadatos (marco §7.2). Los datos técnicos no se muestran en la galería.
- **Propiedad intelectual:** el tope de resolución se refuerza, porque la grilla nunca sirve la versión de 2048 px. El aviso de derechos va en el pie (marco §7.3).

## 7. Elementos obsoletos

No hay código previo. Este documento precisa o reemplaza estas definiciones:

| Documento | Definición | Reemplazo |
|---|---|---|
| Marco 1.2 §5 | "En la grilla se permite un recorte solo si el documento de galería lo define" | Las grillas de fotos nunca recortan (filas justificadas). Solo la foto de una `TarjetaColeccion` se recorta a 4:5, con punto focal. |
| Marco 1.2 §6.3 | Rutas sin `/colecciones` | Se agregan `/colecciones`, `?caracteristica=` en `/colecciones/[slug]`, `?pagina=` y `GET /datos/fotos`. |
| Marco 1.2 §6.1 `Foto` | Sin `fijada`, `ordenFijada` ni punto focal | Se agregan (§5.1). |
| Modelo de contenido 1.0 §5.1 y §5.3 | `Foto` sin esos campos; `lib/contenido.ts` sin paginación | Se agregan los campos, la lista "Fijadas" ordenable en el panel y las funciones de §5.3. |
| Sistema de diseño 1.0 | `ChipFiltro` en una línea en todos los tamaños | En móvil y tableta, fila desplazable (§3.9). No cambia el componente, solo su contenedor. |

## 8. Plan de acción

Para Claude Code, en el paso 4 del plan del marco (§9.2), después del modelo de contenido y del sistema de diseño.

| # | Paso | Depende de | Terminado cuando |
|---|---|---|---|
| 1 | Agregar `fijada`, `ordenFijada` y `focalPoint` a `Foto`, la lista "Fijadas" ordenable, las ayudas y la invalidación de etiquetas. | Modelo de contenido | Rod fija tres fotos, las ordena y el orden persiste. El punto focal se marca en el panel. |
| 2 | `lib/cursor.ts` y las funciones de §5.3 en `lib/contenido.ts`, con pruebas. | 1 | Pruebas en verde para orden, cursores, conteos, chips de colección y secciones de madre. |
| 3 | `GrillaFotos` e `ItemGrilla` con filas justificadas en CSS y la línea al pasar. | 2, sistema de diseño | La guía de estilo muestra una grilla con 4:5, 1:1, 3:2, 16:9 y 3:1 sin recortes, con filas de alto parejo y CLS 0. |
| 4 | `/fotos` con chips, orden y página siguiente sin JavaScript. | 3 | Criterios 4, 5 y 12. |
| 5 | `GET /datos/fotos` y `CargaInfinita` con estados, anuncio y recuperación de la posición. | 4 | Criterios 6, 7 y 8. |
| 6 | `/colecciones/[slug]`: cabecera, secciones de hijas, chips condicionales y redirecciones. | 3, 5 | Criterios 9, 10 y 11. |
| 7 | `/colecciones` y `RejillaColecciones` con recorte 4:5 por punto focal. | 2 | Criterio 13. |
| 8 | Portada: foto principal, colecciones (6 y "Ver todas"), destacadas y cierre. | 3, 7 | Criterios 1, 2 y 3. |
| 9 | Navegación del encabezado y estados vacíos con `PlantillaEstado`. | 4, 6, 7 | Criterios 14 y 15. |
| 10 | Pruebas de rendimiento y en dispositivos reales, incluido el navegador de Instagram. | 1–9 | Criterios 16 a 19. |

## 9. Criterios de aceptación y pruebas

1. En la portada, en 1440 × 900 y en 390 × 844, la foto principal se ve completa y asoma el inicio del bloque de colecciones. La foto y su línea llevan a su ficha.
2. Con 8 colecciones, la portada muestra 6 tarjetas y "Ver todas las colecciones"; con 1, una tarjeta sin ese botón. Sin destacadas, el bloque no aparece.
3. Desde la portada se llega a cualquier ficha en dos clics como máximo, también a las fotos de una hija sin página propia.
4. En `/fotos`, las fijadas aparecen primero en el orden de Rod y luego las demás, de la publicada más recientemente a la más antigua. Con un filtro, se respeta el mismo orden.
5. Ninguna foto se recorta en `/fotos`, en las colecciones ni en las destacadas. Las fotos de una misma fila tienen el mismo alto (±1 px) y la última fila no se estira.
6. Al bajar, se suman 30 fotos sin saltos, con una fila de esqueleto y el anuncio en `aria-live`. Al final de la lista no se hacen más pedidos.
7. Tras cargar 90 fotos, abrir la foto 75 y volver atrás, la vista queda en la foto 75 (Chrome, Safari iOS y navegador de Instagram).
8. Publicar una foto mientras se recorre `/fotos` no duplica ni salta fotos en la siguiente página.
9. Una madre muestra primero sus fotos propias y luego una sección por hija en el orden de Rod. La hija con página propia tiene "Ver colección" y la otra no.
10. Los chips aparecen en una colección solo si sus fotos reúnen dos o más características. Al filtrar una madre se ocultan las secciones vacías.
11. Una colección renombrada, una característica renombrada y una hija con `visibleSola = false` redirigen con 308. Una colección no visible muestra la plantilla de 404.
12. Sin JavaScript, `/fotos` y una colección muestran 30 fotos y "Más fotos" lleva a la página siguiente. `?pagina=999` redirige a la última página válida.
13. Las tarjetas de colección se ven en 4:5, centradas en el punto focal marcado en Payload, en 3, 2 y 1 columna según el ancho. El conteo dice "1 foto" o "N fotos" e incluye las fotos de las hijas.
14. En escritorio, al pasar el mouse o con Tab, aparecen el título y el lugar bajo la foto sin mover la grilla. En táctil no aparecen.
15. El enlace activo del encabezado es correcto en `/colecciones`, en una colección, en `/fotos` y en `/fotos?caracteristica=…`.
16. Lighthouse en móvil, en la portada, en `/fotos` y en una colección: LCP < 2,5 s, CLS < 0,1 y accesibilidad ≥ 95.
17. La grilla nunca pide la versión de 2048 px (se verifica en la pestaña de red).
18. `/datos/fotos` no devuelve fotos de colecciones en borrador ni campos internos, y responde 400 con un cursor alterado.
19. En el navegador de Instagram (iOS y Android), recorrer 150 fotos no recarga la página ni la cuelga.

## 10. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| GC-01 | Con scroll infinito, el pie (Instagram, Privacidad, Condiciones) queda difícil de alcanzar. | Media | Bajo | El encabezado vuelve al subir con Contacto y Sobre mí. Si se nota, en v1.x se puede pasar a "Ver más fotos" tras 90 fotos. |
| GC-02 | Quien solo mira la grilla no se entera de que puede pedir copias. | Media | Medio | La ficha lo deja claro. Se revisa con las primeras consultas y, si hace falta, se agrega una línea editable en la portada (cambio menor). |
| GC-03 | La recuperación de la posición falla en algún navegador y el visitante vuelve arriba tras ver una ficha. | Media | Medio | Prueba en dispositivos reales (criterio 7). Si `sessionStorage` falla, la página parte arriba sin errores. |
| GC-04 | Rod confunde destacadas con fijadas. | Baja | Bajo | Ayudas distintas en el panel y la lista filtrada "Fijadas" (O-6). |
| GC-05 | Una portada de colección se recorta mal porque no tiene punto focal. | Media | Bajo | El centro por defecto suele funcionar; la tarea T-009 incluye revisar las portadas. |
| GC-06 | Memoria en el navegador de Instagram con muchas fotos cargadas. | Media | Alto | `content-visibility`, versiones de 480 o 1200 px y criterio 19. |

## 11. Decisiones abiertas y tareas del dueño

**Decisiones abiertas:** ninguna bloquea. Para otros documentos:

- `portafolio/ficha-foto.md`: cómo usa el contexto `?coleccion=` y `?caracteristica=` para "Anterior/Siguiente" y el `Visor`, y qué hace si el contexto ya no contiene la foto.
- `plataforma/seo.md`: canonical de las fichas sin parámetros, indexación de `?pagina=` y `?caracteristica=`, y títulos de `/colecciones` y `/fotos`.

**Cambios al marco general.** Aplicados al aprobar este documento: el marco pasó a 1.3 (cambio menor, sin cambio de alcance).

1. §5: las grillas de fotos usan filas justificadas y no recortan; solo las tarjetas de colección recortan a 4:5 con punto focal.
2. §6.1 `Foto`: se agregan `fijada`, `ordenFijada` y el punto focal.
3. §6.3: se agregan `/colecciones`, `?caracteristica=` en colecciones, `?pagina=` y `GET /datos/fotos`.

**Cambios a `contenido/modelo-contenido-panel.md`.** Aplicados al aprobar: pasó a 1.1 (cambio menor) con los campos de §5.1, la lista "Fijadas" ordenable, las ayudas de `fijada` y `Coleccion.portada`, `focalPoint: true` y `crop: false` en `Foto`, y las funciones de §5.3 en `lib/contenido.ts`.

**Tareas del dueño**

| Id | Categoría | Tarea | Bloquea |
|---|---|---|---|
| T-009 | contenido | Al cargar las fotos de lanzamiento: elegir la foto de portada del sitio, marcar al menos 6 destacadas, elegir la portada de cada colección y revisar su punto focal, y fijar las fotos que quieras primero en Todas las fotos (opcional). | Lanzamiento (`despliegue`) |

## 12. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.10 | 2026-10-23 | Proporción uniforme 3:2 en `TarjetaColeccion` para equilibrar cuadrículas en toda la web: se elimina el desequilibrio y ruptura de línea base cuando conviven fotos verticales y horizontales en cuadrículas de 2 columnas; las obras verticales se encuadran en la caja 3:2 con `object-fit: cover` respetando el punto focal de Payload, garantizando simetría y alineación de títulos. |
| 1.9 | 2026-10-22 | Compresión editorial de sub-colecciones en la vista de colección madre (`/colecciones/[slug]`): en vez de desplegar la grilla completa de todas las fotos de cada hija en cascada, las sub-categorías se muestran comprimidas como tarjetas de portada (`RejillaColecciones`) con UNA foto representativa (portada asignada o primera foto) y el conteo de obras. Al hacer clic, se navega a la URL dedicada de la hija con retorno jerárquico. |
| 1.8 | 2026-10-22 | Hero Inmersivo de portada a pantalla completa (`min-height: calc(100svh - var(--alto-encabezado))`): la fotografía se despliega en resolución nítida nativa (sin degradación por blur) con velo cinemático oscuro y gradiente para contraste y legibilidad óptima; texto editorial y acciones centradas; pie de obra sutil flotante con acceso a ficha técnica. |
| 1.7 | 2026-10-21 | Rediseño editorial y narrativa integral del Home: respiro vertical superior contra el encabezado (`padding-top` y `max-height` calibrados para fotos verticales/panorámicas); apertura con Hero Editorial tipográfico (*«El papel detiene el tiempo»*) con declaración de autor y llamada directa a explorar colecciones y catálogo; incorporación del bloque de storytelling del taller Fine Art (`BloqueTaller`) con los 3 pilares de materialidad (taller propio, papeles 100% algodón y asesoría); enriquecimiento contextual en cabeceras de Colecciones y Destacadas; y nuevo bloque de cierre cálido invitando a consultar por obras y formatos para espacios. |
| 1.6 | 2026-10-20 | Proporción real y cero recorte en `TarjetaColeccion`: abandono de proporciones forzadas en favor del ratio nativo exacto de la foto de portada (`ancho / alto`), garantizando que obras verticales (como cordilleras con sendero) y panorámicas extensas se vean al 100% de su composición; las tarjetas panorámicas (`ratio >= 1.85`) se extienden al 100% del ancho (`grid-column: 1 / -1`); cuadrícula fluida de 2 columnas con `align-items: start`; y micro-interacción con zoom sutil `scale(1.025)`. |
| 1.5 | 2026-10-20 | Optimización visual para paisajes y panorámicas extensas: `RejillaColecciones` pasa a 2 columnas amplias en escritorio con tarjetas en proporción horizontal `3:2`; en `GrillaFotos`/`ItemGrilla` las panorámicas (`proporcion >= 2.0`) ocupan el 100 % del ancho de la fila de principio a fin y las filas con pocas fotos crecen naturalmente sin quedar chicas a un costado; `PortadaSitio` calibra su `max-width` según `--ratio-portada`; y se corrige `DYNAMIC_SERVER_USAGE` (Error 500) en `/colecciones/[slug]` y `/fotos`. |
| 1.4 | 2026-10-20 | Enriquecimiento de `ItemFotoPublica` en `mapearFotoPublica` (`src/lib/contenido.ts`) incluyendo `url`, `proporcion` y `sizes` (respetando `incluirGrande` para no exponer 2048px en grillas) además de `versiones`, garantizando compatibilidad directa con `MarcoFoto`, `Ficha` y `Visor`. |
| 1.3 | 2026-10-17 | Estado vacío explícito con `PlantillaEstado` en portada (`/`) cuando aún no hay obras publicadas, y diferenciación del mensaje vacío en `/fotos` sin filtro de característica activo, dirigiendo hacia `/sobre-mi`. |
| 1.2 | 2026-10-14 | Cambio menor al aprobar `plataforma/despliegue.md` 1.0: la compilación no consulta la base; las rutas se generan al primer pedido y el calentamiento cubre las principales (§5.3). |
| 1.1 | 2026-10-14 | Cambio menor al aprobar `portafolio/ficha-foto.md` 1.0: desde una colección con filtro activo, el enlace a la ficha lleva `?coleccion=` y `&caracteristica=` (§5.2.9). |
| 1.0 | 2026-10-14 | Aprobado por Rod. El marco general pasa a 1.3 y el modelo de contenido a 1.1 con los cambios del §11; nace T-009. |
| 0.1 | 2026-10-14 | Borrador inicial. Decisiones de Rod: filas justificadas sin recorte; portada con foto fija elegida por Rod, luego colecciones y destacadas; madre agrupada por secciones de hijas; `/fotos` por publicación más reciente con fotos fijadas arriba en su orden; título y lugar solo al pasar el mouse; scroll infinito; página `/colecciones` en el encabezado; filtro por característica en `/fotos` y en cada colección; la invitación a pedir copia vive solo en la ficha; tarjetas de colección recortadas a 4:5 con punto focal. |

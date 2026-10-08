# Identidad visual y sistema de diseño

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/identidad/sistema-de-diseno.md` |
| Tipo | Transversal |
| Versión | 0.1 |
| Estado | En revisión |
| Fecha | 2026-10-07 |
| Padre | `DocumentosTecnicos/marco-general/marco-general-proyecto.md` |
| Dependencias | `marco-general` |
| Versión del producto | v1.0 |

## Índice

1. Contexto y objetivo
2. Alcance
3. Flujo de usuario y UX/UI cuestionado
4. Casos borde
5. Especificación técnica
   - 5.1 Modelo de datos
   - 5.2 Reglas de diseño (tokens)
   - 5.3 Interfaces de los componentes base
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

Este documento fija la identidad visual del sitio y el sistema de diseño que usan todos los componentes visibles: galería, ficha, consulta y páginas. Aplica los principios de UX/UI del marco general (§4.2) y los convierte en valores concretos.

- **Para el Visitante:** un sitio coherente donde la foto es protagonista. La interfaz es oscura, neutra y silenciosa, y la llamada a pedir una copia se reconoce sin esfuerzo.
- **Para el Administrador:** su marca ("Rod Díaz") presente sin diseñar un logo hoy, con la puerta abierta a subir uno desde el panel más adelante.
- **Para quien implementa:** tokens y componentes base únicos, de modo que ningún componente decida su propio color, tipografía o movimiento.

**Carácter de la identidad:** galería de autor. Fondo grafito neutro, títulos en serif de alto contraste (Cormorant Garamond) con voz de revista de fotografía, y una sans clara (Manrope) para todo lo funcional. Sin color de acento: el único elemento claro y relleno de cada vista es la acción principal.

## 2. Alcance

**Incluye**

- Tokens de color, tipografía, espaciado, retícula, radios y movimiento.
- Marca: wordmark tipográfico "Rod Díaz" y regla para reemplazarlo por un logo subido desde el panel.
- Componentes base con sus estados: `Marca`, `Encabezado`, `Pie`, `Boton`, `MarcoFoto`, `ChipFiltro`, `Campo`, `Dialogo`, `Aviso` y `SaltarContenido`.
- Una página de guía de estilo, visible solo en desarrollo, que muestra todos los componentes y estados.

**No incluye**

- Pantallas concretas (portada, grilla, ficha, formulario, páginas). Las definen sus documentos y usan este sistema.
- Estilo del panel de administración. El panel usa el tema oscuro estándar de Payload; su configuración la define `contenido/modelo-contenido-panel.md`.
- Imagen Open Graph y favicon definitivos. Se definen en `plataforma/seo.md`, usando la `Marca` de este documento.

**Para versiones posteriores**

- Logo propio diseñado (cuando Rod lo tenga, se sube al panel sin cambiar código).
- Modo claro: **no se planifica**. El sitio es oscuro siempre (marco §4.2.1).

## 3. Flujo de usuario y UX/UI cuestionado

Este documento no tiene un flujo propio: define cómo se ve y se comporta cada pieza en todos los flujos.

### 3.1 Qué percibe el visitante en los primeros segundos

1. Una franja superior sobria con "Rod Díaz" en serif a la izquierda y la navegación en sans a la derecha.
2. Debajo, la foto ocupa casi toda la pantalla, sin texto encima y sin nada que compita en color.
3. En cada ficha, un solo elemento claro y relleno: "Pedir una copia".

### 3.2 Escritorio y móvil

| Aspecto | Escritorio (≥ 1024 px) | Móvil (< 640 px) |
|---|---|---|
| Márgenes laterales | 48 px (64 px desde 1440 px) | 16 px |
| Encabezado | Marca + navegación en línea, alto 72 px | Marca + botón "Menú", alto 56 px; el menú abre un panel a pantalla completa |
| Foto en ficha | Con aire: alto máximo = alto de ventana − encabezado − 96 px; ancho máximo 1600 px; centrada, nunca recortada | Ancho completo menos márgenes; alto libre |
| Títulos | Escala grande (hasta 64 px) | Escala reducida (máx. 36 px) |

Entre 640 y 1023 px (tableta) se usan márgenes de 32 px y la navegación móvil.

### 3.3 Accesibilidad

- Contraste AA verificado para cada par de color (§5.2.1).
- Foco visible en todo elemento interactivo: contorno de 2 px en `--color-foco` con separación de 3 px.
- Objetivos táctiles de 44 × 44 px como mínimo; campos de 48 px de alto.
- Enlace "Saltar al contenido" como primer elemento enfocable.
- Texto de los campos a 16 px para evitar el zoom automático de iOS.
- `prefers-reduced-motion`: se eliminan desplazamientos y escalas; se mantienen solo fundidos de opacidad cortos.

### 3.4 Microinteracciones

Solo se anima lo que responde a una acción o evita un cambio brusco:

| Momento | Movimiento |
|---|---|
| Foto que termina de cargar | Fundido desde el color dominante, 300 ms |
| Encabezado que se oculta o vuelve | Desplazamiento vertical, 200 ms |
| Presionar un botón | Escala a 0,97, 120 ms |
| Abrir o cerrar `Dialogo` o el menú móvil | Fundido + desplazamiento de 8 px, 250 ms al abrir y 200 ms al cerrar |
| Hover de enlaces y chips | Cambio de color, 150 ms |

No hay animaciones de entrada por sección, ni paralaje, ni movimientos al hacer scroll sobre las fotos.

### 3.5 Objeciones planteadas y su resolución

| # | Objeción | Resolución |
|---|---|---|
| O-1 | Cormorant Garamond se ve frágil y pierde legibilidad en tamaños chicos, sobre todo en fondo oscuro y móviles de gama baja. | La serif se usa **solo desde 24 px** (títulos y marca). Todo texto de lectura, incluida la historia de la foto, va en Manrope. |
| O-2 | Botones redondeados (8 px) junto a fotos rectas pueden verse como dos lenguajes distintos. | Las fotos **nunca** llevan radio; el radio de 8 px es solo para controles (botones, chips, campos, diálogos). La foto es un objeto, el control es interfaz. |
| O-3 | Un encabezado que se oculta puede desorientar o esconderse justo cuando se navega con teclado. | Se oculta solo tras bajar 80 px y vuelve al subir. Siempre se ve arriba de todo, cuando un elemento suyo recibe foco y con el menú móvil abierto. Con `prefers-reduced-motion` aparece y desaparece sin desplazamiento. |
| O-4 | Sin color de acento, ¿se distingue "Pedir una copia"? | Sí, por contraste: es el único elemento relleno claro (`#ECECEC` sobre `#151515`) de la vista. Regla: un solo `Boton` primario por vista. |
| O-5 | En la portada, un encabezado sobre la foto taparía parte de la obra y obligaría a degradados. | El encabezado va siempre sobre fondo sólido, nunca superpuesto a una foto. |
| O-6 | Mostrar el ícono de Instagram implica usar un logo de marca registrada y sumar una librería de íconos. | El enlace a Instagram se muestra como texto ("Instagram"). Los pocos íconos de interfaz (menú, cerrar) son SVG propios en línea. |

## 4. Casos borde

| Caso | Resolución |
|---|---|
| Título de 120 caracteres en `titulo-lg` | Se ajusta en varias líneas con `text-wrap: balance`. En grillas, `galeria-colecciones` puede limitar a 3 líneas; la ficha siempre muestra el título completo. |
| Tildes, ñ, comillas tipográficas y signos ¿¡ | Ambas familias cubren latín extendido; se carga el subconjunto `latin` y `latin-ext`. |
| Foto panorámica (por ejemplo 3:1) en la ficha | `MarcoFoto` la limita por ancho; queda baja y centrada, con aire arriba y abajo. |
| Foto vertical (4:5, 2:3) en la ficha de escritorio | `MarcoFoto` la limita por alto (ventana − encabezado − 96 px) y la centra. |
| La fuente no carga o tarda | `font-display: swap` con métrica de respaldo ajustada (Georgia para la serif, `system-ui` para la sans), sin salto de diseño perceptible. |
| Foto que no carga (error de red) | `MarcoFoto` conserva el color dominante y el espacio reservado, y muestra en texto secundario "No pudimos cargar esta foto". |
| Color dominante muy claro (foto en clave alta) | No hay texto sobre el marcador; el contraste de la interfaz no depende de la foto. |
| Navegador interno de Instagram (barra de URL dinámica, `100vh` inestable) | Altos con `svh`, con `vh` como respaldo. El oculto del encabezado usa un listener pasivo y se desactiva si la ventana mide menos de 480 px de alto. |
| Dispositivos táctiles con hover "pegado" | Los estilos `:hover` se declaran dentro de `@media (hover: hover)`. |
| Sistema operativo en modo claro | El sitio declara `color-scheme: dark` y se ve igual. |
| Modo de alto contraste de Windows (`forced-colors`) | Los controles conservan borde visible; el foco usa `Highlight`. |
| Zoom al 200 % | La retícula es fluida y no aparece scroll horizontal. |
| Logo subido como PNG con fondo blanco o muy grande | El panel acepta SVG o PNG de hasta 200 KB. Se muestra con 28 px de alto y hasta 200 px de ancho. La guía del panel recomienda logo claro sobre fondo transparente. |
| Logo SVG con código incrustado | Se muestra con `<img>`, donde los scripts de un SVG no se ejecutan. Nunca se inserta en línea. |
| Logo eliminado del panel | Vuelve automáticamente el wordmark. |

## 5. Especificación técnica

### 5.1 Modelo de datos

Este documento no crea entidades. Requiere **dos campos nuevos en el global `AjustesSitio`** (marco §6.1):

| Campo | Tipo | Validación | Uso |
|---|---|---|---|
| `nombreMarca` | texto, obligatorio, máx. 40 | — | Texto del wordmark. Valor inicial: "Rod Díaz". Distinto de `nombreSitio` ("Fotos de Rod"), que se usa en SEO y en la pestaña. |
| `logo` | upload opcional | SVG o PNG, máx. 200 KB | Si existe, reemplaza al wordmark en `Marca`. Su texto alternativo es `nombreMarca`. |

Los implementa `contenido/modelo-contenido-panel.md`. Al aprobar este documento, el marco pasa a 1.1 para listar ambos campos en `AjustesSitio` (cambio menor, sin alterar contratos).

### 5.2 Reglas de diseño (tokens)

Los tokens viven como propiedades CSS en `:root`. Ningún componente usa valores literales de color, tamaño de texto, espaciado, radio o duración.

#### 5.2.1 Color

| Token | Valor | Uso | Contraste sobre `--color-fondo` |
|---|---|---|---|
| `--color-fondo` | `#151515` | Fondo de toda página | — |
| `--color-superficie` | `#1C1C1C` | Diálogos, menú móvil, campos | — |
| `--color-superficie-alta` | `#242424` | Hover de chips y botón secundario | — |
| `--color-linea` | `#2A2A2A` | Divisores decorativos | Decorativo |
| `--color-linea-control` | `#6B6B6B` | Bordes de campos, chips y botón secundario | 3,4:1 (≥ 3:1 para controles) |
| `--color-texto` | `#ECECEC` | Títulos y texto principal | 15,5:1 |
| `--color-texto-secundario` | `#A3A3A3` | Lugar, fecha, datos, navegación en reposo | 7,2:1 |
| `--color-texto-terciario` | `#8C8C8C` | Ayudas de campo, pie de página | 5,4:1 |
| `--color-accion` | `#ECECEC` | Fondo del botón primario | — |
| `--color-accion-hover` | `#FFFFFF` | Hover del botón primario | — |
| `--color-accion-texto` | `#151515` | Texto del botón primario | 15,5:1 sobre `--color-accion` |
| `--color-foco` | `#ECECEC` | Contorno de foco | 15,5:1 |
| `--color-error` | `#E58B8B` | Mensajes y borde de campo con error | 7,3:1 |
| `--color-exito` | `#9CC9A4` | Confirmación de envío | 9,8:1 |

Reglas:

- No hay color de acento. El rojo y el verde se usan solo en estados de formulario, siempre acompañados de texto.
- No hay sombras ni degradados. La profundidad se marca con `--color-superficie` y líneas.
- El marcador de carga de cada foto usa su `Foto.colorDominante`, no un token.

#### 5.2.2 Tipografía

| Familia | Rol | Pesos | Regla |
|---|---|---|---|
| **Cormorant Garamond** | Marca y títulos | 400 y 500 | Solo desde 24 px. Nunca en párrafos, botones ni campos. |
| **Manrope** | Lectura e interfaz | 400 y 500 (variable) | Todo lo demás. |

Escala (los títulos son fluidos con `clamp()` entre móvil y escritorio):

| Token | Familia | Tamaño | Interlínea | Uso |
|---|---|---|---|---|
| `--texto-xs` | Manrope 400 | 13 px | 1,5 | Pie, ayudas, créditos |
| `--texto-sm` | Manrope 400/500 | 14 px | 1,5 | Navegación, botones, chips, meta (lugar · fecha) |
| `--texto-base` | Manrope 400 | 16 px | 1,6 | Texto de interfaz, campos |
| `--texto-lectura` | Manrope 400 | 17 px | 1,7 | Historia de la foto, "Sobre mí"; ancho máx. 65 ch |
| `--titulo-sm` | Cormorant 500 | 24 px | 1,2 | Nombre de colección en tarjetas, marca |
| `--titulo-md` | Cormorant 400 | clamp(28 px, 3vw, 36 px) | 1,15 | Títulos de sección y de página |
| `--titulo-lg` | Cormorant 400 | clamp(32 px, 4vw, 48 px) | 1,1 | Título de ficha y de colección |
| `--titulo-xl` | Cormorant 400 | clamp(36 px, 5vw, 64 px) | 1,05 | Uso excepcional en portada |

- Espaciado entre letras: títulos Cormorant −0,01 em; marca +0,01 em; Manrope 0.
- Sin mayúsculas sostenidas en etiquetas. Todo en tipo oración.
- Números de medidas con cifras tabulares (`font-variant-numeric: tabular-nums`) y el signo × con espacios finos ("30 × 45 cm").

#### 5.2.3 Espaciado y retícula

- Escala de 4 px: `--esp-1` 4, `--esp-2` 8, `--esp-3` 12, `--esp-4` 16, `--esp-5` 24, `--esp-6` 32, `--esp-7` 48, `--esp-8` 64, `--esp-9` 96, `--esp-10` 128 (px).
- Puntos de quiebre: 640, 1024 y 1440 px.
- Márgenes laterales (`--margen`): 16 / 32 / 48 / 64 px según punto de quiebre.
- Ancho máximo del contenido: 1600 px. Texto de lectura: 65 ch.
- Alineación: texto a la izquierda en todo el sitio. Las fotos se centran en su contenedor.

#### 5.2.4 Forma

- `--radio-control`: 8 px para botones, chips, campos y diálogos.
- Fotos y marcadores de carga: radio 0, siempre.
- Bordes de controles: 1 px.

#### 5.2.5 Movimiento

| Token | Valor |
|---|---|
| `--dur-rapida` | 150 ms (hover, color) |
| `--dur-presion` | 120 ms (escala al presionar) |
| `--dur-base` | 200 ms (encabezado, cierre de diálogos) |
| `--dur-apertura` | 250 ms (apertura de diálogos y menú) |
| `--dur-foto` | 300 ms (fundido de foto cargada) |
| `--curva-salida` | `cubic-bezier(0.23, 1, 0.32, 1)` (entradas, salidas y respuestas) |
| `--curva-movimiento` | `cubic-bezier(0.77, 0, 0.175, 1)` (desplazamiento del encabezado) |

- Se anima solo `opacity` y `transform`, nunca `all`.
- Nunca `ease-in` en la interfaz.
- Con `prefers-reduced-motion: reduce`, los `transform` se eliminan y las duraciones bajan a 150 ms o menos.

### 5.3 Interfaces de los componentes base

Todos los textos visibles que no sean propios del componente (nombre, enlaces, aviso de derechos) salen de `AjustesSitio` o de `Pagina` (marco §6.2.10).

| Componente | Props principales | Estados y comportamiento |
|---|---|---|
| `Marca` | `ajustes` (`nombreMarca`, `logo`) | Si hay `logo`: `<img>` de 28 px de alto, `alt = nombreMarca`. Si no: `nombreMarca` en `--titulo-sm`. Enlaza a `/`. |
| `Encabezado` | `ajustes`, `navegacion` (lista de enlaces) | Fondo sólido. Escritorio: enlaces en línea con el activo en `--color-texto` y el resto en secundario. Móvil: botón "Menú" (44 px) que abre panel a pantalla completa con foco atrapado y cierre con Esc o "Cerrar". Oculto al bajar 80 px y visible al subir (O-3). |
| `Pie` | `ajustes` | "© <año> <aviso de derechos>", enlaces a Instagram, Contacto, Privacidad y Condiciones, en `--texto-xs`. |
| `Boton` | `variante` (`primario`, `secundario`, `enlace`), `cargando`, `href` opcional | Reposo, hover, foco, presionado (escala 0,97) y cargando (indicador + texto, por ejemplo "Enviando…", con `aria-busy`). No se usan botones deshabilitados: se valida al usar. Un solo `primario` por vista. Alto mínimo 44 px. |
| `MarcoFoto` | `foto` (versiones, `ancho`, `alto`, `colorDominante`, `titulo`, `textoAlternativo`), `modo` (`grilla`, `ficha`, `portada`), `prioridad`, `sizes` | Reserva proporción con `aspect-ratio` desde `ancho`/`alto`. Fondo `colorDominante` mientras carga y luego fundido. `<picture>` con AVIF, WebP y JPEG; `srcset` 480/1200/2048 (marco §6.2.2). `loading="lazy"` salvo `prioridad` (LCP: `fetchpriority="high"`). Error: conserva el marcador y muestra el texto de error. Disuasión: sin menú contextual, `draggable=false`, sin selección ni menú táctil prolongado (`-webkit-touch-callout: none`). En `ficha`, aplica la regla "con aire" (§3.2). Nunca recorta en `ficha`; el recorte en `grilla` lo decide `galeria-colecciones`. |
| `ChipFiltro` | `etiqueta`, `activo`, `alCambiar` | Botón de alternancia con `aria-pressed`. Reposo: borde `--color-linea-control`, texto secundario. Activo: fondo `--color-texto`, texto `--color-fondo`. Alto 36 px visibles con área táctil de 44 px. |
| `Campo` | `tipo` (`texto`, `correo`, `telefono`, `area`, `seleccion`, `casilla`), `etiqueta`, `ayuda`, `error`, `obligatorio` | Etiqueta arriba, siempre visible (sin depender del placeholder). Alto 48 px; texto 16 px. Error: borde y mensaje en `--color-error`, enlazado con `aria-describedby`. "(opcional)" en los no obligatorios, en vez de asteriscos. |
| `Dialogo` | `abierto`, `alCerrar`, `titulo` | Basado en `<dialog>` nativo. En escritorio, panel centrado de hasta 560 px; en móvil, a pantalla completa. Foco atrapado, cierre con Esc, bloqueo del scroll de fondo y retorno del foco al disparador. Sirve de base si D-01 del marco se resuelve como modal. |
| `Aviso` | `tipo` (`info`, `error`, `exito`), `titulo`, `accion` opcional | Mensaje en línea para estados vacíos, errores y confirmaciones. No se usan notificaciones flotantes. |
| `SaltarContenido` | — | Primer elemento enfocable; visible solo con foco. |

### 5.4 Componentes y estructura de código

Se crean (rutas según marco §6.4):

```
src/
├── estilos/
│   ├── tokens.css            # todas las propiedades de §5.2
│   └── base.css              # normalización, body, foco, color-scheme, reduced-motion, forced-colors
├── app/(sitio)/
│   ├── fuentes.ts            # next/font: Cormorant Garamond y Manrope
│   ├── layout.tsx            # importa estilos, fuentes, SaltarContenido, Encabezado y Pie
│   └── guia-estilo/page.tsx  # catálogo de componentes y estados; notFound() fuera de desarrollo
└── componentes/base/
    ├── Marca.tsx
    ├── Encabezado.tsx (+ Encabezado.module.css, MenuMovil.tsx)
    ├── Pie.tsx
    ├── Boton.tsx
    ├── MarcoFoto.tsx
    ├── ChipFiltro.tsx
    ├── Campo.tsx
    ├── Dialogo.tsx
    ├── Aviso.tsx
    ├── SaltarContenido.tsx
    └── iconos.tsx            # SVG propios: menú, cerrar
```

Cada componente usa un CSS Module propio (`*.module.css`) que solo consume tokens.

### 5.5 Rendimiento y seguridad

- **Fuentes:** solo los pesos de §5.2.2 y los subconjuntos `latin` y `latin-ext`, en WOFF2 autoalojado. Presupuesto: ≤ 120 KB entre ambas familias. Se precargan las dos.
- **CSS:** sin framework de utilidades; el CSS global (tokens + base) queda bajo 10 KB.
- **JavaScript del sistema:** solo el oculto del encabezado, el menú móvil y `Dialogo`. Se cargan como componentes cliente acotados; el resto es servidor.
- **CLS:** `MarcoFoto` reserva siempre la proporción y las fuentes usan métricas de respaldo ajustadas.
- **Seguridad del logo:** se acepta SVG o PNG, se sirve desde los medios de Payload y se muestra solo con `<img>` (§4).

### 5.6 Stack

| Pieza | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Estilos | **CSS Modules + propiedades CSS** (incluido en Next.js) | Cero dependencias, tokens legibles y CSS acotado por componente. | Tailwind: otra dependencia y clases largas en el marcado, sin ganancia para una decena de componentes. |
| Fuentes | **`next/font/google`** con Cormorant Garamond y Manrope (licencia OFL, gratis) | Descarga las fuentes en la compilación y las sirve desde el propio sitio; el visitante nunca se conecta a Google. Ajusta métricas de respaldo. | Enlazar Google Fonts en la página: agrega una conexión a un tercero y expone la IP del visitante. |
| Íconos | **SVG propios en línea** (2 o 3 íconos) | Peso nulo y sin licencias de marca. | Lucide u otra librería: innecesaria para tan pocos íconos. |
| Diálogos | **`<dialog>` nativo** | Accesible por defecto y sin dependencias. | Radix u otra librería de diálogos: más peso del necesario. |

Todo lo demás se hereda del marco §6.6. Costo incremental: cero.

## 6. Cumplimiento normativo

Este documento no trata datos personales; lo transversal está en el marco §7. Lo específico:

- **Fuentes autoalojadas:** al no cargar fuentes desde servidores de Google, el sitio no transfiere la IP del visitante a un tercero. Mantiene la condición del marco §7.4 (sin cookies ni rastreo) y no requiere mencionar a Google Fonts en la política de privacidad.
- **Licencias:** Cormorant Garamond y Manrope se distribuyen bajo SIL Open Font License 1.1, que permite su uso en sitios comerciales. Se incluye el archivo de licencia en el repositorio, junto a `fuentes.ts`.
- **Propiedad intelectual:** el aviso de derechos del `Pie` sale de `AjustesSitio` (marco §7.3).
- **Accesibilidad:** no hay una obligación legal específica para este sitio; AA se aplica como principio del marco §4.2.8.

## 7. Elementos obsoletos

No aplica: no hay código previo. Las combinaciones tipográficas que no se eligieron en el prototipo (Newsreader + Hanken Grotesk y EB Garamond + Work Sans) quedan descartadas y no se usan.

## 8. Plan de acción

Para Claude Code, después del paso 2 del plan del marco (§9.2, modelo de contenido).

| # | Paso | Depende de | Terminado cuando |
|---|---|---|---|
| 1 | Crear `tokens.css` y `base.css` con todos los valores de §5.2, `color-scheme: dark`, foco, `prefers-reduced-motion` y `forced-colors`. | — | Los tokens existen y `body` muestra fondo `#151515` con Manrope. |
| 2 | Configurar `fuentes.ts` con `next/font/google` (pesos y subconjuntos de §5.2.2) y agregar las licencias OFL. | 1 | En la pestaña Red no hay solicitudes a `fonts.googleapis.com` ni `fonts.gstatic.com`. |
| 3 | Verificar que `AjustesSitio` tiene `nombreMarca` y `logo` (§5.1) y crear `Marca`. | 1, modelo de contenido | Con logo cargado se ve el logo; al quitarlo vuelve el wordmark. |
| 4 | Crear `SaltarContenido`, `Encabezado` (con menú móvil y oculto al bajar) y `Pie`, e integrarlos en `layout.tsx`. | 3 | Cumplen O-3 y la navegación con teclado. |
| 5 | Crear `Boton`, `ChipFiltro`, `Campo` y `Aviso` con todos sus estados. | 1 | Cada estado se ve en la guía de estilo. |
| 6 | Crear `MarcoFoto` con los tres modos, marcador, fundido, error y disuasión de descarga. | 1, modelo de contenido (versiones de imagen) | Sin CLS y sin menú contextual sobre la foto. |
| 7 | Crear `Dialogo` sobre `<dialog>`. | 1 | Foco atrapado, Esc cierra y el foco vuelve al disparador. |
| 8 | Crear `guia-estilo/page.tsx` con todos los componentes y estados, con fotos de prueba vertical, horizontal, cuadrada y panorámica. | 3–7 | La página existe en desarrollo y responde 404 en producción. |
| 9 | Verificar contraste, teclado, `reduced-motion` y Lighthouse sobre la guía de estilo. | 8 | Se cumplen los criterios de §9. |

## 9. Criterios de aceptación y pruebas

1. Ningún componente usa colores, tamaños, espaciados, radios ni duraciones literales; todo sale de `tokens.css` (revisión de código).
2. Los pares de color de §5.2.1 cumplen los contrastes indicados (verificación con herramienta de contraste).
3. Cormorant Garamond no aparece en ningún elemento con tamaño menor a 24 px.
4. No hay solicitudes a dominios de Google al cargar el sitio público.
5. El peso total de fuentes es ≤ 120 KB.
6. La guía de estilo obtiene CLS < 0,1 y accesibilidad ≥ 95 en Lighthouse.
7. Todo elemento interactivo se alcanza con Tab, tiene foco visible y mide al menos 44 × 44 px de área táctil.
8. Con `prefers-reduced-motion: reduce` no hay desplazamientos ni escalas.
9. El encabezado se oculta al bajar, vuelve al subir y aparece al recibir foco.
10. `MarcoFoto` en modo `ficha` muestra completas una foto vertical 4:5, una horizontal 3:2 y una panorámica 3:1, sin recorte y sin scroll para ver la vertical en una ventana de 1440 × 900.
11. `MarcoFoto` no ofrece menú contextual ni arrastre, y en iOS no muestra el menú de guardar imagen con pulsación larga.
12. Subir un logo en `AjustesSitio` lo muestra en el encabezado sin despliegue de código; quitarlo vuelve al wordmark.
13. El sitio se ve correcto en el navegador interno de Instagram (iOS y Android): encabezado, menú móvil y fotos sin saltos.
14. Con el sistema operativo en modo claro, el sitio sigue oscuro.

## 10. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| SD-01 | Cormorant Garamond se ve delgada o borrosa en pantallas de baja densidad. | Media | Medio | Mínimo de 24 px y peso 500 en la marca y en `--titulo-sm`; revisión en un móvil de gama baja durante el paso 9. |
| SD-02 | El oculto del encabezado produce saltos en el navegador de Instagram. | Media | Medio | Listener pasivo, umbral de 80 px y desactivación en ventanas bajas (§4). Si persiste, el encabezado queda no fijo en ese navegador. |
| SD-03 | Las fuentes superan el presupuesto y afectan el LCP en móvil. | Baja | Medio | Solo dos pesos por familia, subconjuntos latinos y WOFF2. |
| SD-04 | Un logo mal preparado (fondo blanco, muy ancho) rompe el encabezado. | Media | Bajo | Tope de alto y ancho, recomendación en el panel y retorno automático al wordmark al quitarlo. |
| SD-05 | Sin color de acento, la llamada a la copia pasa inadvertida en móvil. | Baja | Alto | Un solo primario claro por vista; se valida en la ficha con usuarios reales antes del lanzamiento (`portafolio/ficha-foto.md`). |

## 11. Decisiones abiertas y tareas del dueño

**Decisiones abiertas**

- Ninguna que bloquee. El modal o la página para la consulta (D-01 del marco) se decide en `consultas/consulta-copia.md`; este documento deja listo `Dialogo` por si se elige modal.

**Cambios que nacen para otros documentos**

- `marco-general`: al aprobar este documento pasa a 1.1, agregando `nombreMarca` y `logo` a `AjustesSitio` en §6.1.
- `contenido/modelo-contenido-panel.md` (pendiente): implementa esos dos campos.
- `plataforma/seo.md` (pendiente): favicon e imagen Open Graph a partir de `Marca`.

**Tareas del dueño**

- Ninguna nueva. Cuando Rod tenga un logo, lo sube al panel sin pasar por un documento.

## 12. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 2026-10-07 | Borrador inicial. Decisiones de Rod: serif editorial + sans (Cormorant Garamond + Manrope, elegido sobre prototipo), wordmark "Rod Díaz" configurable a logo, grafito neutro sin acento, foto con aire en la ficha, encabezado que se oculta al bajar y vuelve al subir, controles con radio de 8 px. |

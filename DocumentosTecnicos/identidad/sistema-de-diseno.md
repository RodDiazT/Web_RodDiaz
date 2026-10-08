# Identidad visual y sistema de diseño

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/identidad/sistema-de-diseno.md` |
| Tipo | Transversal |
| Versión | 0.2 |
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
   - 5.3 Patrones de composición
   - 5.4 Interfaces de los componentes base
   - 5.5 Componentes y estructura de código
   - 5.6 Rendimiento y seguridad
   - 5.7 Stack
6. Cumplimiento normativo
7. Elementos obsoletos
8. Plan de acción
9. Criterios de aceptación y pruebas
10. Riesgos
11. Decisiones abiertas y tareas del dueño
12. Control de cambios

---

## 1. Contexto y objetivo

Este documento fija la identidad visual del sitio y el sistema de diseño de todos los componentes visibles (galería, ficha, consulta y páginas). Aplica los principios de UX/UI del marco general (§4.2) y los convierte en valores concretos.

- **Para el Visitante:** el sitio se ve coherente y la foto es la protagonista. La interfaz es oscura, neutra y silenciosa; la foto se puede ver en grande, y la llamada a pedir una copia se reconoce sin esfuerzo y sin bajar.
- **Para el Administrador:** una sola identidad, "Rod Díaz". Hoy se resuelve con un wordmark, y el logo se puede subir desde el panel cuando exista.
- **Para quien implementa:** tokens, patrones y componentes base únicos. Ningún componente decide su propio color, tipografía, movimiento ni composición de ficha.

**Carácter de la identidad: galería de autor.**

- Fondo grafito neutro.
- Títulos en serif de alto contraste (Cormorant Garamond), con voz de revista de fotografía.
- Una sans clara (Manrope) para todo lo funcional.
- Sin color de acento: el único elemento claro y relleno de cada vista es la acción principal.

## 2. Alcance

**Incluye**

- Tokens de color, tipografía, espaciado, retícula, forma, capas y movimiento.
- Marca:
  - wordmark "Rod Díaz" y su reemplazo por un logo subido desde el panel;
  - monograma "RD" como favicon.
- Patrones de composición:
  - disposición de la ficha (columna lateral o franja inferior según la proporción);
  - foto de portada;
  - plantilla de estado vacío o de error.
- Componentes base con sus estados: `Marca`, `Encabezado`, `MenuMovil`, `Pie`, `Boton`, `MarcoFoto`, `Visor`, `NavegacionFotos`, `Retorno`, `TarjetaColeccion`, `ChipFiltro`, `Campo`, `Dialogo`, `Aviso`, `Esqueleto`, `SaltarContenido` e íconos.
- Página de guía de estilo, visible solo en desarrollo.

**No incluye**

- El contenido y el orden de cada pantalla. Qué datos van en la ficha, cómo se arma la grilla y qué lleva la portada lo definen sus documentos, usando estos patrones.
- El estilo del panel de administración, que usa el tema oscuro estándar de Payload (`contenido/modelo-contenido-panel.md`).
- La imagen Open Graph y el formato del título SEO, que define `plataforma/seo.md` a partir de la `Marca` y el monograma de este documento.

**Para versiones posteriores**

- Logo diseñado: cuando Rod lo tenga, se sube al panel sin cambiar código.
- Imágenes en gama amplia (Display P3): v1.x o futuro. La v1.0 entrega sRGB (§5.6).
- Modo claro: **no se planifica**. El sitio es oscuro siempre (marco §4.2.1).

## 3. Flujo de usuario y UX/UI cuestionado

Este documento no tiene un flujo propio. Define cómo se ve y se comporta cada pieza en todos los flujos.

### 3.1 Qué percibe el visitante en los primeros segundos

1. Una franja superior sobria: "Rod Díaz" en serif a la izquierda y la navegación en sans a la derecha.
2. Debajo, la foto ocupa casi toda la pantalla, sin texto encima y sin nada que compita en color.
3. En cada ficha, el título y "Pedir una copia" se ven **sin bajar** en escritorio (§5.3.1). Es el único elemento claro y relleno de la vista.
4. Un clic en la foto la abre en el `Visor`, a pantalla completa.

### 3.2 Escritorio y móvil

| Aspecto | Escritorio (≥ 1024 px) | Móvil (< 640 px) |
|---|---|---|
| Márgenes laterales | 48 px (64 px desde 1440 px) | 16 px, o la zona segura si es mayor |
| Encabezado | Marca y navegación en línea, 72 px de alto | Marca y botón "Menú", 56 px de alto; el menú abre a pantalla completa |
| Ficha | Columna lateral o franja inferior según la proporción (§5.3.1) | Apilada: foto, título, datos y botón |
| Visor | Flechas laterales, contador y botón de copia | Deslizar entre fotos y pellizcar para ampliar |
| Títulos | Escala grande, hasta 64 px | Escala reducida, hasta 36 px |

En tableta (640 a 1023 px) se usan márgenes de 32 px, la navegación móvil y la ficha apilada.

### 3.3 Accesibilidad

- **Contraste AA** verificado para cada par de color (§5.2.1).
- **Foco visible** en todo elemento interactivo: contorno de 2 px en `--color-foco` con 3 px de separación. Sobre fotos se usa doble anillo (§5.4, `MarcoFoto`).
- **Tamaños táctiles:** objetivos de al menos 44 × 44 px y campos de 48 px de alto.
- **"Saltar al contenido"** es el primer elemento enfocable.
- **Texto de campos a 16 px**, para evitar el zoom automático de iOS. **Nunca se bloquea el zoom del navegador**: sin `maximum-scale` ni `user-scalable=no`.
- **Menos movimiento** (`prefers-reduced-motion`): se eliminan desplazamientos y escalas, y solo quedan fundidos de opacidad de 150 ms o menos.
- **Selección de texto:** la disuasión de descarga aplica solo a la foto. Títulos, historias y datos se pueden seleccionar y copiar.

### 3.4 Movimiento

Solo se anima lo que responde a una acción o evita un cambio brusco, según la frecuencia con que se ve:

| Momento | Movimiento |
|---|---|
| Foto que termina de cargar (solo si no estaba lista) | Fundido de opacidad, 300 ms |
| Encabezado que se oculta o vuelve | `translateY`, 200 ms |
| Presionar un botón, chip o tarjeta | Escala a 0,97, 120 ms |
| Abrir `Dialogo`, `MenuMovil` o `Visor` | Opacidad + escala de 0,97 a 1 (o desplazamiento de 8 px), 250 ms |
| Cerrarlos | Opacidad, 200 ms. La salida es más rápida que la entrada. |
| Deslizar en el `Visor` | La foto sigue al dedo 1:1 y se asienta en 250 ms con curva de cajón |
| Cambiar de foto con ← → en el `Visor` | **Sin animación.** Es una acción de teclado que se repite. |
| Hover de enlaces, chips y tarjetas | Color o borde, 150 ms |

No hay animaciones de entrada por sección, escalonados en la grilla, paralaje ni efectos de brillo en los esqueletos.

### 3.5 Objeciones planteadas y su resolución

| # | Objeción | Resolución |
|---|---|---|
| O-1 | Cormorant Garamond se ve frágil en tamaños chicos sobre fondo oscuro, por el halo y su altura de x baja. | La serif se usa solo desde 24 px y en peso 500 hasta 48 px. El 400 se reserva para 40 px o más. Todo texto de lectura, incluida la historia, va en Manrope. |
| O-2 | Controles con radio de 8 px junto a fotos de esquinas rectas son dos lenguajes. | Las fotos nunca llevan radio; el radio es solo para controles. La foto es un objeto y el control es interfaz. |
| O-3 | El encabezado que se oculta desorienta o tiembla con el rebote de iOS. | Se oculta tras bajar 80 px y vuelve tras subir 24 px seguidos. No se oculta en la ficha ni durante scroll programático. Ver §5.4, `Encabezado`. |
| O-4 | Sin color de acento, ¿se distingue "Pedir una copia"? | Sí. Es el único relleno claro de la vista: los chips activos usan contorno, no relleno. Una vista es la página, sin contar menús ni diálogos abiertos, que son vistas propias. |
| O-5 | Un encabezado sobre la foto de portada la taparía y obligaría a usar degradados. | El encabezado va siempre sobre fondo sólido. |
| O-6 | El ícono de Instagram es una marca registrada y obliga a sumar una librería. | El enlace a Instagram es texto. Los íconos de interfaz son SVG propios (§5.4). |
| O-7 | La foto "con aire" dejaba "Pedir una copia" bajo el pliegue en escritorio (revisión UX, H-01). | La ficha usa columna lateral para verticales y cuadradas, y franja inferior para horizontales y panorámicas (§5.3.1). Se verifica en 1440 × 900 y 1280 × 720. |
| O-8 | La foto con aire nunca se ve en grande (H-03). | Se agrega el `Visor` a pantalla completa en la v1.0. |
| O-9 | Un fundido de la foto que depende de JavaScript puede dejarla invisible en el navegador de Instagram (H-04). | La foto es visible por defecto. El fundido solo se activa si al hidratar aún no cargó, y nunca en la foto prioritaria. |
| O-10 | Tres nombres distintos para un visitante nuevo: "Rod Díaz", "Fotos de Rod" y el de Instagram (H-12). | Rod decide "Rod Díaz" en todo el sitio. Cambia `nombreSitio` del marco (§11). |
| O-11 | Una foto nocturna se funde con el fondo y pierde su rectángulo. | Filete fino activable por foto desde el panel (`Foto.filete`), por decisión de Rod. |
| O-12 | Bloquear la selección o el zoom para proteger las fotos daña la accesibilidad y la lectura. | La disuasión aplica solo a `img` y `picture`. El zoom no se bloquea nunca. |

## 4. Casos borde

| Caso | Resolución |
|---|---|
| Título de 120 caracteres | `text-wrap: balance` y `overflow-wrap: anywhere` como último recurso en móvil. La ficha y el visor muestran el título completo. En grillas, `galeria-colecciones` puede limitarlo a 3 líneas. |
| Palabras largas en historias ("contemplativamente") | `hyphens: auto` con `lang="es-CL"`, solo en `--texto-lectura`. |
| Tildes, ñ, ¿, ¡, comillas tipográficas | Cubiertas por el subconjunto `latin` (U+0000–00FF y signos), que es el que se precarga. |
| Años y cifras en títulos de Cormorant | `font-variant-numeric: lining-nums` para que no desentonen. |
| Foto vertical, cuadrada, horizontal o panorámica en la ficha | Patrón de §5.3.1. No se recortan nunca en la ficha ni en el visor. |
| Foto nocturna o en clave baja | Rod activa `filete` en esa foto: borde interior de 1 px en `--color-filete` en todos los modos. |
| Foto en clave alta | No hay texto sobre el marcador ni sobre la foto. El contraste de la interfaz no depende de la foto. |
| La fuente no carga | `font-display: swap` con métrica de respaldo ajustada (Georgia para la serif, `system-ui` para la sans). |
| Foto que no carga (error de red) | El marco conserva su proporción y pasa a `--color-superficie`, con "No pudimos cargar esta foto" en texto secundario centrado. |
| JavaScript desactivado o lento | Todas las fotos se ven. Solo dejan de funcionar el fundido, el oculto del encabezado y el visor; la ficha sigue completa. |
| Navegador interno de Instagram (barra dinámica) | Alto de la portada con `svh`; el menú, el visor y los diálogos usan `dvh`. |
| iPhone en horizontal (muesca a un lado) | Márgenes `max(var(--margen), env(safe-area-inset-left/right))` y `viewport-fit=cover`. |
| Gesto de refrescar o rebote mientras el visor está abierto | `overscroll-behavior: contain` en el visor, el menú y los diálogos. |
| Pellizcar para ampliar en el visor | Se permite el zoom nativo. Si la escala es mayor a 1 (`visualViewport.scale`), deslizar no cambia de foto. |
| Segundo dedo mientras se desliza | Se ignora; no hay saltos. |
| Deslizar más allá de la primera o la última foto | Resistencia elástica (amortiguación) y vuelta a su sitio. |
| Hover "pegado" en táctil | Estilos `:hover` solo dentro de `@media (hover: hover) and (pointer: fine)`. La respuesta táctil se da con `:active`. |
| Destello gris al tocar (iOS y Android) | `-webkit-tap-highlight-color: transparent` global, con `:active` propio en cada control. |
| Sistema operativo en modo claro | `color-scheme: dark`; el sitio se ve igual. |
| `forced-colors` (alto contraste de Windows) | Los controles conservan borde visible y el foco usa `Highlight`. |
| Zoom al 200 % | La retícula es fluida y no aparece scroll horizontal. |
| Foco de teclado sobre una foto clara | Doble anillo: oscuro por dentro y claro por fuera. Se ve sobre cualquier foto. |
| Logo PNG con fondo blanco o muy ancho | Acepta SVG o PNG de hasta 200 KB. Se muestra con 28 px de alto en móvil y 32 px en escritorio, y hasta 200 px de ancho. El panel lo previsualiza sobre `#151515`. |
| Logo SVG con código incrustado | Se muestra siempre con `<img>`, donde los scripts no se ejecutan. |
| Logo eliminado del panel | Vuelve el wordmark automáticamente. |
| Monograma "RD" a 16 px | Diseño propio a 16 y 32 px con letras ajustadas (§5.4, `Marca`). Si no se lee a 16 px, se usa solo la "R" en ese tamaño (R-SD-06). |

## 5. Especificación técnica

### 5.1 Modelo de datos

Este documento no crea entidades. Requiere los siguientes cambios, que implementa `contenido/modelo-contenido-panel.md` y que el marco incorpora en su versión 1.1 (§11):

| Entidad | Campo | Tipo | Regla |
|---|---|---|---|
| `AjustesSitio` | `nombreSitio` | texto (ya existe) | Valor inicial: **"Rod Díaz"**. Antes era "Fotos de Rod". Es el texto del wordmark y la base del título SEO. |
| `AjustesSitio` | `logo` | upload opcional, nuevo | SVG o PNG de hasta 200 KB. Si existe, reemplaza al wordmark. Su texto alternativo es `nombreSitio`. Si es PNG, se genera una versión de 64 px de alto. |
| `Foto` | `filete` | booleano, nuevo, `false` por defecto | Si está activo, la foto muestra el borde interior fino en todos sus modos. Ayuda en el panel: "Úsalo en fotos muy oscuras que se pierden en el fondo". |

### 5.2 Reglas de diseño (tokens)

Los tokens son propiedades CSS en `:root`. Ningún componente usa valores literales de color, tamaño de texto, espaciado, radio, capa o duración.

**Única excepción:** los puntos de quiebre dentro de `@media`, porque CSS no admite variables ahí. Esos valores salen solo de la tabla de §5.2.3.

#### 5.2.1 Color

| Token | Valor | Uso | Contraste sobre `--color-fondo` |
|---|---|---|---|
| `--color-fondo` | `#151515` | Fondo de toda página y del visor | — |
| `--color-superficie` | `#1C1C1C` | Diálogos, menú móvil, campos, esqueletos, foto con error | — |
| `--color-superficie-alta` | `#242424` | Hover de chips, tarjetas y botón secundario | — |
| `--color-linea` | `#2A2A2A` | Divisores decorativos | Decorativo |
| `--color-linea-control` | `#6B6B6B` | Bordes de campos, chips y botón secundario | 3,4:1 |
| `--color-linea-control-hover` | `#757575` | Borde en hover, sobre `--color-superficie-alta` | ≥ 3:1 sobre `#242424` |
| `--color-texto` | `#ECECEC` | Títulos, texto principal, borde del chip activo | 15,5:1 |
| `--color-texto-secundario` | `#A3A3A3` | Lugar, fecha, datos, navegación en reposo, contador del visor | 7,2:1 |
| `--color-texto-terciario` | `#8C8C8C` | Ayudas de campo, pie | 5,4:1 |
| `--color-accion` | `#ECECEC` | Fondo del botón primario | — |
| `--color-accion-hover` | `#FFFFFF` | Hover del botón primario | — |
| `--color-accion-texto` | `#151515` | Texto del botón primario | 15,5:1 sobre `--color-accion` |
| `--color-foco` | `#ECECEC` | Anillo de foco | 15,5:1 |
| `--color-filete` | `rgba(236, 236, 236, 0.12)` | Borde interior de fotos con `filete` | Decorativo |
| `--color-error` | `#E58B8B` | Mensaje y borde de campo con error | 7,3:1 |
| `--color-exito` | `#9CC9A4` | Confirmación de envío | 9,8:1 |

Reglas:

- **Sin color de acento.** El rojo y el verde se usan solo en estados de formulario, siempre acompañados de texto.
- **Sin sombras decorativas ni degradados.** La única sombra permitida es el anillo interior oscuro del foco sobre fotos.
- **Selección de texto:** `::selection` con fondo `--color-texto` y texto `--color-fondo`.
- **Barras de desplazamiento:** `scrollbar-color: #3A3A3A transparent`.
- **Barra del navegador móvil:** `<meta name="theme-color" content="#151515">`.
- **Marcador de carga:** usa `Foto.colorDominante` de cada foto, no un token.

#### 5.2.2 Tipografía

| Familia | Rol | Pesos | Regla |
|---|---|---|---|
| **Cormorant Garamond** | Marca y títulos | 400 y 500 | Solo desde 24 px. Peso 500 hasta 48 px; 400 solo en `--titulo-xl`. Nunca en párrafos, botones ni campos. |
| **Manrope** | Lectura e interfaz | Variable, se usan 400 y 500 | Todo lo demás. |

Escala. Los títulos son fluidos con `clamp()`; el interletrado depende del tamaño:

| Token | Familia y peso | Tamaño | Interlínea | Interletrado | Uso |
|---|---|---|---|---|---|
| `--texto-xs` | Manrope 400 | 13 px | 1,5 | +0,01 em | Pie, ayudas, contador del visor |
| `--texto-sm` | Manrope 400/500 | 14 px | 1,5 | 0 | Navegación, botones, chips, meta (lugar · fecha) |
| `--texto-base` | Manrope 400 | 16 px | 1,6 | 0 | Interfaz, campos |
| `--texto-lectura` | Manrope 400 | 17 px | 1,7 | 0 | Historia, "Sobre mí"; ancho máximo 65 ch; con guionado |
| `--titulo-sm` | Cormorant 500 | 24 px | 1,2 | 0 (marca: +0,01 em) | Marca, nombre de colección en tarjetas |
| `--titulo-md` | Cormorant 500 | clamp(28 px, 3vw, 36 px) | 1,15 | 0 | Títulos de sección y de página; título en la columna de la ficha |
| `--titulo-lg` | Cormorant 500 | clamp(32 px, 4vw, 48 px) | 1,1 | 0 | Título de colección; título de ficha en franja inferior |
| `--titulo-xl` | Cormorant 400 | clamp(40 px, 5vw, 64 px) | 1,05 | −0,01 em | Uso excepcional en portada |

- Todo en tipo oración. Sin mayúsculas sostenidas en etiquetas.
- Cifras alineadas (`lining-nums`) en títulos de Cormorant. Cifras tabulares en medidas ("30 × 45 cm", con espacios finos alrededor del ×).
- `-webkit-font-smoothing: antialiased` en `body`, porque reduce el halo del texto claro sobre fondo oscuro en macOS.

#### 5.2.3 Espaciado y retícula

- **Espaciado:** escala de 4 px. `--esp-1` 4, `--esp-2` 8, `--esp-3` 12, `--esp-4` 16, `--esp-5` 24, `--esp-6` 32, `--esp-7` 48, `--esp-8` 64, `--esp-9` 96, `--esp-10` 128 (en px).
- **Puntos de quiebre:**

  | Nombre | Desde | Márgenes laterales (`--margen`) |
  |---|---|---|
  | móvil | 0 | 16 px |
  | tableta | 640 px | 32 px |
  | escritorio | 1024 px | 48 px |
  | amplio | 1440 px | 64 px |

- **Altos del encabezado:** `--alto-encabezado` vale 56 px en móvil y 72 px desde escritorio.
- **Anchos máximos:** 1600 px para el contenido y 65 ch para el texto de lectura.
- **Separación entre fotos en cualquier grilla:** al menos `--esp-2` (8 px), para que el foco y los objetivos táctiles no se pisen.
- **Alineación:** texto a la izquierda en todo el sitio. Las fotos se centran en su contenedor.

#### 5.2.4 Forma

- `--radio-control`: 8 px en botones, chips, campos, diálogos, tarjetas (su contenedor, no su foto) y esqueletos de texto.
- Fotos, marcadores y esqueletos de foto: radio 0, siempre.
- Bordes de controles: 1 px.

#### 5.2.5 Capas

| Token | Valor | Uso |
|---|---|---|
| `--capa-encabezado` | 10 | Encabezado fijo |
| `--capa-menu` | 20 | Menú móvil |
| `--capa-dialogo` | 30 | `Dialogo` |
| `--capa-visor` | 40 | `Visor` |

Cuando `<dialog>` se abre con `showModal()`, ocupa la capa superior del navegador. Los tokens ordenan los elementos que no van en esa capa y sirven como respaldo.

#### 5.2.6 Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--dur-rapida` | 150 ms | Hover y cambios de color |
| `--dur-presion` | 120 ms | Escala al presionar |
| `--dur-base` | 200 ms | Encabezado y cierres |
| `--dur-apertura` | 250 ms | Apertura de diálogo, menú y visor; asentamiento del deslizamiento |
| `--dur-foto` | 300 ms | Fundido de foto cargada |
| `--curva-salida` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entradas, salidas y respuestas |
| `--curva-movimiento` | `cubic-bezier(0.77, 0, 0.175, 1)` | Desplazamiento del encabezado |
| `--curva-cajon` | `cubic-bezier(0.32, 0.72, 0, 1)` | Asentamiento del deslizamiento en el visor |

Reglas:

- Se animan solo `opacity` y `transform`. Nunca `transition: all` ni propiedades de diseño (`width`, `height`, `top`, márgenes).
- Nunca `ease-in` en la interfaz y nunca `scale(0)`. Se parte de 0,97.
- Las transiciones son interrumpibles (CSS `transition`, no `@keyframes`) en todo lo que se puede disparar de nuevo antes de terminar.
- Con `prefers-reduced-motion: reduce`, se quitan los `transform` y quedan solo fundidos de 150 ms o menos.
- Los diálogos y el visor se abren desde el centro: no se anclan al disparador.

### 5.3 Patrones de composición

#### 5.3.1 Disposición de la ficha

El documento de ficha decide qué datos se muestran. Este patrón decide **dónde** van, para que "Pedir una copia" siempre se vea sin bajar en escritorio. La proporción se toma de `Foto.proporcion` (valor decimal = ancho / alto).

| Proporción | Escritorio (≥ 1024 px) | Tableta y móvil |
|---|---|---|
| **Vertical o cuadrada** (≤ 1,1) | **Columna lateral.** Retícula de dos columnas: foto y columna de 360 px (380 px desde 1440 px), con 64 px de separación. La foto se limita a `calc(100svh - var(--alto-encabezado) - 96px)` de alto y se alinea a la derecha de su celda. La columna es `sticky` y lleva, en orden: título (`--titulo-md`), meta, el resumen que defina la ficha y `Boton` primario. El botón debe quedar en los primeros 360 px de la columna. La historia sigue debajo del botón, en la misma columna. | Apilada: foto con el ancho completo menos márgenes, luego título, meta, botón e historia. |
| **Horizontal o panorámica** (> 1,1) | **Franja inferior.** La foto, centrada, se limita a `calc(100svh - var(--alto-encabezado) - 160px)` de alto y a 1600 px de ancho. Debajo, una franja de 112 px como mínimo con el título (`--titulo-lg`) y la meta a la izquierda, y el botón primario a la derecha, alineados por la línea base. La historia va debajo, a 65 ch. | Apilada, igual que la vertical. |

- En la ficha, el encabezado no se oculta.
- La foto de la ficha abre el `Visor` con clic, Enter o toque, y lleva un ícono "Ampliar" que aparece en hover y foco (escritorio) y queda visible en táctil.
- En móvil, el botón queda tras un desplazamiento corto. Si conviene una barra fija inferior, la decide `portafolio/ficha-foto.md` con los tokens de este documento.

#### 5.3.2 Foto de portada

- Alto `calc(100svh - var(--alto-encabezado) - 64px)`, para que el inicio del camino a más fotos asome sobre el pliegue (marco §4.2.2).
- La foto se contiene completa, sin recorte, centrada y con aire.
- Usa `MarcoFoto` con `prioridad`: sin fundido, con `fetchpriority="high"` y con la versión de 1200 px como máximo en móvil (marco §5).
- `galeria-colecciones` define qué acompaña a la foto.

#### 5.3.3 Estado vacío y páginas de error

Una sola plantilla (`PlantillaEstado`) para el 404, "Esta foto ya no está disponible" (marco §5) y las colecciones o filtros sin resultados:

- título en `--titulo-md`;
- una línea en `--texto-base`;
- un `Boton` secundario con la acción ("Ver todas las fotos");
- alineada a la izquierda dentro de la columna de lectura;
- opcionalmente, una foto destacada en `MarcoFoto` modo `grilla`, para que no se vea vacía.

Los textos los fija cada documento, sin disculpas y con una dirección clara.

### 5.4 Interfaces de los componentes base

Todos los textos que no sean propios del componente (nombre, enlaces, aviso de derechos) salen de `AjustesSitio` o de `Pagina` (marco §6.2.10). Los rótulos de interfaz ("Menú", "Cerrar", "Ampliar", "Anterior", "Siguiente") son parte del código.

| Componente | Props principales | Estados y comportamiento |
|---|---|---|
| `Marca` | `ajustes` (`nombreSitio`, `logo`) | **Con `logo`:** `<img>` de 28 px de alto en móvil y 32 px en escritorio, hasta 200 px de ancho, con `alt` igual a `nombreSitio`. **Sin logo:** `nombreSitio` en `--titulo-sm`. Enlaza a `/`. **Monograma "RD":** SVG propio en Cormorant 500 `#ECECEC` sobre `#151515`, dibujado aparte a 16 y 32 px con las letras ajustadas. Se publica como `icon.svg`, en ICO de 16/32 px y como `apple-icon` de 180 px. |
| `Encabezado` | `ajustes`, `navegacion`, `ocultable` (por defecto `true`; `false` en la ficha) | `position: sticky; top: 0` sobre fondo sólido, con relleno superior `env(safe-area-inset-top)`. **Se oculta** con `translateY(-100%)` al bajar con `scrollY > 80` px. **Vuelve** al subir 24 px seguidos. **Siempre visible** con `scrollY < 80`, con `:focus-within`, con el menú o un diálogo abierto y durante scroll programático: al navegar, al restaurar la posición y con anclas. Escritorio: el enlace activo en `--color-texto` con `aria-current="page"`, el resto en secundario. Móvil: botón "Menú" de 44 px que abre `MenuMovil`. |
| `MenuMovil` | `navegacion`, `abierto`, `alCerrar` | Construido sobre `Dialogo` a pantalla completa (`100dvh`). Enlaces en `--titulo-md` y "Cerrar" arriba a la derecha. Respeta las zonas seguras. |
| `Pie` | `ajustes` | "© <año> <aviso de derechos>" y enlaces a Instagram, Contacto, Privacidad y Condiciones, en `--texto-xs` y `--color-texto-terciario`. Relleno inferior `env(safe-area-inset-bottom)`. |
| `Boton` | `variante` (`primario`, `secundario`, `enlace`), `cargando`, `href` opcional, `icono` opcional | **Estados:** reposo, hover (solo con puntero fino), foco, presionado (escala 0,97 en `:active`) y cargando (indicador + texto, por ejemplo "Enviando…", con `aria-busy`). No hay botones deshabilitados: se valida al usar. Un solo `primario` por vista (O-4). **Tamaño y toque:** alto mínimo 44 px, `touch-action: manipulation` y `user-select: none`. |
| `MarcoFoto` | `foto` (versiones, `ancho`, `alto`, `colorDominante`, `titulo`, `textoAlternativo`, `filete`), `modo` (`grilla`, `ficha`, `portada`, `visor`), `prioridad`, `sizes`, `alAmpliar` opcional | **Reserva y fuentes:** la proporción se reserva con `aspect-ratio` y el contenedor tiene de fondo el `colorDominante`. Usa `<picture>` con AVIF, WebP y JPEG y `srcset` de 480, 1200 y 2048 px (marco §6.2.2). `loading="lazy"` salvo con `prioridad`. **Fundido (O-9):** la imagen es visible por defecto. Al hidratar, si `img.complete` es falso y no hay `prioridad`, se aplica la clase de fundido y se quita en `onLoad`. **Error:** fondo `--color-superficie` con el texto de error centrado. **Filete:** con `filete`, un borde interior de 1 px en `--color-filete` (`outline` con `outline-offset: -1px`). **Disuasión:** solo en la imagen; sin menú contextual, `draggable=false`, `user-select: none` y `-webkit-touch-callout: none`. **Foco** (cuando es enlace o abre el visor): `outline` de 2 px `--color-foco` con `outline-offset: 2px`, más un anillo interior de 2 px en `--color-fondo`. **Recorte:** nunca en `ficha`, `portada` ni `visor`; en `grilla` lo decide `galeria-colecciones`. |
| `Visor` | `fotos` (lista del contexto: colección, filtro o todas), `indice`, `alCerrar`, `alCambiar`, `accion` opcional ("Pedir una copia") | `<dialog>` modal a pantalla completa (`100dvh`) con fondo `--color-fondo`, abierto con `showModal()`. **La foto:** se contiene completa con márgenes de 16 / 32 px y usa la versión de 2048 px; las vecinas se precargan en 1200 px. **Controles:** "Cerrar" arriba a la derecha, flechas a los lados (solo con puntero fino), contador "3 de 12" (`--texto-xs`), título breve abajo a la izquierda y, si se pasa `accion`, `Boton` primario abajo a la derecha. **Teclado:** ← → cambian de foto al instante; Esc cierra; Tab circula dentro. **Táctil:** se desliza con eventos de puntero y captura (`setPointerCapture`): la foto sigue al dedo 1:1 y cambia si se supera el 25 % del ancho o una velocidad de 0,11 px/ms. En los extremos hay resistencia elástica. Se ignoran los toques adicionales mientras se desliza. Con `visualViewport.scale > 1` el deslizamiento se desactiva y se permite el pellizco nativo (`touch-action: pan-y pinch-zoom`). **Al abrir y cerrar:** bloquea el scroll de fondo (§5.6) y aplica `overscroll-behavior: contain`. Al cerrar, el foco vuelve a la foto de origen. **Disuasión:** la misma de `MarcoFoto`. No usa la API de pantalla completa del navegador: el visor cubre la ventana y así funciona igual en iOS. |
| `NavegacionFotos` | `anterior`, `siguiente` (cada uno con `titulo` y `href`, opcionales) | Enlaces "Anterior" y "Siguiente" con ícono de flecha y el título de la foto en `--texto-sm`. Se ocultan en los extremos. El contexto lo calcula `portafolio/ficha-foto.md`. |
| `Retorno` | `etiqueta`, `href` | Enlace con flecha izquierda, por ejemplo "Volver a Araucanía", en `--texto-sm` secundario. |
| `TarjetaColeccion` | `coleccion` (`nombre`, `portada`, número de fotos publicadas), `href` | Toda la tarjeta es un enlace. Muestra `MarcoFoto` modo `grilla` (portada), luego el nombre en `--titulo-sm` y "12 fotos" en `--texto-sm` secundario. **Hover** (puntero fino): el nombre pasa a `--color-texto`; la foto no se escala. **Al presionar:** escala 0,97. El foco va en el enlace completo, con doble anillo. |
| `ChipFiltro` | `etiqueta`, `href`, `activo` | **Selección única**, porque la ruta del marco admite una sola característica (`?caracteristica=<slug>`). Cada chip es un enlace, y el activo lleva `aria-current="true"`. Incluye la opción "Todas". **Reposo:** borde `--color-linea-control` y texto secundario. **Hover:** fondo `--color-superficie-alta` y borde `--color-linea-control-hover`. **Activo:** borde `--color-texto`, texto `--color-texto` e ícono ✓ de 14 px; nunca relleno claro. **Tamaño:** 36 px visibles, área táctil de 44 px y 8 px de separación. |
| `Campo` | `tipo` (`texto`, `correo`, `telefono`, `area`, `seleccion`, `casilla`), `etiqueta`, `ayuda`, `error`, `obligatorio` | **Etiqueta** siempre visible, arriba del campo. **Tamaño:** 48 px de alto y texto de 16 px. **Error:** borde y mensaje en `--color-error`, unidos con `aria-describedby`. **Campos opcionales:** "(opcional)" en vez de asteriscos. **Teclado de cada tipo:** `type="email"` con `autocapitalize="none"`, `type="tel"`, y `enterkeyhint` según la acción. |
| `Dialogo` | `abierto`, `alCerrar`, `titulo` | `<dialog>` nativo con `showModal()`. **Tamaño:** en escritorio, panel centrado de hasta 560 px; en móvil, pantalla completa con `100dvh`. **Cierre:** con Esc, con el foco atrapado y con retorno del foco al disparador. Bloquea el scroll de fondo y aplica `overscroll-behavior: contain`. Es la base de `MenuMovil` y del formulario si D-01 se resuelve como modal. |
| `Aviso` | `tipo` (`info`, `error`, `exito`), `titulo`, `accion` opcional | Mensaje en línea; no hay notificaciones flotantes. Los errores dicen qué pasó y qué hacer. |
| `Esqueleto` | `proporcion` o `lineas` | Bloques estáticos en `--color-superficie`, sin brillo animado. Los de foto reservan su proporción. |
| `PlantillaEstado` | `titulo`, `texto`, `accion`, `foto` opcional | Ver §5.3.3. |
| `SaltarContenido` | — | Primer elemento enfocable. Solo es visible con foco. |
| Íconos | — | SVG propios en línea, de 20 px, trazo de 1,5 px y `currentColor`: menú, cerrar, flecha izquierda, flecha derecha, ampliar y ✓. Los íconos decorativos llevan `aria-hidden`. Los botones que solo tienen ícono llevan `aria-label`. |

### 5.5 Componentes y estructura de código

Se crean (rutas según marco §6.4):

```
src/
├── estilos/
│   ├── tokens.css            # todas las propiedades de §5.2
│   └── base.css              # normalización, body, foco, selección, color-scheme,
│                             # tap-highlight, reduced-motion, forced-colors, scrollbar
├── app/
│   ├── icon.svg, apple-icon.png, favicon.ico   # monograma "RD"
│   └── (sitio)/
│       ├── fuentes.ts        # next/font: Cormorant Garamond y Manrope
│       ├── licencias/OFL.txt # licencias de las fuentes
│       ├── layout.tsx        # viewport, theme-color, estilos, fuentes, SaltarContenido, Encabezado, Pie
│       └── guia-estilo/page.tsx   # catálogo de componentes y estados; notFound() fuera de desarrollo
└── componentes/base/
    ├── Marca.tsx, Encabezado.tsx, MenuMovil.tsx, Pie.tsx
    ├── Boton.tsx, ChipFiltro.tsx, Campo.tsx, Aviso.tsx, Esqueleto.tsx
    ├── MarcoFoto.tsx, Visor.tsx, NavegacionFotos.tsx, Retorno.tsx, TarjetaColeccion.tsx
    ├── DisposicionFicha.tsx, PlantillaEstado.tsx
    ├── Dialogo.tsx, SaltarContenido.tsx
    ├── iconos.tsx
    └── lib/bloqueoScroll.ts, lib/usarEncabezadoOcultable.ts
```

- Cada componente tiene su CSS Module (`*.module.css`), que solo consume tokens.
- Viewport: `width=device-width, initial-scale=1, viewport-fit=cover`, sin `maximum-scale`.

### 5.6 Rendimiento y seguridad

- **Gestión de color.** Todas las versiones web van en sRGB **con el perfil ICC sRGB incrustado**, porque sin perfil Firefox las muestra sobresaturadas en pantallas de gama amplia. Se eliminan EXIF, IPTC, XMP, GPS y número de serie. Con `sharp`: `.toColorspace('srgb')` y `.withIccProfile('srgb')`, sin `withMetadata`, `keepExif` ni `keepMetadata`. El perfil ICC no contiene datos personales. Esto precisa el marco §6.2.2 y §7.2 (§11).
- **Fuentes.** Solo los pesos de §5.2.2, en WOFF2 autoalojado. Se precarga solo el subconjunto `latin` de cada familia. `latin-ext` se declara sin precarga. Presupuesto: 120 KB como máximo entre ambas familias.
- **CSS.** Sin framework de utilidades. El CSS global (tokens y base) pesa menos de 10 KB.
- **JavaScript del sistema.** Solo lo necesitan el encabezado ocultable, `MenuMovil`, `Dialogo`, `Visor` y el fundido de `MarcoFoto`, como componentes cliente acotados. El `Visor` se carga de forma diferida, solo al abrirlo. Los listeners de scroll y de toque son pasivos, salvo el deslizamiento del visor, que usa eventos de puntero.
- **Bloqueo del scroll de fondo** (iOS incluido). Al abrir, se guarda `scrollY`, se fija `body` con `position: fixed; top: -<scrollY>px; width: 100%` y se aplica `overflow: hidden`. Al cerrar, se restaura todo y se vuelve a la posición guardada. Lo implementa `lib/bloqueoScroll.ts`, que usan `Dialogo`, `MenuMovil` y `Visor`.
- **CLS.** `MarcoFoto` y `Esqueleto` reservan siempre la proporción, y las fuentes usan métricas de respaldo ajustadas.
- **Logo.** Se acepta SVG o PNG. Se sirve desde los medios de Payload y solo se muestra con `<img>`.

### 5.7 Stack

| Pieza | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Estilos | **CSS Modules + propiedades CSS**, incluidos en Next.js | Cero dependencias y CSS acotado por componente. | Tailwind: otra dependencia y clases largas, sin ganancia para una veintena de componentes. `@custom-media`: requiere sumar un plugin de PostCSS solo para cuatro puntos de quiebre. |
| Fuentes | **`next/font/google`** con Cormorant Garamond y Manrope (OFL, gratis) | Se descargan al compilar y se sirven desde el propio sitio; el visitante nunca se conecta a Google. Ajusta las métricas de respaldo. | Enlazar Google Fonts: conexión a un tercero y exposición de la IP del visitante. |
| Íconos | **SVG propios en línea** (6 íconos) | Peso nulo y sin licencias de marca. | Lucide u otra librería: innecesaria para seis íconos. |
| Diálogos y visor | **`<dialog>` nativo + eventos de puntero** | Accesible, con capa superior nativa y sin dependencias. | Librerías de lightbox (PhotoSwipe y otras): más peso y su propio estilo que habría que anular. Se reconsidera solo si el deslizamiento propio no cumple el criterio 15. |

Todo lo demás se hereda del marco §6.6. Costo incremental: cero.

## 6. Cumplimiento normativo

Este documento no trata datos personales; lo transversal está en el marco §7. Lo específico:

- **Fuentes autoalojadas.** El sitio no transfiere la IP del visitante a Google. Se mantiene la condición del marco §7.4 (sin cookies ni rastreo), y la política de privacidad no necesita mencionar Google Fonts.
- **Licencias.** Cormorant Garamond y Manrope se publican bajo la SIL Open Font License 1.1, que permite el uso comercial. Sus archivos de licencia van en el repositorio.
- **Metadatos.** Se conserva solo el perfil de color ICC sRGB, que describe el color y no contiene datos de la cámara, del autor ni de ubicación. El resto de los metadatos se elimina (marco §7.2, con la precisión de §11).
- **Propiedad intelectual.** El aviso de derechos del `Pie` sale de `AjustesSitio` (marco §7.3).
- **Accesibilidad.** No hay una obligación legal específica para este sitio; AA se aplica como principio del marco §4.2.8.

## 7. Elementos obsoletos

- Las combinaciones tipográficas que no se eligieron en el prototipo (Newsreader + Hanken Grotesk y EB Garamond + Work Sans) quedan descartadas.
- La versión 0.1 de este documento queda reemplazada en estos puntos:
  - campo `nombreMarca`: se elimina y se usa `nombreSitio`;
  - foto "con aire" con la información debajo en todos los casos: la reemplaza §5.3.1;
  - chip activo con relleno claro;
  - desactivar el encabezado ocultable en ventanas de menos de 480 px.
- Del marco 1.0, cuando pase a 1.1, quedan obsoletos el valor "Fotos de Rod" de `nombreSitio` y la redacción "sin metadatos" (§11).

## 8. Plan de acción

Para Claude Code, después del paso 2 del plan del marco (§9.2, modelo de contenido).

| # | Paso | Depende de | Terminado cuando |
|---|---|---|---|
| 1 | Crear `tokens.css` y `base.css` con §5.2: `color-scheme: dark`, foco, `::selection`, `scrollbar-color`, `tap-highlight`, `prefers-reduced-motion` y `forced-colors`. Configurar el viewport y `theme-color` en `layout.tsx`. | — | `body` se ve en `#151515` con Manrope y no hay destello al tocar en móvil. |
| 2 | Configurar `fuentes.ts` (pesos y subconjuntos de §5.2.2, precarga solo de `latin`) y agregar las licencias OFL. | 1 | No hay solicitudes a `fonts.googleapis.com` ni a `fonts.gstatic.com`. |
| 3 | Verificar en `AjustesSitio` y `Foto` los campos de §5.1. Ajustar la generación de versiones para que incruste el perfil ICC sRGB. | Modelo de contenido | Una versión generada tiene perfil sRGB y no tiene EXIF ni GPS (`exiftool`). |
| 4 | Crear `Marca` y el monograma "RD" (`icon.svg`, `favicon.ico`, `apple-icon.png`). | 3 | Con logo se ve el logo; sin logo, el wordmark. El favicon se ve en la pestaña. |
| 5 | Crear `lib/bloqueoScroll.ts`, `Dialogo` y `MenuMovil`. | 1 | En iOS el fondo no se desplaza con el menú abierto y el foco vuelve al cerrar. |
| 6 | Crear `SaltarContenido`, `Encabezado` (con `usarEncabezadoOcultable`) y `Pie`, e integrarlos en `layout.tsx`. | 4, 5 | Se cumple O-3. |
| 7 | Crear `Boton`, `ChipFiltro`, `Campo`, `Aviso`, `Esqueleto`, `Retorno`, `PlantillaEstado` e `iconos.tsx`. | 1 | Cada estado se ve en la guía de estilo. |
| 8 | Crear `MarcoFoto` con sus cuatro modos, fundido condicional, error, filete, foco y disuasión. | 3 | Sin CLS, sin menú contextual y fotos visibles con JavaScript desactivado. |
| 9 | Crear `TarjetaColeccion`, `NavegacionFotos` y `DisposicionFicha`. | 7, 8 | Se cumplen los criterios 10 y 11. |
| 10 | Crear `Visor` con carga diferida, teclado, deslizamiento, resistencia y pellizco. | 5, 8 | Se cumplen los criterios 14 y 15. |
| 11 | Crear `guia-estilo/page.tsx` con todos los componentes y estados. Usar fotos de prueba vertical 4:5, cuadrada, horizontal 3:2, panorámica 3:1, nocturna con filete y una con error simulado. | 4–10 | La página existe en desarrollo y da 404 en producción. |
| 12 | Verificar contraste, teclado, `reduced-motion`, Lighthouse, Firefox en pantalla de gama amplia y un dispositivo real (iOS y Android, incluido el navegador de Instagram). | 11 | Se cumplen todos los criterios de §9. |

## 9. Criterios de aceptación y pruebas

1. Ningún componente usa colores, tamaños, espaciados, radios, capas ni duraciones literales. La única excepción son los puntos de quiebre en `@media` (revisión de código).
2. Los pares de color de §5.2.1 cumplen los contrastes indicados.
3. Cormorant Garamond no aparece bajo 24 px, y el peso 400 solo aparece en `--titulo-xl`.
4. No hay solicitudes a dominios de Google al cargar el sitio público, y el peso de fuentes es de 120 KB como máximo.
5. La guía de estilo obtiene CLS < 0,1 y accesibilidad ≥ 95 en Lighthouse.
6. Todo elemento interactivo se alcanza con Tab, tiene foco visible (también sobre una foto clara) y un área táctil de al menos 44 × 44 px.
7. Con `prefers-reduced-motion: reduce` no hay desplazamientos ni escalas.
8. El encabezado se oculta al bajar, vuelve al subir 24 px, aparece al recibir foco y no se oculta en la ficha.
9. Ninguna vista tiene más de un elemento relleno claro (un botón primario), incluso con un filtro activo.
10. **Ficha en escritorio.** En 1440 × 900 y 1280 × 720, el título y "Pedir una copia" se ven sin desplazarse con fotos 4:5, 1:1, 3:2 y 3:1, y ninguna foto se recorta.
11. **Ficha en móvil (390 × 844).** La foto se ve completa y el botón aparece tras un desplazamiento corto.
12. Con JavaScript desactivado, todas las fotos se ven.
13. `MarcoFoto` no ofrece menú contextual ni arrastre. En iOS, la pulsación larga sobre la foto no muestra "Guardar imagen", y el texto de la ficha sí se puede seleccionar.
14. **Visor con teclado.** ← → cambian de foto sin animación, Esc cierra y el foco vuelve a la foto de origen.
15. **Visor en táctil (iOS y Android reales).** Deslizar cambia de foto siguiendo al dedo, un gesto rápido basta y en los extremos hay resistencia. Al pellizcar se amplía sin cambiar de foto, y el fondo no se desplaza.
16. En Firefox con una pantalla de gama amplia, el color de las versiones web coincide con el de Chrome y Safari.
17. Una versión generada conserva el perfil sRGB y no contiene EXIF, GPS ni número de serie.
18. Subir un logo en `AjustesSitio` lo muestra sin desplegar código; al quitarlo vuelve el wordmark.
19. Activar `filete` en una foto muestra el borde fino en grilla, ficha, portada y visor.
20. El zoom del navegador no está bloqueado; con zoom al 200 % no aparece desplazamiento horizontal.
21. El sitio se ve correcto en el navegador de Instagram (iOS y Android): encabezado, menú, ficha y visor, sin saltos y respetando las zonas seguras.

## 10. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| SD-01 | Cormorant se ve delgada o borrosa en pantallas de baja densidad. | Media | Medio | Mínimo de 24 px, peso 500 hasta 48 px, suavizado en macOS. Revisión en un móvil de gama baja (paso 12). |
| SD-02 | El encabezado ocultable produce saltos en el navegador de Instagram. | Media | Medio | Umbrales de 80 y 24 px, listener pasivo y bloqueo durante el scroll programático. Si persiste, `ocultable = false` en ese navegador. |
| SD-03 | Las fuentes superan el presupuesto y afectan el LCP en móvil. | Baja | Medio | Dos pesos por familia, precarga solo de `latin` y WOFF2. |
| SD-04 | Un logo mal preparado rompe el encabezado. | Media | Bajo | Topes de alto y ancho, vista previa en el panel y vuelta al wordmark. |
| SD-05 | El deslizamiento propio del visor no se siente nativo. | Media | Medio | Valores de §5.4 (captura de puntero, velocidad, resistencia) y prueba en dispositivo real (criterio 15). Si falla, se evalúa una librería liviana con una ADR. |
| SD-06 | El monograma "RD" no se lee a 16 px. | Media | Bajo | Dibujo específico para 16 px. Si no funciona, se usa la "R" a 16 px y "RD" desde 32 px. |
| SD-07 | La columna lateral se ve pesada con historias largas. | Baja | Bajo | La historia va bajo el botón; `ficha-foto` puede plegarla con "Leer más". |
| SD-08 | Sin color de acento, la llamada a la copia pasa inadvertida en móvil. | Baja | Alto | Único relleno claro de la vista. Se valida en la ficha antes del lanzamiento (`portafolio/ficha-foto.md`). |

## 11. Decisiones abiertas y tareas del dueño

**Decisiones abiertas**

- Ninguna que bloquee.
- D-01 del marco (modal o página para la consulta) se decide en `consultas/consulta-copia.md`. `Dialogo` queda listo para ambos casos.
- La barra fija inferior en la ficha móvil, si se quiere, la decide `portafolio/ficha-foto.md`.

**Cambios al marco general.** Al aprobar este documento, en el mismo commit, el marco pasa a 1.1. Es un cambio menor, sin cambios de alcance ni de contratos:

1. `AjustesSitio.nombreSitio` pasa a "Rod Díaz", y el título del documento y las menciones a "Fotos de Rod" se actualizan.
2. Se agrega `logo` a `AjustesSitio` y `filete` a `Foto` (§6.1).
3. En §6.2.2 y §7.2 se precisa: "sin metadatos, salvo el perfil de color ICC sRGB".
4. En §4.2 se agrega el visor a pantalla completa como parte de la ficha en la v1.0.

**Cambios para otros documentos pendientes**

- `contenido/modelo-contenido-panel.md`: implementa `logo`, `filete`, el valor de `nombreSitio`, la vista previa del logo y el perfil ICC en la generación de versiones.
- `portafolio/galeria-colecciones.md` y `portafolio/ficha-foto.md`: usan `DisposicionFicha`, `Visor`, `NavegacionFotos` y `TarjetaColeccion`, y definen el contexto de navegación.
- `plataforma/seo.md`: título SEO a partir de "Rod Díaz" (por ejemplo, "Rod Díaz · Fotografía") e imagen Open Graph con la `Marca`.

**Tareas del dueño**

- Ninguna nueva. Cuando Rod tenga un logo, lo sube al panel sin pasar por un documento. Al cargar las fotos de lanzamiento (T-005), marca `filete` en las que se pierdan en el fondo.

## 12. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 0.2 | 2026-10-07 | Revisión UX/UI con un agente independiente y con las guías de diseño de interfaces y movimiento. Decisiones de Rod: ficha con columna lateral para verticales y cuadradas; visor a pantalla completa en la v1.0; "Rod Díaz" como nombre único (`nombreSitio`, se elimina `nombreMarca`); chip activo con contorno y ✓; filete activable por foto; favicon con monograma "RD". Se agregan: perfil ICC sRGB incrustado, fundido sin dependencia de JavaScript, patrones de ficha, portada y estado vacío, componentes `Visor`, `NavegacionFotos`, `Retorno`, `TarjetaColeccion`, `Esqueleto`, `PlantillaEstado` y `MenuMovil` sobre `Dialogo`, tokens de capas, encabezado `sticky` con umbrales, Cormorant 500 hasta 48 px, interletrado según tamaño, reglas de móvil (zoom, zonas seguras, `tap-highlight`, `touch-action`, `theme-color`, bloqueo de scroll en iOS) y criterios de aceptación 9 a 21. Se listan los cambios al marco 1.1. |
| 0.1 | 2026-10-07 | Borrador inicial. Decisiones de Rod: serif editorial + sans (Cormorant Garamond + Manrope, elegido sobre un prototipo), wordmark "Rod Díaz" configurable a logo, grafito neutro sin acento, foto con aire en la ficha, encabezado que se oculta al bajar y vuelve al subir, y controles con radio de 8 px. |

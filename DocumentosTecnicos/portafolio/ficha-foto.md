# Ficha de foto

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/portafolio/ficha-foto.md` |
| Tipo | Componente |
| Versión | 1.1 |
| Estado | Aprobado |
| Fecha | 2026-10-14 |
| Padre | `marco-general/marco-general-proyecto.md` (1.4, que incorpora los cambios del §11) |
| Dependencias | `identidad/sistema-de-diseno.md` (1.0), `contenido/modelo-contenido-panel.md` (1.1), `portafolio/galeria-colecciones.md` (1.1) |
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

La ficha (`/fotos/[slug]`) es el tercer eslabón del flujo central (marco §4.1): el punto donde el **Visitante** pasa de mirar a querer una copia, y desde donde nace la **Consulta** (`consultas/consulta-copia.md`). Es también la página a la que llegan los enlaces compartidos en Instagram y los resultados de Google, muchas veces sin haber pasado por la galería.

**Filtro de valor (método §6).**

1. *Problema real:* el Visitante necesita ver la foto completa y en grande, saber qué es, dónde y cuándo se tomó, y entender qué copias existen y cómo pedirlas. Sin ficha no hay consulta posible.
2. *Beneficio frente al costo:* es el componente que convierte; reutiliza los componentes base del sistema de diseño y las funciones de datos del modelo. Costo incremental cero.
3. *Versión:* núcleo de la v1.0 (marco §2).

**Resultado esperado.** En los primeros segundos, la foto se ve completa y grande; en escritorio, el título y "Pedir una copia" se ven sin bajar (sistema de diseño §5.3.1). El visitante entiende qué tamaños y papeles hay sin leer una tabla, puede elegir uno antes de pedir, puede verla a pantalla completa, compartirla y seguir mirando fotos de la misma colección o de la lista de la que vino.

**Lo que esta ficha hereda y no redefine:**

- **Dónde va cada cosa:** columna lateral para verticales y cuadradas, franja inferior para horizontales y panorámicas (sistema de diseño §5.3.1, `DisposicionFicha`).
- **Qué se ofrece:** formatos activos, compatibles y con al menos un papel activo; si no hay, la foto es de **vitrina** (`modelo-contenido-panel` §5.2.7). Elección de papel (§5.2.8).
- **Visibilidad, redirecciones y fotos no disponibles:** `fotoPorSlug` (`modelo-contenido-panel` §5.3, criterios 14 y 15).
- **Contexto de navegación:** el que entrega la galería (`galeria-colecciones` §5.2.9).

## 2. Alcance

**Incluye (v1.0)**

- Página `/fotos/[slug]` con: foto (`MarcoFoto` modo `ficha`), título, lugar y mes de la toma, resumen de copias, "Pedir una copia", desplegable "Tamaños y papeles" con elección opcional de tamaño, historia plegable, características como enlaces, datos técnicos, compartir, `Retorno`, `NavegacionFotos` y el bloque "Más de <colección>".
- Barra fija inferior "Pedir una copia" en móvil y tableta, que aparece cuando el botón principal sale de la vista.
- `Visor` a pantalla completa con la lista del contexto y el botón "Pedir una copia" de la foto que se está viendo.
- Navegación con ← → en la página (fuera del visor).
- Resolución del contexto (`?coleccion=`, `?caracteristica=`, ambos o ninguno) y endpoint `GET /datos/contexto`.
- Página amable "Esta foto ya no está disponible" para fotos despublicadas.
- Contrato del enlace hacia la consulta (`/consulta?foto=…&formato=…`).

**No incluye**

- El formulario de consulta, si es modal o página (decisión D-01 del marco), su validación y su envío: `consultas/consulta-copia.md`.
- Títulos, descripciones, Open Graph, datos estructurados, canonical y códigos de estado para buscadores: `plataforma/seo.md`. Esta ficha solo fija dos mínimos (§5.5).
- Precios, carrito, comparación de tamaños sobre una pared o maqueta de la copia enmarcada.

**Queda para después**

- *v1.x:* vista previa de una foto en borrador desde el panel (§11, propuesta P-01); maqueta "así se ve en tu pared" (P-02).
- *v2:* la elección de tamaño y papel se convierte en variante de producto. El modelo ya lo permite (marco §6.1) y el parámetro `formato` del contrato con la consulta se reutiliza.

## 3. Flujo de usuario y UX/UI cuestionado

### 3.1 Qué ve el visitante, en orden

**Escritorio, foto vertical o cuadrada (columna lateral):**

1. `Retorno` arriba a la izquierda, sobre la foto: "Volver a Nahuelbuta", "Volver a Todas las fotos" o "Volver a Nocturna" según el contexto (§5.2.3).
2. La foto, completa, a la izquierda; con el ícono "Ampliar" al pasar el mouse o al recibir foco.
3. La columna lateral `sticky`, en este orden:
   1. **Título** (`h1`, `--titulo-md`).
   2. **Meta:** "Nahuelbuta · marzo de 2025" (lugar · mes y año), en `--texto-sm` secundario.
   3. **Resumen de copias** (§5.2.5), en `--texto-sm` secundario: "Copias de 20 × 30 a 60 × 90 cm · 2 papeles".
   4. **`Boton` primario** con `AjustesSitio.textoLlamadaCopia` ("Pedir una copia"). Debajo, si el visitante eligió un tamaño, una línea en `--texto-xs`: "30 × 45 cm · Quitar".
   5. **Desplegable "Tamaños y papeles"** (cerrado por defecto, §3.3).
   6. **Historia**, plegada a 4 líneas con "Leer más" si es más larga (§3.4).
   7. **Características**: "Blanco y negro · Nocturna", enlaces en `--texto-sm` secundario.
   8. **Datos técnicos**: "35 mm · f/8 · 1/250 s" en `--texto-xs` terciario.
   9. **Compartir** (`Boton` variante `enlace` con ícono).
4. Bajo la retícula: `NavegacionFotos` ("Anterior" a la izquierda, "Siguiente" a la derecha, con el título de cada foto).
5. **"Más de Nahuelbuta"**: hasta 6 fotos en `GrillaFotos` (una o dos filas) y el enlace "Ver la colección" (§3.5).
6. `Pie`.

Los elementos 3.1 a 3.4 caben en los primeros 360 px de la columna (sistema de diseño §5.3.1), incluso con un título de 120 caracteres (criterio 2).

**Escritorio, foto horizontal o panorámica (franja inferior):** la foto centrada; en la franja, a la izquierda, título (`--titulo-lg`), meta y resumen; a la derecha, el botón y la línea del tamaño elegido. Debajo, a 65 ch y alineados a la izquierda de la franja: desplegable, historia, características, datos técnicos y compartir. Luego `NavegacionFotos` y "Más de".

**Móvil y tableta (< 1024 px), apilada:** `Retorno`, foto con el ancho completo menos márgenes, título, meta, resumen, botón, desplegable, historia, características, datos técnicos, compartir, navegación, "Más de", pie. El encabezado no se oculta en la ficha (sistema de diseño §5.3.1).

**Foto de vitrina:** sin resumen de copias, sin botón, sin desplegable y sin barra móvil. Si `AjustesSitio.textoVitrina` tiene texto, ocupa el lugar del resumen, en `--texto-sm` secundario. Si no, no se muestra nada en su lugar. El resto de la ficha es igual.

### 3.2 Barra fija inferior (móvil y tableta)

Resuelve el riesgo SD-08: sin color de acento, la llamada podría pasar inadvertida al seguir bajando.

- **Cuándo aparece:** solo bajo 1024 px y solo en fotos que ofrecen copia. Aparece cuando el botón principal queda **por encima** de la vista (el visitante bajó más allá de él). Desaparece cuando el botón vuelve a verse. No aparece al cargar la página ni si el botón está bajo la vista (todavía no llega a él). Lo mide un `IntersectionObserver` sobre el botón principal.
- **Cómo es:** fondo `--color-fondo`, borde superior de 1 px `--color-linea`, relleno de 12 px más `env(safe-area-inset-bottom)`. A la izquierda, el título en una línea con puntos suspensivos y, debajo, el tamaño elegido si lo hay (`--texto-xs` secundario); a la derecha, el mismo `Boton` primario. Alto visible de 64 px. Mientras la barra está visible, el pie recibe un relleno inferior igual a su alto para que nada quede tapado.
- **Movimiento:** entra con `transform: translateY(100%) → 0` en 250 ms con `--curva-salida` y sale en 150 ms (la salida es más rápida que la entrada). Se usa `transition`, no `@keyframes`, para que un vaivén rápido del scroll se interrumpa y retome sin saltos. Con `prefers-reduced-motion`, aparece y desaparece sin desplazamiento (solo opacidad en 150 ms).
- **No compite con el botón:** la vista sigue teniendo un solo primario visible a la vez, porque la barra solo aparece cuando el botón principal no se ve (sistema de diseño O-4).
- **No aparece** con el `Visor`, un `Dialogo` o el `MenuMovil` abiertos.

### 3.3 Desplegable "Tamaños y papeles" y elección de tamaño

- Es un `<details>` nativo: se abre y cierra sin JavaScript, con teclado y con lector de pantalla. El `<summary>` dice "Tamaños y papeles" con un ícono de flecha que gira 180° en 150 ms. El contenido aparece sin animación de altura.
- **Primera línea del contenido:** "Proporción 2:3. Cada copia muestra la foto completa, sin recortes." La proporción se muestra **orientada** (§5.2.4).
- **Lista de tamaños**, en el orden de `FormatoImpresion.orden`. Cada fila: el tamaño orientado ("30 × 45 cm", ancho × alto, convención del proyecto) y, debajo, los papeles en `--texto-xs` secundario: "Algodón mate" si hay uno, o "Algodón mate · Baryta brillante" si hay varios. La `descripcion` breve de cada papel se muestra a continuación de su nombre, en terciario, solo dentro del desplegable.
- **Elección opcional.** La lista es un grupo de opciones (`<fieldset>` con `<legend>` "Elige un tamaño (opcional)" y un `input type="radio"` por fila, toda la fila es el área táctil de al menos 44 px). La fila elegida lleva borde `--color-texto` e ícono ✓, como el chip activo (sistema de diseño, `ChipFiltro`); nunca relleno claro. Al elegir:
  - el botón principal, la barra móvil y el botón del visor (si es la misma foto) pasan a llevar `&formato=<id>`;
  - aparece bajo el botón la línea "30 × 45 cm · Quitar"; "Quitar" deja la elección vacía;
  - la elección dura mientras el visitante esté en la ficha: no se guarda en el navegador ni en la URL de la ficha.
- **Un solo formato:** la lista muestra una fila sin opción y el formato se pasa siempre a la consulta. El resumen ya dice cuál es.
- **Sin JavaScript:** las opciones se ven pero no cambian el enlace; el botón lleva a la consulta sin formato y el visitante lo elige en el formulario.
- **Objeción planteada:** ¿no es más simple que la lista sea solo informativa? Rod eligió que la elección se lleve al formulario porque ahorra un paso a quien ya sabe qué tamaño quiere; sigue siendo opcional y nunca bloquea el botón.

### 3.4 Historia plegada

- Si la historia ocupa más de 4 líneas, se muestra recortada con `line-clamp: 4` y un degradado de 1,5 líneas hacia `--color-fondo`, seguido del enlace "Leer más". "Leer más" la despliega completa y pasa a "Leer menos". No se anima la altura.
- La comprobación de "más de 4 líneas" se hace en el navegador midiendo `scrollHeight` contra `clientHeight`. **Sin JavaScript o antes de hidratar, la historia se ve completa** (el recorte se aplica solo con la clase que agrega el script), así el texto nunca queda inaccesible.
- El texto completo siempre está en el HTML, para buscadores y lectores de pantalla.
- Sin historia, el bloque no existe.

### 3.5 Seguir mirando

- **`NavegacionFotos`** con la anterior y la siguiente de la **lista del contexto** (§5.2.2). En los extremos se oculta el lado que no existe; no da la vuelta. Los enlaces conservan el parámetro de contexto, así la cadena sigue en la misma lista.
- **Teclado en la página:** ← y → navegan a la anterior y la siguiente cuando el foco no está en un campo, en una opción del desplegable (las flechas mueven la elección en un grupo de radios) ni en un enlace o botón con su propia acción de flechas, y no hay diálogo abierto. Sin animación (sistema de diseño §5.4).
- **"Más de <colección>":** hasta 6 fotos visibles de la colección de la foto, sin la foto actual, empezando por la que sigue a la actual en el orden de la colección y dando la vuelta al llegar al final, para que cada ficha muestre fotos distintas. Usa `GrillaFotos` (filas justificadas, sin recorte) con enlaces `?coleccion=<slug>`. Debajo, el enlace "Ver la colección". Si la foto está en una hija sin página propia, el bloque usa la madre ("Más de Salidas outdoor"). Si la colección no tiene otra foto visible, el bloque no existe.
- **`Retorno`** arriba: si el visitante llegó desde esa misma lista dentro del sitio (`document.referrer` del mismo origen con la misma ruta y parámetros), el enlace hace `history.back()` para que la galería recupere su posición (`galeria-colecciones` §3.5). Si no, es un enlace normal a la lista.

### 3.6 Visor

- Se abre con clic, Enter o toque sobre la foto, o con el ícono "Ampliar" (sistema de diseño §5.3.1). Se carga de forma diferida al abrirlo.
- **Lista:** la del contexto (§5.2.2), pedida a `GET /datos/contexto` al abrir. Mientras llega, el visor ya muestra la foto actual (sus datos están en la página) con el contador oculto; al llegar la lista, aparece el contador "3 de 12" y se habilita el cambio de foto. Si la petición falla, el visor queda con la foto actual sola, sin flechas ni contador, y sin mensaje de error.
- **Botón "Pedir una copia"** abajo a la derecha (prop `accion` del `Visor`), solo cuando la foto que se ve ofrece copia; lleva a la consulta de **esa** foto. Si es la foto de la ficha y hay un tamaño elegido, lo incluye. En una foto de vitrina no hay botón.
- **Al cerrar:** el foco vuelve a la foto de la ficha. Si el visitante avanzó a otra foto en el visor, la ficha no cambia (no se navega): cerrar es volver donde estaba. *Objeción planteada:* ¿no debería la ficha pasar a la última foto vista? Se descarta: cambiaría la página debajo del visitante sin que lo pida y rompería el "atrás" del navegador. Quien quiere esa foto puede pedirla desde el visor o navegar con "Siguiente".

### 3.7 Compartir

- Botón "Compartir" con ícono, variante `enlace`, al final de la columna o del bloque bajo la franja.
- Si el navegador ofrece `navigator.share` (la mayoría de los teléfonos), abre el menú nativo con el título de la foto y la **URL canónica** (sin parámetros de contexto).
- Si no (escritorio, o el navegador interno de Instagram en Android), copia la URL canónica con `navigator.clipboard.writeText` y muestra un `Aviso` "Enlace copiado" bajo el botón durante 2 s, anunciado con `aria-live="polite"`. El aviso entra con opacidad y 4 px de desplazamiento en 200 ms, con `transition`.
- Si copiar falla, el aviso se reemplaza por un campo de solo lectura con la URL seleccionada y el texto "Copia este enlace".
- Si el visitante cancela el menú nativo, no pasa nada (la cancelación no es un error).
- Sin JavaScript, el botón no se muestra.

### 3.8 Estados de la interfaz

| Estado | Qué se ve |
|---|---|
| Cargando | La página llega generada desde caché: no hay estado de carga de la página. La foto muestra su `colorDominante` mientras descarga, con la proporción reservada (sin saltos). |
| Foto con error de carga | `MarcoFoto` en estado de error (sistema de diseño). El resto de la ficha funciona, incluido "Pedir una copia". |
| Éxito | La ficha completa del §3.1. |
| Vacío | No aplica: una foto visible siempre tiene título, lugar, fecha y colección (`modelo-contenido-panel` §5.2.4). Cada bloque opcional (historia, características, datos técnicos, "Más de", navegación) simplemente no se muestra si no tiene contenido. |
| Foto despublicada | `PlantillaEstado`: "Esta foto ya no está disponible", el texto "Puedes ver otras fotos en la galería." y dos enlaces: "Ver todas las fotos" y, si su colección sigue visible, "Ver <colección>". Sin foto, sin botón de copia. |
| Foto inexistente o nunca publicada | 404 genérico del sitio. |
| Slug antiguo | Redirección 308 al slug vigente, conservando los parámetros de contexto. |

### 3.9 Accesibilidad

- `h1` con el título. La foto tiene `alt` = `textoAlternativo` o, si falta, `titulo` (marco §4.2.8); como abre el visor, es un `button` con nombre accesible "Ampliar foto: <título>".
- El desplegable es `<details>`; las opciones son radios nativos dentro de un `<fieldset>` con su `legend`.
- "Leer más" es un `button` con `aria-expanded` y `aria-controls`.
- La barra móvil no se anuncia al aparecer (sería ruido); su botón está en el orden de tabulación después del contenido principal. El aviso "Enlace copiado" sí se anuncia.
- Orden del foco: retorno, foto, botón, desplegable, historia, características, compartir, navegación, "Más de".
- Contraste AA con los tokens del sistema de diseño; objetivos táctiles de 44 px.

### 3.10 Objeciones planteadas al flujo y su resolución

| # | Objeción | Resolución |
|---|---|---|
| O-1 | Sin contexto (Instagram, Google), ¿qué recorren Anterior/Siguiente? Propuse al inicio del chat que fuera la colección de la foto. | Se mantiene la regla ya aprobada en `galeria-colecciones` §5.2.9: sin parámetro, el contexto es **Todas las fotos**. Distinguir "vino de `/fotos`" de "vino de Instagram" obligaría a cambiar los enlaces de la galería. La colección queda cubierta por "Más de <colección>". **Rod puede objetarlo en la revisión.** |
| O-2 | Desde una colección filtrada por característica, la galería solo pasa `?coleccion=` y el filtro se pierde en la ficha. | La ficha acepta ambos parámetros a la vez (colección filtrada). Se propone a `galeria-colecciones` un cambio menor (1.1): pasar `?coleccion=<slug>&caracteristica=<slug>` cuando el filtro está activo (§7). |
| O-3 | La lista completa de tamaños visible recarga la columna y empuja la historia. | Resumen de una línea más desplegable (decisión de Rod). |
| O-4 | En móvil, el botón queda bajo la foto y, al seguir bajando, se pierde. | Barra fija que aparece solo cuando el botón ya pasó (decisión de Rod). |
| O-5 | ¿La fecha completa es necesaria? | Mes y año: contexto suficiente y lectura más limpia (decisión de Rod). El día completo sigue en el panel. |
| O-6 | ¿El visor debería ofrecer copia? | Sí, de la foto que se está viendo (decisión de Rod), porque es donde la foto más impresiona. |
| O-7 | Una foto de vitrina podría invitar a escribir igual. | No: muestra `textoVitrina` si Rod lo escribió y, si no, nada (decisión de Rod). Evita prometer algo que no se ofrece. |
| O-8 | Pre-generar todas las combinaciones ficha × contexto rompería la generación estática. | La página se genera una vez por foto con el contexto por defecto; el contexto distinto se resuelve en el navegador (§5.2.2). |
| O-9 | "Compartir" con servicios de redes (botones de Facebook, X) suma scripts de terceros y rastreo. | Solo el menú nativo o copiar el enlace: sin terceros ni cookies. |

## 4. Casos borde

| Caso | Resolución |
|---|---|
| Foto vertical, cuadrada, horizontal o panorámica 3:1 | `DisposicionFicha` (sistema de diseño §5.3.1). Ninguna se recorta. La 3:1 en franja queda limitada a 1600 px de ancho. |
| Título de 120 caracteres o con caracteres especiales | `text-wrap: balance`; el botón sigue en los primeros 360 px de la columna (criterio 2). Se escapa como texto, nunca como HTML. |
| Sin historia, sin características o sin datos técnicos | El bloque no se muestra. Datos técnicos parciales: solo los campos con valor ("f/8 · 1/250 s"). |
| Historia corta (≤ 4 líneas) | Se ve completa, sin "Leer más". |
| Foto con EXIF con GPS o cámara | Nunca se muestran: la ficha solo lee `datosTecnicos` (marco §7.2). |
| Un solo formato con un solo papel | Resumen "Copia de 30 × 45 cm · Algodón mate"; la lista tiene una fila sin opción; el formato va siempre a la consulta. |
| Un solo formato con varios papeles | Resumen "Copia de 30 × 45 cm · 2 papeles"; el papel se elige en la consulta. |
| Muchos formatos (10 o más) | El resumen sigue en una línea (mínimo y máximo); la lista crece dentro del desplegable cerrado por defecto. |
| Formato o papel desactivado después de que el visitante abrió la ficha | La consulta valida el `formato` contra lo ofrecido en ese momento e ignora uno que ya no se ofrece (contrato §5.3). |
| Foto que pasa a vitrina | Revalidación al guardar (`modelo-contenido-panel` §5.2.12): la ficha pierde el botón, la barra y el desplegable. |
| Foto de vitrina sin `textoVitrina` | Nada en el lugar del resumen y del botón. |
| `?coleccion=` de una colección que no existe, no es visible o no contiene la foto | Se usa el contexto Todas las fotos, sin redirigir ni mostrar error. |
| `?coleccion=` con un slug anterior | Se resuelve a la colección vigente (`slugsAnteriores`) en silencio. |
| `?caracteristica=` desconocida o que la foto no tiene | Contexto Todas las fotos. |
| `?coleccion=` y `?caracteristica=` a la vez | Colección filtrada por la característica; si la foto no está en ese subconjunto, solo la colección; si tampoco, Todas las fotos. |
| Foto de una hija sin página propia, con `?coleccion=<madre>` | Contexto: la vista agregada de la madre (propias y luego hijas). `Retorno`: "Volver a <madre>". |
| Foto primera o última de su lista | Se oculta el lado de `NavegacionFotos` que no existe; el visor tiene resistencia en el extremo. |
| Lista de contexto de una sola foto | Sin navegación, sin contador ni flechas en el visor. |
| La lista cambia mientras el visitante navega (Rod publica o despublica) | La página y el contexto se revalidan por etiquetas; un enlace a una foto recién despublicada lleva a la página amable. |
| ← → mientras el foco está en el grupo de tamaños | Las flechas mueven la elección (comportamiento nativo) y no cambian de foto. |
| JavaScript desactivado o lento | Se ven la foto, todos los textos (historia completa), la lista de tamaños, la navegación del contexto por defecto, "Más de" y el botón a la consulta sin formato. No funcionan el visor, la barra móvil, la elección de tamaño, "Leer más", compartir, ← → ni el contexto distinto del por defecto. |
| Navegador interno de Instagram | Primera carga liviana (§5.5). `navigator.share` puede faltar: se copia el enlace. La barra móvil respeta `safe-area-inset-bottom` y la barra propia del navegador. Se prueba en iOS y Android (criterio 17). |
| Conexión lenta o móvil de gama baja | Solo la foto principal tiene prioridad; "Más de" usa carga diferida; el visor y su lista solo se piden al abrirlo. |
| Visitante intenta descargar o capturar | Disuasión de `MarcoFoto` y del `Visor` (marco §6.2.3). No se promete bloquear capturas. La versión mayor servida es de 2048 px. |
| Enlace compartido con parámetros de contexto | La URL canónica no lleva parámetros (`plataforma/seo.md`); compartir usa siempre la canónica. |
| Foto despublicada con consultas o enlaces compartidos | Página amable (§3.8); las consultas conservan su referencia (`consulta-copia`). Un enlace a la consulta de esa foto lo resuelve `consulta-copia`. |
| Foto duplicada (dos fichas casi iguales) | No es un caso de la ficha: el panel avisa a Rod (`modelo-contenido-panel` §5.2.2). |

## 5. Especificación técnica

### 5.1 Modelo de datos

**No se crean ni modifican entidades.** La ficha lee, con los nombres oficiales del marco §6.1:

- `Foto`: `titulo`, `slug`, `slugsAnteriores`, `lugar`, `fecha`, `historia`, `textoAlternativo`, `datosTecnicos`, `coleccion`, `orden`, `caracteristicas`, `proporcion`, `ancho`, `alto`, `colorDominante`, `filete`, `formatos`, `estado`, `publicadaEn` y sus versiones.
- `Coleccion`: `nombre`, `slug`, `padre`, `visibleSola`, `estado`.
- `Caracteristica`: `nombre`, `slug`.
- `FormatoImpresion`: `ladoCortoCm`, `ladoLargoCm`, `nombre`, `proporcion`, `papeles`, `activo`, `orden`.
- `TipoPapel`: `nombre`, `descripcion`, `activo`.
- `AjustesSitio`: `textoLlamadaCopia`, `textoVitrina`.

### 5.2 Reglas de negocio específicas

1. **Visibilidad y oferta.** La ficha no vuelve a definir qué es visible ni qué se ofrece: usa `fotoPorSlug`, `lib/visibilidad.ts` y `formatosOfrecidos` (`modelo-contenido-panel` §5.2.5, §5.2.7 y §5.3).
2. **Contexto.**
   - Tipos de contexto: `todas` (orden de `/fotos`, `galeria-colecciones` §5.2.2), `coleccion` (orden de la colección, §5.2.3), `caracteristica` (`/fotos` filtrado) y `coleccion` + `caracteristica` (colección filtrada, mismo orden de la colección).
   - Resolución: se intenta el contexto pedido y, si no es válido o no contiene la foto, se baja de nivel (colección filtrada → colección → todas) según la tabla del §4. Nunca hay error por un contexto inválido.
   - **Generación:** la página se genera de forma estática una vez por foto, con el contexto `todas` para `NavegacionFotos`. Un componente cliente lee los parámetros de la URL y, si piden otro contexto, consulta `GET /datos/contexto` y reemplaza los enlaces de `NavegacionFotos` y el `Retorno`. Los enlaces de la galería ya llevan los parámetros, así la ficha no necesita generarse por contexto.
   - Los enlaces que la ficha emite (navegación y visor) conservan los parámetros del contexto resuelto, nunca los del contexto pedido si se bajó de nivel.
3. **Retorno.** Etiqueta y destino según el contexto resuelto: `coleccion` → "Volver a <nombre>" a `/colecciones/<slug>`; `caracteristica` → "Volver a <nombre>" a `/fotos?caracteristica=<slug>`; colección filtrada → "Volver a <colección>" a `/colecciones/<slug>?caracteristica=<slug>`; `todas` → "Volver a Todas las fotos" a `/fotos`. Para una hija sin página propia, el destino es la madre.
4. **Orientación de medidas.** Los formatos y la proporción se guardan independientes de la orientación (`modelo-contenido-panel` §5.2.6). La ficha los muestra **orientados como la foto**, en ancho × alto: vertical → `ladoCortoCm × ladoLargoCm` y proporción invertida ("2:3", "4:5", "1:3,4"); horizontal → `ladoLargoCm × ladoCortoCm` y la etiqueta tal cual ("3:2"); cuadrada → igual en ambos sentidos. Las medidas usan coma decimal si la tienen ("29,7 × 42 cm").
5. **Resumen de copias.**
   - Varios formatos: "Copias de <menor> a <mayor> cm", donde menor y mayor se eligen por superficie y se muestran orientados.
   - Un formato: "Copia de <tamaño> cm".
   - Papeles, contando los papeles activos distintos entre los formatos ofrecidos: con uno, " · <nombre del papel>"; con varios, " · <n> papeles".
   - Vitrina: no hay resumen; se usa `textoVitrina` si existe.
6. **Fecha visible.** Mes y año de `Foto.fecha` en America/Santiago, en minúsculas: "marzo de 2025" (`Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric', timeZone: 'America/Santiago' })`). En el HTML va en un `<time datetime="2025-03-14">`.
7. **Datos técnicos visibles.** En este orden y formato: distancia focal "35 mm", apertura "f/8" (con coma si tiene decimal: "f/5,6"), velocidad tal como está normalizada ("1/250 s"). Separados por " · ". Solo los que tienen valor.
8. **"Más de".** Colección de la foto o, si es una hija con `visibleSola = false`, su madre. Hasta 6 fotos visibles distintas de la actual, en orden circular desde la siguiente a la actual. La sección se titula "Más de <nombre>".
9. **Contrato con la consulta.** El destino de "Pedir una copia" es `/consulta?foto=<slug>` y, si hay un formato elegido o la foto tiene un solo formato, `&formato=<id de FormatoImpresion>`, más `&origen=ficha` (o `&origen=visor` desde el visor). `consultas/consulta-copia.md` decide si se abre como modal o página (D-01) y puede interceptar el enlace, pero debe aceptar esta URL, validar `formato` contra los formatos ofrecidos por esa foto e ignorarlo si no corresponde. El papel no viaja en la URL: si el formato tiene un solo papel, la consulta lo informa; si tiene varios, se elige ahí.
10. **Datos, no código.** El texto del botón y el de vitrina salen de `AjustesSitio`. Los rótulos de interfaz ("Tamaños y papeles", "Elige un tamaño (opcional)", "Quitar", "Leer más", "Leer menos", "Compartir", "Enlace copiado", "Copia este enlace", "Más de", "Ver la colección", "Volver a", "Esta foto ya no está disponible" y su texto) son parte del código, como en el sistema de diseño §5.4.

### 5.3 Interfaces

**Rutas**

| Ruta | Generación | Contenido |
|---|---|---|
| `/fotos/[slug]` | Estática (`generateStaticParams` de las fotos visibles) con revalidación por etiquetas; `dynamicParams = true` para fotos publicadas después del despliegue | Ficha (§3), página amable o redirección según `fotoPorSlug`. Los parámetros `coleccion` y `caracteristica` **no** se leen en el servidor (§5.2.2). |
| `GET /datos/contexto` (nueva) | Manejador de ruta con caché por etiquetas | Lista del contexto resuelto, para la navegación y el visor. |
| `/consulta?foto=…&formato=…` | La define `consultas/consulta-copia.md` | Destino de "Pedir una copia" (§5.2.9). |

**Contrato de `GET /datos/contexto`**

- **Parámetros:** `foto` (slug, obligatorio), `coleccion` (slug, opcional), `caracteristica` (slug, opcional).
- **Respuesta 200:**

  ```json
  {
    "contexto": {
      "tipo": "coleccion",
      "coleccion": { "slug": "nahuelbuta", "nombre": "Nahuelbuta" },
      "caracteristica": null,
      "retorno": { "etiqueta": "Volver a Nahuelbuta", "href": "/colecciones/nahuelbuta" },
      "parametros": "?coleccion=nahuelbuta"
    },
    "indice": 2,
    "total": 12,
    "anterior": { "slug": "araucarias-en-niebla", "titulo": "Araucarias en niebla" },
    "siguiente": { "slug": "piedra-del-aguila", "titulo": "Piedra del Águila" },
    "fotos": [
      {
        "slug": "nuble-al-alba",
        "titulo": "Ñuble al alba",
        "textoAlternativo": "…",
        "ancho": 2048,
        "alto": 1365,
        "colorDominante": "#2b2a28",
        "filete": false,
        "ofreceCopia": true,
        "versiones": { "avif": ["…480", "…1200", "…2048"], "webp": ["…480", "…1200", "…2048"], "jpeg": "…1200" }
      }
    ]
  }
  ```

  `fotos` trae la lista completa del contexto en su orden (cientos de fotos como máximo; comprimida pesa unos pocos KB por cada 100). `indice` es la posición de la foto pedida (desde 0). `anterior` y `siguiente` son `null` en los extremos. `tipo` es `todas`, `coleccion`, `caracteristica` o `coleccion_caracteristica`.
- **Errores:** 400 si falta `foto`; 404 si la foto no existe o no es visible. Cuerpo `{ "error": "<código>" }`, sin datos internos. Un contexto inválido **no** es error: se resuelve hacia abajo (§5.2.2).

**Funciones de datos** (amplían `lib/contenido.ts`):

- `fichaFoto(slug)` → `{ foto, coleccion, madre?, caracteristicas, formatos (orientados, con papeles activos), resumenCopias, ofreceCopia, masDe: { titulo, href, fotos } | null, navegacion: { anterior, siguiente } }` o `{ redirigirA }`, `{ noDisponible, coleccion? }` o `null`. Usa `fotoPorSlug` y `formatosOfrecidos`.
- `contextoFoto({ slug, coleccion?, caracteristica? })` → respuesta del endpoint.
- Funciones puras en `lib/ficha.ts`: `orientarFormato(formato, orientacion)`, `etiquetaProporcion(proporcion)`, `resumenCopias(formatos)`, `fechaVisible(fecha)`, `datosTecnicosVisibles(datos)`, `hrefConsulta(slug, formatoId?)`, `masDeCircular(lista, slug, 6)`.

**Etiquetas de caché.** La ficha usa `foto:<slug>`, `fotos` (sus vecinas en Todas las fotos cambian al publicar cualquier foto), `colecciones`, `caracteristicas` y `ajustes`. `GET /datos/contexto` usa `fotos`, `colecciones` y `caracteristicas`. Las invalidan los *hooks* de `modelo-contenido-panel` §5.2.12; además, cambiar un `FormatoImpresion` o `TipoPapel` invalida `fotos`.

### 5.4 Componentes y estructura de código

```
src/
├── app/(sitio)/
│   ├── fotos/[slug]/page.tsx            # ficha, página amable o redirección
│   └── datos/contexto/route.ts          # nueva (JSON)
├── componentes/ficha/
│   ├── Ficha.tsx                        # servidor: usa DisposicionFicha
│   ├── MetaFoto.tsx                     # lugar · mes y año, <time>
│   ├── ResumenCopias.tsx                # servidor
│   ├── TamanosPapeles.tsx               # <details> + fieldset; cliente acotado para la elección
│   ├── EleccionCopia.tsx                # cliente: estado del formato elegido, href de botón, barra y visor
│   ├── BarraCopiaMovil.tsx              # cliente: IntersectionObserver sobre el botón principal
│   ├── Historia.tsx                     # cliente acotado: line-clamp y "Leer más"
│   ├── CaracteristicasFoto.tsx
│   ├── DatosTecnicos.tsx
│   ├── Compartir.tsx                    # cliente: navigator.share / clipboard / campo de respaldo
│   ├── ContextoFicha.tsx                # cliente: lee la URL, pide /datos/contexto, ← →, Retorno
│   ├── MasDeColeccion.tsx               # servidor: GrillaFotos de galeria
│   └── FotoNoDisponible.tsx             # PlantillaEstado
└── lib/
    ├── contenido.ts                     # fichaFoto, contextoFoto
    ├── ficha.ts                         # funciones puras del §5.3
    └── ficha.test.ts
```

- Se reutilizan del sistema de diseño `DisposicionFicha`, `MarcoFoto` (modo `ficha`, con `prioridad` y `alAmpliar`), `Visor` (con `fotos`, `indice` y `accion`), `NavegacionFotos`, `Retorno`, `Boton`, `Aviso` y `PlantillaEstado`; y de la galería, `GrillaFotos`. No se crean componentes base nuevos: `BarraCopiaMovil` y `TamanosPapeles` son propios de la ficha y usan solo tokens existentes.
- `EleccionCopia` es el único estado compartido: un contexto de React pequeño que provee el formato elegido a `TamanosPapeles`, al botón principal, a `BarraCopiaMovil` y a la `accion` del visor.
- El visor se importa con `dynamic(() => import(...), { ssr: false })` al primer clic.

### 5.5 Rendimiento y seguridad

- **LCP:** la foto principal es el LCP. Lleva `prioridad` (`fetchpriority="high"`, sin `loading="lazy"`) y `sizes` según la disposición: vertical o cuadrada `(min-width: 1024px) 60vw, 100vw`; horizontal o panorámica `(min-width: 1600px) 1600px, 100vw`. Así el móvil pide la de 1200 px y el escritorio de alta densidad, la de 2048 px. Meta: LCP < 2,5 s en móvil 4G (marco §6.5).
- **Peso:** la página pesa menos de 300 KB en la primera carga sin contar la foto (marco §6.5). El JavaScript propio de la ficha, sin el visor, pesa menos de 10 KB comprimido; el visor llega solo al abrirlo.
- **"Más de":** carga diferida, versiones de 480 o 1200 px, nunca 2048.
- **Navegación:** los enlaces de `NavegacionFotos` y "Más de" usan el prefetch por defecto de Next.js en vista (sin precargar imágenes de 2048 px).
- **CLS < 0,1:** proporción reservada en la foto; la barra móvil es fija y no desplaza contenido; la línea del tamaño elegido tiene su alto reservado aunque esté vacía.
- **Mínimos de SEO que fija esta ficha** (el resto en `plataforma/seo.md`): canonical sin parámetros, y `noindex` en la página amable de foto no disponible. Su código de estado HTTP lo decide `plataforma/seo.md`.
- **Seguridad:** `GET /datos/contexto` valida los parámetros, solo devuelve fotos visibles con la función de visibilidad única y no expone `huella`, `estado`, `fecha` exacta, datos técnicos ni borradores. La historia (texto enriquecido) se renderiza con el serializador de Lexical de Payload, sin HTML crudo. Compartir y la consulta usan solo slugs e ids públicos.

### 5.6 Stack

| Pieza | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Desplegable | `<details>` nativo | Funciona sin JavaScript, accesible y sin dependencias. | Acordeón propio o de una librería: más código sin beneficio. |
| Barra móvil | `IntersectionObserver` + `transition` CSS | Nativo, sin escuchar el scroll, interrumpible. | Escuchar `scroll` con `requestAnimationFrame`: más trabajo en el hilo principal. |
| Compartir | Web Share API + Clipboard API | Nativo, sin terceros ni rastreo. | Botones de redes o librerías de compartir: scripts y cookies de terceros (marco §7.4). |
| Contexto | Página estática + resolución en el navegador | Mantiene la generación estática y la caché por foto. | Leer `searchParams` en el servidor: vuelve dinámica cada ficha. |

El resto se hereda del marco §6.6, del sistema de diseño §5.7 y de la galería §5.6. **Costo incremental:** cero.

## 6. Cumplimiento normativo

Lo transversal está en el marco §7. Lo específico (preguntas del método §8):

- **Datos personales:** la ficha no trata datos personales. No tiene formularios (el de consulta vive en `consulta-copia`), no usa cookies, `localStorage` ni identificadores del visitante, y compartir no envía nada al servidor. Por eso no se reverifica la Ley 21.719 en este documento. El parámetro `formato` del enlace a la consulta no es un dato personal.
- **Metadatos:** solo se muestran los `datosTecnicos` que Rod deja con valor. Nunca cámara, lente, ISO ni GPS. La pantalla muestra mes y año; el día exacto solo queda en el atributo `datetime` del HTML, salvo que Rod prefiera ocultarlo también ahí (§11, D-F2).
- **Terceros:** ninguno. No hay botones ni scripts de redes sociales.
- **Propiedad intelectual:** la ficha y el visor sirven como máximo la versión de 2048 px (marco §6.2.2). El aviso de derechos va en el pie (marco §7.3).
- **Consumo:** sin precios ni condiciones de venta en la ficha (marco §7.5). La frase "Cada copia muestra la foto completa, sin recortes" es una descripción del producto que Rod debe poder cumplir con su proveedor de impresión (§10, FF-04).

## 7. Elementos obsoletos

No hay código previo. Este documento precisa o completa estas definiciones:

| Documento | Definición | Reemplazo o precisión |
|---|---|---|
| Marco 1.3 §6.3 | Rutas sin `GET /datos/contexto`; `/consulta` "(o modal en la ficha)" sin parámetros | Se agrega `GET /datos/contexto`. El destino de la llamada es `/consulta?foto=<slug>&formato=<id>`; `consulta-copia` decide modal o página (D-01 sigue abierta). Cambio menor: marco 1.4 al aprobar. |
| Sistema de diseño 1.0 §5.3.1 | "Si conviene una barra fija inferior, la decide `portafolio/ficha-foto.md`" | Decidida: barra que aparece cuando el botón principal sale por arriba (§3.2). No cambia el sistema de diseño. |
| Sistema de diseño 1.0, riesgo SD-07 y SD-08 | Historia larga en la columna; llamada inadvertida en móvil | Mitigados con la historia plegada (§3.4) y la barra móvil (§3.2). |
| Galería 1.0 §5.2.9 | Desde una colección se pasa solo `?coleccion=`, aunque haya filtro | Cambio menor aplicado (galería 1.1): con filtro activo en una colección, el enlace lleva `?coleccion=<slug>&caracteristica=<slug>` (O-2). |
| Modelo de contenido 1.1, decisión abierta sobre `textoVitrina` y elección de papel | "Uso de `textoVitrina`… y cómo se muestra la elección de papel" | Resuelto en §3.1, §3.3 y §5.2.9. |

## 8. Plan de acción

Para Claude Code, en el paso 4 del plan del marco (§9.2), después de la galería.

| # | Paso | Depende de | Terminado cuando |
|---|---|---|---|
| 1 | Funciones puras de `lib/ficha.ts` con pruebas. | Modelo de contenido | Pruebas en verde para orientación de formatos y proporción, resumen de copias (1 y varios formatos, 1 y varios papeles), fecha visible, datos técnicos parciales, `hrefConsulta` y `masDeCircular`. |
| 2 | `fichaFoto` y `contextoFoto` en `lib/contenido.ts`, con pruebas de resolución de contexto. | 1, galería paso 2 | Pruebas en verde para los cuatro tipos de contexto, las bajadas de nivel del §4, hijas sin página, slugs anteriores y extremos. |
| 3 | `GET /datos/contexto` con caché por etiquetas. | 2 | Responde según el contrato del §5.3; 400 y 404 como se define; no expone campos privados. |
| 4 | Página `/fotos/[slug]`: ficha estática con `DisposicionFicha`, meta, resumen, botón, historia completa, características, datos técnicos, `NavegacionFotos` del contexto `todas`, "Más de" y la página amable. | 2, sistema de diseño | Criterios 1 a 6 y 13 a 15 sin JavaScript. |
| 5 | `TamanosPapeles` y `EleccionCopia`. | 4 | Criterios 7 y 8. |
| 6 | `BarraCopiaMovil`. | 5 | Criterio 9. |
| 7 | `Historia` plegable y `Compartir`. | 4 | Criterios 10 y 11. |
| 8 | `ContextoFicha` (contexto en el navegador, `Retorno` con `history.back()`, ← →) y el `Visor` con su lista y `accion`. | 3, 5, sistema de diseño paso 10 | Criterios 12, 16 y 18. |
| 9 | Revisión en dispositivos y medición. | 1 a 8 | Criterios 17, 19 y 20. |

## 9. Criterios de aceptación y pruebas

1. **Escritorio sin bajar.** En 1440 × 900 y 1280 × 720, con fotos 4:5, 1:1, 3:2 y 3:1: la foto se ve completa y el título, la meta, el resumen y "Pedir una copia" se ven sin desplazarse.
2. Con un título de 120 caracteres en una foto 4:5, el botón queda dentro de los primeros 360 px de la columna.
3. La meta muestra "lugar · mes de año" en minúsculas y el `<time>` lleva la fecha ISO.
4. El resumen de copias es correcto para: varios formatos con varios papeles, varios formatos con un papel, un formato con un papel y un formato con varios papeles. Las medidas aparecen orientadas como la foto (vertical "30 × 45 cm", horizontal "45 × 30 cm") y la proporción vertical se ve invertida ("2:3").
5. Una foto de vitrina no muestra resumen, botón, desplegable ni barra; muestra `textoVitrina` si existe y nada si no.
6. Datos técnicos parciales muestran solo los presentes; sin datos técnicos, sin historia o sin características, el bloque no aparece.
7. Elegir un tamaño agrega `&formato=<id>` al botón principal, a la barra y al botón del visor (misma foto); "Quitar" lo elimina. Con un solo formato, el enlace siempre lo lleva. Sin JavaScript, el botón lleva a `/consulta?foto=<slug>`.
8. Las opciones de tamaño se recorren con Tab y flechas, se eligen con Espacio, y el lector de pantalla anuncia el `legend` y la opción elegida.
9. **Barra móvil (390 × 844):** no está al cargar; aparece al bajar más allá del botón; desaparece al volver a verlo; no aparece en vitrina, con el visor abierto ni desde 1024 px; con `prefers-reduced-motion` no se desplaza; no tapa el pie.
10. Una historia de más de 4 líneas se pliega con "Leer más" y se despliega completa; una de 4 o menos no muestra el enlace; sin JavaScript se ve completa.
11. **Compartir:** en un teléfono abre el menú nativo con la URL canónica; en escritorio copia el enlace y anuncia "Enlace copiado"; si copiar falla, aparece el campo con la URL.
12. **Contexto:** desde una colección, Anterior/Siguiente y el visor recorren la colección en su orden y `Retorno` dice "Volver a <colección>"; desde `/fotos?caracteristica=x`, recorren el filtro; sin parámetro, recorren Todas las fotos; con un parámetro inválido o que no contiene la foto, bajan de nivel sin error. Los enlaces conservan el parámetro resuelto.
13. "Más de" muestra hasta 6 fotos de la colección sin la actual, empezando por la siguiente y dando la vuelta; en una hija sin página usa la madre; no aparece si no hay otras fotos.
14. Una foto despublicada que estuvo publicada muestra la página amable con `noindex`; una nunca publicada da 404; un slug anterior redirige con 308 conservando los parámetros.
15. La foto no se recorta en la ficha ni en el visor, y no ofrece menú contextual ni arrastre (sistema de diseño, criterio 13).
16. **Visor:** abre con clic, Enter y toque; muestra la foto actual de inmediato y el contador al llegar la lista; ← → cambian de foto sin animación; "Pedir una copia" pide la foto visible y no aparece en vitrinas; al cerrar, el foco vuelve a la foto y la ficha no cambió. Si `GET /datos/contexto` falla, el visor funciona con la foto actual sola.
17. **Navegador de Instagram (iOS y Android reales):** la ficha carga sin saltos, la barra respeta las zonas seguras, compartir copia el enlace si no hay menú nativo y el visor funciona.
18. ← → en la página cambian de foto solo cuando el foco no está en el grupo de tamaños, un campo o un diálogo.
19. **Rendimiento (Lighthouse móvil):** LCP < 2,5 s, CLS < 0,1, página < 300 KB sin la foto y JavaScript propio de la ficha < 10 KB comprimido sin el visor.
20. La ficha y `GET /datos/contexto` nunca sirven datos técnicos ocultos, `huella`, GPS ni versiones mayores a 2048 px.

## 10. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| FF-01 | Sin contexto, Anterior/Siguiente recorren Todas las fotos y quien llega desde Instagram salta entre colecciones. | Media | Bajo | "Más de <colección>" bajo la ficha (§3.5). Se revisa con el uso real (O-1). |
| FF-02 | La barra móvil se siente intrusiva o choca con la barra del navegador de Instagram. | Baja | Medio | Aparece solo tras pasar el botón, alto de 64 px, zonas seguras y prueba en dispositivos reales (criterio 17). |
| FF-03 | El visitante elige un tamaño y luego no lo ve en la consulta. | Baja | Medio | Contrato §5.2.9; `consulta-copia` debe mostrarlo preseleccionado (decisión abierta para ese documento). |
| FF-04 | "Sin recortes" no se cumple si el proveedor de impresión recorta o agrega borde. | Baja | Medio | Los formatos solo se ofrecen si su proporción es compatible (±2 %). Rod valida la frase con su proveedor antes de lanzar (§11, D-F1). |
| FF-05 | La lista de contexto de Todas las fotos crece mucho y pesa al abrir el visor. | Baja | Bajo | Se pide solo al abrir el visor y va comprimida; con cientos de fotos son decenas de KB. Si supera 100 KB comprimido, se pasa a una ventana de ±30 fotos (cambio menor). |
| FF-06 | Rod publica una foto y la ficha de otra muestra vecinas desactualizadas. | Baja | Bajo | Etiqueta `fotos` invalidada en cada publicación (§5.3). |

## 11. Decisiones abiertas y tareas del dueño

**Decisiones abiertas**

- **D-F1 (resuelta).** Se mantiene la frase "Cada copia muestra la foto completa, sin recortes". Si el proveedor de impresión no lo permite, se cambia el rótulo por "Proporción 2:3" (cambio menor, riesgo FF-04).
- **D-F2 (resuelta).** El atributo `datetime` lleva el día exacto; en pantalla, solo mes y año.
- Para `consultas/consulta-copia.md`: aceptar `/consulta?foto=<slug>&formato=<id>`, mostrar el formato preseleccionado, resolver una foto despublicada en la URL y decidir modal o página (D-01).
- Para `plataforma/seo.md`: código de estado de la página amable (404 o 410), título y descripción de la ficha, Open Graph con la versión de 1200 px y datos estructurados.

**Propuestas (fuera de alcance; no se construyen sin tu aprobación)**

- **P-01 (v1.x).** Vista previa de una foto en borrador desde el panel (modo borrador de Next.js con Payload), para revisar la ficha antes de publicar. Costo: bajo, sin servicios nuevos.
- **P-02 (v1.x o futuro).** "Así se ve en tu pared": la foto sobre una pared neutra con una silueta de referencia, a escala según el tamaño elegido. Ayuda a decidir el tamaño. Costo: medio, sin servicios nuevos.

**Cambios a otros documentos** (aplicados al aprobar; cambios menores, sin cambio de alcance)

1. Marco general → 1.4: §6.3 agrega `GET /datos/contexto` y el destino `/consulta?foto=<slug>&formato=<id>`.
2. Galería y colecciones → 1.1: §5.2.9, el enlace desde una colección con filtro activo lleva ambos parámetros (O-2).

**Tareas del dueño**

No nacen tareas nuevas. Para lanzar, siguen abiertas T-005 (fotos de lanzamiento), T-006 (catálogo de tamaños y papeles, que alimenta el resumen y el desplegable) y T-009 (portada y destacadas). Si quieres usar el texto de vitrina, se escribe en Ajustes del sitio al cargar el contenido (parte de T-005).

## 12. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.1 | 2026-10-14 | Cambio menor al aprobar `consultas/consulta-copia.md` 1.0: el enlace a la consulta agrega `origen=ficha` u `origen=visor` (§5.2.9). |
| 1.0 | 2026-10-14 | Aprobado por Rod. D-F1 y D-F2 quedan con sus valores por defecto. El marco general pasa a 1.4 y la galería a 1.1 con los cambios del §11. |
| 0.1 | 2026-10-14 | Borrador inicial. Decisiones de Rod: tamaños con resumen de una línea y desplegable; elección de tamaño opcional que se lleva a la consulta; barra fija móvil que aparece al pasar el botón; fecha en mes y año; historia plegada con "Leer más"; características como enlaces; datos técnicos en una línea discreta; botón compartir nativo; "Más de <colección>" bajo la ficha; vitrina con `textoVitrina` o nada; "Pedir una copia" en el visor. Revisión con las guías de diseño de interfaces (transiciones interrumpibles, salida más rápida que la entrada, sin animar acciones de teclado). |

# Consulta de copia y gestión de consultas

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/consultas/consulta-copia.md` |
| Tipo | Componente |
| Versión | 1.1 |
| Estado | Aprobado |
| Fecha | 2026-10-14 |
| Padre | `marco-general/marco-general-proyecto.md` (1.5) |
| Dependencias | `contenido/modelo-contenido-panel.md` (1.2), `portafolio/ficha-foto.md` (1.1); usa `identidad/sistema-de-diseno.md` (1.0) |
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

Este componente cubre los dos últimos eslabones del flujo central (marco §4.1): la **consulta de copia**, el formulario público al que lleva "Pedir una copia", y la **gestión de consultas**, donde Rod (Administrador) las ve, responde y cierra desde el panel. Es el único punto del sitio que recibe datos personales.

**Filtro de valor (método §6).**

1. *Problema real:* el **Visitante** que quiere una copia necesita decir cuál, en qué tamaño y cómo contactarlo, sin cuenta ni carrito. El **Administrador** necesita recibir esas consultas ordenadas, saber cuáles son nuevas y responderlas rápido. Sin este componente, el sitio no cumple su segundo objetivo (marco §1).
2. *Beneficio frente al costo:* una página, una colección de Payload y unas vistas en el panel. Sin servicios nuevos. Costo incremental cero.
3. *Versión:* núcleo de la v1.0 (marco §2).

**Resultado esperado.** Desde la ficha, el visitante llega a una página donde ya ve la foto que eligió y el tamaño, si lo eligió; completa nombre y correo, acepta la política y envía en menos de un minuto. Si quiere más copias, suma otras fotos sin salir de la página. La consulta queda guardada antes de decirle "recibida". Rod la ve destacada al entrar al panel, la responde desde su Gmail con un borrador listo y la marca como respondida.

**Lo que este componente hereda y no redefine:** la entidad `Consulta` y sus estados (marco §6.1, que este documento amplía, §7), "se guarda primero" (marco §6.2.7), conservación de 12 meses (§6.2.8), antispam sin captcha (§6.2.9), qué fotos y formatos se ofrecen (`modelo-contenido-panel` §5.2.7 y §5.2.8), el contrato de entrada desde la ficha (`ficha-foto` §5.2.9) y los componentes `Campo`, `Boton`, `Aviso` y `PlantillaEstado` (sistema de diseño §5.5).

## 2. Alcance

**Incluye (v1.0)**

- **D-01 resuelta:** el formulario vive en una **página propia**, `/consulta`, no en un modal.
- Entrada desde la ficha (`/consulta?foto=<slug>&formato=<id>`), desde el visor y sin foto (consulta general, por ejemplo desde "Contacto").
- Hasta **5 fotos por consulta**, cada una con tamaño y papel opcionales, y "Agregar otra foto" con buscador por título.
- Campos: nombre y correo (obligatorios); teléfono, ciudad y mensaje (opcionales); casilla de aceptación de la política de privacidad y de ser contactado por los medios indicados (obligatoria); casilla de novedades y promociones (opcional, sin marcar).
- Envío que funciona sin JavaScript, guardado antes de confirmar, estado de éxito con texto editable desde el panel, y conservación de lo escrito si falla.
- Antispam del marco §6.2.9 y sugerencia de corrección de correos mal escritos.
- En el panel: colección *Consultas* con vistas, detalle, "Responder por correo" (borrador en Gmail), "Marcar respondida", "Cerrar", "Es spam", notas internas, otras consultas del mismo correo, contador de nuevas en el menú y en el dashboard, e indicador de consultas por mes (marco §2.1).
- Borrado automático programado (12 meses; spam a los 30 días) y procedimiento de derechos del interesado (acceso, rectificación, supresión, oposición).
- Registro de **suscriptores a novedades** (`Suscriptor`) para quienes marcan la casilla opcional, con su lista en el panel, "Copiar correos" para enviar desde Gmail en copia oculta, y baja.

**No incluye**

- Envío de correos desde el sitio (aviso a Rod, confirmación al interesado, respuesta o boletín de novedades): fuera de la v1.0 por decisión del marco (§6.6). Las novedades las envía Rod desde su Gmail.
- Suscripción a novedades sin consulta (un formulario "suscríbete" suelto): queda para v1.x si se quiere.
- Precios, cotización automática, carrito o pagos.
- El texto de la política de privacidad y la página "Contacto": `paginas/paginas.md` (este documento fija lo que deben decir sobre consultas, §6).
- Título, descripción e indexación de `/consulta`: este documento fija solo `noindex` (§5.5); lo demás en `plataforma/seo.md`.

**Queda para después**

- *v1.x:* aviso de consulta nueva fuera del panel (Telegram u otro), respetando "se guarda primero" (marco §2). Cloudflare Turnstile si el spam supera las defensas (marco R-06).
- *v2:* cada ítem de la consulta (foto × formato × papel) es la variante de producto; el modelo `ItemConsulta` (§5.1) se diseñó para no bloquearlo.

## 3. Flujo de usuario y UX/UI cuestionado

### 3.1 Llegada al formulario

- **Desde la ficha o el visor:** `/consulta?foto=<slug>` y, si lo hay, `&formato=<id>`. La página abre con esa foto como primer ítem y el tamaño preseleccionado (riesgo FF-03 de la ficha resuelto).
- **Sin foto** (desde "Contacto" o escribiendo la URL): la página abre sin ítems, con el título "Escríbeme" y el bloque "¿Te interesa una copia? Agregar una foto".
- La página no se indexa y su URL no se comparte; el `Retorno` dice "Volver a <título de la foto>" (a su ficha) si llegó con foto, y "Volver" (atrás en el historial, o a `/`) si no.

### 3.2 Qué ve el visitante, en orden

**Escritorio (≥ 1024 px), dos columnas** dentro de un contenedor de 1040 px:

- **Izquierda (sticky, 420 px):** "Tu consulta" en `--titulo-md` y la lista de ítems (§3.3). Debajo, "Agregar otra foto" (`Boton` variante `secundario`), oculto al llegar a 5.
- **Derecha (máx. 520 px):** el texto breve `AjustesSitio.textoIntroConsulta` (por defecto "Cuéntame cómo contactarte y te respondo con los detalles y el valor de la copia."), los campos en este orden: **Nombre**, **Correo**, **Teléfono (opcional)**, **Ciudad (opcional)** con la ayuda "Para estimar el envío", **Mensaje (opcional)** (área de 4 líneas que crece hasta 10), la **casilla de privacidad y contacto** (obligatoria), la **casilla de novedades** (opcional, sin marcar) y el `Boton` primario "Enviar consulta".

**Móvil y tableta (< 1024 px), apilado:** `Retorno`, título, ítems, "Agregar otra foto", texto breve, campos, las dos casillas y botón. El botón no es fijo: está al final del formulario y el teclado no lo tapa (`enterkeyhint="next"` en los campos y `enterkeyhint="send"` en el último).

**Sin ítems (consulta general):** la columna izquierda muestra solo "¿Te interesa una copia?" y "Agregar una foto"; el título de la página es "Escríbeme" y el botón dice "Enviar mensaje".

### 3.3 Ítem de la consulta

Cada ítem es una tarjeta con borde `--color-linea` y radio `--radio-control`:

- Miniatura de 480 px mostrada a 72 px de alto, sin recorte, y el título de la foto (enlace a su ficha, que abre en la misma pestaña solo si el formulario está vacío; si tiene texto, abre en otra pestaña para no perderlo).
- **Tamaño (opcional):** `Campo` tipo `seleccion` con los formatos ofrecidos, orientados como la foto ("30 × 45 cm"), más la primera opción "Aún no lo sé". Si la foto tiene un solo formato, se muestra como texto ("Copia de 30 × 45 cm") sin selector.
- **Papel:** si el formato elegido tiene un solo papel, se informa en texto ("Algodón mate"). Si tiene varios, aparece un selector "Papel (opcional)" con "Me ayudas a elegir" como primera opción y la `descripcion` de cada papel como ayuda. Si no hay tamaño elegido, no se muestra papel.
- "Quitar" (variante `enlace`, con nombre accesible "Quitar <título>"). Al quitar el último ítem, la consulta pasa a general sin recargar.

Los ítems aparecen con opacidad y 4 px de desplazamiento en 200 ms; al quitarse, desaparecen en 150 ms y el foco pasa al ítem siguiente, o a "Agregar otra foto" si no hay más. Con `prefers-reduced-motion`, sin desplazamiento.

### 3.4 Agregar otra foto

- "Agregar otra foto" abre un `Dialogo` "Elige una foto" con un buscador (`Campo` tipo `texto`, etiqueta "Buscar por título o lugar") y, debajo, una grilla de miniaturas de las fotos **que ofrecen copia**, en el orden de `/fotos`. Escribir filtra en el navegador, sin acentos ni mayúsculas ("nuble" encuentra "Ñuble").
- Un toque o Enter sobre una miniatura la agrega como ítem y cierra el diálogo; el foco va a su selector de tamaño. Las fotos ya agregadas aparecen con ✓ y no se pueden repetir.
- La lista se pide al abrir el diálogo por primera vez (`GET /datos/fotos-consultables`, §5.3) y se reutiliza. Mientras llega, se ven `Esqueleto`s; si falla, `Aviso` "No pudimos cargar las fotos. Reintentar".
- Sin resultados: "No encontré fotos con «<texto>»" y el enlace "Ver todas".
- Sin JavaScript no hay botón: el visitante puede nombrar otras fotos en el mensaje.

### 3.5 Validación y envío

- Se valida **al salir de cada campo** y al enviar, nunca mientras se escribe. El `Boton` nunca está deshabilitado (sistema de diseño: "se valida al usar").
- Mensajes, junto al campo y en `--color-error` con texto: "Escribe tu nombre", "Escribe tu correo", "Revisa el correo: falta algo como nombre@dominio.cl", "Marca la casilla para poder enviar". Al enviar con errores, el foco va al primer campo con error y arriba aparece un `Aviso` de error con la lista enlazada a cada campo.
- **Sugerencia de correo:** si el dominio parece mal escrito (por ejemplo `gmial.com`, `hotmal.com`, `gmail.co`), bajo el campo aparece "¿Quisiste decir nombre@gmail.com?" como botón que lo corrige. No bloquea el envío.
- **Al enviar:** el botón pasa a "Enviando…" (`cargando`), un segundo clic no hace nada y la consulta se guarda en el servidor antes de responder (marco §6.2.7).
- **Éxito:** el formulario se reemplaza por el estado de éxito en la misma URL (§3.6). El foco va a su título.
- **Falla al guardar:** `Aviso` de error "No pudimos enviar tu consulta. Lo que escribiste sigue aquí: intenta de nuevo en un momento o escríbeme a <correoContacto>". Todos los campos e ítems se conservan.

### 3.6 Estado de éxito

- Título "Recibimos tu consulta" (o "Recibimos tu mensaje" si es general) en `--titulo-md`.
- Texto `AjustesSitio.textoConsultaRecibida`, con `{correo}` reemplazado por el correo escrito. Por defecto: "Te respondo a {correo} en los próximos días. Si no ves mi respuesta, revisa la carpeta de spam."
- Resumen de lo enviado: miniaturas y títulos de los ítems con su tamaño y papel, si los eligió. Si marcó novedades, una línea: "También te sumé a las novedades. Puedes darte de baja cuando quieras escribiendo a <correoContacto>."
- Acciones: "Seguir mirando fotos" (primario, a `/fotos`) y, si llegó desde una foto, "Volver a <título>".
- **Pequeña celebración, sin ruido:** el bloque entra con opacidad y escala de 0,98 a 1 en 250 ms, y un ✓ de 20 px se dibuja con un trazo SVG en 300 ms. Es un momento único en la visita; se justifica (guías de diseño: formularios de primera vez admiten algo de deleite). Sin confeti ni sonido. Con `prefers-reduced-motion`, aparece sin movimiento.
- Recargar la página después del éxito **no** reenvía: muestra el formulario vacío (con la foto del parámetro).

### 3.7 Panel: gestión de consultas

**Menú y dashboard.** El grupo *Consultas* del menú muestra un globo con el número de consultas `nueva` (si hay). La tarjeta "Consultas nuevas" del dashboard (reservada en `modelo-contenido-panel` §3.4) muestra el número y la más antigua sin responder ("La más antigua: hace 4 días"), con enlace a la vista *Nuevas*. La tarjeta **"Consultas por mes"** muestra, para los últimos 12 meses, barras de recibidas y respondidas, con la cifra en texto al lado de cada mes (indicador de la v2, marco §2.1).

**Lista.** Vistas: *Nuevas* (por defecto si hay alguna), *Abiertas* (`nueva` y `respondida`), *Todas*, *Spam*. Columnas: estado (las `nueva` con punto y en negrita), nombre, fotos (miniatura de la primera y "+2" si hay más; "General" si no hay), ciudad, recibida (fecha y hora en America/Santiago). Búsqueda por nombre o correo. Orden: más reciente primero.

**Suscriptores.** En el grupo *Consultas*, la lista *Suscriptores a novedades*: nombre, correo, desde (fecha). Acciones: **"Copiar correos"** (todos, separados por comas, para pegarlos en el campo **CCO** de Gmail, con el recordatorio "Pégalos en CCO, nunca en Para") y **"Dar de baja"** (borra el registro tras confirmar). La tarjeta "Consultas por mes" muestra al lado el total de suscriptores.

**Detalle.** En este orden:

1. Nombre, correo (con "Copiar"), teléfono, ciudad y fecha de recepción.
2. Ítems: miniatura, título (enlace a la ficha si sigue visible; "despublicada" o "eliminada" si no), tamaño y papel elegidos, o "sin tamaño elegido".
3. Mensaje, con saltos de línea respetados y texto plano.
4. Acciones: **"Responder por correo"** (abre Gmail en una pestaña nueva con destinatario, asunto y cuerpo listos, §5.2.6), **"Marcar respondida"**, **"Cerrar"**, **"Es spam"** / "No es spam".
5. **Notas internas** (texto, solo para Rod).
6. **Otras consultas de este correo (N)**, con enlaces.
7. Datos de cumplimiento: aceptó la política el <fecha> (versión de <fecha>), se borra el <fecha>, y "Suscrito a novedades" si marcó la casilla (con enlace a su registro).

Abrir una consulta no cambia su estado: sigue `nueva` hasta que Rod la marca. *Objeción planteada:* ¿no debería pasar a "vista" al abrirla? Se descarta: el contador debe medir lo que falta responder, no lo que Rod miró, y no se agrega un estado más al marco.

### 3.8 Estados de la interfaz

| Estado | Público (`/consulta`) | Panel |
|---|---|---|
| Vacío | Consulta general (§3.2). | "Aún no hay consultas. Cuando alguien pida una copia, aparecerá aquí." |
| Cargando | La página llega del servidor completa; solo el buscador de fotos tiene `Esqueleto`. Enviando: botón "Enviando…". | Lo de Payload. |
| Error | Por campo y `Aviso` de error al guardar (§3.5). | Aviso estándar de Payload. |
| Éxito | §3.6. | Aviso "Guardado" de Payload al cambiar estado o notas. |

### 3.9 Accesibilidad

- `form` con `aria-describedby` hacia el texto breve; cada `Campo` con etiqueta visible, `autocomplete` (`name`, `email`, `tel`, `address-level2`) y error unido con `aria-describedby`.
- El resumen de errores es un `Aviso` con `role="alert"`; el estado de éxito recibe el foco en su título.
- Los ítems son una lista (`ul`) con nombre "Fotos de tu consulta"; quitar uno se anuncia ("Quitaste <título>") con `aria-live="polite"`.
- El `Dialogo` del buscador atrapa el foco, cierra con Esc y devuelve el foco a "Agregar otra foto". Las miniaturas son botones con nombre "Agregar <título>".
- Casillas: `input type="checkbox"` nativo de 24 px con área táctil de 44 px; el enlace a la política abre en una pestaña nueva y lo anuncia ("se abre en una pestaña nueva"). La de novedades dice "(opcional)" en su etiqueta.
- Contraste AA y objetivos de 44 px con los tokens del sistema de diseño.

### 3.10 Objeciones planteadas al flujo y su resolución

| # | Objeción | Resolución |
|---|---|---|
| O-1 | ¿Modal sobre la ficha o página? (D-01) | **Página** (decisión de Rod): funciona sin JavaScript, el "atrás" vuelve a la ficha y en el navegador de Instagram no hay sorpresas. La foto sigue presente como miniatura. |
| O-2 | Varias fotos podrían convertirse en un carrito. | Buscador dentro del formulario, máximo 5, sin lista guardada entre páginas ni contador en el sitio (decisión de Rod). |
| O-3 | Pedir la ciudad suma un dato personal. | Se pide, opcional, porque cambia la primera respuesta de Rod (el envío). Rod la eligió con esa contrapartida (§6). |
| O-4 | Sin correo de confirmación, el interesado no tiene prueba de que se envió. | El estado de éxito repite su correo y lo enviado; el texto (editable) le avisa que revise spam. |
| O-5 | Consulta sin foto mezcla temas en el panel. | Se acepta (decisión de Rod); el panel la marca "General" y el indicador de la v2 cuenta solo consultas con fotos (§5.2.8). |
| O-6 | Casilla obligatoria agrega un paso. | Se mantiene por decisión de Rod: consentimiento explícito y con registro de fecha y versión (§6). |
| O-7 | ¿Marcar respondida al abrir el correo? | No: se marca a mano para que el indicador de la v2 sea fiel (decisión de Rod). |
| O-8 | Validar mientras se escribe molesta. | Validación al salir del campo y al enviar. |
| O-10 | Rod pidió que el texto diga que el interesado acepta ser contactado y que sus datos se pueden usar para comunicaciones y promociones. | El contacto por los medios indicados se suma a la casilla obligatoria, porque es parte de responder. Las promociones van en una **segunda casilla opcional y sin marcar** (decisión de Rod): la Ley 21.719 pide un consentimiento libre y específico por finalidad, y condicionar la consulta a aceptar promociones lo invalidaría (§6). |
| O-9 | Bloquear el envío sospechoso podría perder una consulta real. | Las señales de bot (campo trampa, envío en menos de 3 s) no se rechazan: se guardan como `spam`, que Rod revisa y puede rescatar (§5.2.5). |

## 4. Casos borde

| Caso | Resolución |
|---|---|
| `?foto=` de una foto despublicada, eliminada o inexistente | El formulario abre sin ese ítem, con un `Aviso` informativo: "Esa foto ya no está disponible. Puedes elegir otra o escribirme igual." No es error ni 404. |
| `?foto=` de una foto de vitrina | Igual que arriba, con el texto "Esa foto no está disponible como copia." |
| `?foto=` con un slug anterior | Se resuelve a la foto vigente en silencio (`slugsAnteriores`). |
| `?formato=` que no pertenece a la foto, inactivo o sin papel activo | Se ignora en silencio: el tamaño queda en "Aún no lo sé" (contrato `ficha-foto` §5.2.9). |
| Formato o papel desactivado mientras el visitante llenaba el formulario | El servidor valida cada ítem al guardar y descarta en silencio el formato o papel que ya no corresponde; la consulta se guarda igual, con el ítem "sin tamaño elegido". |
| Foto despublicada entre abrir y enviar | El ítem se descarta al guardar; si era el único, la consulta se guarda como general y el mensaje queda intacto. |
| Más de 5 fotos | "Agregar otra foto" se oculta al llegar a 5; el servidor rechaza más de 5 con un error de validación. |
| La misma foto dos veces | El buscador la marca con ✓ y no la agrega; el servidor deduplica por foto. |
| Correo inválido | Validación de formato en el navegador y en el servidor. No se verifica que exista. |
| Correo con mayúsculas o espacios | Se recorta y se guarda en minúsculas (para agrupar consultas del mismo correo). |
| Nombre de una letra, muy largo o con emoji | Mínimo 2 y máximo 80 caracteres; se aceptan tildes, ñ, apóstrofos y emoji. Se muestra con `overflow-wrap: anywhere`. |
| Correo largo sin cortes (`nombre.apellido.muy.largo@...`) | Máximo 254 caracteres; en el panel y el éxito, `overflow-wrap: anywhere`. |
| Teléfono con formato libre | Opcional, máximo 20 caracteres, se aceptan dígitos, espacios, `+`, `-` y paréntesis. No se valida contra un plan de numeración. |
| Mensaje vacío, muy largo o con enlaces | Opcional, máximo 2000 caracteres, contador visible desde 1800. Se guarda y muestra como texto plano: enlaces sin activar y sin HTML. |
| Doble clic o doble envío | Botón en `cargando` y clave de idempotencia por envío (§5.2.4): el segundo envío devuelve el mismo resultado sin crear otra consulta. |
| Recargar tras el éxito | Formulario vacío, sin reenvío. |
| "Atrás" tras el éxito | Vuelve a la ficha (página propia, sin modal). |
| Base de datos caída al enviar | `Aviso` de error con lo escrito intacto (§3.5). Nada se da por recibido. |
| Spam o bot | Campo trampa, tiempo mínimo y validación de correo: se guarda como `spam`. Más de 5 envíos por hora desde la misma IP: se rechaza con "Recibimos varias consultas desde tu conexión. Intenta en una hora o escríbeme a <correoContacto>". |
| Varias consultas del mismo interesado | Se guardan por separado; el detalle muestra "Otras consultas de este correo (N)". |
| Consulta sobre una foto que luego se borra | El ítem conserva título y slug guardados al enviar; el panel muestra "<título> (eliminada)", sin miniatura. |
| Consulta sobre una foto que luego se despublica | El panel muestra la miniatura y "despublicada". |
| Foto renombrada después de la consulta | El panel muestra el título vigente si la foto existe; el guardado solo se usa si se borró. |
| JavaScript desactivado | Envío normal del formulario con validación del servidor, errores y éxito en la misma página. No hay buscador de fotos, sugerencia de correo ni animaciones. Los selectores de papel se muestran con todos los papeles de los formatos de la foto y el servidor valida la combinación. |
| Navegador interno de Instagram | Página liviana; los campos tienen 16 px (sin zoom), `autocomplete` y teclado adecuado; el botón no queda bajo la barra del navegador. Se prueba en iOS y Android (criterio 15). |
| Autocompletado del navegador llena el campo trampa | El campo trampa lleva `autocomplete="off"`, `tabindex="-1"` y un nombre que los navegadores no autocompletan; aun si se llena, la consulta se guarda como `spam` y no se pierde. |
| Rod responde por otro medio (teléfono, Instagram) | Marca la consulta respondida a mano y puede anotar en notas internas. |
| Rod borra una consulta por error | Payload pide confirmación; no hay papelera en la v1.0. Se recomienda "Cerrar" en vez de borrar. |
| El interesado pide sus datos o su borrado | Procedimiento §5.2.9 (incluye su registro de `Suscriptor`). |
| Marca novedades y ya era suscriptor | No se duplica: se actualizan `consentimientoEn` y `versionPolitica` del registro existente. |
| Marca novedades en una consulta que queda en *Spam* | No se crea `Suscriptor` hasta que Rod marque "No es spam". |
| Pide la baja de novedades pero quiere que respondan su consulta | "Dar de baja" borra solo el `Suscriptor`; la consulta sigue. |
| La consulta se borra a los 12 meses | El `Suscriptor` no se borra con ella: se conserva hasta la baja (§5.2.13). |
| Rod envía novedades con todos los correos en "Para" | El panel solo ofrece "Copiar correos" con el recordatorio de usar CCO; el pie `plantillaNovedades` recuerda la forma de baja. |

## 5. Especificación técnica

### 5.1 Modelo de datos

**`Consulta`** (colección Payload, `src/colecciones/Consulta.ts`). Amplía el marco §6.1 (cambio del §7):

| Campo | Tipo | Regla |
|---|---|---|
| `nombre` | texto | Obligatorio, 2 a 80 caracteres, recortado. |
| `correo` | correo | Obligatorio, máx. 254, recortado y en minúsculas. Índice. |
| `telefono` | texto | Opcional, máx. 20, solo `0-9 +-()` y espacios. |
| `ciudad` | texto | **Nuevo.** Opcional, máx. 80. |
| `mensaje` | área de texto | Opcional, máx. 2000, texto plano. |
| `items` | arreglo de `ItemConsulta` | **Reemplaza** `fotos`, `formatoPreferido` y `papelPreferido`. De 0 a 5 ítems. 0 = consulta general. |
| `tipo` | selección (`copia`, `general`) | **Nuevo.** Calculado al guardar: `copia` si hay al menos un ítem. Solo lectura. |
| `estado` | selección (`nueva`, `respondida`, `cerrada`, `spam`) | Por defecto `nueva` (o `spam` según §5.2.5). Índice. |
| `respondidaEn` | fecha | **Nuevo.** Se fija la primera vez que pasa a `respondida`; no se borra si después pasa a `cerrada`. Alimenta el indicador. |
| `ultimaActividad` | fecha | Al crear y en cada cambio de `estado` o `notasInternas`. |
| `eliminarDespuesDe` | fecha | Calculado: `ultimaActividad` + 12 meses; si `estado = spam`, `createdAt` + 30 días. Índice. |
| `notasInternas` | área de texto | Opcional, solo panel. |
| `consentimientoEn` | fecha | **Nuevo.** Instante en que se envió con la casilla obligatoria marcada. Obligatorio. Solo lectura. |
| `aceptaPromociones` | casilla | **Nuevo.** Si marcó la casilla de novedades. Solo lectura. |
| `versionPolitica` | fecha | **Nuevo.** `contenidoActualizadoEn` de la `Pagina` de privacidad al momento del envío (`paginas/paginas.md` §5.2.7). Solo lectura. |
| `origen` | selección (`ficha`, `visor`, `general`) | **Nuevo.** De dónde llegó (parámetro `origen` de la URL; por defecto `general` sin foto y `ficha` con foto). Solo lectura. Sirve para entender el uso, sin analítica. |
| `claveEnvio` | texto | **Nuevo.** Clave de idempotencia (UUID). Única. Oculta en el panel. |

**`ItemConsulta`** (campos del arreglo `items`):

| Campo | Tipo | Regla |
|---|---|---|
| `foto` | relación con `Foto` | Opcional tras borrar la foto (queda vacía). |
| `tituloFoto` | texto | Copia del título al enviar. Solo lectura. |
| `slugFoto` | texto | Copia del slug al enviar. Solo lectura. |
| `formato` | relación con `FormatoImpresion` | Opcional; solo uno ofrecido por la foto al enviar. |
| `papel` | relación con `TipoPapel` | Opcional; solo uno activo del formato elegido. Si el formato tiene un solo papel, se guarda ese. |

No se guardan IP, agente de usuario ni identificadores del navegador en la `Consulta`.

**`Suscriptor`** (colección Payload nueva, `src/colecciones/Suscriptor.ts`): persona que aceptó recibir novedades y promociones.

| Campo | Tipo | Regla |
|---|---|---|
| `nombre` | texto | Copiado de la consulta. |
| `correo` | correo | Obligatorio, en minúsculas, **único**. |
| `consentimientoEn` | fecha | Instante del consentimiento (el último, si lo renovó). Solo lectura. |
| `versionPolitica` | fecha | `contenidoActualizadoEn` de la política de privacidad al consentir. Solo lectura. |
| `origen` | relación con `Consulta` | La consulta donde marcó la casilla; queda vacía cuando la consulta se borra. |

No guarda teléfono, ciudad ni mensaje. La baja **borra** el registro (§5.2.13).

**`AjustesSitio`**, campos nuevos (datos, no código, marco §6.2.10):

| Campo | Por defecto |
|---|---|
| `textoIntroConsulta` | "Cuéntame cómo contactarte y te respondo con los detalles y el valor de la copia." |
| `textoConsultaRecibida` | "Te respondo a {correo} en los próximos días. Si no ves mi respuesta, revisa la carpeta de spam." |
| `textoConsentimiento` | "Acepto la {politica} y que Rod Díaz me contacte por correo, teléfono u otro medio que indiqué, para responder esta consulta." (`{politica}` se reemplaza por el enlace "política de privacidad") |
| `textoPromociones` | "Quiero recibir novedades y promociones de Rod Díaz (fotos nuevas, ofertas de copias). Puedo darme de baja cuando quiera." |
| `plantillaNovedades` | Pie que Rod pega en cada correo de novedades: "Recibes este correo porque te suscribiste en <nombreSitio>. Si no quieres recibir más, responde BAJA a este correo." |
| `plantillaRespuesta` | Asunto: "Tu consulta por {fotos}" (o "Tu mensaje" si es general). Cuerpo: "Hola {nombre}:\n\nGracias por escribirme. {detalle}\n\n" (`{detalle}` lista cada foto con su tamaño y papel). Rod la edita a su gusto. |

**Índices:** `Consulta`: `correo`, `estado`, `eliminarDespuesDe`, `createdAt`, `claveEnvio` (único). `Suscriptor`: `correo` (único).

### 5.2 Reglas de negocio específicas

1. **Lectura de la URL.** `/consulta` lee en el servidor `foto`, `formato` y `origen`. La foto se resuelve con `fotoPorSlug`; solo se acepta si es visible y ofrece copia (`formatosOfrecidos` no vacío). El formato se acepta solo si está en `formatosOfrecidos` de esa foto. Lo que no cumpla se ignora según el §4.
2. **Validación en el servidor** (la del navegador es solo ayuda): longitudes y formatos del §5.1, máximo 5 ítems, sin fotos repetidas, cada ítem con foto visible que ofrece copia, formato ofrecido y papel activo del formato. Lo inválido de un ítem se limpia (§4); lo inválido de los datos del interesado devuelve errores por campo. La casilla es obligatoria.
3. **Guardar primero** (marco §6.2.7). La acción del servidor crea la `Consulta` con la API local de Payload y solo después devuelve éxito. No hay ningún paso posterior que pueda fallar (no hay aviso en la v1.0); el aviso de la v1.x se colgará de un *hook* `afterChange` que nunca bloquea ni deshace el guardado.
4. **Idempotencia.** El formulario lleva `claveEnvio` (UUID generado al renderizar la página). Si llega un envío con una clave ya guardada, se devuelve el mismo éxito sin crear otra consulta.
5. **Antispam** (marco §6.2.9, precisado):
   - **Campo trampa** oculto (`sitio_web`, fuera de la vista con CSS, `aria-hidden`, `tabindex="-1"`): si trae texto → se guarda con `estado = spam`.
   - **Tiempo mínimo:** el formulario lleva `emitidoEn` firmado con HMAC (`PAYLOAD_SECRET`). Si el envío llega antes de 3 s, o la firma no valida → `spam`. Si la firma tiene más de 24 h, se acepta igual (alguien que dejó la pestaña abierta).
   - **Límite por IP:** 5 envíos por hora por IP, contados en memoria del servicio con la IP resumida (SHA-256 con sal diaria) y sin guardarla. Sobre el límite → se rechaza con el mensaje del §4 (no se guarda). Al reiniciar el servicio el contador se reinicia; se acepta (un solo servicio, tráfico bajo).
   - **Correo:** formato válido o error de campo.
   - Al visitante siempre se le muestra éxito en los casos `spam`: no se le da pista al bot.
6. **Responder por correo.** El botón abre `https://mail.google.com/mail/?view=cm&fs=1&authuser=<correo del Usuario>&to=<correo>&su=<asunto>&body=<cuerpo>`, armado desde `plantillaRespuesta` con `{nombre}`, `{fotos}` (títulos separados por " y ") y `{detalle}`. Un segundo enlace "Usar otro programa" abre `mailto:` con lo mismo. No cambia el estado.
7. **Transiciones de estado.** `nueva → respondida | cerrada | spam`; `respondida → cerrada | nueva`; `cerrada → nueva | respondida`; `spam → nueva` ("No es spam", que recalcula `eliminarDespuesDe`). Cada cambio actualiza `ultimaActividad`. Pasar a `respondida` por primera vez fija `respondidaEn`.
8. **Contador e indicador.** Contador del menú y del dashboard: consultas con `estado = nueva`. Indicador mensual (marco §2.1): por mes calendario en America/Santiago, de los últimos 12 meses, **recibidas** = consultas `tipo = copia` no `spam` creadas en el mes, y **respondidas** = consultas `tipo = copia` con `respondidaEn` en el mes. Las generales se muestran aparte, como un número, sin entrar al indicador. *Nota:* como se borran a los 12 meses, el indicador nunca necesita más historia que la que existe.
9. **Derechos del interesado** (marco §7.1). El interesado escribe a `AjustesSitio.correoContacto`. Rod, en *Consultas*, busca por el correo y usa la acción **"Datos de este correo"**, que muestra cuántas consultas hay y ofrece:
   - **Acceso:** "Descargar" genera un archivo `.txt` legible con todas sus consultas (datos, ítems, mensaje, fechas, estado; sin notas internas que no sean datos del titular, ver §11 D-C2), que Rod adjunta a su respuesta.
   - **Rectificación:** Rod edita los campos de la consulta.
   - **Supresión u oposición:** "Borrar todas" elimina, tras confirmar escribiendo el correo, todas las consultas de ese correo y su `Suscriptor`, si existe. La oposición solo a promociones es "Dar de baja" (§5.2.13).
   - Rod responde por correo; el plazo y el procedimiento visible para el interesado los fija la política de privacidad (`paginas/paginas.md`).
10. **Borrado programado.** Una tarea diaria (`src/tareas/borrarConsultasVencidas.ts`, cola de trabajos de Payload a las 04:00 America/Santiago) borra las consultas con `eliminarDespuesDe` vencido y deja en el registro del servicio solo el número borrado, sin datos personales.
11. **Fechas.** Instantes en UTC; el panel y el éxito muestran America/Santiago (marco §6.2.11). El panel se configura con zona horaria por defecto America/Santiago.
12. **Datos, no código.** Los textos de §5.1 (`AjustesSitio`) son datos. Los rótulos de interfaz ("Tu consulta", "Agregar otra foto", "Elige una foto", "Nombre", "Correo", "Teléfono", "Ciudad", "Mensaje", "Enviar consulta", "Enviar mensaje", "Escríbeme", "Enviando…", "Recibimos tu consulta", "Seguir mirando fotos", los mensajes de error y los del panel) son parte del código, como en el sistema de diseño §5.4.
13. **Novedades y promociones.**
    - La casilla es opcional y nunca viene marcada; no marcarla no cambia nada del envío. Si se marca, al guardar una consulta que no es `spam` se crea o actualiza el `Suscriptor` de ese correo; si es `spam`, se crea al pasarla a "No es spam".
    - **Conservación:** mientras no pida la baja. Al pedirla (respondiendo BAJA, por correo o por cualquier medio), Rod usa "Dar de baja" y el registro se borra. Para no volver a escribirle por error, queda solo una huella del correo (SHA-256 con sal del sitio) en una lista de bajas, que hace que la casilla no lo vuelva a suscribir en silencio: si marca la casilla en una consulta futura, se toma como consentimiento nuevo y la huella se elimina.
    - **Envío:** en la v1.0 lo hace Rod desde Gmail, con los correos en CCO y el pie `plantillaNovedades`. Cada correo dice quién lo envía, de qué trata y cómo darse de baja (Ley 19.496, art. 28 B, §6).
    - Los suscriptores no entran al contador ni al indicador de consultas.

### 5.3 Interfaces

**Rutas**

| Ruta | Generación | Contenido |
|---|---|---|
| `/consulta` | Dinámica (lee parámetros en el servidor) | Formulario, avisos y estado de éxito. `noindex`. |
| Acción del servidor `enviarConsulta` | Server Action de Next.js | Recibe el formulario (con o sin JavaScript) y devuelve `{ estado: 'exito', resumen }` o `{ estado: 'error', errores, valores }`. |
| `GET /datos/fotos-consultables` (nueva) | Manejador de ruta con caché por etiquetas (`fotos`, `colecciones`) | Lista para el buscador. |
| `/admin/collections/consultas` | Panel Payload | Lista, vistas y detalle (§3.7). |

**Contrato de la URL de entrada** (heredado de `ficha-foto` §5.2.9, ampliado): `/consulta?foto=<slug>&formato=<id>&origen=<ficha|visor>`, todos opcionales. La ficha y el visor agregan `origen` (cambio menor a `ficha-foto`, §7).

**Contrato de `enviarConsulta`** (campos del formulario):

| Campo | Notas |
|---|---|
| `nombre`, `correo`, `telefono`, `ciudad`, `mensaje` | Texto. |
| `items[i][foto]`, `items[i][formato]`, `items[i][papel]` | Slug, id, id. `i` de 0 a 4. |
| `acepta` | `on` si marcada (obligatoria). |
| `promociones` | `on` si marcada (opcional). |
| `origen`, `claveEnvio`, `emitidoEn`, `firma`, `sitio_web` | Ocultos. |

Respuesta de error: `errores` por campo con el código (`requerido`, `formato`, `largo`, `maximo_items`, `limite`, `guardado`) y `valores` para repoblar. Nunca devuelve datos internos.

**Contrato de `GET /datos/fotos-consultables`**

```json
{
  "fotos": [
    {
      "slug": "nuble-al-alba",
      "titulo": "Ñuble al alba",
      "lugar": "Ñuble",
      "busqueda": "nuble al alba nuble",
      "miniatura": { "webp": "…480", "avif": "…480", "ancho": 480, "alto": 320, "colorDominante": "#2b2a28" },
      "formatos": [
        { "id": "f12", "nombre": "45 × 30 cm", "papeles": [ { "id": "p1", "nombre": "Algodón mate", "descripcion": "Textura suave" } ] }
      ]
    }
  ]
}
```

Solo fotos visibles que ofrecen copia, en el orden de `/fotos`; formatos ya orientados como la foto. `busqueda` va en minúsculas y sin tildes. Sin `huella`, `estado`, fechas ni datos técnicos.

**Funciones** (`src/lib/consultas.ts` y `src/lib/consultas.test.ts`): `resolverEntrada(params)`, `validarConsulta(datos)`, `limpiarItems(items)`, `clasificarSpam(datos, ahora)`, `firmarEmision(t)` / `verificarEmision(t, firma)`, `sugerirCorreo(correo)`, `calcularEliminarDespuesDe(consulta)`, `urlRespuestaGmail(consulta, plantilla, correoRod)`, `indicadorMensual(consultas, hoy)`, `exportarDatosCorreo(consultas)`.

### 5.4 Componentes y estructura de código

```
src/
├── app/(sitio)/
│   ├── consulta/
│   │   ├── page.tsx                       # servidor: resolverEntrada, noindex
│   │   └── acciones.ts                    # 'use server': enviarConsulta
│   └── datos/fotos-consultables/route.ts  # nueva
├── componentes/consulta/
│   ├── FormularioConsulta.tsx             # cliente con useActionState; funciona sin JS
│   ├── ItemsConsulta.tsx                  # lista de ítems, quitar
│   ├── ItemConsulta.tsx                   # miniatura, tamaño, papel
│   ├── BuscadorFotos.tsx                  # Dialogo + filtro; carga diferida
│   ├── SugerenciaCorreo.tsx
│   └── ExitoConsulta.tsx                  # estado de éxito, ✓ en SVG
├── colecciones/Suscriptor.ts              # acceso solo Usuario; alta y baja
├── colecciones/Consulta.ts                # campos, hooks (tipo, ultimaActividad, eliminarDespuesDe, respondidaEn), acceso solo Usuario
├── componentes/admin/
│   ├── ContadorConsultas.tsx              # globo del menú
│   ├── TarjetaConsultasNuevas.tsx         # dashboard
│   ├── TarjetaConsultasPorMes.tsx         # dashboard, barras en CSS
│   ├── AccionesConsulta.tsx               # responder, marcar, cerrar, spam
│   ├── OtrasConsultasCorreo.tsx
│   ├── DatosDeCorreo.tsx                  # derechos: descargar, borrar todas
│   └── AccionesSuscriptores.tsx           # copiar correos para CCO, dar de baja
├── tareas/borrarConsultasVencidas.ts
├── globales/AjustesSitio.ts               # campos nuevos del §5.1
└── lib/
    ├── consultas.ts
    ├── limiteEnvios.ts                    # contador en memoria por IP resumida
    └── consultas.test.ts
```

- Se reutilizan `Campo`, `Boton`, `Aviso`, `Dialogo`, `Esqueleto`, `Retorno` y `PlantillaEstado` del sistema de diseño. No se crean componentes base nuevos.
- `Consulta.access`: `create`, `read`, `update` y `delete` solo para `Usuario` autenticado. La creación pública pasa únicamente por `enviarConsulta`, que usa la API local con `overrideAccess` después de validar. La API REST/GraphQL de Payload no permite crear consultas desde fuera.
- `BuscadorFotos` se importa con `dynamic(..., { ssr: false })` al primer clic.

### 5.5 Rendimiento y seguridad

- **Peso:** `/consulta` < 150 KB en la primera carga sin miniaturas; JavaScript propio < 12 KB comprimido sin el buscador. Miniaturas de 480 px con carga diferida en el buscador.
- **Acción del servidor:** responde en < 500 ms con la base de datos sana.
- **Seguridad:**
  - Validación y longitudes en el servidor; `mensaje` y demás textos se guardan y muestran como texto plano (React escapa; el panel usa campos de texto, no texto enriquecido).
  - Protección CSRF de las Server Actions de Next.js (verificación de origen) más la firma de `emitidoEn`.
  - Los datos personales nunca viajan en la URL pública: el éxito se muestra en la misma página con el estado de la acción, sin redirigir con parámetros. El enlace de Gmail del panel sí lleva el correo del interesado, pero solo se abre desde la sesión de Rod hacia su propia cuenta (§6).
  - El panel muestra consultas solo a `Usuario`; el registro del servicio no imprime cuerpos de consultas.
  - `noindex, nofollow` en `/consulta` y `Cache-Control: private, no-store`.

### 5.6 Stack

| Pieza | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Envío | Server Action con `useActionState` | Funciona sin JavaScript (mejora progresiva), conserva lo escrito y no expone un endpoint REST propio. | Ruta `POST /api/consultas` con `fetch`: más código y sin respaldo sin JavaScript. |
| Límite por IP | Contador en memoria del servicio | Un solo servicio, tráfico bajo, sin piezas nuevas ni datos guardados. | Redis o tabla en Postgres: costo o datos personales (IP) guardados sin necesidad. |
| Responder | Enlace de redacción de Gmail + `mailto:` | Rod responde desde su cuenta, sin credenciales en el sitio y sin servicio de correo (marco §6.6). | Envío desde el panel: requiere un servicio de correo, descartado para la v1.0. |
| Borrado programado | Cola de trabajos de Payload 3 (`jobs` con `autoRun`) | Ya viene con Payload. | Cron de Railway: otra pieza que configurar. |
| Indicador | Barras en CSS en un componente del dashboard | 12 barras no justifican una librería de gráficos. | Librería de gráficos: peso sin beneficio. |
| Sugerencia de correo | Lista propia de dominios frecuentes y distancia de edición | Unas decenas de líneas. | Librería tipo `mailcheck`: dependencia por poco. |

El resto se hereda del marco §6.6 y del sistema de diseño §5.7. **Costo incremental:** cero.

## 6. Cumplimiento normativo

Lo transversal está en el marco §7.1. Lo específico (preguntas del método §8):

- **Normativa reverificada el 2026-10-14.** La Ley 21.719 mantiene su entrada en vigencia el 1 de diciembre de 2026. El proyecto que la posterga al 1 de diciembre de 2027 (boletín 18.623-07) seguía en su primer trámite en el Senado a fines de septiembre de 2026 y no se encontró su aprobación (fuentes: [Ecosistema Startup, 19-09-2026](https://ecosistemastartup.com/ley-de-proteccion-de-datos-en-chile-postergan-hasta-2027/), [Garrigues](https://www.garrigues.com/es_ES/noticia/chile-ejecutivo-presenta-proyecto-postergar-entrada-vigor-nueva-ley-proteccion-datos.md), consultadas el 2026-10-14). Se mantiene el criterio del marco: cumplir la Ley 21.719 desde el lanzamiento.
- **Novedades y promociones (pedido de Rod, 0.2):** es una **finalidad distinta** de responder la consulta. Por eso tiene su propia casilla, opcional y sin marcar, que no condiciona la consulta: la Ley 21.719 pide un consentimiento libre (sin consecuencias por negarse) y específico para cada finalidad, y no acepta casillas premarcadas ([Alayia Trust](https://alayiatrust.com/en/blog/bases-licitud-consentimiento-ley-21719)). Del suscriptor solo se guardan nombre y correo, hasta su baja. Además, cada correo promocional debe ofrecer una forma expedita de pedir la suspensión, y los envíos quedan prohibidos desde que la pide, también si lo hace por el sistema "No Molestar" del Sernac (Ley 19.496, art. 28 B, y su reglamento de 2020; [AZ, reglamento "No Molestar"](https://www.az.cl/nuevo-reglamento-que-regula-el-sistema-no-molestar-o-antispam/), consultada el 2026-10-14). Esto saca un punto del marco §7.5 ("consumo fuera de alcance"), que se ajusta solo para las promociones.
- **Datos y minimización:** nombre, correo, teléfono (opcional), ciudad (opcional, para estimar el envío) y mensaje (opcional). **La ciudad es un dato nuevo respecto del marco** y se justifica por la misma finalidad. No se guardan IP, agente de usuario ni cookies.
- **Finalidades:** (1) responder la consulta o el mensaje general, contactando por los medios que el interesado indicó; (2) solo si marca la casilla opcional, enviarle novedades y promociones. Ningún dato de la consulta (teléfono, ciudad, mensaje) se usa para la segunda.
- **Base de licitud:** **consentimiento** (marco §7.1), por decisión de Rod: casilla sin marcar, obligatoria, con el texto `textoConsentimiento` y enlace a la política. Cumple los requisitos de la Ley 21.719 de un consentimiento libre, informado, específico e inequívoco mediante una acción afirmativa, sin casillas premarcadas ([Alayia Trust, bases de licitud de la Ley 21.719](https://alayiatrust.com/en/blog/bases-licitud-consentimiento-ley-21719), consultada el 2026-10-14). Se registra `consentimientoEn` y `versionPolitica` como prueba. *Alternativa evaluada y descartada por Rod:* medidas precontractuales a solicitud del titular, sin casilla.
- **Revocación:** retirar el consentimiento es tan simple como darlo: un correo a `correoContacto`, que Rod ejecuta con "Borrar todas" (§5.2.9).
- **Conservación:** consultas, 12 meses desde `ultimaActividad`; `spam`, 30 días (marco §6.2.8); borrado diario automático. Suscriptores, hasta la baja.
- **Derechos:** procedimiento del §5.2.9.
- **Terceros:** Railway (aloja la base de datos). **Google**: cuando Rod responde con "Responder por correo", el correo del interesado y el borrador pasan a su cuenta de Gmail; es la misma vía por la que respondería de todos modos. La política de privacidad debe decir que las respuestas se envían desde Gmail.
- **Lo que la política de privacidad debe incluir sobre consultas** (encargo a `paginas/paginas.md`): responsable (Rod Díaz) y correo de contacto; datos que se piden y para qué; base de licitud (consentimiento) y cómo retirarlo; plazo de conservación (12 meses, 30 días el spam); que no se guardan IP ni cookies de rastreo; Railway y Gmail como terceros; cómo ejercer acceso, rectificación, supresión y oposición, y el plazo de respuesta que fije la ley vigente (a verificar al redactar esa página); **que el interesado acepta ser contactado por los medios que indicó para responder su consulta**; y una sección de **novedades y promociones**: que es opcional, qué se envía, qué se guarda (nombre y correo), que se conserva hasta la baja y cómo darse de baja en cualquier momento.
- **Cookies:** ninguna (el límite por IP no usa cookies). No requiere banner (marco §7.4).
- **Consumo:** sin precios ni condiciones de venta (marco §7.5). El texto de introducción dice que Rod responde "con los detalles y el valor", sin prometer precio ni plazo de entrega.

## 7. Elementos obsoletos

No hay código previo. Este documento cambia o precisa:

| Documento | Definición | Reemplazo |
|---|---|---|
| Marco 1.4 §6.1, `Consulta` | `fotos` (una o más), `formatoPreferido`, `papelPreferido` | `items` (0 a 5 `ItemConsulta` con `foto`, `tituloFoto`, `slugFoto`, `formato`, `papel`); nuevos `ciudad`, `tipo`, `respondidaEn`, `consentimientoEn`, `versionPolitica`, `origen`, `claveEnvio`. "Una `Consulta` referencia una o más `Foto`" pasa a "cero o más (cero = consulta general)". **Cambio al marco: 1.5 al aprobar** (amplía el modelo, sin cambiar alcance). |
| Marco 1.4 §6.1, `AjustesSitio` | Campos actuales | Se agregan `textoIntroConsulta`, `textoConsultaRecibida`, `textoConsentimiento` y `plantillaRespuesta`. |
| Marco 1.4 §6.3 | `/consulta` "(o modal en la ficha)" | `/consulta` es página propia (D-01 resuelta); se agrega `GET /datos/fotos-consultables` y el parámetro `origen`. |
| Marco 1.4 §12, D-01 | Abierta | Resuelta: página propia. |
| Marco 1.4 §7.1 | Datos: nombre, correo, teléfono y mensaje; "no se usan para marketing ni se agregan a listas" | Se agrega ciudad (opcional) y Gmail como tercero. **Se reemplaza la prohibición de marketing** por: novedades y promociones solo con una casilla opcional separada, en la entidad nueva `Suscriptor`, hasta la baja. |
| Marco 1.4 §6.1 | Entidades | Nueva entidad `Suscriptor` (§5.1). |
| Marco 1.4 §7.5 | Consumo fuera de alcance | Se agrega el art. 28 B de la Ley 19.496 para los correos promocionales. |
| `modelo-contenido-panel` 1.1 §3.4 y §5 | Tarjeta "Consultas nuevas" reservada; consulta de foto borrada a definir | Definidas en §3.7 y §4 de este documento; se agrega la tarjeta "Consultas por mes". Cambio menor (1.2) para registrar los campos nuevos de `AjustesSitio` y las tarjetas. |
| `ficha-foto` 1.0 §5.2.9 | Destino `/consulta?foto=&formato=` | Agrega `&origen=ficha` o `&origen=visor`. Cambio menor (1.1). |
| `paginas/paginas.md` (pendiente) | — | "Contacto" enlaza a `/consulta` sin foto, y la política de privacidad incluye lo del §6. Se registra en el índice como nota. |

## 8. Plan de acción

Para Claude Code, en el paso 5 del plan del marco (§9.2), después de la ficha.

| # | Paso | Depende de | Terminado cuando |
|---|---|---|---|
| 1 | Funciones puras de `lib/consultas.ts` con pruebas. | Modelo de contenido | Pruebas en verde para validación, limpieza de ítems, clasificación de spam, firma de emisión, sugerencia de correo, `eliminarDespuesDe`, URL de Gmail, indicador mensual y exportación. |
| 2 | Colección `Consulta` con `ItemConsulta`, *hooks* y acceso; campos nuevos de `AjustesSitio` con sus valores por defecto. | 1 | Una consulta creada desde el panel calcula `tipo`, `ultimaActividad`, `eliminarDespuesDe` y `respondidaEn`; la API REST pública no puede crear ni leer consultas. |
| 3 | `GET /datos/fotos-consultables`. | 2, ficha paso 1 | Responde según el §5.3, solo con fotos que ofrecen copia y formatos orientados. |
| 4 | Página `/consulta` y acción `enviarConsulta`, sin JavaScript primero. | 2 | Criterios 1 a 6 con JavaScript desactivado. |
| 5 | Mejoras con JavaScript: validación al salir del campo, sugerencia de correo, ítems y `BuscadorFotos`, estado de éxito con su animación. | 3, 4 | Criterios 7 a 10. |
| 6 | Antispam: campo trampa, firma de emisión, `limiteEnvios`, idempotencia. | 4 | Criterio 11. |
| 7 | Enlace de la ficha y del visor con `origen`. | 4, ficha | Criterio 1 con ambos orígenes. |
| 8 | Panel: vistas, detalle, acciones, otras consultas del correo, contador del menú y tarjetas del dashboard. | 2 | Criterios 12 a 14. |
| 9 | Derechos: "Datos de este correo", descargar y borrar todas. | 8 | Criterio 16. |
| 10 | Tarea de borrado programado. | 2 | Criterio 17. |
| 11 | `Suscriptor`, casilla de novedades, lista del panel, "Copiar correos" y "Dar de baja". | 2, 4 | Criterio 19. |
| 12 | Revisión en dispositivos y medición. | 1 a 11 | Criterios 15 y 18. |

## 9. Criterios de aceptación y pruebas

1. Desde la ficha, "Pedir una copia" abre `/consulta` con la foto como primer ítem y, si se eligió, el tamaño preseleccionado; el papel se informa si es uno y se ofrece si son varios.
2. `/consulta` sin parámetros muestra la consulta general ("Escríbeme", "Enviar mensaje"); con una foto despublicada, eliminada, de vitrina o inexistente muestra el aviso del §4 sin error; un `formato` ajeno se ignora.
3. Sin JavaScript se puede enviar una consulta con foto y una general; los errores aparecen junto a cada campo y lo escrito se conserva.
4. La consulta se guarda en la base antes de mostrar "Recibimos tu consulta". Con la base caída, aparece el aviso de error y nada se pierde del formulario.
5. Doble clic o reenvío con la misma `claveEnvio` crea **una** consulta. Recargar tras el éxito no reenvía.
6. El servidor rechaza más de 5 ítems y fotos repetidas, y limpia formatos o papeles que ya no se ofrecen.
7. La validación ocurre al salir del campo y al enviar, nunca al escribir; al enviar con errores, el foco va al primer campo con error y el resumen enlaza a cada uno.
8. `gmial.com` sugiere `gmail.com` y la sugerencia corrige el campo con un toque.
9. "Agregar otra foto" abre el buscador, filtra sin tildes ("nuble" → "Ñuble"), agrega con toque o Enter, marca con ✓ las ya agregadas y se oculta con 5 ítems. Quitar un ítem mueve el foco y lo anuncia.
10. El estado de éxito muestra el correo escrito, lo enviado y "Seguir mirando fotos"; su animación dura ≤ 300 ms y no se mueve con `prefers-reduced-motion`.
11. Campo trampa con texto o envío en menos de 3 s: el visitante ve éxito y la consulta queda en *Spam*. El sexto envío en una hora desde la misma IP se rechaza con el mensaje del §4. Ninguna `Consulta` guarda IP.
12. El panel muestra el globo de nuevas en el menú y la tarjeta "Consultas nuevas" con la más antigua; abrir una consulta no cambia su estado.
13. "Responder por correo" abre Gmail con destinatario, asunto y cuerpo armados desde `plantillaRespuesta`; "Marcar respondida" fija `respondidaEn` una sola vez; los cambios de estado siguen el §5.2.7.
14. La tarjeta "Consultas por mes" muestra 12 meses con recibidas y respondidas (solo de copia, sin spam) en America/Santiago y las generales aparte; coincide con un conteo manual de prueba.
15. **Navegador de Instagram (iOS y Android reales):** los campos no hacen zoom, el teclado correcto aparece en correo y teléfono, el botón se alcanza con el teclado abierto y el envío funciona.
16. "Datos de este correo" descarga un `.txt` con todas las consultas de ese correo y "Borrar todas" las elimina tras confirmar escribiendo el correo.
17. La tarea diaria borra consultas con `eliminarDespuesDe` vencido (12 meses; spam a los 30 días) y no registra datos personales.
18. **Rendimiento y accesibilidad (Lighthouse móvil):** `/consulta` < 150 KB sin miniaturas, JavaScript propio < 12 KB sin el buscador, accesibilidad ≥ 95; navegación completa con teclado y lector de pantalla (etiquetas, errores, diálogo, éxito).
19. La casilla de novedades viene sin marcar y no impide enviar. Marcada, crea un solo `Suscriptor` por correo (sin teléfono, ciudad ni mensaje) que sobrevive al borrado de la consulta; "Dar de baja" lo borra y la consulta queda; "Borrar todas" borra ambos. "Copiar correos" entrega la lista con el recordatorio de CCO.

## 10. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| CC-01 | Rod no ve consultas a tiempo (sin aviso externo). | Media | Medio | Contador en menú y dashboard con la más antigua sin responder; texto de éxito editable para ajustar la expectativa. Aviso v1.x (marco R-01). |
| CC-02 | Una consulta real queda en *Spam* (autocompletado o persona muy rápida). | Baja | Medio | No se descarta: queda 30 días en *Spam*; Rod revisa la vista y la rescata. |
| CC-03 | El interesado escribe mal su correo y nunca recibe respuesta. | Media | Medio | Sugerencia de dominio, teléfono opcional y el correo repetido en el estado de éxito. |
| CC-04 | La casilla obligatoria hace abandonar el formulario. | Baja | Bajo | Texto breve y cálido; se revisa con el uso real. Alternativa documentada (§6). |
| CC-05 | El contador en memoria se reinicia con cada despliegue y deja pasar una ráfaga. | Baja | Bajo | Las demás defensas siguen activas; Turnstile en v1.x si hace falta. |
| CC-06 | Consultas generales llenan el panel con temas ajenos a copias. | Media | Bajo | Columna "General", fuera del indicador; si molesta, se separa en una vista propia (cambio menor). |
| CC-07 | El enlace de Gmail cambia de formato. | Baja | Bajo | Respaldo `mailto:` y "Copiar" del correo. |
| CC-09 | Se envían promociones a quien pidió la baja, o se exponen todos los correos en "Para". | Media | Medio | La baja borra el registro y deja una huella; "Copiar correos" solo para CCO; pie con la forma de baja. Servicio de boletines en v1.x si la lista crece (P-03). |
| CC-08 | La normativa cambia de fecha o de requisitos. | Media | Bajo | Se diseñó para la Ley 21.719; se reverifica al redactar la política de privacidad. |

## 11. Decisiones abiertas y tareas del dueño

**Decisiones** (resueltas al aprobar con su valor por defecto)

- **D-C1 (resuelta).** Máximo de 5 fotos por consulta.
- **D-C2 (resuelta).** La descarga de datos de un correo no incluye las notas internas, salvo que contengan datos que el interesado entregó; se revisa al redactar la política de privacidad.
- **D-C3 (resuelta).** Se usan los textos por defecto del §5.1; Rod los edita en el panel cuando quiera.

**Propuestas** (fuera de alcance; no se construyen sin tu aprobación)

- **P-01 (v1.x).** Aviso de consulta nueva por bot de Telegram, sin credenciales tuyas de correo. Costo bajo, gratis.
- **P-03 (v1.x).** Enviar novedades con un servicio de boletines gratis, con enlace de baja automático, cuando la lista pase de unas decenas. Costo: cero en plan gratuito; una cuenta más.
- **P-02 (v1.x).** Respuestas rápidas: dos o tres plantillas (por ejemplo "Cotización", "Sin stock de papel") para elegir al responder. Costo bajo.

**Cambios a otros documentos al aprobar**

1. Marco general → 1.5: `Consulta` con `items` y campos nuevos (§5.1), consulta general (cero fotos), entidad nueva `Suscriptor` y finalidad de novedades con casilla opcional (§7.1), art. 28 B de la Ley 19.496 en §7.5, campos nuevos de `AjustesSitio`, `/consulta` como página y `GET /datos/fotos-consultables` (§6.3), D-01 resuelta, ciudad y Gmail en §7.1.
2. Modelo de contenido y panel → 1.2: campos nuevos de `AjustesSitio` y tarjetas "Consultas nuevas" y "Consultas por mes" en el dashboard.
3. Ficha de foto → 1.1: el enlace a la consulta agrega `origen=ficha` u `origen=visor`.
4. Índice: nota en `paginas` (Contacto enlaza a `/consulta`; la política incluye lo del §6).

**Tareas del dueño**

No nacen tareas nuevas: los textos tienen valores por defecto. Para lanzar sigue pendiente T-007 (Sobre mí); la política de privacidad se redacta con `paginas`.

## 12. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.1 | 2026-10-14 | Cambio menor al aprobar `paginas/paginas.md` 1.0: `versionPolitica` se toma de `Pagina.contenidoActualizadoEn`. |
| 1.0 | 2026-10-14 | Aprobado por Rod. D-C1 a D-C3 con sus valores por defecto. El marco general pasa a 1.5, el modelo de contenido a 1.2 y la ficha a 1.1 con los cambios del §11. |
| 0.2 | 2026-10-14 | Pedido de Rod: la casilla obligatoria dice que acepta ser contactado por los medios que indicó; se agrega una segunda casilla **opcional y sin marcar** para novedades y promociones, con la entidad nueva `Suscriptor` (hasta la baja), lista y "Copiar correos" en el panel, baja y lo que debe decir la política. Se verifica el art. 28 B de la Ley 19.496. |
| 0.1 | 2026-10-14 | Borrador inicial. Decisiones de Rod: formulario en página propia (D-01); hasta 5 fotos con "Agregar otra foto" y buscador; nombre y correo obligatorios, teléfono, ciudad y mensaje opcionales; texto de recepción editable en el panel; responder con borrador en Gmail y marcar a mano; consulta general sin foto; consentimiento con casilla obligatoria. Ley 21.719 reverificada el 2026-10-14. Revisión con las guías de diseño de interfaces (validación al salir del campo, botón nunca deshabilitado, celebración breve en el éxito, casos de datos extremos). |

# Modelo de contenido y panel de administración

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/contenido/modelo-contenido-panel.md` |
| Tipo | Componente |
| Versión | 1.2 |
| Estado | Aprobado |
| Fecha | 2026-10-14 |
| Padre | `marco-general/marco-general-proyecto.md` |
| Dependencias | `marco-general/marco-general-proyecto.md` (1.3; la 1.2 incorporó los cambios del §7); considera `identidad/sistema-de-diseno.md` (1.0) para `logo`, `filete` y perfil ICC |
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

Este componente define **qué contenido existe** en el sitio y **cómo lo administra Rod** (Administrador, marco §3) desde el panel `/admin`, sin tocar código. Es el primer eslabón del flujo central (marco §4.1): todo lo que la galería, la ficha y la consulta muestran sale de aquí.

**Problema que resuelve.** Rod vuelve de una salida (por ejemplo, un fin de semana en Villarrica) con veinte fotos y necesita publicarlas ordenadas, con sus datos y sus tamaños de copia, sin trabajo repetitivo y sin riesgo de que se publique algo a medias, un original o un metadato privado.

**Resultado esperado.**

- Rod arrastra un lote de JPG, aplica en un gesto lo común (colección, lugar, características) y luego completa solo lo propio de cada foto.
- El sistema propone (fecha, datos técnicos, proporción, tamaños) y Rod siempre dispone: **todo dato autocompletado es editable, borrable y rellenable a mano**.
- Nada sale al público sin que Rod lo publique, y nada se publica sin sus datos mínimos.

Este documento implementa las entidades del marco §6.1 y **las ajusta** según las decisiones de Rod en esta sesión. Los cambios al marco se listan en §7 y se incorporan al marco en su versión 1.2.

## 2. Alcance

**Incluye (v1.0)**

- Modelo de datos: `Foto`, `Coleccion` (con jerarquía de dos niveles), `Caracteristica`, `FormatoImpresion`, `TipoPapel`, `Pagina`, `Medio`, `Usuario`, `IntentoAcceso` y el global `AjustesSitio`.
- Procesamiento de imágenes al subir: validación (solo JPG), orientación, lectura de EXIF, versiones web, perfil ICC sRGB, color dominante, huella y proporción.
- Panel: carga masiva, edición en bloque, borrador y publicación con validación, orden de fotos y de sub-colecciones, catálogo de tamaños y papeles, páginas, ajustes del sitio, acceso con Google y registro de intentos de acceso.
- Portada del panel (dashboard) con los pendientes de Rod.

**No incluye**

- Cómo se ven la galería, la ficha y las páginas públicas: lo definen `portafolio/galeria-colecciones.md`, `portafolio/ficha-foto.md` y `paginas/paginas.md`.
- El modelo y la gestión de `Consulta` (formulario, estados, contador, borrado programado): lo define `consultas/consulta-copia.md`. Aquí solo se reserva su lugar en el menú y en el dashboard.
- Respaldos, variables de entorno en Railway y script de recuperación de acceso: `plataforma/despliegue.md`.
- SEO de cada página: `plataforma/seo.md` (aquí solo se dejan los campos).

**Queda para versiones posteriores**

- v1.x: autocompletar el campo `lugar` con lugares ya usados; acción "ofrecer este formato en todas las fotos compatibles"; páginas con bloques (texto, imagen, cita) en lugar de texto enriquecido simple.
- v2: `FormatoImpresion × TipoPapel` por `Foto` como variantes de producto (el modelo ya lo permite, no se construye nada).

## 3. Flujo de usuario y UX/UI cuestionado

### 3.1 Principio del panel

**El sistema propone, Rod dispone.** Cada valor que se completa solo (fecha, distancia focal, apertura, velocidad, proporción, formatos sugeridos, color dominante) queda visible, editable y borrable. Un campo vacío simplemente no se muestra en el sitio. El panel nunca publica nada por su cuenta.

El panel usa el tema oscuro estándar de Payload y su interfaz en español (`identidad/sistema-de-diseno.md`). Los textos de ayuda son breves y cálidos.

### 3.2 Flujo principal: subir una salida

1. **Subir el lote.** En *Fotos → Subir varias*, Rod arrastra los JPG (carga masiva de Payload). Cada archivo se procesa (§5.2.2) y crea una `Foto` en estado `borrador`. Lo que el EXIF trae se precarga: `fecha` (fecha de captura), `distanciaFocal`, `apertura` y `velocidad`. La `proporcion` se calcula y se asocian como sugerencia los `FormatoImpresion` activos compatibles.
2. **Aplicar lo común.** El panel lleva a la lista filtrada "Recién subidas". Rod selecciona todas y usa *Editar varias* para fijar de una vez `coleccion`, `lugar` y `caracteristicas`.
3. **Completar cada foto.** Rod abre cada foto y escribe `titulo` y, si quiere, `historia` y `textoAlternativo`. Ajusta lo que venga mal: fecha, datos técnicos, formatos, `filete`.
4. **Publicar.** Cambia `estado` a `publicada`, foto por foto o en bloque con *Editar varias*. Si a una foto le falta un dato mínimo (§5.2.4), el panel no la publica y dice qué falta, por ejemplo: "Para publicar falta: título, lugar".
5. **Ordenar.** En la colección, Rod arrastra para ordenar sus fotos y elige la portada (si no la elige, se usa la primera).

### 3.3 Otros flujos

- **Armar una colección de a poco.** Rod crea "Villarrica" en `borrador` y le va sumando fotos durante semanas. Nada de esa colección se ve en público hasta que la pasa a `publicada`, aunque sus fotos estén marcadas `publicada` (§5.2.5).
- **Colección madre y sub-colecciones.** Rod crea "Salidas outdoor" (madre) y dentro "Nahuelbuta" (hija, con `padre` = "Salidas outdoor"). Si "Nahuelbuta" tiene una sola foto y no merece página propia, Rod desmarca `visibleSola`: la foto aparece dentro de "Salidas outdoor" y en `/fotos`, pero "Nahuelbuta" no se lista como colección.
- **Foto solo de vitrina.** Rod quita todos los formatos de una foto, o la foto tiene una proporción sin catálogo (una panorámica larga). La foto se publica igual y la ficha no ofrece copia.
- **Catálogo de copias.** En *Catálogo → Tipos de papel*, Rod crea sus papeles una vez ("Algodón mate", "Satinado"). En *Catálogo → Formatos de impresión*, crea cada tamaño (por ejemplo 30 × 45 cm), y el panel muestra su proporción calculada (3:2). Luego marca los papeles disponibles para ese tamaño.
- **Páginas y ajustes.** En *Sitio*, Rod edita "Sobre mí" (texto y foto de perfil), "Contacto", la política de privacidad, las condiciones y los `AjustesSitio` (correo, Instagram, logo, foto de portada, textos).
- **Entrar al panel.** Rod abre `/admin` y presiona "Entrar con Google". Solo `rodrigodiaztapia@gmail.com` entra. Cualquier otro correo ve "Esta cuenta no tiene acceso", y el intento queda en *Seguridad → Intentos de acceso*.

### 3.4 Portada del panel (dashboard)

Reemplaza la portada por defecto de Payload con tarjetas simples, en este orden:

1. **Consultas nuevas** (número, la más antigua sin responder y enlace) y **Consultas por mes** (12 meses, recibidas y respondidas, y total de suscriptores). Las define `consultas/consulta-copia.md` §3.7.
2. **Fotos en borrador** (número), con un enlace a la lista "Por completar", que muestra las que no cumplen los mínimos y qué les falta.
3. **Accesos rechazados** de los últimos 30 días (número y el último correo). Si no hay, la tarjeta no se muestra.
4. Accesos directos: *Subir fotos*, *Colecciones*, *Ajustes del sitio*.

### 3.5 Estados de la interfaz

| Situación | Comportamiento |
|---|---|
| Lista de fotos vacía | "Aún no hay fotos. Sube tu primera salida" con el botón *Subir varias*. |
| Procesando subida | Progreso por archivo (lo da Payload). Un archivo que falla no detiene al resto, y su error se muestra junto a su nombre. |
| Archivo rechazado | "Solo se aceptan fotos JPG. Exporta la foto como JPG desde Lightroom." o "La foto pesa más de 60 MB." |
| Posible duplicado | Aviso en la foto nueva: "Esta foto parece igual a «<título o archivo>»" con enlace a la existente. Rod decide si borra una. |
| Publicación rechazada | Mensaje con la lista exacta de lo que falta. La foto queda en su estado anterior. |
| Éxito al guardar | El aviso estándar de Payload, en español. |

### 3.6 Escritorio y móvil

El panel se usa sobre todo en escritorio. La carga masiva, la edición en bloque y el orden por arrastre se prueban en escritorio. En móvil, Rod debe poder entrar, editar textos, publicar o despublicar y revisar el dashboard; no se exige subir lotes desde el teléfono.

### 3.7 Objeciones planteadas al flujo y su resolución

| # | Objeción | Resolución (con Rod) |
|---|---|---|
| O-1 | ¿Colección y característica son lo mismo? | No. La **colección** agrupa por lugar o salida y se va llenando con el tiempo. La **característica** es una etiqueta transversal y combinable ("Street", "Blanco y negro", "Atardecer"). Lo temático va en características. |
| O-2 | ¿Una foto en varias colecciones? | **No: una foto pertenece a una sola colección.** Es más claro para el visitante (las colecciones son como álbumes) y evita conflictos de portada y enlaces. Lo temático se cubre con características. Esto cambia el marco (§7). |
| O-3 | ¿Fotos sueltas sin colección? | No. La colección es **obligatoria para publicar**. Una foto recién subida puede estar sin colección mientras está en borrador. |
| O-4 | Colecciones que nacen con una o dos fotos. | La colección tiene `borrador` y `publicada`, y Rod decide cuándo se ve. |
| O-5 | ¿Jerarquía de colecciones? | Sí, **dos niveles como máximo** (madre e hija). La madre puede tener fotos propias y sub-colecciones, y su vista agrega todo. Cada hija decide si es visible sola (`visibleSola`) o solo alimenta a la madre. |
| O-6 | ¿Lugar heredado de la colección? | No se amarra: el `lugar` es un campo propio, de texto libre, que puede no coincidir con la colección. El ahorro de tipeo viene de la edición en bloque. |
| O-7 | Fecha de la foto. | Se usa la fecha de captura del EXIF. Si no viene, Rod la escribe; sin fecha no se publica. |
| O-8 | ¿Qué datos técnicos se muestran? | Solo distancia focal (mm), apertura y velocidad. **Nunca** cámara, lente ni GPS, que ni siquiera se guardan. El EXIF no distingue zoom de fijo: se muestran los milímetros. |
| O-9 | ¿Tamaños por foto o por catálogo? | **Catálogo por proporción.** Al subir, la foto recibe como sugerencia los formatos compatibles con su proporción, y Rod los deja, quita o agrega. |
| O-10 | ¿Una foto sin tamaños? | Válida: queda **solo de vitrina**, publicada sin ofrecer copia. Cambia la regla del marco "Tamaños a pedido" (§7). |
| O-11 | ¿El papel va por foto o es global? | **El papel va amarrado al formato.** Al configurar un tamaño, Rod marca qué papeles tiene para ese tamaño. Si hay dos o más, el interesado elige. Si hay uno, solo se le informa. El tamaño siempre se elige. Los papeles son una lista reutilizable. |
| O-12 | ¿RAW, TIFF, HEIC? | **Solo JPG.** Rod siempre exporta JPG en sRGB desde Lightroom. Lo demás se rechaza con un mensaje claro. Esto cambia el marco (§7). |
| O-13 | ¿Uno o varios administradores? | Uno solo y cerrado. Además se registran los intentos de acceso rechazados (correo y fecha). |
| O-14 | ¿Páginas libres o simples? | Simples en la v1.0: texto enriquecido más una imagen opcional. El diseño atractivo de "Sobre mí" lo define `paginas/paginas.md`. |

## 4. Casos borde

| Caso | Resolución |
|---|---|
| Foto vertical del R5 Mark II con orientación EXIF (rotada) | Se aplica la orientación (`sharp().rotate()`) **antes** de quitar metadatos y calcular la proporción. Una vertical nunca queda acostada. |
| Original de 45 MP o más, de hasta 60 MB | Se acepta. El archivo subido se procesa en memoria y se descarta. En el volumen no queda ningún archivo de más de 2048 px en el lado largo. |
| Archivo que no es JPG (RAW, TIFF, HEIC, PNG, WebP) o JPG renombrado | Se valida el tipo real del archivo (sus primeros bytes), no la extensión. Se rechaza con un mensaje claro. |
| JPG en Adobe RGB o Display P3 (por error) | Se convierte a sRGB y se incrusta el perfil ICC sRGB (sistema de diseño §5.5). |
| JPG sin EXIF o con EXIF incompleto | Los campos quedan vacíos y Rod los completa. Sin `fecha`, la foto no se publica. |
| EXIF con GPS, número de serie, cámara o lente | No se leen ni se guardan en la base de datos. Las versiones generadas no tienen EXIF, IPTC ni XMP. |
| Fecha EXIF sin zona horaria | Se guarda como día calendario (sin hora) para que no cambie de día al convertir a UTC (§5.2.3). |
| Valores EXIF raros (velocidad 0,0125 s, apertura 7,1) | Se normalizan para mostrarse: velocidad como fracción "1/80 s" (o "2 s" si es de 1 s o más), apertura como "f/7,1" y distancia focal en "mm" entera. |
| Proporción casi estándar (4000 × 2667) | Se normaliza a la proporción estándar más cercana con ±2 % de tolerancia (marco §6.2.4): 3:2. |
| Proporción fuera de toda lista (panorámica 3,4:1) | Se guarda como proporción personalizada con su valor decimal ("3,4:1"). Solo es compatible con formatos dentro de ±2 % de ese valor. Si no hay ninguno, la foto queda de vitrina. |
| Rod recortó distinto y quiere corregir la proporción | Puede sobrescribirla. El panel advierte: "La proporción que elegiste no coincide con la foto (3:2). Los tamaños podrían recortarla". |
| Foto vertical y formatos | Los formatos se definen por lado corto × lado largo y valen para ambas orientaciones. En una foto vertical 2:3, "30 × 45 cm" se muestra como 30 × 45 (ancho × alto). En una horizontal, como 45 × 30. |
| Rod intenta asociar un formato incompatible | El panel lo impide: "Ese tamaño es 4:5 y la foto es 3:2". |
| Formato desactivado o sin papeles activos | No se ofrece en el sitio y la asociación se conserva. Si una foto queda sin formatos ofrecibles, se comporta como vitrina. |
| Editar las medidas de un formato que ya tiene fotos | Se bloquea: "Este tamaño está en N fotos. Crea uno nuevo y desactiva este". Así una foto nunca queda con un tamaño incompatible. |
| Nuevo formato en el catálogo con fotos antiguas compatibles | No se agrega automáticamente a las fotos existentes. Rod lo agrega con *Editar varias* (en la v1.x, una acción dedicada). |
| Borrar un papel usado por formatos, o un formato usado por fotos | Se bloquea con el número de usos. Se ofrece desactivarlo (`activo = false`). |
| Foto sin título al subir en lote | Se permite en borrador. En las listas del panel se identifica por miniatura y nombre de archivo. |
| Título muy largo o con caracteres especiales | Máximo 120 caracteres. El `slug` se genera sin tildes ni símbolos ("Ñuble al alba" → `nuble-al-alba`) y, si se repite, se le agrega un sufijo `-2`. |
| Rod cambia el título de una foto ya publicada | El `slug` **no cambia solo** después de la primera publicación. Si Rod lo edita a mano, el anterior se guarda en `slugsAnteriores` y redirige (los enlaces compartidos en Instagram siguen funcionando). |
| Foto duplicada (misma `huella`) | Se crea igual, con el aviso de §3.5 y un enlace a la existente. Rod decide cuál borra. |
| Foto `publicada` dentro de una colección en `borrador` | No se ve en público (§5.2.5). En el panel la foto muestra la etiqueta "Oculta: su colección está en borrador". |
| Hija `publicada` con madre en `borrador` | La hija y sus fotos no se ven. |
| Hija con `visibleSola = false` y alguien abre su URL | `/colecciones/<hija>` redirige (308) a la madre. |
| Colección madre sin fotos propias, solo con hijas | Válido. Su vista muestra las fotos de sus hijas visibles. |
| Colección sin fotos visibles | No se muestra en público (marco §6.2.5). |
| Asignar como padre una colección que ya es hija, o convertir en hija una madre con hijas | Se bloquea: "Las colecciones admiten solo dos niveles". Tampoco puede ser su propio padre. |
| Borrar una colección con fotos o con hijas | Se bloquea: "Tiene N fotos y M sub-colecciones. Muévelas a otra colección antes de borrarla". Como la colección es obligatoria, no se ofrece "desasociar" (precisa el marco §5). |
| Renombrar colección o característica | Se conserva el `slug` anterior en `slugsAnteriores` como redirección (marco §5). |
| Foto que se despublica con consultas o enlaces compartidos | Si alguna vez estuvo publicada (`publicadaEn` existe), su URL muestra la página amable del marco §5. Si nunca se publicó, devuelve 404. Las consultas se conservan. |
| Borrar una foto | Se permite. Se borran sus versiones del volumen. Si tiene consultas, el panel avisa ("Tiene N consultas; se conservarán con el título guardado") y `consulta-copia` define cómo se conserva la referencia. Se recomienda despublicar en vez de borrar. |
| Foto de portada del sitio o de una colección despublicada | Se usa la siguiente según la regla de respaldo: la primera foto `destacada` visible y, si no hay, la más reciente visible. Para una colección, su primera foto visible. |
| Publicar en bloque con fotos incompletas | Se publican las que cumplen. Las demás quedan en borrador, y el panel muestra cuáles y qué les falta. |
| Subida que falla a mitad (red, volumen lleno) | La `Foto` no se crea si no se generaron todas sus versiones; no quedan registros sin imagen. Los archivos parciales se limpian. |
| Lote muy grande (40 fotos de 30 MB) | Se procesan en serie, sin ir en paralelo, para no exceder la memoria del servicio. Payload sube un archivo por petición. |
| Intento de acceso con otro correo de Google | Se rechaza, se registra `correo` y `fecha`, y se muestra "Esta cuenta no tiene acceso". No se crea `Usuario`. |
| Muchos intentos de acceso (bot) | Se registra como máximo un intento por correo por hora, para no llenar la tabla. Los registros se borran a los 90 días. |
| Logo inválido (formato o tamaño) | Se rechaza según el sistema de diseño (SVG o PNG de hasta 200 KB). |

## 5. Especificación técnica

### 5.1 Modelo de datos

Nombres oficiales del marco §6.1, sin tildes en el código. Las etiquetas del panel van en español con tilde ("Colección", "Características (etiquetas)"). **Marcados con ◆** los campos que cambian respecto del marco 1.1 (se incorporan en el marco 1.2). **Marcados con ◇** los agregados en la versión 1.1 de este documento, desde `portafolio/galeria-colecciones.md` (marco 1.3).

#### `Foto` (colección *upload*)

| Campo | Tipo | Reglas |
|---|---|---|
| `titulo` | texto | Máx. 120. Obligatorio para publicar. |
| `slug` | texto, único, indexado | Se genera de `titulo` mientras la foto nunca se haya publicado. Después, solo cambia si Rod lo edita. |
| `slugsAnteriores` ◆ | lista de texto | Para redirecciones. |
| `lugar` | texto | Texto libre. Obligatorio para publicar. |
| `fecha` | fecha (solo día) | Precargada de `DateTimeOriginal` del EXIF. Obligatoria para publicar. |
| `historia` | texto enriquecido (Lexical, sin imágenes) | Opcional. |
| `textoAlternativo` | texto | Opcional. Si falta, se usa `titulo`. |
| `datosTecnicos` ◆ | grupo: `distanciaFocal` (número, mm), `apertura` (número, f), `velocidad` (texto normalizado, por ejemplo "1/250 s") | Precargados del EXIF, editables y borrables. Un campo vacío no se muestra. **No existen** campos de cámara, lente ni ISO. |
| `coleccion` ◆ | relación con `Coleccion`, **una**, indexada | Obligatoria para publicar. |
| `orden` ◆ | número | Posición dentro de su colección. Se asigna al final al llegar y se cambia arrastrando. |
| `caracteristicas` | relación con `Caracteristica`, varias | Opcional. |
| `proporcion` | grupo: `etiqueta` (texto: `1:1`, `5:4`, `4:3`, `3:2`, `16:9`, `2:1`, `3:1` o personalizada, por ejemplo `3,4:1`), `valor` (decimal, lado largo / lado corto, ≥ 1), `orientacion` ◆ (`horizontal`, `vertical`, `cuadrada`), `manual` ◆ (booleano) | Calculada al subir. Si Rod la sobrescribe, `manual = true`. |
| `formatos` | relación con `FormatoImpresion`, varias | Solo los compatibles (§5.2.6). Se precarga con los formatos activos compatibles al subir. Si está vacía, la foto es de vitrina. |
| ~~`papeles`~~ ◆ | — | **Se elimina.** Los papeles salen del formato (`FormatoImpresion.papeles`). |
| `estado` | `borrador`, `publicada`, `despublicada` | Nace en `borrador`. |
| `publicadaEn` ◆ | fecha y hora (UTC), solo lectura | Primera vez que pasó a `publicada`. Distingue "despublicada" (página amable) de "nunca publicada" (404). |
| `destacada` | booleano | Para la portada. Ayuda: "Aparece en la portada". |
| `fijada` ◇ | booleano, `false` | Ayuda: "Aparece primero en Todas las fotos". |
| `ordenFijada` ◇ | número, opcional | Orden entre las fijadas; se asigna al final al fijar, se cambia arrastrando en la lista filtrada "Fijadas" y se vacía al desfijar. |
| `focalX`, `focalY` ◇ | punto focal nativo de Payload (`focalPoint: true`, `crop: false`) | 0 a 100, por defecto 50 / 50. Solo para el recorte 4:5 de las tarjetas de colección (`portafolio/galeria-colecciones.md` §5.2.4). No genera archivos. |
| `filete` | booleano, `false` | Ayuda: "Úsalo en fotos muy oscuras que se pierden en el fondo". |
| `ancho`, `alto` | número (px), solo lectura | De la versión mayor generada. |
| `colorDominante` | texto (hex), solo lectura | Para el marcador de carga. |
| `huella` | texto (SHA-256 del archivo subido), indexado, solo lectura | Detección de duplicados. |
| `posibleDuplicado` ◆ | relación con `Foto`, solo lectura | Se llena si la `huella` ya existía. |
| `faltantes` ◆ | campo virtual (no se guarda) | Lista de datos mínimos faltantes, para la columna "Por completar". |
| versiones (`sizes`) | gestionadas por Payload | `480`, `1200` y `2048` px de lado largo, en AVIF y WebP, más `1200` en JPEG (marco §6.2.2). El archivo principal también queda reducido a 2048 px. |

Columnas de la lista: miniatura, título (o nombre de archivo), colección, estado, fecha y "Por completar". ◇ Lista filtrada "Fijadas", ordenable por arrastre sobre `ordenFijada`.

#### `Coleccion`

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | texto | Obligatorio, máx. 80. |
| `slug`, `slugsAnteriores` | texto único; lista | Como en el marco. |
| `descripcion` | texto, máx. 300 | Opcional. |
| `padre` ◆ | relación con `Coleccion`, una, opcional | Solo puede apuntar a una colección sin `padre`. Una colección con hijas no puede tener `padre`. |
| `visibleSola` ◆ | booleano, `true` | Solo aplica a hijas. Si es `false`, la hija no se lista y sus fotos se ven solo dentro de la madre y en `/fotos`. |
| `orden` ◆ | número | Posición entre sus hermanas (las hijas de una madre, o las madres de la portada). Se cambia arrastrando. |
| `portada` | relación con `Foto` | Opcional. Debe pertenecer a la colección o a una hija. Si falta, se usa la primera foto visible. Ayuda ◇: "En las tarjetas, la portada se ve recortada en formato vertical 4:5. Marca el punto focal en la foto para elegir el centro." |
| `estado` ◆ | `borrador`, `publicada` | Reemplaza `publicada`/`oculta`. Nace en `borrador`. |
| `fotos` ◆ | campo *join* (inverso de `Foto.coleccion`), solo lectura | Para ver y ordenar las fotos desde la colección. |
| `hijas` ◆ | campo *join* (inverso de `padre`), solo lectura | Para ver y ordenar las sub-colecciones. |

El campo `orden` del marco (lista ordenada de `Foto`) se reemplaza por `Foto.orden`, porque cada foto vive en una sola colección.

#### `Caracteristica`

Sin cambios respecto del marco: `nombre` (único, máx. 40), `slug`, `slugsAnteriores`. Etiqueta en el panel: "Características (etiquetas)".

#### `FormatoImpresion`

| Campo | Tipo | Reglas |
|---|---|---|
| `ladoCortoCm`, `ladoLargoCm` ◆ | número (cm, hasta un decimal) | Reemplazan `anchoCm`/`altoCm`: el formato vale para ambas orientaciones. `ladoCortoCm ≤ ladoLargoCm`. |
| `nombre` | texto calculado | "30 × 45 cm". |
| `proporcion` | grupo `etiqueta` + `valor`, calculado | Con la misma normalización que `Foto`. |
| `papeles` ◆ | relación con `TipoPapel`, varias, **mínimo una** | Papeles disponibles para este tamaño. |
| `activo` | booleano, `true` | — |
| `orden` | número | Orden en que se listan los tamaños (del menor al mayor por defecto). |

Las medidas no se pueden editar si el formato tiene fotos asociadas (§4).

#### `TipoPapel`

Sin cambios respecto del marco: `nombre` (único), `descripcion` (máx. 120), `activo`.

#### `Pagina`

| Campo | Tipo | Reglas |
|---|---|---|
| `titulo`, `slug` | texto | `slug` reservado para `sobre-mi`, `contacto`, `privacidad` y `condiciones`. Se crean en la semilla. |
| `contenido` ◆ | texto enriquecido (Lexical: párrafos, títulos h2/h3, listas, enlaces, negrita, cursiva) | En la v1.0 no hay bloques. |
| `imagen` | relación con `Medio`, opcional | Por ejemplo, la foto de perfil en "Sobre mí". |
| `estado` | `borrador`, `publicada` | — |
| `seo` | grupo: `descripcion` (máx. 160) | El resto lo define `plataforma/seo.md`. |

#### `Medio` ◆ (colección *upload* nueva)

Imágenes auxiliares que **no son obra**: el logo y la foto de perfil. No aparecen en galerías ni se pueden consultar. Acepta JPG (hasta 20 MB; se generan versiones de 480 y 1200 px en WebP y AVIF, sin metadatos salvo el ICC sRGB), PNG y SVG (hasta 200 KB, para el logo, según el sistema de diseño). Campos: `textoAlternativo` (obligatorio salvo en el logo, que usa `nombreSitio`) y `uso` (`logo`, `pagina`).

#### `AjustesSitio` (global)

Como en el marco: `nombreSitio` ("Rod Díaz"), `logo` (relación con `Medio`, opcional), `descripcion`, `correoContacto`, `redes` (lista de `red`, que puede ser `instagram` u `otra`, más `url`), `fotoPortada` (relación con `Foto`, opcional), `textoLlamadaCopia` (por defecto "Pedir una copia"), `textoDerechos`, `textoVitrina` ◆ (opcional; texto breve que la ficha puede mostrar en fotos sin copia) y los textos de la consulta `textoIntroConsulta`, `textoConsultaRecibida`, `textoConsentimiento`, `textoPromociones`, `plantillaRespuesta` y `plantillaNovedades` (valores por defecto en `consultas/consulta-copia.md` §5.1), en una pestaña *Consultas* de Ajustes del sitio. El logo se previsualiza sobre `#151515` (sistema de diseño).

#### `Usuario` (colección *auth*)

Como en el marco: `correo`, `nombre`, `proveedorAcceso` (`google`), `idGoogle` y `ultimoAcceso`. Se crea en el primer inicio de sesión válido. No hay registro, contraseña ni opción de crear usuarios desde el panel.

#### `IntentoAcceso` ◆ (colección nueva)

| Campo | Tipo | Reglas |
|---|---|---|
| `correo` | texto, indexado | Correo de Google que intentó entrar. |
| `fecha` | fecha y hora (UTC) | — |
| `motivo` | `correo_no_autorizado`, `error_proveedor` | — |

Solo lectura en el panel, salvo borrar. No se guarda IP, nombre ni foto de la cuenta. Se borra a los 90 días.

#### Índices

`Foto.slug` (único), `Foto.coleccion` + `Foto.orden`, `Foto.estado` + `Foto.publicadaEn` ◇, `Foto.fijada` + `Foto.ordenFijada` ◇, `Foto.huella`, `Coleccion.slug` (único), `Coleccion.padre`, `Caracteristica.slug` (único), `IntentoAcceso.fecha`.

### 5.2 Reglas de negocio específicas

1. **El sistema propone, Rod dispone.** Ningún valor automático es definitivo ni bloquea la edición. Recalcular (por ejemplo, la proporción) nunca pisa un valor que Rod editó a mano (`manual = true`).
2. **Procesamiento al subir** (en este orden, en un *hook* de la operación de subida):
   1. Validar el tipo real (JPEG por firma de bytes) y el tamaño (≤ 60 MB).
   2. Calcular `huella` (SHA-256 del archivo recibido) y buscar duplicados.
   3. Leer del EXIF **solo** `DateTimeOriginal`, `FocalLength`, `FNumber` y `ExposureTime`, y normalizarlos (§4).
   4. `rotate()` según la orientación EXIF; convertir a sRGB (`toColorspace('srgb')`) e incrustar el perfil (`withIccProfile('srgb')`), sin `withMetadata`, `keepExif` ni `keepMetadata`.
   5. Calcular `ancho`, `alto`, `proporcion` y `colorDominante` sobre la imagen orientada.
   6. Generar las versiones (marco §6.2.2) y reducir el archivo principal a 2048 px de lado largo.
   7. Precargar `formatos` con los activos compatibles.
   8. Descartar el archivo original recibido (marco §6.2.1).
3. **Fecha de la toma.** `fecha` es un día calendario. Se guarda a las 12:00 America/Santiago (en UTC) para que ninguna conversión la mueva de día, y se muestra solo como fecha. Precisa el marco §6.2.11 para este campo.
4. **Mínimos para publicar una `Foto`:** `titulo`, `lugar`, `fecha` y `coleccion`. La proporción y las versiones existen siempre, porque sin ellas la foto no se crea. Si falta algo, se rechaza el cambio a `publicada` con la lista de faltantes. Los formatos **no** son obligatorios.
5. **Visibilidad pública** (función única `lib/visibilidad.ts`, que usan todas las consultas públicas):
   - Una `Foto` es visible si `estado = publicada`, su `coleccion` está `publicada` y, si esa colección tiene `padre`, el padre también está `publicado`.
   - Una `Coleccion` madre se lista si está `publicada` y tiene al menos una foto visible, propia o de sus hijas.
   - Una `Coleccion` hija se lista y tiene página propia si está `publicada`, su madre está `publicada`, `visibleSola = true` y tiene al menos una foto visible.
   - La vista de una madre muestra sus fotos propias (por `orden`) y luego las de cada hija `publicada` (hijas por `orden` y fotos por `orden`). La presentación (agrupada o continua) la decide `portafolio/galeria-colecciones.md`.
6. **Compatibilidad de formatos.** Un `FormatoImpresion` es compatible con una `Foto` si `|valorFormato − valorFoto| / valorFoto ≤ 0,02`, comparando siempre lado largo / lado corto (independiente de la orientación). La validación corre al guardar la foto y al editar en bloque.
7. **Oferta de copia.** Una foto ofrece copia si tiene al menos un formato `activo` con al menos un papel `activo`. Si no, es **de vitrina**: la ficha no muestra "Pedir una copia". Esto reemplaza "Tamaños a pedido" del marco §6.2.4.
8. **Elección de papel** (para la ficha y la consulta): en cada formato ofrecido, si tiene dos o más papeles activos el interesado elige; si tiene uno, se informa sin pedir elección.
9. **Jerarquía:** dos niveles como máximo (§4). La validación corre en el servidor (*hook* `beforeValidate`), no solo en la interfaz.
10. **Acceso:** solo entran los correos de la variable de entorno `CORREOS_ADMIN` (hoy `rodrigodiaztapia@gmail.com`; marco §3). Un correo rechazado genera un `IntentoAcceso` (como máximo uno por correo por hora) y no crea `Usuario`.
11. **Borrado programado:** la tarea diaria del marco (`tareas/`) también borra los `IntentoAcceso` de más de 90 días.
12. **Revalidación:** al publicar, despublicar, editar o borrar una `Foto`, `Coleccion`, `Caracteristica`, `FormatoImpresion`, `TipoPapel`, `Pagina` o `AjustesSitio`, se revalidan las rutas públicas afectadas (*hooks* `afterChange` y `afterDelete` con `revalidatePath`/`revalidateTag`).

### 5.3 Interfaces

| Interfaz | Detalle |
|---|---|
| `/admin` | Panel Payload en español con grupos de navegación: **Obra** (Fotos, Colecciones, Características), **Catálogo de copias** (Formatos de impresión, Tipos de papel), **Consultas** (Consultas y Suscriptores a novedades, de `consulta-copia`), **Sitio** (Páginas, Medios, Ajustes del sitio), **Seguridad** (Intentos de acceso; `Usuario` oculto). |
| `/admin` (dashboard) | Componente propio que reemplaza la portada (§3.4). |
| Inicio de sesión | Botón "Entrar con Google" en `/admin/login`. Callback OAuth en la ruta que defina la librería elegida (§5.6). Las respuestas de rechazo usan un mensaje genérico. |
| API de Payload `/api/...` | Lectura pública solo de lo visible: el control de acceso `read` de `Foto`, `Coleccion`, `Pagina` aplica §5.2.5 para usuarios anónimos. `IntentoAcceso`, `Usuario` y los borradores solo los lee Rod. Escritura solo para Rod. |
| Funciones de datos para el sitio | `lib/contenido.ts` expone a los componentes públicos: `fotosVisibles(filtro)`, `fotoPorSlug(slug)` (devuelve `{foto}`, `{redirigirA}`, `{noDisponible}` o `null`), `coleccionesListadas()`, `coleccionPorSlug(slug)`, `formatosOfrecidos(foto)` (con orientación y papeles) y `ajustes()`. ◇ Se suman las funciones de paginación y vistas de `portafolio/galeria-colecciones.md` §5.3. Los documentos de galería, ficha y páginas consumen estas funciones. |

### 5.4 Componentes y estructura de código

```
src/
├── colecciones/
│   ├── Foto.ts                  # campos, hooks de subida, validación de publicación
│   ├── Coleccion.ts             # jerarquía, joins, validaciones de borrado
│   ├── Caracteristica.ts
│   ├── FormatoImpresion.ts      # medidas bloqueadas con fotos asociadas
│   ├── TipoPapel.ts
│   ├── Pagina.ts
│   ├── Medio.ts                 # nuevo
│   ├── Usuario.ts               # auth con Google, sin contraseña
│   └── IntentoAcceso.ts         # nuevo
├── globales/AjustesSitio.ts
├── lib/
│   ├── imagenes.ts              # validación, rotate, sRGB+ICC, versiones, color dominante, huella
│   ├── exif.ts                  # lectura acotada a 4 etiquetas y normalización
│   ├── proporcion.ts            # normalización y compatibilidad (±2 %)
│   ├── visibilidad.ts           # §5.2.5
│   ├── contenido.ts             # funciones de datos para el sitio (§5.3)
│   ├── slug.ts                  # slug sin tildes, sufijos, slugsAnteriores
│   └── acceso.ts                # lista permitida y registro de intentos
├── admin/
│   ├── Dashboard.tsx            # §3.4
│   ├── OrdenarFotos.tsx         # orden por arrastre dentro de la colección
│   ├── AvisoDuplicado.tsx
│   └── VistaPreviaLogo.tsx      # logo sobre #151515
├── tareas/borrarVencidos.ts     # + IntentoAcceso > 90 días
└── semilla/                     # páginas reservadas y AjustesSitio inicial
```

Las pruebas viven junto a `lib/` (`*.test.ts`) para proporción, compatibilidad, EXIF, slug y visibilidad.

### 5.5 Rendimiento y seguridad

- **Memoria al procesar:** un archivo a la vez por petición. `sharp` se configura con `sharp.cache(false)` y `sharp.concurrency(1)` en producción, para que un JPG de 45 MP no agote la memoria del servicio en Railway.
- **Volumen:** solo versiones web. Una foto ocupa del orden de 1 a 2 MB entre todas sus versiones; cientos de fotos caben holgados (lo dimensiona `plataforma/despliegue.md`).
- **Lectura pública:** las rutas públicas son estáticas o con revalidación al publicar (marco §6.5). No consultan la base en cada visita.
- **Control de acceso:** reglas de acceso de Payload en el servidor, para cada colección y operación. La interfaz no es la barrera.
- **EXIF:** se leen solo las cuatro etiquetas permitidas. Ningún dato de cámara, lente, serie ni GPS llega a la base de datos.
- **Subidas:** solo Rod puede subir, con tipo validado por firma de bytes. Los SVG del logo se muestran solo con `<img>` (sistema de diseño).
- **Secretos:** `CORREOS_ADMIN`, credenciales OAuth y `PAYLOAD_SECRET` solo en variables de entorno (marco §6.5).

### 5.6 Stack

| Pieza | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| CMS, base de datos e imágenes | Heredado del marco §6.6 (Payload 3, PostgreSQL, volumen, `sharp`). | — | — |
| Carga masiva y edición en bloque | Funciones nativas de Payload 3 (*bulk upload* y *edit many*). | Cero código propio y probado por la comunidad. | Un cargador propio: semanas de trabajo para lo mismo. |
| Lectura de EXIF | **`exifr`** (MIT, gratis), limitado a 4 etiquetas. | Liviano, lee solo lo pedido y no necesita binarios externos. | `exiftool`: requiere un binario en el contenedor. El EXIF crudo de `sharp` con `exif-reader`: viable, pero con más código de normalización. |
| Orden por arrastre | Función `orderable` de Payload si la versión instalada la soporta; si no, el componente `OrdenarFotos.tsx` sobre `Foto.orden`. | Rod ordena visualmente sin escribir números. | Escribir números de orden a mano: propenso a errores. |
| Acceso con Google | Heredado del marco (estrategia propia de Payload con Auth.js o plugin OAuth). El registro de intentos se agrega en el *callback*. | — | — |
| Páginas | Texto enriquecido Lexical (incluido en Payload). | Suficiente para la v1.0. | Constructor de bloques: más complejo, queda para v1.x. |

**Costo incremental:** cero. `exifr` es una librería gratuita y no se suma ningún servicio.

## 6. Cumplimiento normativo

Lo transversal está en el marco §7. Lo específico de este componente:

- **Datos personales que trata:** el correo de Rod (`Usuario`) y los correos de quienes intentan entrar al panel (`IntentoAcceso`).
  - *Finalidad:* seguridad del panel (detectar intentos de acceso).
  - *Base de licitud:* interés legítimo en la seguridad del sistema.
  - *Minimización:* solo correo, fecha y motivo; sin IP, nombre ni foto.
  - *Conservación:* 90 días, con borrado automático.
  - *Acceso:* solo Rod.
  - *Terceros:* Google entrega el correo como parte del inicio de sesión.
  - La política de privacidad (`paginas/paginas.md`) debe mencionar este registro en una línea.
- **Vigencia de la normativa (reverificada el 2026-10-13):** la Ley 21.719 sigue con entrada en vigencia el **1 de diciembre de 2026**. El proyecto que la posterga al 1 de diciembre de 2027 (Boletín 18.623-07) aún no estaba aprobado al 6 de octubre de 2026 y se esperaba que su debate partiera a mediados de octubre ([CiberLATAM, 6 de octubre de 2026](https://ciberlatam.com/en/news/chile-delays-personal-data-law-facb0e5c); [Carey](https://www.carey.cl/gobierno-ingresa-proyecto-de-ley-que-posterga-en-un-ano-entrada-en-vigor-de-la-ley-sobre-proteccion-de-datos-personales)). Se mantiene el criterio del marco: cumplir desde el lanzamiento.
- **Metadatos de las fotos (marco §7.2):** se refuerza. Las etiquetas sensibles del EXIF ni siquiera se leen, y las versiones solo llevan el perfil ICC sRGB.
- **Propiedad intelectual:** el tope de 2048 px y el descarte del original se aplican aquí (marco §6.2.1 y §6.2.2).
- **Cookies:** solo la cookie de sesión del panel, que es esencial y no requiere consentimiento (marco §7.4).

## 7. Elementos obsoletos

No hay código previo. Este documento deja obsoletas estas definiciones del **marco 1.1**, que se actualizan en el **marco 1.2**:

| Marco 1.1 | Reemplazo |
|---|---|
| §6.1 `Foto.colecciones` (varias) y relación "cero o más `Coleccion`" | `Foto.coleccion` (una, obligatoria para publicar) y `Foto.orden`. |
| §6.1 `Foto.papeles` | Se elimina; el papel sale de `FormatoImpresion.papeles`. |
| §6.1 `Foto.datosTecnicos` con cámara, lente e ISO e interruptores `visible` | Solo `distanciaFocal`, `apertura` y `velocidad`; un campo vacío no se muestra. |
| §6.1 `Coleccion.orden` (lista de fotos) y `estado` `publicada`/`oculta` | `padre`, `visibleSola`, `orden` (entre hermanas) y `estado` `borrador`/`publicada`. |
| §6.1 `FormatoImpresion.anchoCm`/`altoCm` | `ladoCortoCm`/`ladoLargoCm` (vale para ambas orientaciones) y `papeles`. |
| §6.1 sin `Medio` ni `IntentoAcceso` | Se agregan ambas entidades; `AjustesSitio.logo` pasa a ser una relación con `Medio`. Se agregan `Foto.slugsAnteriores`, `Foto.publicadaEn` y `AjustesSitio.textoVitrina`. |
| §5 y §6.2.4: se aceptan JPEG, PNG, WebP y TIFF | Solo JPEG (hasta 60 MB). |
| §6.2.4 "Una foto sin formatos … dice «Tamaños a pedido»" | Una foto sin formatos ofrecibles es de vitrina y no ofrece copia (§5.2.7). Principio 3 del §4.2: "en cada ficha **que ofrece copia**". |
| §5 "ofrece desasociarlas" (colección con fotos) | Para colecciones: mover las fotos a otra colección, porque la colección es obligatoria. |
| §6.2.6 "avisa y pide confirmación" (duplicados) | Se sube y se avisa en la foto nueva con un enlace a la existente; Rod decide. |

Ningún otro documento aprobado queda afectado: el sistema de diseño usa `ancho`, `alto`, `colorDominante`, `filete` y `textoAlternativo`, que no cambian. Los documentos pendientes (galería, ficha, consulta, páginas) se redactarán sobre el marco 1.2.

## 8. Plan de acción

Para Claude Code, después del paso 1 del plan del marco (§9.2: base del proyecto).

| # | Paso | Depende de | Terminado cuando |
|---|---|---|---|
| 1 | `lib/proporcion.ts`, `lib/slug.ts` y `lib/exif.ts`, con pruebas. | — | Las pruebas cubren 3:2, 4:5 vertical, 1:1, 16:9, panorámica personalizada, la tolerancia ±2 %, velocidad y apertura normalizadas, y slugs con ñ y tildes. |
| 2 | `lib/imagenes.ts`: validación por firma, rotación, sRGB+ICC, versiones, color dominante y huella. | 1 | Una foto de prueba del R5 Mark II vertical sale vertical; `exiftool` sobre cada versión muestra solo el perfil ICC; ningún archivo del volumen supera 2048 px. |
| 3 | Colecciones `TipoPapel` y `FormatoImpresion` (bloqueo de medidas y borrado). | 1 | Crear 30 × 45 muestra 3:2. Editar sus medidas con fotos asociadas se bloquea. |
| 4 | `Coleccion` con jerarquía, joins y validaciones. | — | Un tercer nivel se rechaza en el servidor; borrar con fotos o hijas se bloquea. |
| 5 | `Caracteristica`, `Medio` y `AjustesSitio` (con `logo` y vista previa). | — | Subir un PNG de 300 KB como logo se rechaza; uno válido se previsualiza sobre `#151515`. |
| 6 | `Foto`: campos, *hooks* de subida (paso 2), formatos sugeridos, duplicados, `publicadaEn`, validación de publicación y `faltantes`. | 2, 3, 4 | Subir 20 JPG en lote crea 20 borradores con EXIF precargado; publicar una sin lugar muestra "Para publicar falta: lugar". |
| 7 | `lib/visibilidad.ts`, `lib/contenido.ts` y reglas de acceso `read` públicas. | 4, 6 | Pruebas de §9 (visibilidad) en verde. La API anónima no devuelve borradores. |
| 8 | Orden por arrastre de fotos y de colecciones hermanas. | 6 | Rod reordena y el orden persiste. |
| 9 | `Usuario` con Google, `CORREOS_ADMIN`, `IntentoAcceso` y su limitación por hora. Requiere T-008. | Base | Rod entra; otro correo ve el rechazo y queda registrado una sola vez por hora. |
| 10 | `Pagina` y semilla (`sobre-mi`, `contacto`, `privacidad`, `condiciones` y `AjustesSitio` inicial). | 5 | Las cuatro páginas existen en borrador tras la semilla. |
| 11 | Dashboard, grupos de navegación, etiquetas y ayudas en español. | 6, 9 | El dashboard muestra borradores y accesos rechazados; el espacio de consultas queda listo. |
| 12 | Revalidación de rutas y tarea de borrado de `IntentoAcceso`. | 7, 9 | Publicar una foto actualiza `/fotos` sin desplegar; un intento de 91 días se borra al correr la tarea. |
| 13 | Cargar el catálogo de T-006 (cuando Rod lo entregue) y probar con fotos reales. | 3, T-006 | El catálogo de Rod está en el panel. |

## 9. Criterios de aceptación y pruebas

1. Subir un lote de 20 JPG crea 20 `Foto` en `borrador` sin bloquear el panel, con `fecha`, `distanciaFocal`, `apertura` y `velocidad` precargados si el EXIF los trae.
2. *Editar varias* asigna colección, lugar y características a las 20 en una sola acción.
3. Un RAW (.CR3), un TIFF, un HEIC, un PNG y un JPG renombrado desde PNG se rechazan con el mensaje de §3.5.
4. Una foto vertical con orientación EXIF se ve vertical en todas sus versiones, y su `proporcion` es `3:2` vertical.
5. `exiftool` sobre cualquier versión generada no muestra EXIF, IPTC, XMP ni GPS; solo el perfil ICC sRGB. Ningún archivo del volumen supera 2048 px en el lado largo y el original no existe en el volumen.
6. La base de datos no contiene cámara, lente, número de serie ni coordenadas de ninguna foto.
7. Todo campo autocompletado se puede editar y vaciar, y un campo vacío no se devuelve como dato técnico visible en `lib/contenido.ts`.
8. Publicar sin `titulo`, `lugar`, `fecha` o `coleccion` se rechaza con la lista exacta de faltantes. Publicar sin formatos se permite (vitrina).
9. Una foto 3:2 recibe al subir solo los formatos 3:2 activos. Asociarle un 4:5 se rechaza.
10. Un formato 30 × 45 aparece como 30 × 45 en una vertical y 45 × 30 en una horizontal (`formatosOfrecidos`).
11. Un formato con un solo papel activo se informa sin elección; con dos, `formatosOfrecidos` los entrega como elegibles.
12. **Visibilidad:** una foto `publicada` en una colección `borrador` no aparece en la API anónima ni en `fotosVisibles`. Una hija con `visibleSola = false` no aparece en `coleccionesListadas`, sus fotos sí aparecen en la madre y su URL redirige a la madre.
13. Un tercer nivel de colección, una colección como su propio padre y una madre con hijas convertida en hija se rechazan desde la API (no solo en la interfaz).
14. Cambiar el título de una foto publicada no cambia su `slug`. Editar el `slug` a mano deja el anterior en `slugsAnteriores` y `fotoPorSlug` devuelve `redirigirA`.
15. Una foto despublicada que estuvo publicada devuelve `noDisponible`; una que nunca se publicó devuelve `null`.
16. Subir dos veces el mismo archivo muestra el aviso de duplicado con un enlace.
17. Solo `rodrigodiaztapia@gmail.com` entra. Otro correo ve "Esta cuenta no tiene acceso", no se crea `Usuario` y queda un `IntentoAcceso`; diez intentos en una hora con ese correo dejan un solo registro.
18. El dashboard muestra fotos en borrador y accesos rechazados de los últimos 30 días.
19. Un `IntentoAcceso` de más de 90 días se borra al correr la tarea diaria.
20. Ningún texto, correo ni enlace del sitio está escrito en el código (marco §6.2.10): todo sale de `AjustesSitio` o `Pagina`.
21. Procesar un JPG de 45 MP no supera la memoria del servicio en Railway (se mide en el despliegue de prueba).

## 10. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| MC-01 | Un JPG de 45 MP agota la memoria del servicio al generar versiones. | Media | Alto | Procesamiento en serie, `sharp.concurrency(1)`, sin caché; criterio 21 en el despliegue. |
| MC-02 | Una regla de visibilidad mal aplicada filtra un borrador al público. | Baja | Alto | Una sola función (`lib/visibilidad.ts`) usada por la API y las páginas, con pruebas (criterio 12). |
| MC-03 | La carga masiva o el orden por arrastre de Payload cambian entre versiones. | Media | Medio | Fijar la versión de Payload; alternativa propia `OrdenarFotos.tsx` prevista. |
| MC-04 | Rod sube 20 fotos y la edición foto por foto se vuelve tediosa. | Media | Medio | Edición en bloque para lo común; en la v1.x, autocompletar `lugar` si se nota la fricción. |
| MC-05 | Una foto queda solo de vitrina sin que Rod lo note y se pierde una venta. | Media | Bajo | La lista de fotos muestra "Vitrina" en las que no ofrecen copia. |
| MC-06 | Fecha EXIF con la hora de la cámara mal configurada. | Baja | Bajo | La fecha es editable y es solo un día. |
| MC-07 | La librería de OAuth no encaja bien con Payload 3. | Media | Medio | El marco ya contempla Auth.js o plugin; el script de recuperación de `despliegue` cubre el bloqueo. |

## 11. Decisiones abiertas y tareas del dueño

**Decisiones abiertas:** ninguna bloquea la implementación. Lo que queda para otros documentos:

- Presentación de la vista de una madre (agrupada por sub-colección o continua): `portafolio/galeria-colecciones.md`.
- Uso de `textoVitrina` en fotos sin copia y cómo se muestra la elección de papel: `portafolio/ficha-foto.md`.
- Cómo conserva una `Consulta` la referencia a una foto borrada: `consultas/consulta-copia.md`.

**Tareas del dueño** (ya existen, sin tareas nuevas):

| Id | Categoría | Tarea | Bloquea |
|---|---|---|---|
| T-006 | contenido | Definir el catálogo inicial de tamaños (cm, por proporción: 3:2, 4:5, 1:1 y otras que uses) y de tipos de papel, indicando qué papeles hay en cada tamaño. | Paso 13 de la implementación |
| T-008 | desarrollo | Crear el cliente OAuth de Google Cloud para el panel. | Paso 9 de la implementación |

## 12. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.2 | 2026-10-14 | Cambio menor al aprobar `consultas/consulta-copia.md` 1.0: tarjetas del dashboard, grupo Consultas con Suscriptores y textos de consulta en `AjustesSitio`. |
| 1.1 | 2026-10-14 | Cambio menor al aprobar `portafolio/galeria-colecciones.md` 1.0: `Foto.fijada`, `Foto.ordenFijada` y punto focal (`focalPoint: true`, `crop: false`); lista "Fijadas" ordenable; ayudas de `destacada`, `fijada` y `Coleccion.portada`; índices; funciones de datos de galería en `lib/contenido.ts`. |
| 1.0 | 2026-10-13 | Aprobado por Rod. El marco general pasa a 1.2 con los cambios del §7. |
| 0.1 | 2026-10-13 | Borrador inicial, conversado por voz con Rod. Decisiones: una colección por foto (obligatoria para publicar) y características transversales; colecciones de dos niveles con fotos propias en la madre y `visibleSola` en las hijas; borrador y publicación para fotos y colecciones; `lugar` libre; fecha de captura del EXIF o manual; solo distancia focal, apertura y velocidad (sin cámara, lente ni GPS); todo lo automático es editable; catálogo de formatos por proporción con papeles por formato; fotos de vitrina sin copia; carga masiva con edición en bloque; solo JPG en sRGB; acceso con un solo correo de Google y registro de intentos rechazados; páginas simples. Nuevas entidades `Medio` e `IntentoAcceso`. Cambios al marco listados en §7. |

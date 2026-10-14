# Páginas

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/paginas/paginas.md` |
| Tipo | Componente |
| Versión | 0.1 |
| Estado | En revisión |
| Fecha | 2026-10-14 |
| Padre | `marco-general/marco-general-proyecto.md` |
| Dependencias | `identidad/sistema-de-diseno.md`, `contenido/modelo-contenido-panel.md` |
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
- Anexo A · Texto inicial de la política de privacidad
- Anexo B · Texto inicial de las condiciones de uso

---

## 1. Contexto y objetivo

Las páginas son el apoyo del flujo central (marco §4.1). No venden ni muestran obra por sí mismas, pero resuelven tres cosas:

1. **Confianza.** El visitante que llega desde Instagram quiere saber quién está detrás de las fotos antes de pedir una copia. "Sobre mí" le pone cara y voz a la obra y lo devuelve a ella.
2. **Un camino para escribir sin una foto en mente.** "Contacto" lleva a la consulta general (`consultas/consulta-copia.md`) y a Instagram.
3. **Cumplimiento.** La política de privacidad es obligatoria antes del lanzamiento (marco §7.1) y las condiciones dan aviso de derechos de autor (marco §7.3).

**Filtro de valor (método §6).**

1. *Problema real:* el **Visitante** no tiene cómo conocer a Rod ni escribirle sin elegir una foto; el **Interesado** necesita saber qué pasa con sus datos antes de aceptar la casilla de privacidad del formulario.
2. *Beneficio frente al costo:* tres plantillas de página sobre la colección `Pagina` que ya existe y textos iniciales en la semilla. Sin servicios ni dependencias nuevas. Costo incremental cero.
3. *Versión:* v1.0. Sin la política de privacidad no se puede lanzar el formulario.

**Resultado esperado.** Rod edita las cuatro páginas desde el panel sin tocar código. El visitante encuentra "Sobre mí" y "Contacto" en el encabezado, y "Privacidad" y "Condiciones" en el pie. Las páginas se ven como parte del sitio: fondo oscuro, tipografía del sistema de diseño, y la obra presente cuando corresponde.

## 2. Alcance

**Incluye (v1.0):**

- **Sobre mí** (`/sobre-mi`): foto de perfil, texto de Rod y, al final, hasta 6 fotos destacadas y un enlace a Contacto (decisión de Rod).
- **Contacto** (`/contacto`): página breve con el texto de Rod, el botón "Escríbeme" hacia `/consulta` sin foto y el enlace a Instagram. **No muestra el correo** (decisión de Rod).
- **Política de privacidad** (`/privacidad`) y **Condiciones de uso** (`/condiciones`): plantilla de lectura con fecha de actualización. Sus textos iniciales completos van en la semilla (Anexos A y B) y quedan editables (decisión de Rod).
- **Páginas libres** (`/[slug]`): Rod puede crear otras páginas (por ejemplo, "Sobre las copias"). Se ven al publicarlas; **no entran al menú ni al pie** y Rod las enlaza desde un texto (decisión de Rod).
- Reglas de protección de las páginas reservadas (no se borran, su `slug` no cambia, la política no se despublica).
- Marcador `{correo}` en el texto, que se reemplaza por el correo de contacto protegido contra recolectores.

**No incluye:**

- El formulario de consulta: `consultas/consulta-copia.md`.
- Títulos, descripciones y Open Graph de cada página: `plataforma/seo.md` (aquí solo se usa `seo.descripcion`, que ya existe).
- Encabezado, pie y plantilla de estado: `identidad/sistema-de-diseno.md` §5.4.

**Para versiones posteriores:**

- v1.x: páginas con bloques (texto, imagen, cita), ya previsto en `modelo-contenido-panel` §2; casilla "Mostrar en el pie" para páginas libres, si Rod llega a tener varias.
- Futuro: página del curso de fotografía (fuera de alcance por instrucción del proyecto).

## 3. Flujo de usuario y UX/UI cuestionado

### 3.1 Sobre mí (`/sobre-mi`)

**Qué percibe en los primeros segundos.** La cara de Rod y una frase suya, con la misma calma que la obra. No es un currículum: es una presentación breve que termina devolviendo al visitante a las fotos.

**Escritorio (≥ 1024 px).** Dos columnas dentro del ancho del sitio:

```
┌────────────────────────────────────────────────────────────┐
│ Encabezado                                                  │
├──────────────────────┬─────────────────────────────────────┤
│                      │ Sobre mí              (--titulo-md) │
│   Foto de perfil     │                                     │
│   MarcoFoto 'ficha'  │ Texto de Rod (--texto-lectura,      │
│   (sticky, top 96)   │ máx. 65 ch)                         │
│   máx. 40 % ancho    │ …                                   │
│                      │                                     │
├──────────────────────┴─────────────────────────────────────┤
│ Algunas fotos                                (--titulo-sm) │
│ GrillaFotos con hasta 6 destacadas                          │
│                                                             │
│ ¿Quieres escribirme?  Boton secundario "Escríbeme"          │
├─────────────────────────────────────────────────────────────┤
│ Pie                                                         │
└─────────────────────────────────────────────────────────────┘
```

- La foto de perfil (`Pagina.imagen`, un `Medio`) usa `MarcoFoto` en modo `ficha`: nunca se recorta, ocupa hasta el 40 % del ancho y como máximo 80 vh de alto. Es `sticky` mientras el texto es más largo que ella, para que la cara acompañe la lectura.
- El texto (`Pagina.contenido`) usa `--texto-lectura` (17 px, interlineado 1,7, máx. 65 ch, con guionado), alineado a la izquierda. Los títulos h2/h3 del texto enriquecido usan `--titulo-sm` y `--texto-base` en negrita.
- Al final, el bloque "Algunas fotos": hasta **6** fotos `destacada` visibles en una `GrillaFotos` (la de `galeria-colecciones` §3.5), de la más reciente a la más antigua, cada una enlazada a su ficha sin contexto (contexto "todas las fotos", como las destacadas de la portada). Si no hay destacadas, el bloque no aparece.
- Cierre: una línea "¿Quieres escribirme?" y un `Boton` **secundario** "Escríbeme" hacia `/contacto`. Es secundario porque la página no tiene acción primaria: la protagonista sigue siendo la obra.

**Móvil (< 1024 px).** Una columna: título, foto de perfil a todo el ancho de la columna (máx. 70 vh de alto, sin `sticky`), texto, "Algunas fotos" y el cierre.

**Sin foto de perfil.** Una sola columna de lectura; el texto no se estira para ocupar el hueco.

### 3.2 Contacto (`/contacto`)

**Qué percibe.** Una página corta y cálida que dice cómo escribir, sin formularios a la vista ni datos sueltos.

```
┌───────────────────────────────────────────┐
│ Contacto                      (--titulo-md)│
│                                            │
│ Texto breve de Rod (--texto-lectura).      │
│ Por defecto: "¿Te interesa una copia,      │
│ una colaboración o solo quieres saludar?   │
│ Escríbeme y te respondo personalmente."    │
│                                            │
│ [ Escríbeme ]          Boton primario      │
│                                            │
│ También estoy en Instagram: @…  (enlace)   │
└───────────────────────────────────────────┘
```

- Columna de lectura alineada a la izquierda, sin foto. Si `Pagina.imagen` tiene una, se muestra arriba del título en `MarcoFoto` modo `ficha`, como máximo 50 vh de alto.
- "Escríbeme" es el **único** `Boton` primario de la vista y lleva a `/consulta` sin parámetros (consulta general: título "Escríbeme", botón "Enviar mensaje", `consulta-copia` §3).
- La línea de Instagram sale de `AjustesSitio.redes`: por cada red, un enlace con su nombre ("Instagram") y el usuario o la URL legible, con `rel="me noopener"` y `target="_blank"`. Si no hay redes, la línea no aparece.
- **No se muestra el correo** (decisión de Rod): el camino para escribir es el formulario, que guarda la consulta antes de confirmar. El correo sigue visible en la política de privacidad, porque es el canal para ejercer derechos (§6), y en los mensajes de error del formulario (`consulta-copia` §3).
- El texto es `Pagina.contenido`; el rótulo del botón "Escríbeme" es interfaz y va en el código.

### 3.3 Política de privacidad y condiciones (`/privacidad`, `/condiciones`)

Plantilla de lectura (`PlantillaTexto`), la misma para páginas libres:

- Título en `--titulo-md`, debajo "Actualizada el 14 de octubre de 2026" en `--texto-sm` secundario (fecha de `Pagina.updatedAt` en America/Santiago, formato largo en español).
- Contenido en una columna de `--texto-lectura`, máx. 65 ch, alineada a la izquierda. Los h2 dan estructura y llevan `id` para anclas (por ejemplo, `/privacidad#tus-derechos`), con `scroll-margin-top` igual al alto del encabezado.
- Sin índice lateral ni acordeones: son textos cortos y se leen de corrido. Las listas usan el estilo de lista del sistema de diseño.
- El marcador `{correo}` se muestra como un enlace al correo de contacto (§5.2.6).
- Al final, un `Retorno` "Volver" (atrás en el historial, o a `/` si no hay historial). En la política de privacidad abierta desde el formulario, el enlace se abre en la misma pestaña y "Volver" devuelve al formulario, que conserva lo escrito porque el navegador restaura la página (`consulta-copia` §4, caso "atrás").

### 3.4 Páginas libres (`/[slug]`)

Usan la misma `PlantillaTexto` sin la línea "Actualizada el…" (solo la llevan las legales). Si tienen `imagen`, se muestra arriba del contenido en `MarcoFoto` modo `ficha`, máx. 70 vh. No aparecen en el menú, el pie ni el mapa del sitio, salvo que `plataforma/seo.md` decida incluirlas en el mapa.

### 3.5 Estados de la interfaz

| Estado | Comportamiento |
|---|---|
| Vacío | Una página publicada con contenido vacío no se puede guardar (validación del panel, §5.2.2). En público no existe el estado vacío. |
| Cargando | Las páginas son estáticas y llegan completas del servidor; las fotos usan la reserva de proporción y el fundido de `MarcoFoto`. No hay `Esqueleto`. |
| Error | Página inexistente o en borrador: el 404 de `PlantillaEstado` ("No encontramos esta página", botón "Ver todas las fotos"). Error al cargar una foto: el estado de error de `MarcoFoto`. |
| Éxito | La página se ve. |

### 3.6 Navegación

- El encabezado ya tiene "Sobre mí" y "Contacto" (`galeria-colecciones` §3.6); las rutas salen de `Pagina`. Si una de esas dos páginas está en borrador, **su enlace no aparece** en el encabezado ni en el menú móvil, y "Escríbeme" de Sobre mí apunta a `/consulta` en vez de `/contacto`.
- El pie enlaza a Contacto, Privacidad y Condiciones (`sistema-de-diseno` §5.4); cada enlace aparece solo si su página está publicada.
- Accesibilidad: un `h1` por página (el título), jerarquía h2/h3 sin saltos, enlaces con texto descriptivo, foco visible en todo, la foto de perfil con su `textoAlternativo` (obligatorio en `Medio`), y contraste AA del sistema de diseño.

### 3.7 Objeciones planteadas al flujo y su resolución

| # | Objeción | Resolución |
|---|---|---|
| O-1 | "Contacto" podría ir directo al formulario y ahorrar un clic. | Página breve con botón (decisión de Rod): da un lugar indexable y compartible, presenta Instagram y explica el tono antes del formulario. El clic extra es de bajo costo en una página tan corta. |
| O-2 | Sin el correo a la vista, quien prefiera escribir desde su propio correo no puede. | Decisión de Rod: el formulario guarda la consulta y la deja en el panel, que es donde Rod la gestiona. El correo sigue en la política de privacidad, como exige el ejercicio de derechos. |
| O-3 | "Sobre mí" puede volverse un callejón sin salida. | Cierra con "Algunas fotos" (6 destacadas) y "Escríbeme" (decisión de Rod). El visitante vuelve a la obra sin buscar el menú. |
| O-4 | Repetir las destacadas de la portada en Sobre mí parece redundante. | Son 6 y no 12, y quien llega a Sobre mí desde Instagram muchas veces no pasó por la portada. Si Rod prefiere otras fotos, en v1.x se puede agregar una relación "fotos de esta página". |
| O-5 | Los textos legales escritos por un asistente pueden no calzar con la operación real. | Se redactan desde lo ya aprobado (consulta, suscriptores, intentos de acceso, terceros, plazos) y con la normativa verificada el 2026-10-14. Rod los revisa en este documento; no hay revisión de abogado en la v1.0 (decisión de Rod) y se deja como riesgo PG-01. |
| O-6 | Si Rod despublica la política por error, el formulario queda pidiendo aceptar un texto que no existe. | La política publicada no se puede volver a borrador (§5.2.3). |
| O-7 | Páginas libres sin menú se pueden "perder". | Es lo pedido: Rod las enlaza desde un texto (por ejemplo, desde "Sobre mí"). El panel muestra la URL pública de cada página para copiarla. |
| O-8 | El correo escrito en la política queda expuesto a robots que recolectan direcciones. | Se escribe como marcador `{correo}` y se arma en el navegador (§5.2.6); sin JavaScript se muestra con "[arroba]" en vez de "@". |

## 4. Casos borde

| Caso | Resolución |
|---|---|
| "Sobre mí" sin texto aún (T-007 abierta) | La página queda en borrador (la semilla la crea así): su enlace no aparece y `/sobre-mi` da 404. El lanzamiento la exige publicada (lo verifica `plataforma/despliegue.md`). |
| Sobre mí sin foto de perfil | Una sola columna de lectura (§3.1). |
| Foto de perfil vertical, cuadrada u horizontal | `MarcoFoto` modo `ficha` sin recorte, con los topes de alto de §3.1. Una horizontal en escritorio queda limitada por el 40 % del ancho. |
| Texto de Sobre mí muy corto (una línea) | La foto deja de ser `sticky` si es más alta que el texto; la columna de texto se alinea arriba. |
| Texto muy largo | Sin tope; la foto `sticky` acompaña y el bloque "Algunas fotos" va después. |
| Sin destacadas | El bloque "Algunas fotos" no aparece; el cierre "Escríbeme" se mantiene. |
| Contacto sin redes en `AjustesSitio` | La línea de Instagram no aparece. |
| `correoContacto` vacío | No se puede publicar la política de privacidad ni guardar el marcador vacío: el panel exige `correoContacto` antes de publicar `privacidad` (§5.2.3). |
| Rod borra el marcador `{correo}` de la política | Al publicar `privacidad`, el panel avisa si el texto no contiene `{correo}`: "La política debe indicar cómo escribirte. Agrega {correo} donde corresponda." No bloquea si Rod escribió el correo a mano, pero el aviso queda visible. |
| Rod escribe `{correo}` en otra página | Funciona igual en cualquier `Pagina`. |
| Rod intenta borrar una página reservada | El panel lo impide: "Esta página es parte del sitio y no se puede borrar. Puedes dejarla en borrador." (salvo `privacidad`, §5.2.3). |
| Rod cambia el `slug` de una página reservada | El campo es de solo lectura en las reservadas. |
| Página libre con `slug` igual a una ruta del sitio (`fotos`, `colecciones`, `consulta`, `admin`, `api`, `datos`, `sobre-mi`, `contacto`, `privacidad`, `condiciones`, `sitemap.xml`, `robots.txt`, `guia-estilo`) | Validación: "Ese nombre ya lo usa el sitio. Elige otro." |
| Rod renombra una página libre ya compartida | Se guarda el `slug` anterior en `slugsAnteriores` y la URL vieja redirige con 308, como en las demás entidades (marco §5). |
| Página libre en borrador con enlaces compartidos | 404 con `PlantillaEstado`. |
| Título largo o con caracteres especiales | `titulo` máx. 80 caracteres; se ajusta en varias líneas con `text-wrap: balance`. El `slug` se genera sin tildes ni signos. |
| Enlace en el texto hacia otro sitio | Se abre en la misma pestaña, salvo los de redes; los enlaces externos llevan `rel="noopener"`. |
| Rod edita la política después de que hubo consultas | `updatedAt` cambia, y con ello la fecha "Actualizada el…" y la `versionPolitica` de las consultas nuevas (`consulta-copia` §5.1). Las consultas anteriores conservan la fecha con la que se aceptaron. |
| Navegador interno de Instagram | Páginas estáticas, sin JavaScript propio salvo el armado del correo; la foto de perfil usa la versión de 1200 px en móvil. |
| JavaScript desactivado | Todo funciona; el correo se lee como "nombre [arroba] dominio.cl". |

## 5. Especificación técnica

### 5.1 Modelo de datos

Se usa `Pagina` tal como la define `modelo-contenido-panel` §5.1, con **un campo nuevo** y reglas de validación:

| Campo | Tipo | Reglas |
|---|---|---|
| `titulo` | texto | Obligatorio, máx. 80. |
| `slug` | texto, único | Generado desde `titulo` en páginas libres. Solo lectura en las reservadas (`sobre-mi`, `contacto`, `privacidad`, `condiciones`). No admite las rutas del sitio (§4). |
| `slugsAnteriores` ◆ | lista de texto, solo lectura | **Nuevo.** Como en `Foto`, `Coleccion` y `Caracteristica`. Solo se llena en páginas libres. |
| `contenido` | texto enriquecido (Lexical) | Obligatorio para publicar. Párrafos, h2/h3, listas, enlaces, negrita, cursiva (sin cambios). |
| `imagen` | relación con `Medio` (`uso = pagina`), opcional | Foto de perfil en Sobre mí; ilustración en Contacto y páginas libres. Se ignora en `privacidad` y `condiciones`. |
| `estado` | `borrador`, `publicada` | Reglas de §5.2.3. |
| `seo.descripcion` | texto, máx. 160 | Lo usa `plataforma/seo.md`. |
| `reservada` | casilla calculada, solo lectura | Verdadera si el `slug` es uno de los cuatro reservados. No se muestra al público. |

En el panel, la lista de *Páginas* muestra título, estado, URL pública (con botón para copiarla) y fecha de actualización; las reservadas aparecen primero con la etiqueta "Del sitio".

### 5.2 Reglas de negocio específicas

1. **Plantilla según `slug`.** `sobre-mi` → `PlantillaSobreMi`; `contacto` → `PlantillaContacto`; `privacidad` y `condiciones` → `PlantillaTexto` con fecha; cualquier otra → `PlantillaTexto` sin fecha.
2. **Publicar exige** `titulo` y `contenido` no vacío.
3. **Páginas reservadas.** No se pueden borrar ni cambiar su `slug`. `privacidad` exige `AjustesSitio.correoContacto` para publicarse y, una vez publicada, **no puede volver a borrador** ("La política de privacidad debe estar visible mientras el formulario reciba consultas."). Las otras tres sí pueden volver a borrador.
4. **Visibilidad de enlaces.** Encabezado, menú móvil, pie y el cierre de Sobre mí muestran el enlace a una página reservada solo si está `publicada` (§3.6). La casilla de privacidad del formulario enlaza siempre a `/privacidad`.
5. **Destacadas en Sobre mí.** `fotosDestacadas(6)` de `galeria-colecciones` §5.3, con las reglas de visibilidad del marco §6.2.5.
6. **Marcador `{correo}`.** Al renderizar el texto enriquecido, cada aparición literal de `{correo}` se reemplaza por el componente `CorreoProtegido`: en el HTML del servidor va el texto "usuario [arroba] dominio" sin `mailto`; al hidratar se arma el enlace `mailto:` con el correo de `AjustesSitio.correoContacto`, que viaja dividido (usuario y dominio en atributos `data-` separados). Es disuasión básica, no seguridad.
7. **Fecha de actualización.** Se muestra `updatedAt` en America/Santiago, formato largo ("14 de octubre de 2026"). Un cambio solo de `estado` no cuenta como actualización del texto: el *hook* guarda `contenidoActualizadoEn` y la fecha visible y la `versionPolitica` (`consulta-copia` §5.1) se toman de ese campo. ◆ Este campo técnico se agrega a `Pagina` junto a `slugsAnteriores`.
8. **Revalidación.** Al guardar una `Pagina` o `AjustesSitio` se revalidan su ruta, el encabezado y el pie de todo el sitio (`modelo-contenido-panel` §5.2.12).
9. **Semilla.** Crea las cuatro páginas en borrador con los textos iniciales: Sobre mí con un texto de ejemplo marcado "[Reemplaza este texto]" (T-007), Contacto con el texto de §3.2, y privacidad y condiciones con los Anexos A y B. La semilla no sobrescribe páginas que ya existan.

### 5.3 Interfaces

| Ruta | Qué hace |
|---|---|
| `/sobre-mi` | `PlantillaSobreMi` con `paginaPorSlug('sobre-mi')` y `fotosDestacadas(6)`. Estática con revalidación. |
| `/contacto` | `PlantillaContacto` con `paginaPorSlug('contacto')` y `ajustes()`. Estática con revalidación. |
| `/[slug]` | `privacidad`, `condiciones` y páginas libres. Si el `slug` está en `slugsAnteriores` de alguna página, 308 a la actual. Si no existe o está en borrador, 404. Se generan estáticas al publicar. |

Funciones nuevas en `lib/contenido.ts`:

- `paginaPorSlug(slug)` → `{ pagina }`, `{ redirigirA }` o `null` (solo publicadas para anónimos, con la regla de visibilidad de `lib/visibilidad.ts`).
- `paginasEnNavegacion()` → `{ sobreMi?: href, contacto?: href, privacidad?: href, condiciones?: href }`, usada por `Encabezado`, `MenuMovil` y `Pie`.

No hay endpoints nuevos ni escrituras públicas.

### 5.4 Componentes y estructura de código

```
src/
├── app/(sitio)/
│   ├── sobre-mi/page.tsx          # PlantillaSobreMi
│   ├── contacto/page.tsx          # PlantillaContacto
│   └── [slug]/page.tsx            # PlantillaTexto (legales y libres) + redirecciones
├── componentes/paginas/
│   ├── PlantillaSobreMi.tsx
│   ├── PlantillaContacto.tsx
│   ├── PlantillaTexto.tsx
│   ├── TextoEnriquecido.tsx        # render de Lexical con estilos de lectura y marcador {correo}
│   ├── CorreoProtegido.tsx         # componente cliente mínimo
│   └── paginas.module.css
├── colecciones/Pagina.ts           # + slugsAnteriores, contenidoActualizadoEn, validaciones, hooks
├── lib/contenido.ts                # + paginaPorSlug, paginasEnNavegacion
├── lib/rutasReservadas.ts          # lista de slugs que usa el sitio
└── semilla/paginas.ts              # textos de §3.2 y Anexos A y B
```

`Encabezado`, `MenuMovil` y `Pie` (sistema de diseño) reciben su lista de enlaces desde `paginasEnNavegacion()`; no se modifica su diseño.

### 5.5 Rendimiento y seguridad

- Páginas estáticas, sin JavaScript propio salvo `CorreoProtegido` (< 1 KB). Primera carga de `/contacto` y de las legales por debajo de 100 KB.
- La foto de perfil es un `Medio` con versiones de 480 y 1200 px (`modelo-contenido-panel` §5.1), con `prioridad` en Sobre mí (es el LCP).
- El texto enriquecido se renderiza en el servidor desde la estructura de Lexical, nunca como HTML crudo: no se puede inyectar código desde el panel.
- Enlaces externos con `rel="noopener"`; los de redes con `rel="me noopener"`.

### 5.6 Stack

Todo heredado: Next.js, Payload 3, el *serializer* de Lexical incluido en Payload y los componentes del sistema de diseño. **Nada nuevo.**

*Alternativa descartada:* un generador de políticas de privacidad en línea. Sus textos son genéricos (citan cookies, analítica y transferencias que el sitio no hace), suelen exigir una cuenta y no calzan con la Ley 21.719.

## 6. Cumplimiento normativo

Preguntas del método §8, solo lo específico de este componente:

1. **¿Trata datos personales?** Las páginas no recogen datos. Sí son el lugar donde se **informa** el tratamiento del formulario y del panel: la política del Anexo A cubre todo lo que exige `consulta-copia` §6 y `modelo-contenido-panel` §6 (registro de intentos de acceso).
2. **Normativa reverificada el 2026-10-14.** La Ley 21.719 sigue con entrada en vigencia el **1 de diciembre de 2026**: el proyecto del Ejecutivo para postergarla a 2027 seguía en el Senado y no ha sido ley ([CiberLATAM, actualizado el 6 de octubre de 2026](https://ciberlatam.com/en/news/chile-delays-personal-data-law-facb0e5c)). Bajo la Ley 21.719, el responsable responde una solicitud de derechos en **30 días corridos**, prorrogables una vez por 30 más, y el titular puede reclamar ante la Agencia de Protección de Datos Personales; los derechos son acceso, rectificación, supresión, oposición y portabilidad, más el bloqueo temporal ([Alayia Trust, *Plazos de la Ley 21.719*, modificado el 11 de septiembre de 2026](https://alayiatrust.com/blog/plazos-ley-21719)). Bajo la Ley 19.628, todavía vigente, el plazo es de **2 días hábiles**, tras el cual el titular puede recurrir al juez civil ([art. 16, Ley 19.628](https://iura.cl/19628/16)).
3. **Decisión de plazo.** La política compromete **responder dentro de 2 días hábiles**: cumple con ambas leyes, así que el texto no depende de la fecha de entrada en vigencia ni de la prórroga. Rod lo ejecuta con la acción "Datos de este correo" (`consulta-copia` §5.2.9). Si en la práctica le resulta difícil, puede cambiarse a "30 días corridos" desde que rija la Ley 21.719.
4. **Transferencia internacional.** Railway y Google pueden alojar datos fuera de Chile; la política lo dice. La región concreta la fija `plataforma/despliegue.md`, sin cambiar el texto.
5. **Cookies y rastreo.** Ninguna página agrega cookies ni terceros. Las fuentes son autoalojadas (`sistema-de-diseno` §6).
6. **Propiedad intelectual.** Las condiciones (Anexo B) dan el aviso de la Ley 17.336 y la regla de que lo publicado no es una oferta de venta, coherente con marco §7.5.
7. **Consumo.** La sección de novedades de la política incluye la baja expedita del art. 28 B de la Ley 19.496 (marco §7.5).

## 7. Elementos obsoletos

No hay código previo. Cambios a documentos aprobados que se aplican al aprobar este documento:

| Documento | Antes | Después |
|---|---|---|
| Marco 1.5 §6.1, `Pagina` | Sin `slugsAnteriores` | Agrega `slugsAnteriores` y `contenidoActualizadoEn`. |
| Marco 1.5 §6.3 | `/sobre-mi`, `/contacto`, `/[slug]` | Precisa que `/privacidad`, `/condiciones` y las páginas libres van por `/[slug]`, y que las rutas del sitio están reservadas. |
| `modelo-contenido-panel` 1.2 §5.1, `Pagina` | Sin campos ni validaciones de protección | Agrega `slugsAnteriores`, `contenidoActualizadoEn`, `reservada` y las reglas de §5.2.3 (no borrar, slug fijo, privacidad no vuelve a borrador). La semilla usa los textos de este documento. |
| `consulta-copia` 1.0 §5.1, `versionPolitica` | `updatedAt` de la política | Se toma de `contenidoActualizadoEn` (cambio menor, sin efecto en el diseño). |

## 8. Plan de acción

| # | Paso | Depende de | Terminado cuando |
|---|---|---|---|
| 1 | Agregar a `Pagina.ts` `slugsAnteriores`, `contenidoActualizadoEn`, `reservada`, las validaciones y los *hooks* de §5.2. Crear `lib/rutasReservadas.ts`. | Paso 10 de `modelo-contenido-panel` | Criterios 7 a 10 pasan. |
| 2 | `paginaPorSlug` y `paginasEnNavegacion` en `lib/contenido.ts`; conectar `Encabezado`, `MenuMovil` y `Pie`. | 1 | Criterio 6 pasa. |
| 3 | `TextoEnriquecido` y `CorreoProtegido`. | 1 | Criterio 11 pasa con y sin JavaScript. |
| 4 | `PlantillaTexto` y ruta `/[slug]` con redirecciones y 404. | 2, 3 | Criterios 4, 5 y 12 pasan. |
| 5 | `PlantillaContacto` y `/contacto`. | 2, 3 | Criterio 3 pasa. |
| 6 | `PlantillaSobreMi` y `/sobre-mi` con `fotosDestacadas(6)`. | 2, 3, `GrillaFotos` de galería | Criterios 1 y 2 pasan. |
| 7 | Semilla de páginas con §3.2 y Anexos A y B. | 1 | Criterio 13 pasa. |
| 8 | Pruebas en escritorio, móvil y navegador interno de Instagram. | 4–7 | Criterio 14 pasa. |

## 9. Criterios de aceptación y pruebas

1. En escritorio, `/sobre-mi` muestra la foto de perfil sin recorte a la izquierda (sticky) y el texto a la derecha con máx. 65 ch; en móvil, todo en una columna.
2. Sobre mí muestra hasta 6 destacadas en `GrillaFotos` que abren su ficha; sin destacadas el bloque no aparece; el cierre "Escríbeme" lleva a `/contacto` (o a `/consulta` si Contacto está en borrador).
3. `/contacto` muestra el texto, un único `Boton` primario "Escríbeme" hacia `/consulta` sin parámetros y la línea de Instagram desde `AjustesSitio.redes`. **No aparece el correo** en ningún lugar de la página ni en su HTML.
4. `/privacidad` y `/condiciones` muestran título, "Actualizada el <fecha>" y el texto con h2 anclables.
5. Una página libre publicada se ve en `/<slug>`; en borrador da 404; tras renombrarla, la URL anterior responde 308 a la nueva.
6. Con Sobre mí en borrador, no aparece en encabezado ni menú móvil; con Contacto, Privacidad o Condiciones en borrador, no aparecen en el pie.
7. Las páginas reservadas no se pueden borrar ni cambiar su `slug` desde el panel ni desde la API.
8. `privacidad` no se publica sin `correoContacto` y, una vez publicada, no vuelve a borrador.
9. Una página libre no acepta un `slug` reservado por el sitio.
10. Cambiar solo el `estado` de la política no cambia la fecha visible ni la `versionPolitica` de las consultas nuevas; cambiar el texto sí.
11. `{correo}` se muestra como enlace `mailto:` con JavaScript, y como "usuario [arroba] dominio" sin JavaScript; el correo completo no aparece literal en el HTML del servidor.
12. Una página con contenido malicioso escrito en el panel (por ejemplo, `<script>` pegado como texto) se muestra como texto, sin ejecutarse.
13. Tras la semilla existen las cuatro páginas en borrador con sus textos; volver a ejecutar la semilla no las sobrescribe.
14. Lighthouse en móvil: accesibilidad ≥ 95 en las cuatro páginas, sin saltos de diseño (CLS < 0,1), y prueba manual en el navegador interno de Instagram en iOS y Android.

## 10. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| PG-01 | Los textos legales no los revisa un abogado y omiten algo exigible. | Media | Medio | Se redactan desde lo aprobado y la normativa verificada; se reverifican en cada componente que trate datos y antes del 1 de diciembre de 2026. Revisión profesional queda disponible si Rod la pide (categoría `negocio`). |
| PG-02 | Rod no alcanza a responder una solicitud de derechos en 2 días hábiles. | Baja | Medio | Las solicitudes serán raras; "Datos de este correo" resuelve en minutos. Si se vuelve un problema, se cambia a 30 días corridos cuando rija la Ley 21.719 (§6.3). |
| PG-03 | Sin correo visible en Contacto, alguien que no quiere usar formularios no escribe. | Baja | Bajo | Decisión de Rod. Queda Instagram como canal alternativo. |
| PG-04 | Rod edita la política y deja de reflejar lo que hace el sitio (por ejemplo, al agregar analítica en v1.x). | Media | Medio | Regla del marco §7.4: un componente que agregue terceros o cookies marca el marco para revisión y actualiza el Anexo A. |
| PG-05 | Lanzar con "Sobre mí" en borrador deja el sitio sin presentación. | Media | Bajo | El enlace se oculta y el sitio no se rompe; `plataforma/despliegue.md` lo incluye en la lista de lanzamiento (T-007). |

## 11. Decisiones abiertas y tareas del dueño

**Decisiones de Rod en este documento:** Contacto como página breve con botón hacia la consulta; Sobre mí cierra con destacadas y "Escríbeme"; textos legales completos en la semilla, sin revisión de abogado; páginas libres sin menú; Contacto sin el correo a la vista.

**Decisiones abiertas:** ninguna que bloquee la implementación.

**Tareas del dueño:**

- **T-007** (`contenido`, ya existe): escribir el texto de "Sobre mí" y elegir la foto de perfil. Bloquea el lanzamiento, no la implementación.
- No nacen tareas nuevas: revisar los Anexos A y B es parte de aprobar este documento.

## 12. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 2026-10-14 | Borrador inicial. Decisiones de Rod: Contacto como página breve con botón "Escríbeme" hacia `/consulta`; Sobre mí con foto de perfil, texto, 6 destacadas y "Escríbeme"; textos legales completos en la semilla; páginas libres en `/[slug]` sin menú; Contacto sin correo visible. Ley 21.719 y Ley 19.628 reverificadas el 2026-10-14; plazo de respuesta de 2 días hábiles. |

---

## Anexo A · Texto inicial de la política de privacidad

> Se carga en la semilla como contenido de la `Pagina` `privacidad`. `{correo}` se reemplaza al mostrarse (§5.2.6). Rod puede editarlo desde el panel.

**Título:** Política de privacidad

En este sitio muestro mis fotografías y recibo consultas de quienes quieren una copia impresa o simplemente escribirme. Aquí te cuento qué datos pido, para qué los uso y cómo puedes decidir sobre ellos.

**Quién es responsable**

Rod Díaz. Puedes escribirme a {correo} para cualquier tema de esta política.

**Qué datos pido y para qué**

Cuando envías una consulta te pido tu nombre y tu correo, y de forma opcional tu teléfono, tu ciudad (para estimar el envío) y un mensaje. También guardo las fotos, tamaños y papeles que elegiste. Uso estos datos solo para responder tu consulta, y al enviarla aceptas que te contacte por correo, teléfono u otro medio que me hayas indicado para ese fin.

Si además marcas la casilla de novedades, guardo tu nombre y tu correo para enviarte, de vez en cuando, fotos y colecciones nuevas y promociones de copias. Es opcional: tu consulta no depende de esa casilla.

No guardo tu dirección IP ni uso cookies de rastreo, analítica de visitas ni publicidad.

**Por qué puedo tratarlos**

Porque tú lo autorizas al enviar el formulario. Puedes retirar tu autorización cuando quieras escribiéndome a {correo}, tan fácil como la diste.

**Cuánto tiempo los guardo**

- Consultas: 12 meses desde el último contacto contigo. Después se borran de forma automática.
- Mensajes marcados como spam: 30 días.
- Novedades: hasta que pidas la baja.

**Con quién se comparten**

No vendo ni cedo tus datos. Solo los procesan dos servicios que uso para operar el sitio:

- **Railway**, que aloja el sitio y su base de datos.
- **Google (Gmail)**, desde donde respondo las consultas y envío las novedades.

Sus servidores pueden estar fuera de Chile, así que tus datos pueden almacenarse o transmitirse en el extranjero bajo las condiciones de seguridad de esos proveedores.

**Tus derechos**

Puedes pedirme acceder a tus datos, corregirlos, borrarlos, oponerte a su uso, recibirlos en un formato que puedas llevarte o bloquearlos temporalmente. Escríbeme a {correo} desde el correo con el que enviaste la consulta y te respondo dentro de 2 días hábiles. Si no recibes respuesta o no estás de acuerdo con ella, puedes reclamar ante la autoridad que corresponda según la ley vigente.

**Novedades y promociones**

Solo las recibes si marcaste la casilla. Para darte de baja basta con responder cualquiera de esos correos o escribirme a {correo}, y dejo de enviártelos desde ese momento. También respeto las solicitudes hechas a través del registro "No Molestar" del Sernac.

**Acceso al panel del sitio**

Por seguridad, si alguien intenta entrar al panel de administración con una cuenta no autorizada, guardo el correo usado y la fecha durante 90 días.

**Seguridad**

El sitio funciona solo con conexión cifrada (HTTPS) y únicamente yo tengo acceso al panel donde se ven las consultas.

**Cambios a esta política**

Si cambio esta política, la fecha de actualización arriba lo indica. Cada consulta guarda la versión que aceptaste.

## Anexo B · Texto inicial de las condiciones de uso

> Se carga en la semilla como contenido de la `Pagina` `condiciones`. Rod puede editarlo desde el panel.

**Título:** Condiciones de uso

**Las fotografías**

Todas las fotografías de este sitio son obra de Rod Díaz y están protegidas por la Ley 17.336 de Propiedad Intelectual. Todos los derechos reservados.

No está permitido descargarlas, copiarlas, reproducirlas, modificarlas, publicarlas en otros sitios o redes, usarlas con fines comerciales ni usarlas para entrenar sistemas de inteligencia artificial sin mi autorización por escrito.

Sí puedes compartir el enlace a una foto o a una colección: me encanta que lo hagas.

Si quieres usar una foto para un proyecto, una publicación o una marca, escríbeme desde la página de contacto y lo conversamos.

**Las copias impresas**

Lo que ves en el sitio no es una oferta de venta: los tamaños y papeles indican lo que se puede pedir. Cada copia se conversa uno a uno: te respondo con el valor, el plazo y la forma de envío antes de que decidas.

Los colores en pantalla dependen de cada dispositivo, así que la copia impresa puede verse algo distinta.

**El sitio**

Hago lo posible por que el sitio funcione siempre y la información esté al día, pero puede tener interrupciones o errores. Puedo cambiar estas condiciones; la fecha de actualización arriba lo indica.

Para cualquier duda, escríbeme desde la página de contacto.

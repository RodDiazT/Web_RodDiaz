# Despliegue y dominio

| Campo | Valor |
|---|---|
| Ruta | `DocumentosTecnicos/plataforma/despliegue.md` |
| Tipo | Transversal |
| Versión | 1.4 |
| Estado | Aprobado |
| Fecha | 2026-10-22 |
| Padre | `marco-general/marco-general-proyecto.md` (1.10) |
| Dependencias | `contenido/modelo-contenido-panel.md` (1.8), `plataforma/seo.md` (1.1) |
| Versión del producto | v1.0 (el dominio propio y la difusión quedan en v1.x) |

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

Este documento define cómo el sitio pasa del código a estar público en Railway, cómo se mantiene vivo y cómo se recupera si algo falla. Lo usan dos actores:

- **Administrador (Rod).** Necesita que el sitio esté arriba sin pensar en servidores, que un cambio no rompa lo publicado, que su contenido no se pierda y que el costo no lo sorprenda.
- **Visitante.** No ve este componente, pero sufre si falla: un sitio caído, lento o con fotos rotas al llegar desde Google.

Hereda del marco general el stack (§6.6: un solo servicio Next.js + Payload 3, PostgreSQL y volumen de imágenes en la cuenta Railway de Rod, plan Pro), la seguridad (§6.5), el acceso al panel solo con Google y su script de recuperación (§3), y los riesgos R-02 (costo) y R-03 (pérdida de datos). Resuelve la decisión D-02 (respaldos) y la tarea T-004 (límite de gasto).

**Resultado esperado:** un proyecto Railway `web-roddiaz` con dos entornos (**producción** y **pruebas**). Cada cambio de código llega primero a pruebas. Producción se actualiza solo cuando se promueve a mano, después de revisarlo. Hay respaldos diarios automáticos y una copia mensual fuera de Railway que Rod descarga con un botón del panel. El costo se estima por debajo de lo que el plan Pro ya incluye y hay un tope de gasto. Al final está la lista de lanzamiento.

**Lanzamiento y difusión (decisión de Rod).** La v1.0 se **lanza** en el subdominio de Railway, abierta a Google, pero **no se difunde** (Instagram, enlaces compartidos) hasta tener dominio propio en la v1.x. Así el sitio se prueba con uso real y empieza a indexarse, sin repartir enlaces que después cambiarán.

## 2. Alcance

**Incluye (v1.0)**

- Proyecto Railway `web-roddiaz` en el workspace "roddiazt's Projects", región **US East Metal (Virginia)**, la más cercana a Chile.
- Dos entornos: `production` (público, indexable) y `pruebas` (público, no indexable, se duerme sin uso).
- Servicios por entorno: `sitio` (Next.js + Payload, con el volumen `medios`) y `postgres` (con su volumen).
- Configuración como código (`railway.json`): compilación, migraciones antes de desplegar, chequeo de salud, reinicio ante fallas y rutas que disparan un despliegue.
- Disparo: push a `main` con cambios de código → despliegue automático en pruebas. Producción, solo promoción manual.
- Variables de entorno y secretos por entorno.
- Respaldos: automáticos de Railway (base diaria y semanal, imágenes semanal) y **descarga de respaldo desde el panel**, con aviso si pasan más de 30 días.
- Script de recuperación de acceso al panel si Google no está disponible (marco §3).
- Chequeo de salud `GET /api/salud` y calentamiento de páginas tras cada inicio.
- Estimación de costo, aviso de gasto en USD 25 y tope en USD 40 (T-004).
- Lista de lanzamiento verificable.
- Procedimiento documentado para el cambio a dominio propio (se ejecuta en la v1.x).

**No incluye**

- Compra y configuración del dominio y difusión: v1.x (procedimiento en §5.2.12, tarea T-012). La redirección por host ya la deja lista `plataforma/seo.md` §5.2.4.
- CDN o proxy delante de Railway (por ejemplo, Cloudflare): v1.x, junto con el dominio.
- Monitoreo externo de disponibilidad (UptimeRobot u otro): v1.x, si hace falta.
- Réplicas o varias regiones: el volumen solo se monta en una instancia y el tráfico no lo justifica.
- Integración continua con pruebas automáticas en GitHub Actions: no se pide y suma una pieza. Las pruebas corren en local antes del push (§5.2.3).
- Canónicas, sitemap, `robots.txt`, `X-Robots-Tag`, host único y Search Console: los define `plataforma/seo.md`. Este documento fija los valores de `URL_SITIO` y `ENTORNO` que esas reglas usan.

## 3. Flujo de usuario y UX/UI cuestionado

Este componente casi no tiene interfaz pública. Sus flujos son de Rod y de quien implementa (Claude Code), y una tarjeta nueva en el panel.

### 3.1 Un cambio de código llega al sitio

1. Claude Code termina un paso, corre las pruebas en local y hace push a `main`.
2. Si el push cambia código (no solo `DocumentosTecnicos/`), Railway compila y despliega **pruebas** sola. Un push que solo toca documentos no despliega nada.
3. Claude Code revisa pruebas: chequeo de salud, las rutas del criterio que corresponda y los registros del servicio.
4. Claude Code le avisa a Rod qué cambió y le pide el visto bueno para producción, con un enlace a pruebas.
5. Con el sí de Rod, Claude Code **promueve**: despliega en producción exactamente el commit revisado en pruebas. Railway corre las migraciones, levanta la versión nueva, verifica `/api/salud` y recién entonces deja de servir la anterior… salvo el corte breve que impone el volumen (§4).
6. Si algo sale mal en producción, se vuelve al despliegue anterior con el *rollback* de Railway (disponible 120 horas en el plan Pro).

**Cuándo promover:** fuera de los momentos en que Rod está subiendo fotos y, de preferencia, de noche, porque el despliegue con volumen corta el sitio unos segundos.

### 3.2 Descargar un respaldo (tarjeta del panel)

Se agrega una tarjeta **Respaldo** a la portada del panel (`contenido/modelo-contenido-panel.md` §3.4), después de *Fotos en borrador*:

```
┌ Respaldo ───────────────────────────────────┐
│ Último respaldo descargado: hace 12 días    │
│ Espacio de imágenes: 0,8 de 5 GB            │
│                         [ Descargar respaldo ] │
└─────────────────────────────────────────────┘
```

- Estados del texto: nunca → "Aún no descargas un respaldo"; 30 días o menos → "hace N días"; más de 30 → en `--color-aviso`, "Han pasado N días desde tu último respaldo".
- Al presionar **Descargar respaldo** se abre un `<dialog>` breve: "Este archivo tiene tu contenido y los datos de quienes te escribieron. Guárdalo en un lugar seguro, por ejemplo tu Google Drive, y borra el anterior." Botones: *Descargar* y *Cancelar*.
- *Descargar* genera el archivo `respaldo-roddiaz-AAAA-MM-DD.json.gz` (unos pocos MB). Mientras se genera, el botón dice "Preparando…" y queda deshabilitado. Al terminar, el navegador lo descarga y la tarjeta pasa a "hace 0 días".
- Error: "No se pudo preparar el respaldo. Inténtalo de nuevo en unos minutos." No cambia la fecha del último respaldo.
- Espacio de imágenes: en `--color-aviso` desde el 80 % del volumen.
- El archivo **no trae las imágenes**: estas están en los respaldos de Railway y Rod tiene sus originales (§5.2.7).

### 3.3 Recuperar el acceso al panel

Si Google no deja entrar (cliente OAuth roto, cambio de Google, cuenta bloqueada):

1. Rod le pide a Claude Code (o a este asistente con acceso a la terminal) que genere un enlace de acceso.
2. Se ejecuta, dentro del servicio `sitio` de producción (`railway ssh`), el script `recuperar-acceso`. Imprime un enlace de un solo uso válido por 15 minutos: `https://<sitio>/admin/recuperar?token=…`.
3. Rod abre el enlace, entra al panel como su `Usuario` y la sesión dura lo normal. El enlace usado o vencido muestra "Este enlace ya no sirve. Pide uno nuevo." y lleva a `/admin`.
4. El uso queda en el registro del servicio. Para ejecutar el script hay que tener acceso a la cuenta Railway de Rod: ese es el control.

### 3.4 Visitante

- No ve diferencia entre entornos. Pruebas existe en una dirección propia (`roddiaz-pruebas.up.railway.app`), no indexable, con datos de prueba.
- En un despliegue de producción puede ver durante segundos la página de error de Railway. Se acepta (§10, DS-03).
- La primera visita a una página después de un despliegue la genera el servidor; el calentamiento tras el inicio (§5.2.6) hace que eso le pase al propio sitio y no a un visitante en las rutas principales.

### 3.5 Objeciones planteadas al flujo y su resolución

| # | Objeción | Resolución |
|---|---|---|
| O-1 | Lanzar en el subdominio y compartirlo en Instagram reparte enlaces que se rompen al llegar el dominio. | Rod decide lanzar **sin difundir** hasta tener dominio. Al cambiar, el subdominio redirige con 301 al dominio, ruta por ruta (`seo` §5.2.4; procedimiento en §5.2.12). |
| O-2 | Indexar el subdominio hace que Google guarde URLs que van a cambiar. | Rod prefiere indexar desde ya (también decidido en `seo`). La redirección 301 y el cambio de dirección de Search Console trasladan la indexación. Se acepta un periodo de transición (DS-06). |
| O-3 | Documentos y código comparten `main`: cada commit de documentos reiniciaría el sitio y su contador antispam. | Rutas de vigilancia (`watchPatterns`): solo cambios de código disparan despliegue. |
| O-4 | Sin ramas, un entorno de pruebas no sirve si producción también se actualiza sola. | Pruebas automático y producción con despliegue automático **desactivado**; se promueve a mano el commit revisado. |
| O-5 | Un segundo entorno casi duplica el consumo. | Pruebas en modo *Serverless* (se duerme a los 5 a 10 minutos sin tráfico), sin tareas programadas y sin conexiones abiertas a la base. Costo estimado de 1 a 2 USD al mes (§5.5). |
| O-6 | Copiar la base de producción a pruebas para probar con datos reales pone consultas reales en un sitio público de prueba. | Prohibido. Pruebas usa la semilla y las fotos de prueba de Rod (T-013). |
| O-7 | Los respaldos de Railway viven en la misma cuenta: si se pierde la cuenta, se pierde todo. | Descarga mensual desde el panel, con aviso a los 30 días. |
| O-8 | Un respaldo descargado con consultas guardado para siempre en el computador de Rod rompe el plazo de conservación de la política. | El diálogo pide borrar el anterior; la política dice que los respaldos pueden conservar un dato borrado hasta 45 días (§6). |
| O-9 | La compilación en Railway no alcanza la red privada de la base: generar las fichas durante la compilación obligaría a abrir la base a internet. | La compilación no se conecta a la base. Las páginas se generan al primer pedido y quedan en caché; el calentamiento cubre las principales (§5.2.6). |
| O-10 | Un tope de gasto alcanzado detiene **todos** los proyectos del workspace, no solo el sitio. | Aviso en USD 25 (apenas se supera lo incluido) y tope en USD 40, con margen sobre la estimación (§5.5). |

## 4. Casos borde

| Caso | Resolución |
|---|---|
| La compilación falla en pruebas | Pruebas queda en el despliegue anterior y producción no se toca. Claude Code lee el registro, corrige y vuelve a hacer push. |
| Una migración falla | El comando previo al despliegue (`payload migrate`) termina con error y Railway no levanta la versión nueva. El sitio sigue con la anterior. |
| La versión nueva no responde el chequeo de salud | Railway no la pone en servicio (espera hasta 120 s) y mantiene la anterior. |
| Un error aparece en producción después de promover | *Rollback* al despliegue anterior desde Railway. Por eso las migraciones son **solo aditivas** (§5.2.4). |
| Corte durante un despliegue con volumen | El volumen se monta en una sola instancia: Railway detiene la anterior antes de iniciar la nueva y hay segundos sin servicio. Se promueve de noche y no mientras Rod sube fotos. |
| Rod sube fotos durante un despliegue | La subida en curso falla y la foto no se crea (regla del modelo de contenido: no quedan registros sin imagen). Rod la vuelve a subir. |
| Primera visita a pruebas dormida | Puede tardar unos segundos o devolver un 502 una vez; recargar basta. |
| Push que solo cambia documentos | No despliega en ningún entorno. |
| Push que cambia código y documentos | Despliega pruebas (lo que importa es que cambió código). |
| Volumen de imágenes casi lleno | La tarjeta *Respaldo* lo marca desde el 80 %. Railway permite agrandar el volumen en vivo en el plan Pro; se agranda de a 5 GB. |
| Volumen lleno al subir | La subida falla con mensaje y la foto no se crea (modelo de contenido §4). |
| Se pierde la base de producción | Se restaura el respaldo diario más reciente de Railway (pestaña *Backups* del servicio `postgres`). Se pierde como máximo un día de cambios. |
| Se pierde el volumen de imágenes | Se restaura el respaldo semanal de Railway. Las fotos subidas después se vuelven a subir desde los originales de Rod con "Reemplazar archivo". |
| Se pierde todo el proyecto o la cuenta Railway | Proyecto nuevo con este documento, `restaurar-respaldo` con el último archivo descargado y resubida de las fotos desde los originales (§5.2.7). |
| Restaurar un respaldo de Railway en otro entorno | Railway solo restaura en el mismo proyecto y entorno. Para pruebas no se usa (O-6). |
| Google no deja entrar al panel | Script de recuperación (§3.3). |
| Se alcanza el tope de gasto | Railway detiene los servicios del workspace. Rod sube el tope o revisa qué consumió; el sitio vuelve al reanudar. El aviso en USD 25 llega antes. |
| El subdominio `roddiaz` no está disponible | Se usa `rod-diaz` y, si tampoco, `roddiaz-fotos`. `URL_SITIO` se ajusta y el cliente OAuth recibe la URI nueva. |
| Contador antispam en memoria tras un despliegue | Se reinicia (riesgo CC-05 de `consulta-copia`); como solo se promueve a mano, ocurre pocas veces. |
| Hora de las tareas diarias | El servidor corre en UTC (`TZ=UTC`); la tarea de borrado se programa en America/Santiago como define `consulta-copia`, por lo que el cambio de horario de Chile no la mueve. |
| El enlace de recuperación se filtra | Sirve una sola vez y por 15 minutos; generar uno nuevo anula el anterior. |
| Respaldo descargado con un formato antiguo | El archivo trae `versionEsquema`; `restaurar-respaldo` lo rechaza si es de una versión que no sabe restaurar y lo dice. |

## 5. Especificación técnica

### 5.1 Modelo de datos

Cambios a entidades del marco (§6.1), que el marco absorbe al aprobar este documento (§7):

**`AjustesSitio`**

| Campo | Tipo | Notas |
|---|---|---|
| `ultimoRespaldoEn` | fecha (instante UTC), opcional | Se escribe solo al terminar una descarga de respaldo. Solo lectura en el panel; oculto en la edición de ajustes. |
| `supresionesRecientes` | lista de `{ resumen (SHA-256 del correo en minúsculas), fecha }` | Se agrega una entrada con cada "Borrar todas" de `consulta-copia`; la tarea diaria quita las de más de 45 días. Oculto en el panel. Sirve para repetir supresiones tras restaurar un respaldo (§6). |

**`Usuario`**

| Campo | Tipo | Notas |
|---|---|---|
| `recuperacionHash` | texto, opcional | SHA-256 del token de recuperación vigente. Nunca se guarda el token. Oculto en el panel. |
| `recuperacionVence` | fecha (instante UTC), opcional | 15 minutos después de generarlo. Al usarlo, ambos campos se vacían. |

No hay entidades nuevas. El archivo de respaldo no es una entidad: se genera y se entrega, y no queda copia en el servidor.

### 5.2 Reglas de negocio específicas

1. **Proyecto y región.** Proyecto `web-roddiaz` en el workspace "roddiazt's Projects", región `us-east4-eqdc4a` (US East Metal, Virginia) para todos los servicios y volúmenes de ambos entornos.
2. **Entornos.**

   | | `production` | `pruebas` |
   |---|---|---|
   | Dirección | `roddiaz.up.railway.app` | `roddiaz-pruebas.up.railway.app` |
   | Despliegue | **Manual** (despliegue automático desactivado) | Automático con push a `main` que cambia código |
   | `ENTORNO` | `produccion` (indexable) | `pruebas`: `robots.txt` excluye todo y toda respuesta lleva `X-Robots-Tag: noindex` (`seo` §4) |
   | *Serverless* (dormir sin uso) | No | Sí, en `sitio` y `postgres` |
   | Tareas programadas | Sí (`TAREAS_AUTOMATICAS=true`) | No |
   | Datos | Reales | Semilla y fotos de prueba (T-013). Nunca una copia de producción |
   | Respaldos de Railway | Sí (§5.2.7) | No |
   | Recursos máximos de `sitio` | 2 GB de RAM, 2 vCPU | 1 GB de RAM, 1 vCPU |

   Los máximos son topes: se cobra lo que se usa. Los 2 GB en producción cubren el pico de procesar un JPG de 45 MP con `sharp` en serie (modelo de contenido §5.5, criterio 21). En `pruebas` (1 GB de RAM), para evitar saturación de memoria durante la ingesta de fotos de prueba de 45 MP (T-013), se aplica `sharp.concurrency(1)` y AVIF `effort: 3`.
3. **Disparo de despliegues (Exclusivo vía Git / GitHub).** El servicio `sitio` en Railway está conectado de forma obligatoria y permanente al repositorio oficial de GitHub `RodDiazT/Web_RodDiaz`. Todos los despliegues en Railway se originan **única y exclusivamente mediante commits en Git (`git push` a `main`, etiquetados en Railway como `via GitHub`)**. Queda expresamente vetado el despliegue manual aislado por terminal (`railway up` / `via CLI`), garantizando trazabilidad absoluta, paridad 1:1 entre el historial de Git y los entornos desplegados, y evitando desincronizaciones silenciosas. Adicionalmente, `railway.json` define `watchPatterns` con las rutas de código (`src/**`, `public/**`, `scripts/**`, `package.json`, el *lockfile*, `next.config.*`, `tsconfig.json`, `railway.json`). Un cambio solo en `DocumentosTecnicos/`, `README.md` o `CLAUDE.md` no dispara despliegue innecesario. Antes de cada push con código, se compila y corren las pruebas unitarias en local.
4. **Migraciones.** En producción y pruebas la base se modifica solo con migraciones de Payload versionadas en `src/migraciones/`, ejecutadas por el comando previo al despliegue (`payload migrate`). El modo *push* automático de esquema queda solo para desarrollo local. Las migraciones son **aditivas**: una columna se quita en dos promociones (primero deja de usarse, después se borra), para que el *rollback* siempre funcione con la base ya migrada.
5. **Promoción a producción.** Se despliega en producción el **mismo commit** que está corriendo en pruebas y pasó su revisión, con el visto bueno de Rod en el chat. Se hace con la CLI o la herramienta de Railway ("desplegar commit"). Cada promoción se anota en `_ESTADO_PROYECTO.md` cuando cambia algo visible.
6. **Compilación sin base y calentamiento.** Durante la compilación (`NEXT_PHASE = phase-production-build`) ninguna página consulta la base: los `generateStaticParams` devuelven una lista vacía y las rutas dinámicas se generan al primer pedido (`dynamicParams = true`) y quedan en caché con las mismas etiquetas de revalidación. Al iniciar el servidor, `instrumentation.ts` espera 5 segundos, invoca primero `/api/salud` con `User-Agent: Web_RodDiaz_Warmup/1.0` (lo que purga cualquier caché estática generada sin base durante `next build`) y luego pide en local `/`, `/fotos`, `/colecciones`, `/sobre-mi`, `/contacto` y las fichas de las fotos destacadas, para que las genere el propio sitio con datos reales de PostgreSQL y no el primer visitante. Si el calentamiento falla, se registra y el sitio sigue.
7. **Respaldos.**

   | Qué | Cómo | Frecuencia | Se conserva |
   |---|---|---|---|
   | Base de producción (volumen de `postgres`) | Respaldo programado de Railway | Diario y semanal | 6 días (diario) y 27 días (semanal) |
   | Imágenes de producción (volumen `medios`) | Respaldo programado de Railway | Semanal | 27 días |
   | Contenido y consultas fuera de Railway | Botón *Descargar respaldo* del panel | Mensual (aviso a los 30 días) | Rod guarda solo el último |

   - No se usa el respaldo mensual de Railway para la base (89 días), para no conservar datos borrados más allá de lo que dice la política (§6).
   - El archivo descargado es JSON comprimido: `manifiesto` (`fecha`, `commit`, `versionEsquema`, conteos por colección), todas las colecciones de contenido (`Foto`, `Coleccion`, `Caracteristica`, `FormatoImpresion`, `TipoPapel`, `Pagina`, `Medio`), `Consulta`, `Suscriptor`, `Usuario` (sin campos de recuperación) y el global `AjustesSitio`. Las fotos y medios van con sus metadatos y nombres de archivo, **sin imágenes**. Excluye `IntentoAcceso` y las tablas internas de Payload (sesiones, preferencias, cola de trabajos).
   - `restaurar-respaldo` carga un archivo solo en una base **vacía** (se niega si encuentra datos) y conserva los `id`. Luego Rod vuelve a subir cada foto desde su original con "Reemplazar archivo", que regenera las versiones sin tocar los datos.
   - La prueba de restauración (criterio 12) se hace en local y la base local se borra al terminar, porque el archivo tiene datos personales.
8. **Chequeo de salud.** `GET /api/salud` responde `200 { "estado": "ok" }` si la base responde a `SELECT 1` en menos de 2 s y el volumen de medios se puede leer; si no, `503 { "estado": "falla" }`. No revela versiones, rutas ni errores. Railway lo usa para dar por bueno un despliegue y reinicia el servicio si cae (hasta 5 reintentos).
9. **Pruebas que se duerme.** En `pruebas`: `NEXT_TELEMETRY_DISABLED=1`, conexiones a la base con cierre por inactividad (60 s) y sin tareas automáticas de Payload; si no, el servicio nunca dejaría de enviar tráfico y no se dormiría. `NEXT_TELEMETRY_DISABLED=1` también en producción.
10. **Límite de gasto (T-004).** En *Usage Limits* del workspace: aviso por correo en **USD 25** y tope en **USD 40**. Lo configura Rod, porque está en la facturación.
11. **Recuperación de acceso.** `scripts/recuperar-acceso.ts` toma el primer correo de `CORREOS_ADMIN`, busca su `Usuario` (si no existe, lo crea con ese correo), genera un token aleatorio de 32 bytes, guarda su hash y vencimiento (15 min), imprime el enlace con `URL_SITIO` y deja una línea en el registro ("Enlace de recuperación generado para <correo>"). La ruta `/admin/recuperar` valida el token, vacía los campos, abre la sesión de Payload y redirige a `/admin`. No hay otra forma de entrar sin Google.
12. **Cambio a dominio propio (procedimiento para la v1.x, no se ejecuta en la v1.0).**
    1. Rod compra el dominio `.cl` (T-012) y configura el DNS con la guía del asistente (o le da acceso).
    2. Se agrega el dominio al servicio `sitio` de producción en Railway y se crean los registros que Railway indique; se espera el certificado.
    3. **Antes** de cambiar `URL_SITIO`, se agregan al cliente OAuth de Google la URI de redirección y el origen del dominio (conservando los del subdominio), para que el panel funcione en ambos durante el cambio.
    4. `URL_SITIO` pasa a `https://<dominio>` y se promueve producción. Desde ese momento el host único de `seo` §5.2.4 responde 301 desde el subdominio, ruta por ruta, sin cambiar código.
    5. Search Console: propiedad del dominio y "Cambio de dirección" (`seo` §5.2.4).
    6. El subdominio **se mantiene activo redirigiendo al menos 12 meses** (riesgo SEO-01). Las URI del subdominio se quitan del cliente OAuth al mes.
    7. Recién entonces se difunde en Instagram.

### 5.3 Interfaces

| Interfaz | Tipo | Contrato |
|---|---|---|
| `GET /api/salud` | Ruta de Next.js, pública | §5.2.8. Sin caché (`Cache-Control: no-store`). **Excepción del host único** de `seo` §5.2.4: el chequeo de Railway llega con un host interno y no se redirige. |
| `POST /api/respaldo` | Ruta de Next.js, solo `Usuario` con sesión | Responde el archivo como descarga (`Content-Disposition: attachment; filename="respaldo-roddiaz-AAAA-MM-DD.json.gz"`, `Content-Type: application/gzip`), generado en *stream*. Al terminar, escribe `AjustesSitio.ultimoRespaldoEn`. Sin sesión: `401`. Máximo una generación a la vez. |
| `GET /admin/recuperar?token=` | Ruta de Next.js | §5.2.11. Token válido → sesión y redirección a `/admin`. Inválido o vencido → página "Este enlace ya no sirve". |
| `pnpm recuperar-acceso` | Script, ejecutado con `railway ssh` en producción | Imprime el enlace (§3.3). |
| `pnpm restaurar-respaldo --archivo <ruta>` | Script, local o en un proyecto nuevo | §5.2.7. |
| `railway.json` | Configuración como código | §5.4. |
| Variables de entorno | Railway, por entorno | Tabla de §5.5. |

### 5.4 Componentes y estructura de código

```
Web_RodDiaz/
├── railway.json                       # compilación, watchPatterns, migraciones, salud, reinicio, ajustes por entorno
├── .env.ejemplo                       # nombres de variables con valores de ejemplo, sin secretos
├── scripts/
│   ├── recuperar-acceso.ts
│   └── restaurar-respaldo.ts
└── src/
    ├── instrumentation.ts             # calentamiento al iniciar (§5.2.6)
    ├── middleware.ts                  # host único y robots por entorno: lo define `seo`; aquí solo la excepción de /api/salud
    ├── migraciones/                   # migraciones de Payload
    ├── lib/
    │   ├── respaldo.ts                # arma el JSON comprimido en stream
    │   └── entorno.ts                 # lectura validada de variables (falla al iniciar si falta una)
    ├── app/
    │   ├── api/salud/route.ts
    │   ├── api/respaldo/route.ts
    │   └── (payload)/admin/recuperar/ # validación del token
    └── componentes/admin/
        └── TarjetaRespaldo.tsx         # tarjeta del dashboard (§3.2)
```

**`railway.json` (forma esperada).** Claude Code valida los nombres de campo contra la referencia vigente de Railway (`https://railway.com/railway.schema.json`) antes de usarlo:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "watchPatterns": ["src/**", "public/**", "scripts/**", "package.json", "pnpm-lock.yaml", "next.config.*", "tsconfig.json", "railway.json"]
  },
  "deploy": {
    "preDeployCommand": ["pnpm payload migrate"],
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/salud",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  },
  "environments": {
    "pruebas": { "deploy": { "sleepApplication": true } }
  }
}
```

El gestor de paquetes y su *lockfile* son los que elija la implementación base (marco §9.2, paso 1); el ejemplo usa `pnpm`. La región, los recursos máximos, el despliegue automático desactivado de producción y los respaldos programados se fijan en la configuración del servicio en Railway y se verifican con el criterio 1.

### 5.5 Rendimiento y seguridad

**Variables de entorno**

| Variable | `production` | `pruebas` | Secreto |
|---|---|---|---|
| `DATABASE_URL` | Referencia `${{postgres.DATABASE_URL}}` (red privada) | Ídem, su propia base | Sí |
| `PAYLOAD_SECRET` | Aleatoria de 32 bytes | **Distinta** a la de producción | Sí |
| `CORREOS_ADMIN` | `rodrigodiaztapia@gmail.com` | Ídem | No |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Cliente OAuth de T-008 | El mismo cliente, con la URI de pruebas también autorizada | Sí (el secreto) |
| `URL_SITIO` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` (en la v1.x, el dominio) | Ídem, su dirección | No |
| `RUTA_MEDIOS` | `${{RAILWAY_VOLUME_MOUNT_PATH}}` | Ídem | No |
| `ENTORNO` | `produccion` | `pruebas` | No |
| `TAREAS_AUTOMATICAS` | `true` | `false` | No |
| `NEXT_TELEMETRY_DISABLED` | `1` | `1` | No |
| `TZ` | `UTC` | `UTC` | No |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram (`@BotFather`, T-014) | Opcional (o token de pruebas) | Sí |
| `TELEGRAM_CHAT_ID` | ID de chat o canal de Telegram para avisos | Opcional | Sí |

`src/lib/entorno.ts` valida al iniciar que existan las variables obligatorias; si falta una, el servicio no arranca y el chequeo de salud impide que la versión entre en servicio. Las variables de Telegram (`TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`) son opcionales: si no se configuran, las consultas se guardan normalmente sin disparar notificación push. Los secretos se cargan con la herramienta de Railway o la CLI, nunca en el repositorio; `.env.ejemplo` solo trae los nombres.

**Seguridad**

- `postgres` sin proxy TCP público: solo se alcanza por la red privada del proyecto.
- El volumen de medios no se lista: las imágenes se sirven solo desde la ruta de medios de Payload (marco §6.5).
- `POST /api/respaldo` exige sesión de Rod; el archivo se genera en *stream* y no se escribe en el volumen ni en `/tmp`.
- El token de recuperación es de un solo uso, 15 minutos y guardado como hash.
- Las cabeceras de seguridad del marco (§6.5) las agrega `next.config` en ambos entornos.
- Producción y pruebas tienen `PAYLOAD_SECRET` distintos: una sesión de pruebas no sirve en producción.

**Rendimiento**

- Imágenes con `Cache-Control: public, max-age=31536000, immutable`, porque cada versión tiene nombre único; el navegador no las vuelve a pedir.
- Calentamiento tras cada inicio (§5.2.6).
- Railway recibe el tráfico en el punto de entrada más cercano al visitante y lo lleva a Virginia. Desde Chile se espera del orden de 120 a 150 ms de latencia de red; con páginas en caché y fotos optimizadas no compromete el LCP < 2,5 s del marco. Un CDN delante (Cloudflare con el dominio) queda para la v1.x.

**Costo estimado (precios de Railway verificados el 2026-10-14: RAM USD 10/GB-mes, CPU USD 20/vCPU-mes, volumen USD 0,15/GB-mes, egreso USD 0,05/GB)**

| Concepto | Supuesto | USD/mes |
|---|---|---|
| `sitio` producción | 0,5 GB de RAM promedio y 0,05 vCPU | 6,0 |
| `postgres` producción | 0,2 GB de RAM y 0,02 vCPU | 2,4 |
| Volúmenes y respaldos | Unos 2 GB entre imágenes, base y copias incrementales | 0,3 |
| Egreso | 5 GB al mes (unas 3.000 páginas vistas de 1,5 MB) | 0,3 |
| Pruebas | Despierto cerca de un 10 % del tiempo | 1,0 a 2,0 |
| **Total del sitio** | | **≈ 10 a 11** |

El plan Pro (USD 20 al mes) incluye USD 20 de consumo. **Si el consumo total del workspace, sumando tus otros cuatro proyectos, queda bajo USD 20, el sitio no agrega costo.** Si los demás ya consumen cerca de 20, el sitio sumaría del orden de USD 10 al mes. Por eso T-004 empieza por revisar el consumo actual.

### 5.6 Stack

| Pieza | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Hosting, base y volumen | Heredado del marco §6.6 (Railway Pro). | — | — |
| Región | US East Metal (Virginia) | La más cercana a Chile entre las de Railway. | US West (California): algo más lejos. |
| Entornos | Entornos de Railway: `production` y `pruebas`, con pruebas dormido sin uso | Prueba real en la misma plataforma, a bajo costo. | Previas por cambio (*PR environments*): exigen ramas, que el proyecto no usa. |
| Configuración | `railway.json` en el repositorio | Queda versionada y revisable, como el resto. | Solo la configuración en el panel de Railway: no deja historia. |
| Respaldo externo | Descarga desde el panel | Sin credenciales ni base expuesta, y Rod controla dónde lo guarda. | Tarea programada a Google Drive: abre la base o guarda credenciales de Drive en Railway. |
| Recuperación de acceso | Script con `railway ssh` y enlace de un solo uso | No agrega contraseñas y el control es la cuenta de Railway. | Inicio con contraseña de respaldo: una credencial más que mantener. |
| Integración continua | Pruebas en local antes del push | Un solo desarrollador y despliegue a producción manual. | GitHub Actions: otra pieza para un caso que no la necesita. |

No hay servicios ni dependencias nuevas con costo.

## 6. Cumplimiento normativo

Lo transversal está en el marco §7. Específico de este componente:

- **Vigencia de la Ley 21.719 (reverificada el 2026-10-14).** Sigue fijada para el 1 de diciembre de 2026. El proyecto que la posterga al 1 de diciembre de 2027 sigue en tramitación en el Senado (fuente: [Garrigues, "El Ejecutivo refuerza la futura Agencia de Protección de Datos…"](https://www.garrigues.com/es_ES/noticia/chile-ejecutivo-refuerza-futura-agencia-proteccion-datos-concede-ano-adicional-adaptacion), actualizada el 11 de septiembre de 2026, consultada el 2026-10-14). No cambia el diseño: se cumple desde el lanzamiento.
- **Respaldos con datos personales.** Los respaldos de la base y el archivo descargado contienen consultas y suscriptores. Un dato borrado (por plazo o por pedido de supresión) puede seguir en un respaldo hasta su vencimiento: 27 días en Railway y, en el archivo descargado, hasta que Rod lo reemplace por el siguiente (unos 30 días). La política de privacidad agrega: *"Las copias de respaldo del sitio pueden conservar un dato borrado hasta 45 días; después desaparece también de ellas."* (cambio a `paginas/paginas.md`, Anexo A, en la aprobación).
- **Supresión y respaldos.** Si alguien pide borrar sus datos, se borran de la base de inmediato (procedimiento de `consulta-copia`). Los respaldos no se editan. Cada "Borrar todas" agrega a `AjustesSitio.supresionesRecientes` el resumen SHA-256 del correo y la fecha, sin el correo; la entrada se elimina a los 45 días con la tarea diaria. Antes de restaurar un respaldo, se copia esa lista de la base actual (si sigue disponible; Railway conserva el volumen anterior al restaurar) y, después, se vuelve a borrar lo que coincida antes de reabrir el sitio. Si la base actual se perdió, Rod repite a mano las supresiones que recuerde de las últimas semanas.
- **Lugar de los datos.** Railway, región Virginia (Estados Unidos). La política ya dice que los datos pueden almacenarse fuera de Chile; no cambia su texto (`paginas` §6.4).
- **Entorno de pruebas.** No recibe datos reales de producción. Si un visitante real enviara una consulta en pruebas, se borra al revisar pruebas; la dirección no se publica y no está indexada.
- **Script de recuperación.** Su ejecución deja registro y solo la puede ejecutar quien entra a la cuenta Railway de Rod.

## 7. Elementos obsoletos

No hay código previo. Al aprobar este documento cambian:

| Documento | Cambio | Versión |
|---|---|---|
| `consultas/consulta-copia.md` | §5.2.9: "Borrar todas" agrega el resumen del correo a `AjustesSitio.supresionesRecientes`; la tarea diaria limpia las entradas de más de 45 días. | 1.3 |
| Marco general | §6.1: `AjustesSitio.ultimoRespaldoEn` y `supresionesRecientes`; `Usuario.recuperacionHash` y `recuperacionVence`. §6.3: `/api/salud`, `/api/respaldo`, `/admin/recuperar`. §6.4: `railway.json`, `scripts/`, `src/migraciones/`. §6.6: región Virginia, dos entornos, fila de dominio ("v1.0 se lanza indexada en el subdominio, sin difundir; dominio y difusión en v1.x"). §11: mitigaciones de R-02 y R-03 apuntan a este documento. §12: D-02 resuelta; T-012 y T-013. | 1.8 |
| `contenido/modelo-contenido-panel.md` | §3.4: tarjeta *Respaldo* en el dashboard, después de *Fotos en borrador*. | 1.5 |
| `paginas/paginas.md` | Anexo A: frase sobre respaldos en "Cuánto tiempo los guardo". | 1.2 |
| `portafolio/galeria-colecciones.md` y `portafolio/ficha-foto.md` | §5.3: la compilación no consulta la base; las rutas se generan al primer pedido y el calentamiento cubre las principales. Sin cambio visible. | 1.2 cada uno |

La tarea T-004 se redefine con los valores decididos (§11).

## 8. Plan de acción

Para Claude Code. Los pasos 1 a 3 se hacen junto con la base del proyecto (marco §9.2, paso 1); el resto, al final de la implementación.

| # | Paso | Depende de | Terminado cuando |
|---|---|---|---|
| 1 | `src/lib/entorno.ts`, `.env.ejemplo`, `GET /api/salud` y `TZ=UTC`. | Base del proyecto | Sin una variable, `pnpm start` falla con un mensaje claro; `/api/salud` da 200 con la base de datos y 503 sin ella. |
| 2 | Migraciones de Payload en `src/migraciones/` desde el primer esquema; *push* solo en local. | Modelo de contenido, paso 2 | `pnpm payload migrate` sobre una base vacía crea todo el esquema. |
| 3 | Compilación sin base (§5.2.6): `generateStaticParams` vacío en compilación y `instrumentation.ts` con calentamiento. | 1 | `pnpm build` termina con la base apagada; al iniciar se ven en el registro los pedidos de calentamiento. |
| 4 | Proyecto `web-roddiaz` en Railway con la región, entornos, servicios, volúmenes, recursos máximos y direcciones del §5.2.1 y §5.2.2; conexión con el repositorio (si la app de Railway no tiene acceso al repositorio, se le pide a Rod el permiso mínimo). | 1 a 3 | El proyecto existe con dos entornos y la región correcta. |
| 5 | `railway.json` validado; despliegue automático solo en pruebas; producción con despliegue automático desactivado. | 4 | Un commit solo de documentos no despliega; uno con código despliega pruebas y no producción. |
| 6 | Variables y secretos de §5.5 en ambos entornos. URIs de redirección de pruebas y producción en el cliente OAuth (con Rod, T-008). | 4, T-008 | Rod entra al panel en pruebas y en producción con Google. |
| 7 | Pruebas en *Serverless* con lo del §5.2.9. | 5 | Tras 15 minutos sin tráfico, `sitio` y `postgres` de pruebas aparecen dormidos. |
| 8 | Verificar en pruebas el comportamiento de `ENTORNO` que implementa `seo` (pasos 6 y 7 de `seo`) y la excepción de `/api/salud` en el host único. | 5 | Pruebas responde `noindex` y `robots.txt` cerrado; producción no; `/api/salud` no redirige. |
| 9 | Respaldos programados de Railway en producción (§5.2.7). | 4 | La pestaña *Backups* muestra los horarios diario y semanal de `postgres` y semanal de `medios`. |
| 10 | `POST /api/respaldo`, `lib/respaldo.ts`, `TarjetaRespaldo` y `restaurar-respaldo`. | Modelo de contenido, consulta-copia | Criterios 11 y 12. |
| 11 | `recuperar-acceso` y `/admin/recuperar`. | Modelo de contenido, paso 9 | Criterio 13. |
| 12 | Prueba de memoria con las fotos de T-013 en pruebas y en producción antes del lanzamiento. | 6, T-013 | Criterio 14. |
| 13 | Lista de lanzamiento (§9, criterio 16) y primera promoción pública. | Todo lo anterior | Rod confirma en el chat que el sitio está lanzado. |

## 9. Criterios de aceptación y pruebas

1. El proyecto `web-roddiaz` existe en el workspace de Rod, con los entornos `production` y `pruebas`, todos los servicios en US East Metal y los recursos máximos del §5.2.2.
2. Un push que solo modifica `DocumentosTecnicos/` no crea despliegues. Uno que modifica `src/` despliega pruebas y no producción.
3. Producción solo cambia al promover a mano; el commit en producción es el mismo que se revisó en pruebas.
4. Con una migración que falla a propósito en pruebas, el despliegue no entra en servicio y el sitio sigue respondiendo con la versión anterior.
5. Con `/api/salud` devolviendo 503 a propósito, Railway no pone en servicio la versión nueva.
6. Un *rollback* en pruebas a un despliegue anterior funciona con la base ya migrada.
7. `pnpm build` termina sin acceso a la base, y tras iniciar, `/`, `/fotos` y `/colecciones` responden desde caché al primer visitante.
8. Pruebas responde con `X-Robots-Tag: noindex` y `robots.txt` que excluye todo; producción no (salvo las rutas que `seo` §5.2.9 marca). `GET /api/salud` con un host distinto de `URL_SITIO` responde 200 sin redirigir.
9. Pruebas se duerme tras 15 minutos sin tráfico y despierta con un pedido.
10. `postgres` no tiene proxy TCP público en ningún entorno, y no hay secretos en el repositorio (búsqueda de `PAYLOAD_SECRET`, `GOOGLE_CLIENT_SECRET` y cadenas de conexión en el historial).
11. *Descargar respaldo* entrega un `.json.gz` con manifiesto y todas las colecciones del §5.2.7, sin `IntentoAcceso` ni imágenes; la tarjeta pasa a "hace 0 días"; a los 31 días (fecha simulada) aparece el aviso; sin sesión, `POST /api/respaldo` da 401.
12. `restaurar-respaldo` sobre una base local vacía reconstruye el contenido con los mismos `id`; sobre una base con datos se niega. La base local se borra al terminar.
13. `recuperar-acceso` imprime un enlace que abre el panel una vez; el segundo uso y el uso después de 15 minutos muestran "Este enlace ya no sirve"; generar uno nuevo anula el anterior.
14. Subir en serie las tres fotos de T-013 (incluido el JPG de 45 MP) en producción no reinicia el servicio por memoria (métricas de Railway) y sus versiones cumplen el modelo de contenido (sRGB con ICC, sin EXIF ni GPS).
15. El aviso de gasto en USD 25 y el tope en USD 40 aparecen en *Usage Limits* del workspace (T-004).
16. **Lista de lanzamiento** (todo debe cumplirse antes de la primera promoción pública):
    - [ ] T-005: al menos 12 fotos publicadas con título, lugar y fecha.
    - [ ] T-006: catálogo de tamaños y papeles cargado; las fotos que ofrecen copia tienen formatos.
    - [ ] T-007: "Sobre mí" publicada con texto y foto de perfil.
    - [ ] T-009: foto de portada elegida, al menos 6 destacadas, portada y punto focal revisados en cada colección.
    - [ ] T-011: descripción del sitio escrita en *Ajustes del sitio* (`seo`).
    - [ ] Política de privacidad y condiciones publicadas (la de privacidad con la frase de respaldos; las condiciones habilitan la etiqueta de licencia de `seo`).
    - [ ] `AjustesSitio`: correo de contacto, Instagram y textos de consulta revisados por Rod.
    - [ ] Revisión externa de `seo` (criterio 18 de `seo`) sobre producción.
    - [ ] Consulta de prueba de punta a punta en producción (con foto y general), vista en el panel y luego borrada.
    - [ ] `exiftool` sobre una versión publicada solo muestra el perfil ICC.
    - [ ] Lighthouse móvil en portada, `/fotos` y una ficha: LCP < 2,5 s, CLS < 0,1.
    - [ ] Prueba en el navegador interno de Instagram (abriendo el enlace desde un mensaje propio).
    - [ ] Primer respaldo descargado desde el panel.
    - [ ] Respaldos programados de Railway activos y límite de gasto configurado.
    - [ ] Sin consultas ni datos de prueba en producción.

    Al lanzar (no bloquea): T-010, verificación en Search Console y envío del sitemap.

## 10. Riesgos

| Id | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| DS-01 | El consumo de los otros proyectos más el sitio supera lo incluido y aparece un cobro mensual. | Media | Bajo | Estimación de §5.5, aviso en USD 25 y revisión del consumo actual (T-004). |
| DS-02 | Se alcanza el tope y se detienen todos los proyectos del workspace. | Baja | Medio | Tope con margen (USD 40) y aviso antes. |
| DS-03 | Corte de segundos en cada despliegue de producción por el volumen. | Alta | Bajo | Promoción manual, de noche y poco frecuente. |
| DS-04 | Una migración rompe el *rollback*. | Baja | Alto | Migraciones aditivas en dos pasos y prueba en pruebas (criterio 6). |
| DS-05 | Rod no descarga el respaldo y la cuenta Railway se pierde. | Baja | Alto | Aviso en el panel a los 30 días; respaldos de Railway; Rod tiene los originales. |
| DS-06 | Al cambiar de dominio, Google tarda en trasladar la indexación. | Media | Bajo | 301 ruta por ruta, cambio de dirección en Search Console y subdominio redirigiendo 12 meses (§5.2.12, SEO-01). Como no se difunde antes, hay pocos enlaces externos. |
| DS-07 | El JPG de 45 MP supera la memoria y reinicia el servicio. | Media | Medio | Hasta 2 GB en producción, `sharp` en serie y criterio 14 antes de lanzar. |
| DS-08 | Railway cambia nombres de campos de `railway.json` o de la configuración. | Media | Bajo | Validación contra el esquema publicado (paso 5). |
| DS-09 | Pruebas no se duerme y cuesta como un segundo sitio. | Media | Bajo | §5.2.9 y criterio 9; si no se logra, pruebas se apaga cuando no se use. |
| DS-10 | Latencia a Virginia en conexiones lentas de regiones. | Media | Bajo | Caché, imágenes livianas y CDN con el dominio en la v1.x. |

## 11. Decisiones abiertas y tareas del dueño

**Decisiones de Rod en este documento:** lanzar en el subdominio sin difundir, indexado desde ya; despliegue solo con cambios de código; entorno de pruebas aparte con promoción manual a producción; respaldos de Railway y descarga mensual desde el panel; aviso de gasto en USD 25 y tope en USD 40.

**Decisiones abiertas:** ninguna que bloquee.

**Tareas del dueño**

| Id | Categoría | Tarea | Bloquea |
|---|---|---|---|
| T-004 | desarrollo | (Redefinida) Revisar en la facturación de Railway el consumo actual de tus proyectos y fijar en *Usage Limits* un aviso de USD 25 y un tope de USD 40. **Hecha (2026-10-16, tope fijado en USD 30).** | Lanzamiento |
| T-008 | desarrollo | (Existente) Cliente OAuth de Google. Al implementarlo se agregan las URI de pruebas y de producción. **Hecha (2026-10-17).** | Paso 6 |
| T-012 | desarrollo | **Nueva.** Comprar el dominio `.cl` cuando decidas difundir el sitio (v1.x; unos 10.000 CLP al año en NIC Chile, a confirmar al comprar). | Difusión (v1.x) |
| T-013 | contenido | **Nueva.** Entregar 3 JPG de prueba exportados desde Lightroom: uno de 45 MP vertical, uno en Adobe RGB y uno con GPS. | Paso 12 |
| T-014 | desarrollo | **Nueva.** Crear bot en Telegram con @BotFather y registrar `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en Railway. **Hecha (2026-10-16).** | Aviso de consultas |
| T-005, T-006, T-007, T-009, T-011 | contenido | (Existentes) Fotos, catálogo, Sobre mí, portada y descripción del sitio. | Lanzamiento |
| T-010 | desarrollo | (Existente, de `seo`) Search Console al lanzar. | — |

## 12. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.4 | 2026-10-22 | Vinculación y regla de despliegue exclusivo vía Git/GitHub (`via GitHub`): conexión permanente del servicio Railway con el repositorio `RodDiazT/Web_RodDiaz`, vetando despliegues manuales por CLI (`railway up`) para asegurar sincronización 1:1, trazabilidad y automatización continua ante cada `git push` a `main` (§5.2.3 y `CLAUDE.md`). |
| 1.3 | 2026-10-17 | Invalidación automática de caché de compilación (`revalidarRutasSeguras`) cuando `src/instrumentation.ts` invoca `/api/salud` con `User-Agent: Web_RodDiaz_Warmup/1.0` al arrancar el contenedor, e inclusión de `/contacto` en el calentamiento inicial (§5.2.6). |
| 1.2 | 2026-10-17 | Cierre de T-008; definición operativa de ambientes: el ambiente activo inicial (`sitio-production-7f52.up.railway.app`, configurado con `ENTORNO=pruebas` y `TAREAS_AUTOMATICAS=false`) se mantiene permanentemente como entorno de QA / pruebas para validar cambios presentes y futuros, y al aprobar el QA se duplicarán los recursos hacia un entorno Oficial separado (`ENTORNO=produccion`) abierto al público. Sincronización automática de esquema PostgreSQL y semilla en `onInit`. |
| 1.1 | 2026-10-14 | Alineado con marco 1.9, modelo de contenido 1.6 y consulta de copia 1.4: variables opcionales `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` para avisos push instantáneos de consultas (T-014); nota de límite de memoria `sharp.concurrency(1)` y AVIF `effort: 3` en entorno de pruebas (1 GB RAM) para ingesta de fotos de 45 MP (T-013). |
| 1.0 | 2026-10-14 | Aprobado por Rod. Marco general pasa a 1.8, modelo de contenido a 1.5, consulta de copia a 1.3, páginas a 1.2, galería a 1.2 y ficha a 1.2 (§7). Nacen T-012 y T-013; T-004 queda con los valores de §5.2.10. |
| 0.1 | 2026-10-14 | Borrador inicial. Decisiones de Rod: subdominio indexado sin difundir hasta el dominio; despliegue solo con cambios de código; entornos producción y pruebas con promoción manual; respaldos de Railway más descarga mensual desde el panel; aviso USD 25 y tope USD 40. Ley 21.719 reverificada. Alineado con `seo` 1.0 (aprobado en paralelo): `ENTORNO` en vez de una variable propia, excepción de `/api/salud` en el host único, mudanza según `seo` §5.2.4 con el subdominio redirigiendo 12 meses y lista de lanzamiento con T-010 y T-011; tareas nuevas renumeradas T-012 y T-013. |

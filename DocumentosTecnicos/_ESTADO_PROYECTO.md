# Estado del proyecto — Rod Díaz

Actualizado: 2026-10-14

## Resumen
**Todos los documentos de la v1.0 están aprobados y actualizados tras auditoría técnica Fine Art y difusión:** marco general (1.9), sistema de diseño (1.1), modelo de contenido y panel (1.6), galería y colecciones (1.2), ficha de foto (1.3), consulta de copia (1.4), páginas (1.3), SEO (1.1) y despliegue (1.1).
El flujo central y catálogo Fine Art quedan blindados para la impresión en taller propio (Canon imagePROGRAF PRO-1100, tintas minerales LUCIA PRO II): medidas reales en cm, respeto absoluto al ratio nativo 3:2 de la cámara con margen perimetral blanco de conservación para enmarcado y firma, asignación manual de formatos por foto, y catálogo enriquecido de papeles Fine Art (algodón, baritado, gramaje, libre de ácido). Difusión en redes optimizada con lienzo Open Graph desenfocado para fotos verticales y botón de WhatsApp nativo para in-app browsers. Operación ágil con avisos push instantáneos vía Telegram Bot, antispam calibrado a 1.8 s (sin fricción para autocompletado en móviles), snapshots inmutables en consultas y trazabilidad de archivos originales para Lightroom. Despliegue con límites de memoria Sharp ajustados en pruebas. Siguiente: implementación con Claude Code.

## Versión en curso
v1.0: portafolio con consulta 1:1.

## Stack y recursos confirmados
- Repositorio: GitHub `RodDiazT/Web_RodDiaz` (privado), rama `main`.
- Railway: workspace "roddiazt's Projects" en plan Pro (verificado el 2026-10-07). Proyecto del sitio definido (`web-roddiaz`, US East, entornos `production` y `pruebas`); se crea al implementar.
- Stack aprobado en el marco: Next.js + Payload CMS 3 + PostgreSQL en Railway, imágenes en volumen con `sharp` (concurrencia serial y AVIF effort 3 en pruebas), acceso al panel con Google. Notificaciones push instantáneas de consultas vía Telegram Bot (opcional, sin costo ni dependencias de terceros).
- Sistema de diseño: CSS Modules + tokens CSS, fuentes autoalojadas con `next/font` (sin conexión a Google), íconos SVG propios, `<dialog>` nativo. Visor con inspección de nitidez Fine Art mediante doble toque (zoom 2.5x). Versiones web en sRGB con perfil ICC.
- Imágenes: solo JPG hasta 60 MB; metadatos EXIF leídos con `exifr` y trazabilidad con `nombreArchivoOriginal` para ubicar el master en Lightroom.
- Galería: filas justificadas en CSS puro, scroll infinito con `IntersectionObserver` y punto focal nativo de Payload; sin dependencias nuevas.
- Ficha: `<details>` nativo, `IntersectionObserver`, Web Share y botón directo a WhatsApp; leyenda clara de margen blanco de conservación y firma; sin dependencias nuevas.
- Consultas: Server Action con mejora progresiva, antispam calibrado a 1.8 s para autocompletado de navegadores móviles, snapshots históricos de nombres de formato y papel (`nombreFormatoSnapshot`, `nombrePapelSnapshot`), respuesta desde Gmail, borrado diario con la cola de trabajos de Payload y notificación push por Telegram Bot.
- Páginas: plantillas sobre `Pagina` con texto enriquecido de Lexical; correo protegido con marcador `{correo}`; política de privacidad con plazo flexible para expediciones fotográficas en terreno; condiciones con pautas de conservación y manipulación Fine Art.
- SEO: API de metadatos de Next.js, `sitemap.ts` y `robots.ts`; vista previa con lienzo de 1200 × 630 desenfocado en fondos para fotos verticales (óptimo para WhatsApp 1:1 e Instagram Stories); JSON-LD propio; Google Search Console gratis y sin script.
- Despliegue: `railway.json` con rutas de vigilancia, migraciones de Payload antes de desplegar, `GET /api/salud`, respaldos programados de Railway y descarga desde el panel; variables de Telegram opcionales.
- Tablero: https://claude.ai/artifact/So8RmLvWvY4EkLEBNbVdcd

## Documentos aprobados recientes
- Marco general del proyecto, versión 1.9 (2026-10-14): Canon PRO-1100, margen de conservación Fine Art, aviso push por Telegram Bot, nombre de archivo original, snapshots y antispam 1.8 s.
- Identidad visual y sistema de diseño, versión 1.1 (2026-10-14): evaluación vertical/cuadrada en DisposicionFicha y doble toque 2.5x en Visor.
- Modelo de contenido y panel de administración, versión 1.6 (2026-10-14): nombreArchivoOriginal, FormatoImpresion con medidas en cm y margen mínimo, TipoPapel Fine Art enriquecido, Sharp concurrency(1) y AVIF effort 3.
- Ficha de foto, versión 1.3 (2026-10-14): leyenda de margen de conservación y firma; botón de WhatsApp directo.
- Consulta de copia y gestión de consultas, versión 1.4 (2026-10-14): snapshots de catálogo en ítems, aviso push por Telegram Bot, antispam 1.8 s.
- Páginas, versión 1.3 (2026-10-14): plazo flexible de respuesta a derechos en privacidad; pautas de manipulación y enmarcado Fine Art en condiciones.
- SEO, versión 1.1 (2026-10-14): lienzo Open Graph para fotos verticales con fondo desenfocado; unificación de etiquetas de caché.
- Despliegue y dominio, versión 1.1 (2026-10-14): variables de Telegram Bot; límite de memoria Sharp en pruebas para 45 MP.
- Galería y colecciones, versión 1.2 (2026-10-14): compilación sin base.

## Bloqueos
- Ninguno.

## Próximos pasos
1. **Etapa 5: Sistema de Consultas 1:1 y Notificaciones** (doc 6). Página `/consulta`, parámetros de URL (`?foto=...&formato=...`), antispam calibrado (1.8s + honeypot + rate limit), Server Action con snapshots inmutables de catálogo, avisos push resilientes por Telegram Bot (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) y gestión en `/admin`.
2. Rod, antes de implementar el panel: catálogo de tamaños y papeles en cm (T-006), cliente OAuth de Google (T-008) y bot de Telegram para avisos (T-014).
3. Rod, antes de lanzar: límite de gasto en Railway (T-004), 12 fotos (T-005), Sobre mí (T-007), portada y destacadas (T-009), descripción del sitio (T-011) y JPG de prueba de 45 MP (T-013). Al lanzar: Search Console (T-010).
4. v1.x: dominio propio (T-012) y difusión.

## Control de cambios
| Fecha | Cambio |
|---|---|
| 2026-10-14 | **Etapa 4 completada:** Portafolio público Fine Art desarrollado íntegramente según especificaciones (galeria-colecciones 1.2 y ficha-foto 1.3). Paginación por cursor opaco base64 (`src/lib/cursor.ts`), funciones puras de dominio (`src/lib/ficha.ts`), capa de datos (`src/lib/contenido.ts`), y route handlers `GET /datos/fotos` y `GET /datos/contexto`. Componentes de galería en CSS puro (filas justificadas sin recortes, `IntersectionObserver` con restauración en `sessionStorage`, `PortadaSitio`, `RejillaColecciones` 4:5, `CabeceraColeccion`, `FiltroCaracteristicas`). Componentes de ficha Fine Art (`EleccionCopia`, `MetaFoto`, `ResumenCopias`, selector de tamaños y papeles compatibles con leyenda de margen blanco de conservación y firma a lápiz grafito, `BarraCopiaMovil` fija al scroll, historia colapsable con line-clamp, datos técnicos, compartir nativo Web Share con fallback WhatsApp, carrusel circular `MasDeColeccion` e integración con `Visor`). Vistas públicas: `/`, `/colecciones`, `/colecciones/[slug]`, `/fotos`, `/fotos/[slug]`. 23 pruebas unitarias al 100% y compilación Next.js limpia sin base de datos activa. |
| 2026-10-14 | **Auditoría y corrección de Etapa 3:** Corrección de colisión de desmontaje en `Dialogo` que impedía `dialog.close()` y retorno de foco al disparador; eliminación de salto brusco de scroll en `bloqueoScroll` con `{ behavior: 'instant' }`; orden canónico de navegación en `Encabezado` y `MenuMovil` (Colecciones, Fotos, Sobre mí, Contacto) y coincidencia activa de subrutas `/colecciones/*`; eliminación de faux-bolding tipográfico en `MenuMovil`; eliminación de transición CSS permanente en arrastre táctil de `Visor` para seguimiento 1:1 y precarga invisible de fotos adyacentes a 1200px; normalización de ratios en `TarjetaColeccion` (4:5) y `MarcoFoto` (`focalX`, `focalY`); corrección de anillo de foco accesible en `Campo` y `TarjetaColeccion`; reestructuración de slots en `DisposicionFicha` garantizando CTA "Pedir una copia" en los primeros 360px en vertical; adición de íconos SVG para compartir y WhatsApp; e incorporación de ratios cuadrada (1:1) y panorámica (3:1) en `/guia-estilo`. |
| 2026-10-14 | **Etapa 3 completada:** Sistema de diseño e identidad visual aprobado implementado íntegramente. Configuración de fuentes locales autoalojadas `next/font` (*Cormorant Garamond* y *Manrope*) con licencia OFL, tokens CSS nativos en `:root` (paleta grafito neutra, sin acentos de color, espaciados en múltiplos de 4px, capas y curvas de movimiento). Suite completa de componentes base modulares: `SaltarContenido`, `Marca` (conmutación logo/wordmark), `Boton` (primario, secundario, enlace), `Dialogo` modal nativo `<dialog>`, `MenuMovil` (100dvh), `Encabezado` ocultable (umbrales 80/24px y fijo en ficha), `Pie` accesible, `ChipFiltro` con área táctil 44px, `Campo` (inputs, select, textarea y checkbox con texto 16px en iOS), `Aviso` en línea, `Esqueleto` estático sin CLS, `MarcoFoto` (soporte picture AVIF/WebP, filete perimetral y disuasión de descarga), `Retorno`, `PlantillaEstado`, `NavegacionFotos`, `TarjetaColeccion` (ratio vertical 4:5), `DisposicionFicha` (columna lateral vs franja inferior) y `Visor` a pantalla completa con navegación táctil y doble toque (*double-tap zoom* 2.5x). Catálogo interactivo en `/guia-estilo` (protegido en producción) y monograma "RD" en `icon.svg`. |
| 2026-10-14 | **Auditoría y corrección de Etapa 2:** Corrección de control de acceso `read` en `Foto`, `Coleccion` y `Pagina` para restringir borradores a anónimos; preservación estricta de `slug` al modificar títulos de fotos publicadas; blindaje de validación de campos mínimos en actualizaciones parciales; actualización de `req.file.size` al procesar el buffer en Sharp a 2048px; corrección de desfase de fecha de toma en `normalizarFechaDia` para formatos EXIF y cadenas sin zona horaria; incorporación de tarea de purga automática `src/tareas/borrarVencidos.ts` (>90 días); agregado de campo calculado `reservada` en `Pagina`; incorporación de hooks de revalidación segura (`afterChange`/`afterDelete`); y alineación de contratos en `contenido.ts` (`fotoPorSlug`, `coleccionesListadas` y `coleccionPorSlug`). Suite de pruebas unitarias al 100% en verde y compilación Next.js limpia. |
| 2026-10-14 | **Etapa 2 completada:** Modelo de contenido y colecciones oficiales Payload 3 implementadas (`Foto`, `Coleccion`, `Caracteristica`, `FormatoImpresion`, `TipoPapel`, `Pagina`, `Medio`, `Consulta`, `Suscriptor`, `Usuario`, `IntentoAcceso` y `AjustesSitio`). Soporte de procesamiento Sharp (sRGB + perfil ICC, descarte de EXIF/GPS, tope 2048px), lectura acotada de EXIF con `exifr`, proporciones con tolerancia ±2%, reglas de visibilidad, scripts de semilla y recuperación de acceso (`/admin/recuperar`). Suite de 14 pruebas unitarias en verde y compilación Next.js exitosa. |
| 2026-10-14 | **Auditoría y corrección de Etapa 1:** Corrección del contrato estricto de `/api/salud` (200 `{ estado: 'ok' }` / 503 `{ estado: 'falla' }`, timeout de 2s y verificación de volumen), alineación de variables en `entorno.ts` (`CORREOS_ADMIN`, `RUTA_MEDIOS`, `ENTORNO`, `TAREAS_AUTOMATICAS`), eliminación de campo duplicado y correos cableados en `Usuario.ts`, incorporación de cabeceras de seguridad en `next.config.mjs` y adición de relaciones y plantillas en `AjustesSitio.ts`. |
| 2026-10-14 | **Etapa 1 completada:** Base técnica del proyecto inicializada y desplegada en Railway con éxito. Next.js 15.2.9 + Payload CMS 3.90.2 + PostgreSQL en US East (Virginia). `/api/salud` verificado respondiendo 200 y panel `/admin` operativo en `https://sitio-production-7f52.up.railway.app`. |
| 2026-10-14 | Auditoría integral Fine Art y difusión aprobada por Rod. Actualización de toda la suite documental: Canon PRO-1100, margen de conservación y ratio 3:2, papeles Fine Art enriquecidos, lienzo OG vertical, Telegram Bot (T-014), antispam móvil 1.8 s, snapshots de catálogo, optimización de memoria Sharp. Marco 1.9, sistema-de-diseno 1.1, modelo-contenido-panel 1.6, ficha-foto 1.3, consulta-copia 1.4, paginas 1.3, seo 1.1, despliegue 1.1. |
| 2026-10-14 | Despliegue aprobado (1.0); marco general 1.8; modelo de contenido 1.5; consulta de copia 1.3; páginas 1.2; galería 1.2; ficha 1.2; T-004 redefinida; T-012 y T-013. Documentación de la v1.0 completa. |
| 2026-10-14 | SEO aprobado (1.0); marco general 1.7; modelo de contenido 1.4; consulta de copia 1.2; páginas 1.1; T-010 y T-011. |
| 2026-10-14 | Páginas aprobado (1.0); marco general 1.6; modelo de contenido 1.3; consulta de copia 1.1. |
| 2026-10-14 | Consulta de copia aprobada (1.0); marco general 1.5; modelo de contenido 1.2; ficha 1.1. |
| 2026-10-14 | Ficha de foto aprobada (1.0); marco general 1.4; galería 1.1. |
| 2026-10-14 | Galería y colecciones aprobado (1.0); marco general 1.3; modelo de contenido 1.1; T-009. |
| 2026-10-13 | Modelo de contenido y panel aprobado (1.0); marco general 1.2. |
| 2026-10-07 | Sistema de diseño aprobado (1.0); marco general 1.1. |
| 2026-10-07 | Marco general aprobado (1.0). |
| 2026-10-07 | Tablero publicado y registrado. |
| 2026-10-07 | Repo creado; plan Pro de Railway confirmado; marco 0.3 sin correo ni analítica. |
| 2026-10-07 | Creación del estado del proyecto. |

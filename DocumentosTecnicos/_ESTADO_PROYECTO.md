# Estado del proyecto — Rod Díaz

Actualizado: 2026-10-14

## Resumen
**Todos los documentos de la v1.0 están aprobados:** marco general (1.8), sistema de diseño (1.0), modelo de contenido y panel (1.5), galería y colecciones (1.2), ficha de foto (1.2), consulta de copia (1.3), páginas (1.2), SEO (1.0) y despliegue (1.0). El flujo central queda completo en documentos: portada → galería → ficha → `/consulta` (página propia, hasta 5 fotos, consulta general, casilla obligatoria de privacidad y contacto, casilla opcional de novedades) → panel (nuevas, respuesta con borrador en Gmail, indicador mensual, suscriptores). Páginas completas: Sobre mí con destacadas, Contacto con «Escríbeme» hacia la consulta general (sin correo visible), y política de privacidad y condiciones redactadas en la semilla. SEO completo: indexación desde el subdominio con host único (`URL_SITIO`), títulos «título, lugar · Rod Díaz», vista previa 1200 × 630 con la foto completa y la marca, etiqueta «Con licencia» en Google Imágenes, Search Console, características indexables y robots de IA de búsqueda sí y de entrenamiento no. Despliegue completo: proyecto `web-roddiaz` en Railway (US East) con entornos producción (promoción manual) y pruebas (automático, dormido sin uso), despliegue solo con cambios de código, respaldos de Railway más descarga mensual desde el panel, enlace de recuperación de acceso, costo estimado de USD 10 a 11 al mes con aviso en USD 25 y tope en USD 40, y lanzamiento en el subdominio indexado sin difundir hasta el dominio propio (v1.x). Siguiente: implementación con Claude Code.

## Versión en curso
v1.0: portafolio con consulta 1:1.

## Stack y recursos confirmados
- Repositorio: GitHub `RodDiazT/Web_RodDiaz` (privado), rama `main`.
- Railway: workspace "roddiazt's Projects" en plan Pro (verificado el 2026-10-07). Proyecto del sitio definido (`web-roddiaz`, US East, entornos `production` y `pruebas`); se crea al implementar.
- Stack aprobado en el marco: Next.js + Payload CMS 3 + PostgreSQL en Railway, imágenes en volumen con `sharp`, acceso al panel con Google. En la v1.0 no hay aviso por correo ni analítica.
- Sistema de diseño: CSS Modules + tokens CSS, fuentes autoalojadas con `next/font` (sin conexión a Google), íconos SVG propios, `<dialog>` nativo. Versiones web en sRGB con perfil ICC.
- Imágenes: solo JPG hasta 60 MB; EXIF leído con `exifr` (solo fecha, distancia focal, apertura y velocidad).
- Galería: filas justificadas en CSS puro, scroll infinito con `IntersectionObserver` y punto focal nativo de Payload; sin dependencias nuevas.
- Ficha: `<details>` nativo, `IntersectionObserver`, Web Share y Clipboard API; contexto resuelto en el navegador con `GET /datos/contexto`; sin dependencias nuevas.
- Consultas: Server Action con mejora progresiva, antispam sin captcha (trampa, firma de tiempo, límite por IP en memoria), respuesta desde Gmail, borrado diario con la cola de trabajos de Payload; sin servicios nuevos.
- Páginas: plantillas sobre `Pagina` con texto enriquecido de Lexical; correo protegido con marcador `{correo}`; sin dependencias nuevas.
- SEO: API de metadatos de Next.js, `sitemap.ts` y `robots.ts`; vista previa con `sharp` y la fuente local; JSON-LD propio; Google Search Console gratis y sin script. Sin dependencias nuevas.
- Despliegue: `railway.json` con rutas de vigilancia, migraciones de Payload antes de desplegar, `GET /api/salud`, respaldos programados de Railway y descarga desde el panel; sin servicios nuevos.
- Tablero: https://claude.ai/artifact/So8RmLvWvY4EkLEBNbVdcd

## Documentos aprobados recientes
- Despliegue y dominio, versión 1.0 (2026-10-14); marco general 1.8, modelo de contenido 1.5, consulta de copia 1.3, páginas 1.2, galería 1.2 y ficha 1.2.
- SEO, versión 1.0 (2026-10-14); marco general 1.7, modelo de contenido 1.4, consulta de copia 1.2 y páginas 1.1.
- Páginas, versión 1.0 (2026-10-14); marco general 1.6, modelo de contenido 1.3 y consulta de copia 1.1: protección de páginas reservadas y `contenidoActualizadoEn`.
- Consulta de copia y gestión de consultas, versión 1.0 (2026-10-14).
- Marco general 1.5, modelo de contenido 1.2 y ficha 1.1 (2026-10-14): `Consulta` con ítems, `Suscriptor`, textos de consulta, `/datos/fotos-consultables`.
- Ficha de foto, versión 1.0 (2026-10-14).
- Marco general 1.4 y galería 1.1 (2026-10-14): `GET /datos/contexto`, enlace `/consulta?foto=&formato=` y contexto con filtro desde una colección.
- Galería y colecciones, versión 1.0 (2026-10-14).
- Marco general 1.3 y modelo de contenido 1.1 (2026-10-14): fijadas, punto focal, `/colecciones` y `/datos/fotos`.
- Modelo de contenido y panel de administración, versión 1.0 (2026-10-13).
- Marco general 1.2 (2026-10-13): una colección por foto con jerarquía, papeles por formato, vitrina, solo JPG, `Medio` e `IntentoAcceso`.
- Identidad visual y sistema de diseño, versión 1.0 (2026-10-07).
- Marco general 1.1 (2026-10-07): nombre "Rod Díaz", `logo`, `filete`, perfil ICC, visor.
- Marco general del proyecto, versión 1.0 (2026-10-07).

## Bloqueos
- Ninguno.

## Próximos pasos
1. Implementación con Claude Code según el plan del marco §9.2, partiendo por la base del proyecto (incluye los pasos 1 a 3 de despliegue).
2. Rod, antes de implementar el panel: catálogo de tamaños y papeles (T-006) y cliente OAuth de Google (T-008).
3. Rod, antes de lanzar: límite de gasto en Railway (T-004), 12 fotos (T-005), Sobre mí (T-007), portada y destacadas (T-009), descripción del sitio (T-011) y JPG de prueba (T-013). Al lanzar: Search Console (T-010).
4. v1.x: dominio propio (T-012) y difusión.

## Control de cambios
| Fecha | Cambio |
|---|---|
| 2026-10-07 | Creación del estado del proyecto. |
| 2026-10-07 | Repo creado; plan Pro de Railway confirmado; marco 0.3 sin correo ni analítica. |
| 2026-10-07 | Tablero publicado y registrado. |
| 2026-10-07 | Marco general aprobado (1.0). |
| 2026-10-07 | Sistema de diseño aprobado (1.0); marco general 1.1. |
| 2026-10-13 | Modelo de contenido y panel aprobado (1.0); marco general 1.2. |
| 2026-10-14 | Galería y colecciones aprobado (1.0); marco general 1.3; modelo de contenido 1.1; T-009. |
| 2026-10-14 | Ficha de foto aprobada (1.0); marco general 1.4; galería 1.1. |
| 2026-10-14 | Consulta de copia aprobada (1.0); marco general 1.5; modelo de contenido 1.2; ficha 1.1. |
| 2026-10-14 | Páginas aprobado (1.0); marco general 1.6; modelo de contenido 1.3; consulta de copia 1.1. |
| 2026-10-14 | SEO aprobado (1.0); marco general 1.7; modelo de contenido 1.4; consulta de copia 1.2; páginas 1.1; T-010 y T-011. |
| 2026-10-14 | Despliegue aprobado (1.0); marco general 1.8; modelo de contenido 1.5; consulta de copia 1.3; páginas 1.2; galería 1.2; ficha 1.2; T-004 redefinida; T-012 y T-013. Documentación de la v1.0 completa. |

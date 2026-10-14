# Estado del proyecto — Rod Díaz

Actualizado: 2026-10-14

## Resumen
Marco general (1.4), sistema de diseño (1.0), modelo de contenido y panel (1.1), galería y colecciones (1.1) y ficha de foto (1.0) aprobados. La ficha muestra la foto completa con su título, lugar, mes y año, un resumen de copias con desplegable de tamaños y papeles (elección opcional que pasa a la consulta), "Pedir una copia" (también en el visor y en una barra móvil que aparece al pasar el botón), historia plegable, etiquetas, datos técnicos, compartir y "Más de <colección>". Siguiente desbloqueado: consulta de copia (además de páginas y despliegue).

## Versión en curso
v1.0: portafolio con consulta 1:1.

## Stack y recursos confirmados
- Repositorio: GitHub `RodDiazT/Web_RodDiaz` (privado), rama `main`.
- Railway: workspace "roddiazt's Projects" en plan Pro (verificado el 2026-10-07); el proyecto del sitio aún no se crea.
- Stack aprobado en el marco: Next.js + Payload CMS 3 + PostgreSQL en Railway, imágenes en volumen con `sharp`, acceso al panel con Google. En la v1.0 no hay aviso por correo ni analítica.
- Sistema de diseño: CSS Modules + tokens CSS, fuentes autoalojadas con `next/font` (sin conexión a Google), íconos SVG propios, `<dialog>` nativo. Versiones web en sRGB con perfil ICC.
- Imágenes: solo JPG hasta 60 MB; EXIF leído con `exifr` (solo fecha, distancia focal, apertura y velocidad).
- Galería: filas justificadas en CSS puro, scroll infinito con `IntersectionObserver` y punto focal nativo de Payload; sin dependencias nuevas.
- Ficha: `<details>` nativo, `IntersectionObserver`, Web Share y Clipboard API; contexto resuelto en el navegador con `GET /datos/contexto`; sin dependencias nuevas.
- Tablero: https://claude.ai/artifact/So8RmLvWvY4EkLEBNbVdcd

## Documentos aprobados recientes
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
1. Consulta de copia y gestión de consultas (`consultas/consulta-copia.md`): debe aceptar `/consulta?foto=<slug>&formato=<id>`, mostrar el tamaño preseleccionado y decidir modal o página (D-01).
2. En paralelo, desbloqueados: páginas (`paginas/paginas.md`) y despliegue (`plataforma/despliegue.md`).
3. Rod: catálogo de tamaños y papeles (T-006) y cliente OAuth de Google (T-008) antes de implementar el panel.

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

# Estado del proyecto — Rod Díaz

Actualizado: 2026-10-13

## Resumen
Marco general (1.2), sistema de diseño (1.0) y modelo de contenido y panel (1.0) aprobados. Cada foto vive en una sola colección (colecciones de dos niveles), las características son etiquetas transversales, los papeles van por formato y una foto puede ser solo de vitrina. Rod sube lotes de JPG y edita en bloque; todo nace en borrador. Siguientes desbloqueados: galería y colecciones, páginas, y despliegue.

## Versión en curso
v1.0: portafolio con consulta 1:1.

## Stack y recursos confirmados
- Repositorio: GitHub `RodDiazT/Web_RodDiaz` (privado), rama `main`.
- Railway: workspace "roddiazt's Projects" en plan Pro (verificado el 2026-10-07); el proyecto del sitio aún no se crea.
- Stack aprobado en el marco: Next.js + Payload CMS 3 + PostgreSQL en Railway, imágenes en volumen con `sharp`, acceso al panel con Google. En la v1.0 no hay aviso por correo ni analítica.
- Sistema de diseño: CSS Modules + tokens CSS, fuentes autoalojadas con `next/font` (sin conexión a Google), íconos SVG propios, `<dialog>` nativo. Versiones web en sRGB con perfil ICC.
- Imágenes: solo JPG hasta 60 MB; EXIF leído con `exifr` (solo fecha, distancia focal, apertura y velocidad).
- Tablero: https://claude.ai/artifact/So8RmLvWvY4EkLEBNbVdcd

## Documentos aprobados recientes
- Modelo de contenido y panel de administración, versión 1.0 (2026-10-13).
- Marco general 1.2 (2026-10-13): una colección por foto con jerarquía, papeles por formato, vitrina, solo JPG, `Medio` e `IntentoAcceso`.
- Identidad visual y sistema de diseño, versión 1.0 (2026-10-07).
- Marco general 1.1 (2026-10-07): nombre "Rod Díaz", `logo`, `filete`, perfil ICC, visor.
- Marco general del proyecto, versión 1.0 (2026-10-07).

## Bloqueos
- Ninguno.

## Próximos pasos
1. Galería y colecciones (`portafolio/galeria-colecciones.md`): define cómo se ve la vista de una colección madre.
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

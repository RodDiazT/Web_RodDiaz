# Índice maestro — Rod Díaz

## Documentos

| Ruta | Tipo | Versión | Estado | Producto | Padre | Dependencias |
|---|---|---|---|---|---|---|
| `marco-general/marco-general-proyecto.md` | marco | 1.6 | aprobado | v1.0 | — | — |
| `identidad/sistema-de-diseno.md` | transversal | 1.0 | aprobado | v1.0 | marco-general | marco-general |
| `contenido/modelo-contenido-panel.md` | componente | 1.3 | aprobado | v1.0 | marco-general | marco-general |
| `portafolio/galeria-colecciones.md` | componente | 1.1 | aprobado | v1.0 | marco-general | sistema-de-diseno, modelo-contenido-panel |
| `portafolio/ficha-foto.md` | componente | 1.1 | aprobado | v1.0 | marco-general | sistema-de-diseno, modelo-contenido-panel, galeria-colecciones |
| `consultas/consulta-copia.md` | componente | 1.1 | aprobado | v1.0 | marco-general | modelo-contenido-panel, ficha-foto |
| `paginas/paginas.md` | componente | 1.0 | aprobado | v1.0 | marco-general | sistema-de-diseno, modelo-contenido-panel |
| `plataforma/seo.md` | transversal | 0.1 | revision | v1.0 | marco-general | galeria-colecciones, ficha-foto, paginas |
| `plataforma/despliegue.md` | transversal | — | pendiente | v1.0 | marco-general | modelo-contenido-panel |

## Árbol

```
marco-general/marco-general-proyecto.md        [aprobado 1.6]
├── identidad/sistema-de-diseno.md             [aprobado 1.0]
├── contenido/modelo-contenido-panel.md        [aprobado 1.3]
├── portafolio/galeria-colecciones.md          [aprobado 1.1]
├── portafolio/ficha-foto.md                   [aprobado 1.1]
├── consultas/consulta-copia.md                [aprobado 1.1]
├── paginas/paginas.md                         [aprobado 1.0]
├── plataforma/seo.md                          [revision 0.1]
└── plataforma/despliegue.md                   [pendiente]
```

## Tareas del dueño

### Desarrollo
| Id | Tarea | Bloquea | Estado | Creada |
|---|---|---|---|---|
| T-001 | Crear el repositorio privado RodDiazT/Web_RodDiaz en GitHub y dar acceso a la app de Claude | — | hecha (2026-10-07) | 2026-10-07 |
| T-002 | Crear cuenta gratis en Resend con rodrigodiaztapia@gmail.com y generar clave de API | consulta-copia | descartada (2026-10-07) | 2026-10-07 |
| T-003 | Crear cuenta gratis de Cloudflare y activar Web Analytics | seo | descartada (2026-10-07) | 2026-10-07 |
| T-004 | Revisar en la facturación de Railway el consumo actual y fijar un límite de gasto mensual (plan Pro confirmado) | despliegue | abierta | 2026-10-07 |
| T-008 | Crear cliente OAuth de Google Cloud para el inicio de sesión del panel | modelo-contenido-panel | abierta | 2026-10-07 |

### Contenido
| Id | Tarea | Bloquea | Estado | Creada |
|---|---|---|---|---|
| T-005 | Seleccionar al menos 12 fotos de lanzamiento con título, lugar y fecha | despliegue | abierta | 2026-10-07 |
| T-006 | Definir catálogo inicial de tamaños (cm) y tipos de papel | modelo-contenido-panel | abierta | 2026-10-07 |
| T-007 | Escribir el texto de Sobre mí y elegir foto de perfil | paginas | abierta | 2026-10-07 |
| T-009 | Elegir la foto de portada, marcar al menos 6 destacadas, revisar portada y punto focal de cada colección y fijar fotos (opcional) | despliegue | abierta | 2026-10-14 |

### Negocio
| Id | Tarea | Bloquea | Estado | Creada |
|---|---|---|---|---|
| — | Sin tareas | — | — | — |

## Checklist (fuente de verdad)

<!-- CHECKLIST:INICIO -->
```json
{
  "esquema": "1.1",
  "proyecto": "Rod Díaz (Web_RodDiaz)",
  "actualizado": "2026-10-14T14:30-03:00",
  "fases": [
    {
      "id": "v1.0",
      "nombre": "Portafolio con consulta 1:1",
      "objetivo": null
    },
    {
      "id": "v1.x",
      "nombre": "Mejoras",
      "objetivo": null
    },
    {
      "id": "v2",
      "nombre": "Venta automatizada",
      "objetivo": null
    }
  ],
  "documentos": [
    {
      "id": "marco-general",
      "ruta": "marco-general/marco-general-proyecto.md",
      "titulo": "Marco general del proyecto",
      "tipo": "marco",
      "dominio": "marco-general",
      "padre": null,
      "dependencias": [],
      "fase": "v1.0",
      "estado": "aprobado",
      "version": "1.6",
      "actualizado": "2026-10-14",
      "notas": "1.6: Pagina con slugsAnteriores, contenidoActualizadoEn y protección de reservadas; rutas por /[slug] (desde paginas)."
    },
    {
      "id": "sistema-de-diseno",
      "ruta": "identidad/sistema-de-diseno.md",
      "titulo": "Identidad visual y sistema de diseño",
      "tipo": "transversal",
      "dominio": "identidad",
      "padre": "marco-general",
      "dependencias": [
        "marco-general"
      ],
      "fase": "v1.0",
      "estado": "aprobado",
      "version": "1.0",
      "actualizado": "2026-10-07",
      "notas": ""
    },
    {
      "id": "modelo-contenido-panel",
      "ruta": "contenido/modelo-contenido-panel.md",
      "titulo": "Modelo de contenido y panel de administración",
      "tipo": "componente",
      "dominio": "contenido",
      "padre": "marco-general",
      "dependencias": [
        "marco-general"
      ],
      "fase": "v1.0",
      "estado": "aprobado",
      "version": "1.3",
      "actualizado": "2026-10-14",
      "notas": "1.3: Pagina con slugsAnteriores, contenidoActualizadoEn, reservada y semilla de textos (desde paginas). Implementación requiere T-006 y T-008."
    },
    {
      "id": "galeria-colecciones",
      "ruta": "portafolio/galeria-colecciones.md",
      "titulo": "Galería y colecciones",
      "tipo": "componente",
      "dominio": "portafolio",
      "padre": "marco-general",
      "dependencias": [
        "sistema-de-diseno",
        "modelo-contenido-panel"
      ],
      "fase": "v1.0",
      "estado": "aprobado",
      "version": "1.1",
      "actualizado": "2026-10-14",
      "notas": "1.1: contexto con filtro desde una colección (desde ficha-foto)."
    },
    {
      "id": "ficha-foto",
      "ruta": "portafolio/ficha-foto.md",
      "titulo": "Ficha de foto",
      "tipo": "componente",
      "dominio": "portafolio",
      "padre": "marco-general",
      "dependencias": [
        "sistema-de-diseno",
        "modelo-contenido-panel",
        "galeria-colecciones"
      ],
      "fase": "v1.0",
      "estado": "aprobado",
      "version": "1.1",
      "actualizado": "2026-10-14",
      "notas": "1.1: enlace a la consulta con origen (desde consulta-copia)."
    },
    {
      "id": "consulta-copia",
      "ruta": "consultas/consulta-copia.md",
      "titulo": "Consulta de copia y gestión de consultas",
      "tipo": "componente",
      "dominio": "consultas",
      "padre": "marco-general",
      "dependencias": [
        "modelo-contenido-panel",
        "ficha-foto"
      ],
      "fase": "v1.0",
      "estado": "aprobado",
      "version": "1.1",
      "actualizado": "2026-10-14",
      "notas": "1.1: versionPolitica desde Pagina.contenidoActualizadoEn (desde paginas)."
    },
    {
      "id": "paginas",
      "ruta": "paginas/paginas.md",
      "titulo": "Páginas",
      "tipo": "componente",
      "dominio": "paginas",
      "padre": "marco-general",
      "dependencias": [
        "sistema-de-diseno",
        "modelo-contenido-panel"
      ],
      "fase": "v1.0",
      "estado": "aprobado",
      "version": "1.0",
      "actualizado": "2026-10-14",
      "notas": "Aprobado. Marco pasa a 1.6, modelo-contenido-panel a 1.3 y consulta-copia a 1.1 (§7). Lanzamiento requiere T-007."
    },
    {
      "id": "seo",
      "ruta": "plataforma/seo.md",
      "titulo": "SEO",
      "tipo": "transversal",
      "dominio": "plataforma",
      "padre": "marco-general",
      "dependencias": [
        "galeria-colecciones",
        "ficha-foto",
        "paginas"
      ],
      "fase": "v1.0",
      "estado": "revision",
      "version": "0.1",
      "actualizado": "2026-10-14",
      "notas": "Borrador 0.1: indexación desde el subdominio con URL_SITIO, lienzo OG con foto completa y marca, licencia en Google Imágenes, Search Console, robots de IA (búsqueda sí, entrenamiento no). Al aprobar: marco 1.7, modelo 1.4, consulta 1.2, páginas 1.1; T-010 y T-011."
    },
    {
      "id": "despliegue",
      "ruta": "plataforma/despliegue.md",
      "titulo": "Despliegue y dominio",
      "tipo": "transversal",
      "dominio": "plataforma",
      "padre": "marco-general",
      "dependencias": [
        "modelo-contenido-panel"
      ],
      "fase": "v1.0",
      "estado": "pendiente",
      "version": null,
      "actualizado": "2026-10-07",
      "notas": ""
    }
  ],
  "tareas": [
    {
      "id": "T-001",
      "titulo": "Crear el repositorio privado RodDiazT/Web_RodDiaz en GitHub y dar acceso a la app de Claude",
      "categoria": "desarrollo",
      "origen": "marco-general",
      "bloquea": [],
      "estado": "hecha",
      "creada": "2026-10-07",
      "cerrada": "2026-10-07"
    },
    {
      "id": "T-002",
      "titulo": "Crear cuenta gratis en Resend con rodrigodiaztapia@gmail.com y generar clave de API",
      "categoria": "desarrollo",
      "origen": "marco-general",
      "bloquea": [
        "consulta-copia"
      ],
      "estado": "descartada",
      "creada": "2026-10-07",
      "cerrada": "2026-10-07",
      "notas": "Rod elimina de la v1.0 el aviso por correo y la analítica"
    },
    {
      "id": "T-003",
      "titulo": "Crear cuenta gratis de Cloudflare y activar Web Analytics",
      "categoria": "desarrollo",
      "origen": "marco-general",
      "bloquea": [
        "seo"
      ],
      "estado": "descartada",
      "creada": "2026-10-07",
      "cerrada": "2026-10-07",
      "notas": "Rod elimina de la v1.0 el aviso por correo y la analítica"
    },
    {
      "id": "T-004",
      "titulo": "Revisar en la facturación de Railway el consumo actual y fijar un límite de gasto mensual (plan Pro confirmado)",
      "categoria": "desarrollo",
      "origen": "marco-general",
      "bloquea": [
        "despliegue"
      ],
      "estado": "abierta",
      "creada": "2026-10-07",
      "cerrada": null
    },
    {
      "id": "T-005",
      "titulo": "Seleccionar al menos 12 fotos de lanzamiento con título, lugar y fecha",
      "categoria": "contenido",
      "origen": "marco-general",
      "bloquea": [
        "despliegue"
      ],
      "estado": "abierta",
      "creada": "2026-10-07",
      "cerrada": null
    },
    {
      "id": "T-006",
      "titulo": "Definir catálogo inicial de tamaños (cm) y tipos de papel",
      "categoria": "contenido",
      "origen": "marco-general",
      "bloquea": [
        "modelo-contenido-panel"
      ],
      "estado": "abierta",
      "creada": "2026-10-07",
      "cerrada": null
    },
    {
      "id": "T-007",
      "titulo": "Escribir el texto de Sobre mí y elegir foto de perfil",
      "categoria": "contenido",
      "origen": "marco-general",
      "bloquea": [
        "paginas"
      ],
      "estado": "abierta",
      "creada": "2026-10-07",
      "cerrada": null
    },
    {
      "id": "T-008",
      "titulo": "Crear cliente OAuth de Google Cloud para el inicio de sesión del panel",
      "categoria": "desarrollo",
      "origen": "marco-general",
      "bloquea": [
        "modelo-contenido-panel"
      ],
      "estado": "abierta",
      "creada": "2026-10-07",
      "cerrada": null
    },
    {
      "id": "T-009",
      "titulo": "Elegir la foto de portada, marcar al menos 6 destacadas, revisar portada y punto focal de cada colección y fijar fotos (opcional)",
      "categoria": "contenido",
      "origen": "galeria-colecciones",
      "bloquea": [
        "despliegue"
      ],
      "estado": "abierta",
      "creada": "2026-10-14",
      "cerrada": null
    }
  ]
}
```
<!-- CHECKLIST:FIN -->

## Control de cambios

| Fecha | Cambio |
|---|---|
| 2026-10-07 | Creación del índice. Marco general en revisión (0.1); 8 documentos identificados; tareas T-001 a T-007. |
| 2026-10-07 | Marco general 0.2: acceso con Google, aviso por Resend; T-002 redefinida; nueva T-008. |
| 2026-10-07 | Marco general 0.3: se eliminan de la v1.0 el aviso por correo y la analítica; `seo-analitica` pasa a `seo`. T-001 hecha; T-002 y T-003 descartadas; T-004 redefinida. |
| 2026-10-07 | Marco general aprobado (1.0). Quedan desbloqueados `sistema-de-diseno` y `modelo-contenido-panel`. |
| 2026-10-07 | Sistema de diseño en revisión (0.1): Cormorant Garamond + Manrope, grafito neutro sin acento, marca "Rod Díaz" configurable a logo. |
| 2026-10-07 | Sistema de diseño 0.2 tras revisión UX/UI: columna lateral en ficha, visor, "Rod Díaz" como nombre único, filete por foto, favicon RD, perfil ICC sRGB. |
| 2026-10-07 | Sistema de diseño aprobado (1.0). Marco general pasa a 1.1. Siguiente: `modelo-contenido-panel`. |
| 2026-10-13 | Modelo de contenido y panel en revisión (0.1): una colección por foto con jerarquía de dos niveles, papeles por formato, fotos de vitrina, solo JPG, registro de intentos de acceso. |
| 2026-10-13 | Modelo de contenido y panel aprobado (1.0). Marco general pasa a 1.2. Quedan desbloqueados `galeria-colecciones`, `paginas` y `despliegue`. |
| 2026-10-14 | Galería y colecciones en revisión (0.1): filas justificadas sin recorte, fijadas en /fotos, scroll infinito, página /colecciones, filtro también en colecciones, recorte 4:5 de tarjetas con punto focal. |
| 2026-10-14 | Galería y colecciones aprobado (1.0). Marco general pasa a 1.3 y modelo de contenido a 1.1. Nueva T-009 (contenido). Queda desbloqueado `ficha-foto`. |
| 2026-10-14 | Ficha de foto en revisión (0.1): resumen de copias con desplegable y elección de tamaño, barra móvil al pasar el botón, mes y año, historia plegada, compartir nativo, «Más de <colección>», contexto resuelto en el navegador y `GET /datos/contexto`. |
| 2026-10-14 | Ficha de foto aprobada (1.0). Marco general pasa a 1.4 y galería a 1.1. Sin tareas nuevas. Queda desbloqueado `consulta-copia`. |
| 2026-10-14 | Consulta de copia en revisión (0.1): página propia, hasta 5 fotos con buscador, ciudad opcional, consulta general, casilla de consentimiento, respuesta con borrador en Gmail, indicador mensual en el dashboard. |
| 2026-10-14 | Consulta de copia 0.2: casilla obligatoria incluye ser contactado por los medios indicados; casilla opcional de novedades y promociones con la entidad `Suscriptor`. |
| 2026-10-14 | Consulta de copia aprobada (1.0). Marco general pasa a 1.5, modelo de contenido a 1.2 y ficha a 1.1. Siguiente: `paginas` (también desbloqueado `despliegue`). |
| 2026-10-14 | Páginas en revisión (0.1): Contacto con botón a la consulta general y sin correo visible, Sobre mí con destacadas, política de privacidad y condiciones completas en la semilla, páginas libres sin menú. Ley 21.719 reverificada. |
| 2026-10-14 | Páginas aprobado (1.0). Marco general pasa a 1.6, modelo de contenido a 1.3 y consulta de copia a 1.1. Sin tareas nuevas. Siguientes desbloqueados: `seo` y `despliegue`. |
| 2026-10-14 | SEO en revisión (0.1): indexar desde el subdominio con host único, vista previa con foto completa y marca, títulos con lugar, descripción automática editable, etiqueta "Con licencia", Search Console, características indexables, robots de IA de búsqueda sí y de entrenamiento no. |

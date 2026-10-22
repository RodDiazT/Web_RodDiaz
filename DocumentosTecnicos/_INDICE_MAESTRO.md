# Índice maestro — Rod Díaz

## Documentos

| Ruta | Tipo | Versión | Estado | Producto | Padre | Dependencias |
|---|---|---|---|---|---|---|
| Ruta | Tipo | Versión | Estado | Producto | Padre | Dependencias |
|---|---|---|---|---|---|---|
| `marco-general/marco-general-proyecto.md` | marco | 1.10 | aprobado | v1.0 | — | — |
| `identidad/sistema-de-diseno.md` | transversal | 1.5 | aprobado | v1.0 | marco-general | marco-general |
| `contenido/modelo-contenido-panel.md` | componente | 1.10 | aprobado | v1.0 | marco-general | marco-general |
| `portafolio/galeria-colecciones.md` | componente | 1.8 | aprobado | v1.0 | marco-general | sistema-de-diseno, modelo-contenido-panel |
| `portafolio/ficha-foto.md` | componente | 1.5 | aprobado | v1.0 | marco-general | sistema-de-diseno, modelo-contenido-panel, galeria-colecciones |
| `consultas/consulta-copia.md` | componente | 1.5 | aprobado | v1.0 | marco-general | modelo-contenido-panel, ficha-foto |
| `paginas/paginas.md` | componente | 1.4 | aprobado | v1.0 | marco-general | sistema-de-diseno, modelo-contenido-panel |
| `plataforma/seo.md` | transversal | 1.2 | aprobado | v1.0 | marco-general | galeria-colecciones, ficha-foto, paginas |
| `plataforma/despliegue.md` | transversal | 1.5 | aprobado | v1.0 | marco-general | modelo-contenido-panel |

## Árbol

```
marco-general/marco-general-proyecto.md        [aprobado 1.10]
├── identidad/sistema-de-diseno.md             [aprobado 1.5]
├── contenido/modelo-contenido-panel.md        [aprobado 1.10]
├── portafolio/galeria-colecciones.md          [aprobado 1.8]
├── portafolio/ficha-foto.md                   [aprobado 1.5]
├── consultas/consulta-copia.md                [aprobado 1.5]
├── paginas/paginas.md                         [aprobado 1.4]
├── plataforma/seo.md                          [aprobado 1.2]
└── plataforma/despliegue.md                   [aprobado 1.5]
```

## Tareas del dueño

### Desarrollo
| Id | Tarea | Bloquea | Estado | Creada |
|---|---|---|---|---|
| T-001 | Crear el repositorio privado RodDiazT/Web_RodDiaz en GitHub y dar acceso a la app de Claude | — | hecha (2026-10-07) | 2026-10-07 |
| T-002 | Crear cuenta gratis en Resend con rodrigodiaztapia@gmail.com y generar clave de API | consulta-copia | descartada (2026-10-07) | 2026-10-07 |
| T-003 | Crear cuenta gratis de Cloudflare y activar Web Analytics | seo | descartada (2026-10-07) | 2026-10-07 |
| T-004 | Revisar en la facturación de Railway el consumo actual y fijar en Usage Limits un aviso de USD 25 y un tope de USD 40 | despliegue | hecha (2026-10-16) | 2026-10-07 |
| T-008 | Crear cliente OAuth de Google Cloud para el inicio de sesión del panel | modelo-contenido-panel | hecha (2026-10-17) | 2026-10-07 |
| T-010 | Verificar el sitio en Google Search Console y enviar el sitemap (al lanzar) | — | abierta | 2026-10-14 |
| T-012 | Comprar el dominio .cl cuando decidas difundir el sitio (v1.x) | — | abierta | 2026-10-14 |
| T-014 | Crear bot en Telegram con @BotFather y registrar TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en Railway | — | hecha (2026-10-16) | 2026-10-14 |

### Contenido
| Id | Tarea | Bloquea | Estado | Creada |
|---|---|---|---|---|
| T-005 | Seleccionar al menos 12 fotos de lanzamiento con título, lugar y fecha | despliegue | abierta | 2026-10-07 |
| T-006 | Definir catálogo inicial de tamaños (cm) y tipos de papel | modelo-contenido-panel | abierta | 2026-10-07 |
| T-007 | Escribir el texto de Sobre mí y elegir foto de perfil | paginas | hecha (2026-10-17) | 2026-10-07 |
| T-009 | Elegir la foto de portada, marcar al menos 6 destacadas, revisar portada y punto focal de cada colección y fijar fotos (opcional) | despliegue | abierta | 2026-10-14 |
| T-011 | Escribir la descripción del sitio en Ajustes (máx. 160 caracteres: qué fotografías y dónde) | despliegue | abierta | 2026-10-14 |
| T-013 | Entregar 3 JPG de prueba exportados desde Lightroom: uno de 45 MP vertical, uno en Adobe RGB y uno con GPS | despliegue | abierta | 2026-10-14 |

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
  "actualizado": "2026-10-17T19:06-03:00",
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
      "version": "1.10",
      "actualizado": "2026-10-17",
      "notas": "1.10: cierre de T-008, definición de ambiente permanente de QA vs Oficial, panel Payload 100% en español y regla obligatoria de sincronización documental continua."
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
      "version": "1.5",
      "actualizado": "2026-10-20",
      "notas": "1.5: aplicación del Manual de Marca 2026 (silueta del Cerro El Plomo, logotipo horizontal en encabezado y Open Graph, apilado y monograma RD en /admin, y favicon oficial)."
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
      "version": "1.8",
      "actualizado": "2026-10-17",
      "notas": "1.8: revalidación integral en todas las colecciones al editar/recortar medios o fotos, y protección de Foto al editar solo focalPoint."
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
      "version": "1.8",
      "actualizado": "2026-10-22",
      "notas": "1.8: Hero Inmersivo a pantalla completa con fotografía nítida, velo cinemático y tipografía de autor."
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
      "version": "1.3",
      "actualizado": "2026-10-14",
      "notas": "1.3: leyenda de margen perimetral de conservación y firma; botón directo de WhatsApp en móviles."
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
      "version": "1.5",
      "actualizado": "2026-10-17",
      "notas": "1.5: conexión dinámica de textoConsentimiento, textoPromociones, plantillaRespuesta y plantillaNovedades desde AjustesSitio."
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
      "version": "1.4",
      "actualizado": "2026-10-17",
      "notas": "1.4: cierre de T-007 con texto biográfico de Rod Díaz en Sobre mí y autorretrato vinculado; corrección de validación de creación de páginas reservadas en Pagina.ts."
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
      "estado": "aprobado",
      "version": "1.2",
      "actualizado": "2026-10-20",
      "notas": "1.2: logotipo horizontal oficial en la franja inferior de los lienzos Open Graph."
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
      "estado": "aprobado",
      "version": "1.4",
      "actualizado": "2026-10-22",
      "notas": "1.4: vinculación permanente y regla de despliegue exclusivo vía Git/GitHub (via GitHub) en Railway, vetando deploys por CLI."
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
      "titulo": "Revisar en la facturación de Railway el consumo actual y fijar en Usage Limits un aviso de USD 25 y un tope de USD 40",
      "categoria": "desarrollo",
      "origen": "marco-general",
      "bloquea": [
        "despliegue"
      ],
      "estado": "hecha",
      "creada": "2026-10-07",
      "cerrada": "2026-10-16",
      "notas": "Rod configuró en Railway Usage Limits un hard limit de USD 30."
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
      "estado": "hecha",
      "creada": "2026-10-07",
      "cerrada": "2026-10-17",
      "notas": "Texto biográfico redactado y publicado en /sobre-mi junto al autorretrato en blanco y negro (Medio id=1)."
    },
    {
      "id": "T-008",
      "titulo": "Crear cliente OAuth de Google Cloud para el inicio de sesión del panel",
      "categoria": "desarrollo",
      "origen": "marco-general",
      "bloquea": [
        "modelo-contenido-panel"
      ],
      "estado": "hecha",
      "creada": "2026-10-07",
      "cerrada": "2026-10-17",
      "notas": "Cliente OAuth configurado en Google Cloud y registrado en Railway production."
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
    },
    {
      "id": "T-010",
      "titulo": "Verificar el sitio en Google Search Console y enviar el sitemap (al lanzar)",
      "categoria": "desarrollo",
      "origen": "seo",
      "bloquea": [],
      "estado": "abierta",
      "creada": "2026-10-14",
      "cerrada": null
    },
    {
      "id": "T-011",
      "titulo": "Escribir la descripción del sitio en Ajustes (máx. 160 caracteres: qué fotografías y dónde)",
      "categoria": "contenido",
      "origen": "seo",
      "bloquea": [
        "despliegue"
      ],
      "estado": "abierta",
      "creada": "2026-10-14",
      "cerrada": null
    },
    {
      "id": "T-012",
      "titulo": "Comprar el dominio .cl cuando decidas difundir el sitio (v1.x)",
      "categoria": "desarrollo",
      "origen": "despliegue",
      "bloquea": [],
      "estado": "abierta",
      "creada": "2026-10-14",
      "cerrada": null,
      "notas": "Bloquea la difusión (v1.x), no el lanzamiento."
    },
    {
      "id": "T-013",
      "titulo": "Entregar 3 JPG de prueba exportados desde Lightroom: uno de 45 MP vertical, uno en Adobe RGB y uno con GPS",
      "categoria": "contenido",
      "origen": "despliegue",
      "bloquea": [
        "despliegue"
      ],
      "estado": "abierta",
      "creada": "2026-10-14",
      "cerrada": null
    },
    {
      "id": "T-014",
      "titulo": "Crear bot en Telegram con @BotFather y registrar TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en Railway",
      "categoria": "desarrollo",
      "origen": "consulta-copia",
      "bloquea": [],
      "estado": "hecha",
      "creada": "2026-10-14",
      "cerrada": "2026-10-16",
      "notas": "Bot @WebRodDiaz_bot configurado y registrado en Railway production."
    }
  ]
}
```
<!-- CHECKLIST:FIN -->

## Control de cambios

| Fecha | Cambio |
|---|---|
| 2026-10-20 | Aplicación integral del Manual de Marca Rod Díaz 2026 (silueta del Cerro El Plomo, 5.424 m): logotipo horizontal en Hueso `#F4F2EE` en encabezado (`Marca.tsx`) y lienzos Open Graph (`lienzo-og.ts`), logotipo apilado y monograma RD en `/admin` (`LogoAdmin.tsx`, `IconoAdmin.tsx`), y favicon con la línea del Plomo (`icon.svg`, `favicon.ico`, `apple-icon.png`). Sistema de diseño 1.5, SEO 1.2. |
| 2026-10-17 | Cierre de T-007 (texto biográfico de "Sobre mí" redactado, vinculado al autorretrato en blanco y negro en `Medios auxiliares` y publicado en `/sobre-mi`; corrección en `beforeValidate` de `Pagina.ts` para creación inicial de páginas reservadas). Cierre de T-008 (cliente Google OAuth configurado y operativo en `/admin`). Formalización del ambiente actual como entorno permanente de QA/pruebas (`ENTORNO=pruebas`) previo a duplicar al entorno Oficial al aprobar QA. Traducción íntegra del panel Payload al español (`@payloadcms/translations`, etiquetas en español y ocultamiento de botones de contraseña local) y regla de actualización documental obligatoria en cada modificación. Marco 1.10, modelo-contenido-panel 1.7, paginas 1.4, despliegue 1.2. |
| 2026-10-14 | Auditoría integral y granular Fine Art / Tech Lead completada y aprobada por Rod. Actualización masiva de documentos: Canon PRO-1100, margen de conservación y ratios 3:2, papeles Fine Art enriquecidos, lienzo Open Graph para fotos verticales, aviso push por bot de Telegram, antispam móvil 1.8 s, snapshots en consultas, optimización de memoria Sharp. Marco 1.9, sistema-de-diseno 1.1, modelo-contenido-panel 1.6, ficha-foto 1.3, consulta-copia 1.4, paginas 1.3, seo 1.1, despliegue 1.1. Nace tarea T-014. |
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
| 2026-10-14 | SEO aprobado (1.0). Marco general pasa a 1.7, modelo de contenido a 1.4, consulta de copia a 1.2 y páginas a 1.1. Nuevas T-010 (desarrollo) y T-011 (contenido). Siguiente: `despliegue`. |
| 2026-10-14 | Despliegue en revisión (0.1): producción y pruebas en US East (pruebas automático, producción manual), despliegue solo con cambios de código, respaldos de Railway y descarga mensual desde el panel, recuperación de acceso con enlace de un solo uso, aviso USD 25 y tope USD 40, lanzamiento en subdominio indexado sin difundir. |
| 2026-10-14 | Despliegue aprobado (1.0). Marco general pasa a 1.8, modelo de contenido a 1.5, consulta de copia a 1.3, páginas a 1.2, galería a 1.2 y ficha a 1.2. T-004 redefinida; nuevas T-012 (desarrollo) y T-013 (contenido). Todos los documentos de la v1.0 quedan aprobados. |

# Instrucciones para Claude Code — Web_RodDiaz

1. Antes de implementar, haz `git pull` en `main` y lee `DocumentosTecnicos/_INDICE_MAESTRO.md`. Su bloque JSON es la fuente de verdad.
2. Implementa **solo** documentos con estado `aprobado`. Nunca implementes documentos `revision` ni `para_revision`.
3. Lee siempre el documento, su padre y `DocumentosTecnicos/marco-general/marco-general-proyecto.md`.
4. Usa los nombres oficiales de entidad del marco general (§6.1), sin sinónimos ni tildes en el código.
5. Si encuentras una contradicción entre un documento y el código, o entre documentos, **repórtala** y no la resuelvas por tu cuenta.
6. No escribas en el código textos, enlaces ni datos de contacto que se administran desde el panel.
7. Nunca publiques originales ni metadatos (EXIF o GPS) de las fotos.
8. No edites a mano vistas derivadas (tablero, `data.json`).
9. Cada vez que se realice una modificación, corrección o ajuste en el código o en la configuración (durante el desarrollo, QA o mantenimiento), se deben actualizar de inmediato los documentos técnicos respectivos en `DocumentosTecnicos/` a modo de documentación viva. Nunca expongas claves, tokens ni secretos en los documentos ni en el repositorio.
10. Los despliegues a Railway se originan **exclusivamente desde GitHub (`git push` a `main`)** mediante la integración nativa de Railway con el repositorio `RodDiazT/Web_RodDiaz`. Queda prohibido desplegar vía CLI (`railway up`) para garantizar trazabilidad y consistencia 1:1 entre Git y los entornos desplegados.

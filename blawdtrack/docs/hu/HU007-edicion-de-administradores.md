# HU007 · Edición de administradores

**Estado:** en desarrollo (Sprint 3). Task 91 hecha: endpoint de búsqueda y validación de existencia del
administrador. El resto de la historia (edición, interfaz) sigue pendiente.

**Rama:** `feature/hu007/T01/91/silesky` (Task 91, backend). Pruebas y evidencias:
[`HU007-Task91-pruebas.md`](../HU007-Task91-pruebas.md).

## Task 91 · Buscar y validar que el administrador exista

`GET /api/v1/admins/{documentType}/{documentNumber}`, solo Súper Usuario: devuelve el perfil del administrador (sin
credenciales) o `404 ADMINISTRADOR_NO_EXISTENTE` si no existe o el documento es de otro rol. Detalle en el documento
de pruebas.

## Qué se sabe hoy

- Antes de la Task 91 no había código de esta historia: `AdminController` solo exponía listar, crear, consultar
  elegibilidad y eliminar administradores, y el menú lateral no tiene una opción de "Editar administrador".
- La rama remota `feature/HU007-editar-admin` (julio de 2026) no tiene commits propios respecto a `develop`.

## Cuando se implemente

Este documento debe seguir la misma estructura que las demás historias: criterios y su estado, funcionamiento
en backend y frontend, clases involucradas y qué prueba cada test.

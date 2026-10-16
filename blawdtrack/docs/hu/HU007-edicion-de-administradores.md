# HU007 · Edición de administradores

**Estado:** en desarrollo (Sprint 3). Tasks 91 y 92 hechas: búsqueda y validación de existencia del administrador, y
actualización de datos con cierre de sesión y bitácora. La interfaz de edición sigue pendiente.

**Ramas:** `feature/hu007/T01/91/silesky` (Task 91) y `feature/hu007/T02/92/silesky` (Task 92, apilada sobre la 91),
ambas de backend. Pruebas y evidencias: [`HU007-Task91-pruebas.md`](../HU007-Task91-pruebas.md) y
[`HU007-Task92-pruebas.md`](../HU007-Task92-pruebas.md).

## Task 91 · Buscar y validar que el administrador exista

`GET /api/v1/admins/{documentType}/{documentNumber}`, solo Súper Usuario: devuelve el perfil del administrador (sin
credenciales) o `404 ADMINISTRADOR_NO_EXISTENTE` si no existe o el documento es de otro rol. Detalle en el documento
de pruebas.

## Task 92 · Actualizar datos, cerrar la sesión y dejar historial

`PATCH /api/v1/admins/{documentType}/{documentNumber}`, solo Súper Usuario, con `fullName`, `email`, `password` y `status`
opcionales (al menos uno). Cambiar el estado o la contraseña cierra de inmediato la sesión abierta del administrador;
cada cambio queda en la bitácora de administradores con las acciones `ACTUALIZAR_ADMINISTRADOR`,
`ACTIVAR_ADMINISTRADOR`, `DESACTIVAR_ADMINISTRADOR` y `CAMBIAR_CONTRASENA_ADMINISTRADOR`, sin guardar nunca la
contraseña. Detalle en el documento de pruebas.

## Qué se sabe hoy

- Antes de la Task 91 no había código de esta historia: `AdminController` solo exponía listar, crear, consultar
  elegibilidad y eliminar administradores, y el menú lateral no tiene una opción de "Editar administrador".
- La rama remota `feature/HU007-editar-admin` (julio de 2026) no tiene commits propios respecto a `develop`.

## Cuando se implemente

Este documento debe seguir la misma estructura que las demás historias: criterios y su estado, funcionamiento
en backend y frontend, clases involucradas y qué prueba cada test.

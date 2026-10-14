# HU007 · Edición de administradores

**Estado:** en desarrollo (Sprint 3). Tasks 91 a 95 hechas: búsqueda y validación de existencia del administrador, actualización de datos
con cierre de sesión y bitácora (backend), y la pantalla *Actualizar administrador* con su integración y avisos
(frontend).

**Ramas:** `feature/hu007/T01/91/silesky` (Task 91), `feature/hu007/T02/92/silesky` (Task 92, apilada sobre la 91) y
`feature/hu007/T03/93-94-95/silesky` (Tasks 93, 94 y 95, frontend, apilada sobre la 92).

## Task 91 · Buscar y validar que el administrador exista

`GET /api/v1/admins/{documentType}/{documentNumber}`, solo Súper Usuario: devuelve el perfil del administrador (sin
credenciales) o `404 ADMINISTRADOR_NO_EXISTENTE` si no existe o el documento es de otro rol.

## Task 92 · Actualizar datos, cerrar la sesión y dejar historial

`PATCH /api/v1/admins/{documentType}/{documentNumber}`, solo Súper Usuario, con `fullName`, `email`, `password` y `status`
opcionales (al menos uno). Cambiar el estado o la contraseña cierra de inmediato la sesión abierta del administrador;
cada cambio queda en la bitácora de administradores con las acciones `ACTUALIZAR_ADMINISTRADOR`,
`ACTIVAR_ADMINISTRADOR`, `DESACTIVAR_ADMINISTRADOR` y `CAMBIAR_CONTRASENA_ADMINISTRADOR`, sin guardar nunca la
contraseña. `GET /api/v1/admins/{documentType}/{documentNumber}/history` devuelve el historial de un solo administrador.

## Tasks 93, 94 y 95 · Pantalla Actualizar administrador

Pantalla del Súper Usuario en *Gestión de usuarios → Administradores → Actualizar administrador*
(`/main-menu/admins/update`), con el mismo diseño que *Actualizar mensajero*: lista con búsqueda por documento, formulario
prellenado (nombre, correo, contraseña opcional y estado de acceso) y avisos de éxito y de error. Consulta el perfil con
la Task 91 y guarda con un `PATCH` de la Task 92. Igual que *Actualizar mensajero*, tiene la pestaña *Historial* de cada administrador y
el botón *Ver historial general* (con las eliminaciones).

## Qué se sabe hoy

- Antes de la Task 91 no había código de esta historia: `AdminController` solo exponía listar, crear, consultar
  elegibilidad y eliminar administradores, y el menú lateral no tiene una opción de "Editar administrador".
- La rama remota `feature/HU007-editar-admin` (julio de 2026) no tiene commits propios respecto a `develop`.

## Cuando se implemente

Este documento debe seguir la misma estructura que las demás historias: criterios y su estado, funcionamiento
en backend y frontend, clases involucradas y qué prueba cada test.

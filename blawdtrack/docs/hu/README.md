# Historias de usuario

Un documento por historia. Todos siguen la misma estructura:

1. **Resumen** de qué hace.
2. **Criterios de aceptación** y su estado en `develop`.
3. **Cómo funciona** en el backend y en el frontend, con diagramas.
4. **Clases y archivos** que la implementan.
5. **Pruebas:** qué verifica cada test.
6. **Limitaciones conocidas** en `develop` y **cambios pendientes** en el PR abierto de correcciones.

| Historia | Tema | Estado en `develop` | PR de correcciones |
|---|---|---|---|
| [HU001](HU001-inicio-de-sesion.md) | Inicio de sesión y control de acceso por rol | ✅ Funciona; códigos de error mejorables | `fix/hu001/criterios-aceptacion/silesky` (#3) |
| [HU002](HU002-recuperacion-de-contrasena.md) | Recuperación de contraseña | ❌ El correo no se envía | `fix/hu002/criterios-aceptacion/silesky` (#4) |
| [HU003](HU003-registro-de-mensajeros.md) | Registro de mensajeros | ⚠️ Sin validación del formato del documento | `fix/hu003/criterios-aceptacion/silesky` (#5) |
| [HU004](HU004-edicion-de-mensajeros.md) | Edición de mensajeros | ⚠️ Estado de acceso e historial solo en pantalla | `fix/hu004/criterios-aceptacion/silesky` (#6) |
| [HU005](HU005-desactivacion-de-mensajeros.md) | Desactivación de mensajeros | ❌ El endpoint no existe | `fix/hu005/criterios-aceptacion/silesky` (#7) |
| [HU006](HU006-creacion-de-administradores.md) | Creación de administradores | ✅ Backend; ⏳ formulario en ramas `t04`/`t05` | — |
| [HU007](HU007-edicion-de-administradores.md) | Edición de administradores | Siguiente sprint (fuera del alcance actual) | — |
| [HU008](HU008-eliminacion-de-administradores.md) | Eliminación de administradores | ⚠️ No se puede eliminar en la práctica | `fix/hu008/criterios-aceptacion/silesky` (#22) |
| [HU009](HU009-roles-y-permisos.md) | Roles y permisos | ⚠️ Solo por rol; la pantalla no guarda | `fix/hu009/criterios-aceptacion/silesky` (#13) |
| [HU011](HU011-deteccion-de-paquetes-duplicados.md) | Detección de paquetes duplicados | ✅ Backend (Tasks 113 y 114) en PR; ⏳ frontend e integración con la importación (HU-010) | `feature/hu011/T01/113/silesky`, `feature/hu011/T02/114/silesky` |

Otros documentos de apoyo en [`docs/`](..): [arquitectura](../arquitectura.md), guías de pruebas manuales
(`HU003-Task69-pruebas.md`, `HU006-Task85-pruebas.md`) y colecciones de Postman.

> El estado de la tabla describe `develop` al momento de escribir. Cuando se fusione cada PR de
> correcciones, actualiza el documento de su historia.

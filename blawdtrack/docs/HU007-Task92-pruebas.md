# HU007 · Task 92 (T02) · Pruebas y evidencias

Task: **T02 · Desarrollar la lógica de actualización de datos, control de sesiones e historial** (Backend).

El Súper Usuario modifica los datos de un administrador (nombre completo, correo, contraseña o estado de acceso). Cualquier
cambio de estado o de contraseña cierra de inmediato la sesión abierta del administrador, y todo cambio deja su traza en
la bitácora de auditoría. Se apoya en la búsqueda de la [Task 91](HU007-Task91-pruebas.md).

## Endpoint

`PATCH /api/v1/admins/{documentType}/{documentNumber}` — solo Súper Usuario. Cuerpo con campos opcionales:

```json
{ "fullName": "Ana Nueva", "email": "ana.nueva@example.com", "password": "NuevaClave123", "status": "INACTIVE" }
```

Solo se aplican los campos que lleguen, pero debe llegar al menos uno. El documento y el rol no se modifican.

| Caso | Respuesta |
| --- | --- |
| Cambios válidos | `200` con el perfil actualizado (`AdminDetailResponse`, sin contraseña). |
| Correo ya usado por otro usuario | `409`, código `DUPLICATE_EMAIL`. Repetir el correo propio (aunque cambie la mayúscula) no es duplicado. |
| El administrador no existe o el documento es de otro rol | `404`, `ADMINISTRADOR_NO_EXISTENTE`. |
| Cuerpo vacío, nombre en blanco, correo mal formado, contraseña débil (menos de 8 caracteres o sin letras y números) o estado desconocido | `400`. |
| Quien llama no es Súper Usuario | `403`, también con un cuerpo inválido (la autorización va antes de validar). |
| Sin token | `401`. |

## Qué pasa con la sesión y la bitácora

| Cambio | Sesión del administrador | Registro en la bitácora (`GET /api/v1/admins/audit-log`) |
| --- | --- | --- |
| Nombre y/o correo | Sigue abierta | `ACTUALIZAR_ADMINISTRADOR`, con los campos cambiados en la frase ("modificó los datos (nombre, correo) del Administrador…"). |
| Estado a `INACTIVE` | Se cierra de inmediato: sube `tokenVersion` y su token deja de servir en la siguiente solicitud. | `DESACTIVAR_ADMINISTRADOR` |
| Estado a `ACTIVE` | Se cierra (cualquier cambio de estado) | `ACTIVAR_ADMINISTRADOR` |
| Contraseña | Se cierra de inmediato | `CAMBIAR_CONTRASENA_ADMINISTRADOR`; la contraseña **nunca** se guarda en la bitácora. |
| Repetir el mismo estado o los mismos datos | Sin cambios | Sin registro. |

La contraseña se guarda siempre como hash. La bitácora de administradores que ya existía (creación y eliminación) ahora
incluye también estas cuatro acciones. Como esa bitácora es general (no filtra por administrador), cada registro se redacta
como una frase que dice quién hizo qué y a quién, por ejemplo: *"El Super Usuario 'Alicia' modificó los datos (nombre,
correo) del Administrador de Ventas 'Ana' (CEDULA 2-0345-0987)."* Las de estado y contraseña agregan "Su sesión activa se
cerró de inmediato." (ajuste hecho junto con la pantalla de las Tasks 93 a 95).

## Historial por administrador

`GET /api/v1/admins/{documentType}/{documentNumber}/history` (solo Súper Usuario) devuelve los registros de **ese**
administrador (alta, modificaciones, activaciones, desactivaciones y cambios de contraseña), del más reciente al más
antiguo, con la misma forma que `GET /api/v1/admins/audit-log`. Un administrador inexistente da `404`. Su eliminación no
aparece aquí (ya no hay administrador a quien preguntar): está en el historial general. La usa la pestaña *Historial*
de la pantalla [Actualizar administrador](HU007-Task93-95-pruebas.md). Lo prueban dos casos nuevos de
`AdminUpdateIntegrationTest` (ahora 12 pruebas).

## Cómo está hecho

- `AdminController.actualizar` — nuevo `PATCH`, con `@PreAuthorize` del Súper Usuario.
- `AdminService.updateAdministrator` / `AdminServiceImpl` — usa la búsqueda compartida de la Task 91, valida el correo
  (`AdminUniquenessValidator.validateEmailChange`), aplica los cambios con `User.changeStatus` y `User.changePassword`
  (que suben `tokenVersion` y limpian el último inicio de sesión) y registra cada cambio con `AuditService.logAction`.
- `AdminUpdateRequest` — cuerpo con validaciones; su `toString` oculta la contraseña.
- `AuditAction` — cuatro acciones nuevas.

## Resultado de las pruebas automáticas

Verificado el 14 de octubre de 2026 con Maven, desde `blawdtrack/backend`:

- `AdminUpdateIntegrationTest`: **10 pruebas aprobadas**, sin fallos.
- `AdminServiceImplTest`: **14 pruebas aprobadas** (4 nuevas y una actualizada), sin fallos.
- Las clases de administradores, auditoría y mensajeros que comparten el servicio y la bitácora suman **205 pruebas aprobadas**,
  `BUILD SUCCESS`.
- Estas pruebas usan H2 en memoria; no modifican la base MySQL.

| Prueba | Qué demuestra |
| --- | --- |
| `AdminUpdateIntegrationTest` · `updatesNameAndEmailAndLeavesATraceWithoutClosingTheSession` | Nombre y correo se limpian y guardan; `tokenVersion` no cambia; queda `ACTUALIZAR_ADMINISTRADOR`. |
| · `deactivatingTheAdminClosesTheOpenSessionImmediatelyAndIsAudited` | El token que funcionaba un momento antes responde 401 tras desactivar; queda `DESACTIVAR_ADMINISTRADOR`. |
| · `reactivatingTheAdminIsAudited` / `sendingTheSameStatusChangesNothingAndLeavesNoTrace` | Reactivar se audita; repetir el estado no deja rastro. |
| · `changingThePasswordHashesItClosesTheSessionAndNeverLogsIt` | Hash correcto, sesión cerrada, y la contraseña no aparece en la bitácora. |
| · `anEmailUsedByAnotherUserIsRejected` / `keepingTheSameEmailIsNotADuplicate` | 409 con `DUPLICATE_EMAIL`; el propio correo no choca. |
| · `unknownAdminOrAnotherRoleReturns404` | 404 con `ADMINISTRADOR_NO_EXISTENTE`. |
| · `invalidBodiesAreRejectedWith400` | Cuerpo vacío, nombre en blanco, correo inválido, contraseñas débiles y estado desconocido dan 400. |
| · `onlyTheSuperUserCanUpdateAndAuthorizationComesBeforeValidation` | 403 para Administrador de Ventas y Mensajero, también con cuerpo inválido; 401 sin token; no se modifica nada. |
| `AdminServiceImplTest` · `updatingOnlyTheNameAuditsItAndKeepsTheSessionOpen` | Solo el nombre: se audita `fullName`, `tokenVersion` igual y no se codifica ninguna contraseña. |
| · `changingStatusAndPasswordRaisesTheTokenVersionAndNeverAuditsThePassword` | Estado y contraseña suben `tokenVersion`; el detalle de auditoría es `status` y `password`. |
| · `anUnchangedRequestLeavesNoTrace` / `updatingAnUnknownAdminThrowsAdminNotFound` | Sin cambios no hay auditoría; administrador inexistente lanza el error. |
| · `getAuditLogReturnsTheAdminEntriesNewestFirst` | La bitácora de administradores consulta también las acciones nuevas. |

## Cómo correr las pruebas

Desde `blawdtrack/backend`, en PowerShell (con `JWT_SECRET` definido):

```powershell
.\mvnw.cmd test "-Dtest=AdminUpdateIntegrationTest,AdminServiceImplTest"
```

## Probar el endpoint a mano (opcional)

Con el backend en marcha y un token de Súper Usuario:

```powershell
curl.exe -s -X PATCH http://localhost:8080/api/v1/admins/CEDULA/<numero> -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"status\":\"INACTIVE\"}"
curl.exe -s http://localhost:8080/api/v1/admins/audit-log -H "Authorization: Bearer <token>"
```

La segunda llamada muestra la traza `DESACTIVAR_ADMINISTRADOR`. Si el administrador tenía sesión, su token deja de servir.

## Capturas más importantes

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola de `AdminUpdateIntegrationTest` con `Tests run: 10, Failures: 0`. |
| E2 | Consola de `AdminServiceImplTest` con `Tests run: 14, Failures: 0`. |
| E3 | (Opcional) La respuesta 200 del `PATCH` y la entrada nueva en la bitácora. |

**Si tienes que priorizar:** E1 (cubre sesión cerrada, bitácora y validaciones). Oculta correos y tokens en las capturas.

# HU007 · Task 91 (T01) · Pruebas y evidencias

Task: **T01 · Implementar el endpoint de búsqueda y validación de existencia del administrador** (Backend).

Antes de modificar a un administrador, el Súper Usuario necesita saber que existe. Este endpoint recibe el documento de
identidad del administrador, comprueba que quien lo pide es Súper Usuario y que el perfil existe, y devuelve sus datos
(para precargar el formulario de edición) o un error descriptivo si no lo encuentra.

## Endpoint

`GET /api/v1/admins/{documentType}/{documentNumber}` — solo Súper Usuario.

El proyecto identifica a las personas por **tipo y número de documento** (`CEDULA`, `DIMEX` o `PASAPORTE`), no solo por
la cédula; por eso la ruta lleva los dos, igual que la de la eliminación de administradores (HU-008).

| Caso | Respuesta |
| --- | --- |
| Existe un Administrador de Ventas con ese documento | `200` con `id`, `documentType`, `documentNumber`, `fullName`, `email`, `phone` y `status`. Nunca trae la contraseña. |
| No existe ese documento | `404`, código `ADMINISTRADOR_NO_EXISTENTE`, mensaje "Administrador no existente". |
| El documento pertenece a un usuario con otro rol (por ejemplo un mensajero) | `404`, el mismo error: para este flujo no es un administrador. |
| Mismo número con otro tipo de documento | Es otra persona: `404` si no hay un administrador con ese tipo. |
| Formato de documento inválido (`abc`, tipo desconocido) | `400`, código `VALIDATION_ERROR`. |
| Quien consulta es Administrador de Ventas o Mensajero | `403`, también con un documento inválido (la autorización se evalúa antes de validar). |
| Sin token | `401`. |

## Cómo está hecho

- `AdminController.buscar` — nuevo `GET`, con `@PreAuthorize` del Súper Usuario (la ruta `/api/v1/admins/**` ya es solo
  del Súper Usuario en `SecurityConfig`).
- `AdminService.findAdministrator` / `AdminServiceImpl` — la búsqueda del administrador se extrajo a
  `findSalesAdministrator`, que ahora usan la validación de eliminación (HU-008) y esta, para no duplicar la regla
  "existe y es Administrador de Ventas".
- `AdminDetailResponse` — el perfil que se devuelve, sin credenciales.
- El error reutiliza `AdminNotFoundException` y su manejador (`ADMINISTRADOR_NO_EXISTENTE`).

## Resultado de las pruebas automáticas

Verificado el 14 de octubre de 2026 con Maven, desde `blawdtrack/backend`:

- `AdminLookupIntegrationTest`: **8 pruebas aprobadas**, sin fallos.
- `AdminServiceImplTest`: **10 pruebas aprobadas** (3 nuevas), sin fallos.
- Pruebas de eliminación y registro de administradores (que comparten el servicio): aprobadas.
- En total, las 6 clases corridas suman **54 pruebas aprobadas**, `BUILD SUCCESS`.
- Estas pruebas usan H2 en memoria; no modifican la base MySQL.

| Prueba | Qué demuestra |
| --- | --- |
| `AdminLookupIntegrationTest` · `superUserFindsAnExistingAdminAndGetsItsProfileWithoutCredentials` | 200 con el perfil, sin `passwordHash` ni `password`. |
| · `unknownDocumentReturns404WithADescriptiveError` | 404 con código `ADMINISTRADOR_NO_EXISTENTE` y mensaje. |
| · `aUserThatIsNotASalesAdminIsNotFound` | Un mensajero con ese documento no se encuentra como administrador. |
| · `sameDocumentNumberUnderAnotherTypeIsAnotherPerson` | La búsqueda es por tipo y número. |
| · `invalidDocumentFormatReturns400` | 400 con `VALIDATION_ERROR`. |
| · `onlyTheSuperUserCanSearch` | Administrador de Ventas y Mensajero reciben 403. |
| · `authorizationIsResolvedBeforeValidatingTheDocument` | 403, no 400, con documento inválido. |
| · `requestWithoutTokenReturns401` | Sin sesión, 401. |
| `AdminServiceImplTest` · `findingAnAdminReturnsTheProfileWithoutCredentials` | El servicio devuelve el perfil sin la contraseña. |
| · `findingAnUnknownDocumentThrowsAdminNotFound` / `findingAUserWithAnotherRoleIsNotFoundEither` | El error cuando no existe o tiene otro rol. |

## Cómo correr las pruebas

Desde `blawdtrack/backend`, en PowerShell (con `JWT_SECRET` definido):

```powershell
.\mvnw.cmd test "-Dtest=AdminLookupIntegrationTest,AdminServiceImplTest"
```

## Probar el endpoint a mano (opcional)

Con el backend en marcha, inicia sesión como Súper Usuario y llama:

```powershell
curl.exe -s http://localhost:8080/api/v1/admins/CEDULA/<numero-de-documento> -H "Authorization: Bearer <token>"
```

Con el documento de un administrador existente devuelve su perfil; con uno inexistente, el 404 descrito arriba.

## Capturas más importantes

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola de `AdminLookupIntegrationTest` con `Tests run: 8, Failures: 0`. |
| E2 | Consola de `AdminServiceImplTest` con `Tests run: 10, Failures: 0`. |
| E3 | (Opcional) La respuesta 200 y la respuesta 404 del endpoint en Postman o `curl`. |

Oculta correos y tokens en las capturas.

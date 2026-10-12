# HU010 · Task 270 (T09) · Pruebas y evidencias

Task: **T09 · Implementar restricción de acceso por rol (Administrador de Ventas)**.

El módulo de importación de paquetes y sus endpoints solo los puede usar el personal autorizado. Cualquier otro rol
(el mensajero) o una petición sin sesión queda bloqueada, en el servidor y en las pantallas.

## Decisión de acceso

La task habla del Administrador de Ventas. La decisión de que **también el Súper Usuario** pueda importar es de
Genesis (el Súper Usuario debe poder usar todo el sistema); **falta registrarla en la Task 270 o en la HU-010 de
Azure DevOps** con quién y cuándo la confirmó el equipo (Alicia). Si no se confirma, se vuelve a `hasRole(SALES_ADMIN)`
y se quita la opción del menú del Súper Usuario. Con esa decisión el acceso a la importación es:

| Rol | Endpoints `/api/v1/packages/**` | Pantallas de importación |
| --- | --- | --- |
| Administrador de Ventas | Permitido | Permitido |
| Súper Usuario | Permitido | Permitido |
| Mensajero | **403 Forbidden** | Redirigido a su inicio |
| Sin sesión | **401 Unauthorized** | Redirigido a `/login` |

Antes, el servidor solo dejaba pasar al Administrador de Ventas y el Súper Usuario recibía 403 aunque viera el menú.

## Qué cambia

- **Filtro de seguridad** (`SecurityConfig`), con el alcance acotado a la importación:
  - `/api/v1/packages/import/**` y `/api/v1/packages/shipment-numbers/**` exigen `ADMIN_VENTAS` o `SUPER_USER`
    (`hasAnyRole`). Van declaradas **antes** de la regla general.
  - El resto, `/api/v1/packages/**` (eliminar, detalle, historial y búsqueda de las HU-012, HU-013 y HU-014), sigue
    siendo solo del Administrador de Ventas (`hasRole`).
  - Las reglas se evalúan antes de leer el cuerpo de la petición, así que un mensajero recibe 403 aunque mande un
    JSON inválido.
- **Controlador** (`PackageImportValidationController`): la comparación de números de envío usa la misma regla con
  `@PreAuthorize`, como segunda barrera a nivel de método.
- **Frontend:** sin cambios. Las rutas de importación ya están protegidas por rol (`ProtectedRoute`) y el menú las
  muestra solo a esos dos roles; el mensajero no las ve y, si entra por URL, vuelve a su inicio.
- Los endpoints que agreguen las Tasks 265 y 266 (`/import/preview` e `/import`) cuelgan de `/api/v1/packages/**`,
  así que el filtro los cubre. Deben usar el mismo mecanismo en su `@PreAuthorize`: hoy la Task 265 autoriza
  `/import/**` por permiso (`PAQUETE_IMPORTAR`) y esta task por rol, y ambas editan las mismas líneas de
  `SecurityConfig`. Hay que elegir roles o permisos y aplicarlo igual en los dos PR (solicitud dejada como comentario en #112).

## Resultado de las pruebas automáticas

Verificado el 10 de octubre de 2026 con Maven, desde `blawdtrack/backend`:

- `PackageShipmentNumberComparisonIntegrationTest`: **7 pruebas aprobadas**, sin fallos.
- Pruebas de `packages`, de seguridad y de autenticación: aprobadas, sin fallos.
- Estas pruebas usan H2 en memoria; no necesitan MySQL.
- Las pruebas del frontend de rutas por rol (`App.routes.test.jsx`) ya cubren la redirección del mensajero y de la
  persona sin sesión en las pantallas de importación.

| Prueba | Qué demuestra |
| --- | --- |
| `administradorDeVentasComparaMasivamenteContraLaBaseDeDatos` | El Administrador de Ventas ejecuta el endpoint (200). |
| `elSuperUsuarioTambienPuedeEjecutarLaComparacion` | El Súper Usuario también (200). |
| `elMensajeroNoPuedeEjecutarLaComparacion` | El mensajero recibe **403** aunque mande un cuerpo inválido. |
| `solicitudSinTokenDevuelveUnauthorizedAntesDeValidarElCuerpo` | Sin sesión, **401**. |
| `laImportacionEstaAbiertaAlSuperUsuarioYCerradaAlMensajero` | En `/api/v1/packages/import/**` el Administrador de Ventas y el Súper Usuario pasan el filtro y el mensajero recibe 403. |
| `elRestoDePaquetesSigueSiendoSoloDelAdministradorDeVentas` | En otra ruta de `/api/v1/packages/**` el Súper Usuario y el mensajero reciben 403; el Administrador de Ventas pasa el filtro. |
| `administradorDeVentasRecibeErrorDeValidacionParaListaVacia` | Con permiso, el cuerpo inválido da 400 (la validación sigue después de la seguridad). |
| `App.routes.test.jsx` (frontend) | Mensajero y persona sin sesión no ven las pantallas de importación. |

## Cómo correr las pruebas

Desde `blawdtrack/backend`, en PowerShell (con `JWT_SECRET` definido):

```powershell
.\mvnw.cmd test -Dtest=PackageShipmentNumberComparisonIntegrationTest
```

Y las del frontend desde `blawdtrack/frontend`:

```powershell
npx vitest run src/App.routes.test.jsx
```

## Capturas más importantes

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola de `PackageShipmentNumberComparisonIntegrationTest` con `Tests run: 7, Failures: 0`. |
| E2 | Consola de `App.routes.test.jsx` en verde. |

Oculta correos y tokens en las capturas.

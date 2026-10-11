# HU010 · Task 270 (T09) · Pruebas y evidencias

Task: **T09 · Implementar restricción de acceso por rol (Administrador de Ventas)**.

El módulo de importación de paquetes y sus endpoints solo los puede usar el personal autorizado. Cualquier otro rol
(el mensajero) o una petición sin sesión queda bloqueada, en el servidor y en las pantallas.

## Decisión de acceso

La task habla del Administrador de Ventas. Se decidió que **también el Súper Usuario** puede importar (el menú
"Gestión de paquetes" ya lo mostraba a los dos roles), así que el acceso es:

| Rol | Endpoints `/api/v1/packages/**` | Pantallas de importación |
| --- | --- | --- |
| Administrador de Ventas | Permitido | Permitido |
| Súper Usuario | Permitido | Permitido |
| Mensajero | **403 Forbidden** | Redirigido a su inicio |
| Sin sesión | **401 Unauthorized** | Redirigido a `/login` |

Antes, el servidor solo dejaba pasar al Administrador de Ventas y el Súper Usuario recibía 403 aunque viera el menú.

## Qué cambia

- **Filtro de seguridad** (`SecurityConfig`): `/api/v1/packages/**` exige el rol `ADMIN_VENTAS` o `SUPER_USER`
  (`hasAnyRole`). La regla se evalúa antes de leer el cuerpo de la petición, así que un mensajero recibe 403 aunque
  mande un JSON inválido.
- **Controlador** (`PackageImportValidationController`): la comparación de números de envío usa la misma regla con
  `@PreAuthorize`, como segunda barrera a nivel de método.
- **Frontend:** sin cambios. Las rutas de importación ya están protegidas por rol (`ProtectedRoute`) y el menú las
  muestra solo a esos dos roles; el mensajero no las ve y, si entra por URL, vuelve a su inicio.
- Los endpoints que agreguen las Tasks 265 y 266 (`/import/preview` e `/import`) cuelgan de `/api/v1/packages/**`,
  así que el filtro los cubre. Deben usar la misma regla en su `@PreAuthorize` (hoy declaran solo
  `ADMIN_VENTAS` o la autoridad `PAQUETE_IMPORTAR`).

## Resultado de las pruebas automáticas

Verificado el 10 de octubre de 2026 con Maven, desde `blawdtrack/backend`:

- `PackageShipmentNumberComparisonIntegrationTest`: **5 pruebas aprobadas**, sin fallos.
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
| E1 | Consola de `PackageShipmentNumberComparisonIntegrationTest` con `Tests run: 5, Failures: 0`. |
| E2 | Consola de `App.routes.test.jsx` en verde. |

Oculta correos y tokens en las capturas.

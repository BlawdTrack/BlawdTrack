# HU010 · Task 269 (T08) · Pruebas y evidencias

Task: **T08 · Implementar la confirmación de importación desde el frontend** (Frontend).

El administrador confirma la importación desde la pantalla de previsualización
([Task 268](HU010-Task268-pruebas.md)). El frontend envía la solicitud final al backend y muestra el resultado: el
paso 3 del flujo, con la cantidad de paquetes importados.

## Qué hace

- **Botón "Confirmar importación de N paquetes válidos"** en la previsualización. Envía el mismo archivo que se
  cargó a `POST /api/v1/packages/import` (multipart, parte `file`). El backend vuelve a leerlo y registra solo los
  válidos: los registros con errores y los duplicados se excluyen.
- **Mientras se envía:** el botón dice "Importando…" y se bloquea, igual que "Cargar otro archivo".
- **Resultado (paso 3, "Resultado de la importación"):**
  - Aviso "Importación completada" con la cantidad de paquetes registrados ("2 paquetes registrados de
    archivo.xlsx"); si no se registró ninguno, una advertencia.
  - Cuatro totales: registros leídos, importados, con errores y duplicados.
  - Los números de envío de los paquetes importados.
  - Botón "Importar otro archivo".
- **Errores:** sin permiso (403), sesión vencida, error del servidor o de red se muestran como alerta y se puede
  volver a intentar. Los textos hablan de importar, no de cargar.
- **No se puede confirmar** si no hay registros válidos o si se perdió el archivo (por ejemplo, al recargar la
  página): la pantalla lo avisa y pide cargarlo de nuevo.
- **Cómo viaja el archivo:** la pantalla de carga entrega la previsualización y el archivo a la de previsualización
  por el estado de navegación (`location.state.preview` y `location.state.file`).

## Qué falta del backend (importante)

- Los endpoints de Luis F (Tasks 265 y 266, `/import/preview` e `/import`) aún no están fusionados; sin ellos el
  servidor responde 500 y la pantalla muestra el error.
- `/import` hoy exige el rol Administrador de Ventas (`hasRole(ADMIN_VENTAS)`): el Súper Usuario recibiría 403
  hasta que la Task 270 lo ajuste. La pantalla muestra "No tienes permiso para confirmar la importación de paquetes."
- La respuesta que espera es `PackageImportExecutionResponse`: `fileName`, `totalRecords`, `registeredRecordsCount`,
  `invalidRecordsCount`, `duplicateRecordsCount` y `registeredShipmentNumbers`.

## Resultado de las pruebas automáticas

Verificado el 10 de octubre de 2026 con Node 22 y Vitest, desde `blawdtrack/frontend`:

- Pruebas de la task: **50 aprobadas** en 5 archivos (incluye las de la carga y la previsualización que cambiaron).
- Suite completa del frontend: **690 pruebas aprobadas en 56 archivos**, sin fallos.
- `npm run build` compila. `eslint` no reporta errores en los archivos de esta task (el de
  `PasswordRecoveryTestPage.jsx` ya existe en `develop`).
- Estas pruebas simulan el servicio: no necesitan el backend ni la base de datos.

| Prueba | Qué demuestra |
| --- | --- |
| `services/PackageImportService.test.js` | La confirmación envía el archivo como multipart a `/v1/packages/import`, devuelve el cuerpo y propaga el error. |
| `utils/importResult.test.js` | El modelo del resultado: totales, números registrados, cantidad calculada si falta, campos ausentes. |
| `utils/packageImportErrors.test.js` | Los textos de la confirmación (permiso, servidor, genérico) sin perder el mensaje del archivo inválido ni el 413. |
| `pages/PackageImportPreviewPage.test.jsx` | Botón con la cantidad de válidos; envía el archivo; resultado en el paso 3 con singular y plural; sin ninguno registrado; estado "Importando…"; error del servidor y de permiso con reintento; deshabilitado sin válidos o sin archivo. |
| `pages/PackageImportPage.test.jsx` | El archivo viaja junto con la previsualización. |

## Cómo correr las pruebas

Desde la carpeta `blawdtrack/frontend` (el prompt debe terminar en `...\blawdtrack\frontend>`), en PowerShell:

```powershell
# Solo las pruebas de esta task (50)
npx vitest run src/services/PackageImportService.test.js src/utils/importResult.test.js src/utils/packageImportErrors.test.js src/pages/PackageImportPreviewPage.test.jsx src/pages/PackageImportPage.test.jsx

# Los casos de la confirmación, legibles uno por uno
npx vitest run src/pages/PackageImportPreviewPage.test.jsx --reporter=verbose

# Toda la suite
npm test
```

## Cómo ver la pantalla en el navegador

1. Inicia el backend y el frontend (`npm run dev -- --host` en `blawdtrack/frontend`; `http://localhost:5173`).
2. Entra con un Administrador de Ventas, abre "Gestión de paquetes" → "Importar paquetes" y carga un `.xlsx` o `.csv`.
3. Con los endpoints de Luis F fusionados, "Ver previsualización" muestra el botón "Confirmar importación" y, al
   pulsarlo, el resultado. Sin ellos verás el error del servidor al cargar el archivo.

## Capturas más importantes

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola de las 50 pruebas de la task en verde (`5 passed`, `50 passed`). |
| E2 | Consola de la suite completa: `Test Files  56 passed (56)` y `Tests  690 passed (690)`. |
| E3 | Consola de `npx vitest run src/pages/PackageImportPreviewPage.test.jsx --reporter=verbose`: se leen los casos de confirmar, resultado, error y botón bloqueado. |
| E4 | La previsualización en el navegador mostrando el botón "Confirmar importación" (o el error del servidor al cargar). |

**Si tienes que priorizar:** E3 (lo que pide la task: disparar el registro y mostrar el resultado) y E2. Oculta
correos y tokens en las capturas.

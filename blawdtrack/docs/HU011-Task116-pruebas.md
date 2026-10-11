# HU011 · Task 116 · Pruebas y evidencias

Task: **T04 · Integrar el flujo de detección de duplicados con la API REST y contadores de resumen** (Frontend).

La pantalla **Detectar duplicados** (`/main-menu/paquetes/duplicados`) ahora carga el archivo ella misma: el
Administrador de Ventas o el Súper Usuario elige el archivo de Zoho Inventory, la pantalla lo envía a
`POST /api/v1/packages/import/preview` y muestra los totales de válidos y duplicados con sus alertas. Antes solo
mostraba la previsualización que le entregaba la pantalla de importación y, sin ella, un estado vacío.

## Qué hace

- **Sin archivo:** formulario de carga (zona de arrastre, archivo elegido, "Cargar y validar" bloqueado hasta elegir uno).
- **Envío:** el botón pasa a "Validando archivo…" y se bloquea mientras el backend responde.
- **Error:** un formato no permitido se rechaza en el navegador sin enviarse; un fallo del servidor se muestra como
  alerta y se puede volver a intentar.
- **Resultado:** aviso (advertencia con duplicados, éxito sin ellos), los cuatro totales y la lista resaltada.
- **Acciones:** "Ver previsualización completa" (lleva a la pantalla de la Task 268 con el mismo archivo) y "Cargar
  otro archivo".
- Si llega desde la importación con una previsualización, la muestra directamente.

Para no duplicar código, la selección y el envío del archivo quedaron en `usePackageFileUpload` y el formulario en
`PackageFileUploadForm`; la pantalla de importación (Task 267) usa ahora los mismos.

## Resultado de las pruebas automáticas

Verificado el 10 de octubre de 2026 con Node 22 y Vitest, desde `blawdtrack/frontend`:

- Pantallas de duplicados e importación: **28 aprobadas** en 2 archivos.
- Suite completa del frontend: **677 pruebas aprobadas en 55 archivos**, sin fallos.
- `npm run build` compila. `eslint` sobre los archivos de la task no tiene errores (el error de
  `PasswordRecoveryTestPage.jsx` ya existe en `develop`).
- Estas pruebas simulan el servicio: no necesitan el backend ni la base de datos.

| Prueba | Qué demuestra |
| --- | --- |
| `pages/DuplicateDetectionPage.test.jsx` | Formulario sin archivo; el archivo se envía al servicio y se muestran totales y duplicados; estado "Validando archivo…"; error del servidor con reintento; formato rechazado sin enviar; "Cargar otro archivo" (con archivo propio y con el que venía de la importación); enlace a la previsualización completa. |
| `pages/PackageImportPage.test.jsx` | Sigue verde tras mover la carga al hook y al formulario compartidos. |

## Cómo correr las pruebas

Desde `blawdtrack/frontend`, en PowerShell:

```powershell
npx vitest run src/pages/DuplicateDetectionPage.test.jsx src/pages/PackageImportPage.test.jsx
npm test
```

## Ver la pantalla con el servidor

Necesita el endpoint de previsualización de Luis F (Task 265), todavía sin fusionar; sin él el servidor responde 500
y la pantalla muestra el mensaje de error. Sin el servidor, la pantalla se ve en estado de carga y con los errores
de formato.

## Capturas

| Evidencia | Qué capturar |
| --- | --- |
| E1 | Consola de las 28 pruebas de las dos pantallas en verde. |
| E2 | Consola de la suite completa: `Test Files  55 passed (55)` y `Tests  677 passed (677)`. |
| E3 | La pantalla en el navegador sin archivo (formulario de carga). |
| E4 | La pantalla con un archivo elegido, o el aviso de error. |

Oculta correos y tokens en las capturas.

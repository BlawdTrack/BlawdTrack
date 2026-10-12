# HU011 · Task 116 · Pruebas y evidencias

Task: **T04 · Integrar el flujo de detección de duplicados con la API REST y contadores de resumen** (Frontend).

La detección de duplicados **no es una pantalla aparte**: es una verificación del flujo de **Importar paquetes**. Esta
task la deja integrada en la previsualización de la importación (`/main-menu/paquetes/previsualizacion`), que recibe
la respuesta de `POST /api/v1/packages/import/preview` que pide la pantalla de carga, con los totales de válidos y
duplicados y las alertas correspondientes.

## Qué cambia

- **El aviso de la previsualización dice de qué tipo son los duplicados:** "Duplicados: 2 ya registrados en la base
  de datos y 2 repetidos en el archivo".
- **Se cuentan filas, no números de envío**, como el backend de la Task 265 (`duplicateRecordsCount` es el total de
  filas excluidas y `duplicates[].occurrences` las filas de cada número). Un número repetido 3 veces son 3
  duplicados: el contador dice 3, la lista muestra 3 filas y el aviso dice "3 repetidos en el archivo". Las causas
  son excluyentes (`countDuplicateCauses`): las filas de un número registrado y repetido cuentan solo como
  "ya registrado", igual que `alreadyRegisteredCount` y `duplicatedInFileCount` de la comparación de la HU-011.
- **Se retira la pantalla "Detectar duplicados"**, su ruta (`/main-menu/paquetes/duplicados`), su opción del menú, el
  botón "Ver detalle de duplicados" y los componentes que solo ella usaba. Todo lo que mostraba (filas resaltadas
  con la etiqueta "Duplicado" y la causa, totales y alertas) ya está en la previsualización. "Gestión de paquetes"
  queda con "Importar paquetes".
- Las pruebas de `PackageStatusChip`, `StatCard` y `StatusMessage` pasaron a `components/packageUi.test.jsx`.

## Resultado de las pruebas automáticas

Verificado el 12 de octubre de 2026 con Node 22 y Vitest, desde `blawdtrack/frontend`:

- Pruebas del flujo (utilidades y pantalla de previsualización): **75 aprobadas** en 4 archivos.
- Suite completa del frontend: **656 pruebas aprobadas en 54 archivos**, sin fallos.
- `npm run build` compila. `eslint` no reporta errores en los archivos de esta task (el de
  `PasswordRecoveryTestPage.jsx` ya existe en `develop`).
- Estas pruebas no necesitan el backend ni la base de datos.

| Prueba | Qué demuestra |
| --- | --- |
| `utils/duplicateReport.test.js` | Nota de cada causa; conteo excluyente de "ya registrados" y "repetidos en el archivo"; entradas vacías. |
| `utils/importPreview.test.js` | La previsualización incluye las causas de duplicado por fila; un número repetido 3 veces aparece 3 veces. **Prueba con la respuesta real del backend** (`utils/fixtures/packageImportPreview.real.json`): los totales suman los registros leídos, el duplicado es el ya registrado, el registro sin teléfono trae su motivo. |
| `components/preview/preview.test.jsx` | El aviso explica el tipo de duplicados (singular y plural); totales, filtros y filas resaltadas. |
| `pages/PackageImportPreviewPage.test.jsx` | Los duplicados se revisan en la misma pantalla: el aviso trae la causa y no hay enlace a otra pantalla de duplicados. |
| `config/navigation.test.js`, `App.routes.test.jsx`, `components/layout/MainMenuLayout.test.jsx` | "Gestión de paquetes" solo tiene "Importar paquetes"; la ruta de duplicados ya no existe. |

## Prueba de punta a punta contra el backend real

Se levantó el backend de la Task 265 (rama `fix/HU010-task265-resolver-comentarios-pr`, la versión corregida de #112)
con una base de datos aparte y el frontend contra él, con un Administrador de Ventas real. Se cargó
`paquetes_e2e.csv` con: 4 paquetes válidos, uno con tres filas del mismo número y la misma orden, uno sin teléfono y
uno ya registrado (ENV-0900, registrado antes con `POST /api/v1/packages/import`).

Respuesta real (`200`): `totalRecords` 7, `validRecordsCount` 5, `invalidRecordsCount` 1, `duplicateRecordsCount` 1,
`duplicates: [{ shipmentNumber: "ENV-0900", occurrences: 1, reasons: ["ALREADY_REGISTERED"] }]`. Es la que está
copiada en el fixture de las pruebas.

Lo que mostró esa prueba:

- **El parser agrupa las filas con el mismo número de envío y la misma orden en un solo paquete** (las tres filas de
  ENV-2006 quedaron como un paquete válido). Si repiten el número con órdenes distintas, rechaza el archivo completo
  (`INVALID_PACKAGE_FILE`, "El paquete repite SO Number con valores diferentes"). Por eso el caso "repetido en el
  archivo" no se produce con un archivo real; la pantalla lo cubre porque el contrato del backend lo permite.
- **El backend aún no manda `deliveryWindow`** en los válidos: la pantalla muestra "Entrega: Sin calcular" y el
  horario (`schedule`). Falta pedírselo a Luis F.
- El tamaño máximo de archivo es 10 MB y un archivo mayor responde 413 (`PACKAGE_FILE_TOO_LARGE`).

## Cómo correr las pruebas

Desde `blawdtrack/frontend`, en PowerShell:

```powershell
npx vitest run src/utils/importPreview.test.js src/utils/duplicateReport.test.js src/components/preview src/pages/PackageImportPreviewPage.test.jsx
npm test
```

## Ver el flujo en el navegador (con el backend real)

1. Inicia el backend de la Task 265 y el frontend; entra con un Administrador de Ventas (el backend de la Task 265
   solo permite ese rol; el Súper Usuario recibe 403).
2. Abre "Gestión de paquetes": solo aparece **Importar paquetes** (ya no hay "Detectar duplicados").
3. Elige un `.xlsx` o `.csv`: la pantalla muestra "Validando archivo…". Un `.pdf` se rechaza sin enviarse.
4. "Ver previsualización" abre el aviso de duplicados con su causa, los totales y las filas resaltadas. Sin el
   endpoint de la Task 265 el servidor responde 500 y la pantalla de carga muestra el error.

Archivo de prueba `paquetes_e2e.csv` (para tener un duplicado, registra antes `ENV-0900` importando solo esa fila):

```csv
Packing Number,SO Number,Customer Name,Shipping Address,Shipping Phone,Notes
ENV-2001,SO-9001,Ana Mora Vargas,"Moravia, San José",8712-0094,De 9 a 4
ENV-2002,SO-9002,Beto Rojas,Heredia centro,8390-7781,De 9 a 4
ENV-2003,SO-9003,Carla Jiménez,"Escazú, San José",6012-4455,De 1 a 4
ENV-2004,SO-9004,Diego Solano,Alajuela,7099-1122,
ENV-2005,SO-9005,Elena Cruz,Cartago,,De 9 a 4
ENV-2006,SO-9006,Fabio León,Liberia,8811-2200,De 9 a 4
ENV-2006,SO-9006,Fabio León,Liberia,8811-2200,De 9 a 4
ENV-2006,SO-9006,Fabio León,Liberia,8811-2200,De 9 a 4
ENV-0900,SO-9010,Gina Salas,Puntarenas,8300-1100,De 9 a 4
```

## Capturas

| Evidencia | Qué capturar |
| --- | --- |
| E1 | Consola de las 75 pruebas del flujo en verde. |
| E2 | Consola de la suite completa: `Test Files  54 passed (54)` y `Tests  656 passed (656)`. |
| E3 | El menú lateral con "Gestión de paquetes" → solo "Importar paquetes". |
| E4 | **La previsualización con datos reales** (carga de `paquetes_e2e.csv` contra el backend): el aviso con el duplicado, los cuatro totales (7 leídos, 5 válidos, 1 con errores, 1 duplicado) y las filas resaltadas. |

Oculta correos y tokens en las capturas.

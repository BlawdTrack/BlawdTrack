# HU011 · Task 116 · Pruebas y evidencias

Task: **T04 · Integrar el flujo de detección de duplicados con la API REST y contadores de resumen** (Frontend).

La detección de duplicados **no es una pantalla aparte**: es una verificación del flujo de **Importar paquetes**. Esta
task la deja integrada en la previsualización de la importación (`/main-menu/paquetes/previsualizacion`), que recibe
la respuesta de `POST /api/v1/packages/import/preview` que pide la pantalla de carga, con los totales de válidos y
duplicados y las alertas correspondientes.

## Qué cambia

- **El aviso de la previsualización dice de qué tipo son los duplicados:** "Duplicados: 2 ya registrados en la base
  de datos y 1 repetido en el archivo". Las causas se cuentan de forma excluyente, igual que en el backend
  (`countDuplicateCauses`).
- **Se retira la pantalla "Detectar duplicados"**, su ruta (`/main-menu/paquetes/duplicados`), su opción del menú, el
  botón "Ver detalle de duplicados" y los componentes que solo ella usaba. Todo lo que mostraba (filas resaltadas
  con la etiqueta "Duplicado" y la causa, totales y alertas) ya está en la previsualización. "Gestión de paquetes"
  queda con "Importar paquetes".
- Las pruebas de `PackageStatusChip`, `StatCard` y `StatusMessage` pasaron a `components/packageUi.test.jsx`.

## Resultado de las pruebas automáticas

Verificado el 10 de octubre de 2026 con Node 22 y Vitest, desde `blawdtrack/frontend`:

- Pruebas del flujo (utilidades y pantalla de previsualización): **62 aprobadas** en 4 archivos.
- Suite completa del frontend: **643 pruebas aprobadas en 54 archivos**, sin fallos.
- `npm run build` compila. `eslint` no reporta errores en los archivos de esta task (el de
  `PasswordRecoveryTestPage.jsx` ya existe en `develop`).
- Estas pruebas no necesitan el backend ni la base de datos.

| Prueba | Qué demuestra |
| --- | --- |
| `utils/duplicateReport.test.js` | Nota de cada causa; conteo excluyente de "ya registrados" y "repetidos en el archivo"; entradas vacías. |
| `utils/importPreview.test.js` | La previsualización incluye las causas de duplicado contadas. |
| `components/preview/preview.test.jsx` | El aviso explica el tipo de duplicados (singular y plural); totales, filtros y filas resaltadas. |
| `pages/PackageImportPreviewPage.test.jsx` | Los duplicados se revisan en la misma pantalla: el aviso trae la causa y no hay enlace a otra pantalla de duplicados. |
| `config/navigation.test.js`, `App.routes.test.jsx`, `components/layout/MainMenuLayout.test.jsx` | "Gestión de paquetes" solo tiene "Importar paquetes"; la ruta de duplicados ya no existe. |

## Cómo correr las pruebas

Desde `blawdtrack/frontend`, en PowerShell:

```powershell
npx vitest run src/utils/importPreview.test.js src/utils/duplicateReport.test.js src/components/preview src/pages/PackageImportPreviewPage.test.jsx
npm test
```

## Ver el flujo en el navegador

1. Inicia el backend y el frontend; entra con el Súper Usuario o un Administrador de Ventas.
2. Abre "Gestión de paquetes": solo aparece **Importar paquetes** (ya no hay "Detectar duplicados").
3. Elige un `.xlsx` o `.csv`: la pantalla muestra "Validando archivo…". Un `.pdf` se rechaza sin enviarse.
4. Con el endpoint de previsualización del backend (Task 265, Luis F, aún sin fusionar), "Ver previsualización" abre
   el aviso de duplicados con su causa, los totales y las filas resaltadas. Sin ese endpoint el servidor responde
   500 y la pantalla de carga muestra el error.

## Capturas

| Evidencia | Qué capturar |
| --- | --- |
| E1 | Consola de las 62 pruebas del flujo en verde. |
| E2 | Consola de la suite completa: `Test Files  54 passed (54)` y `Tests  643 passed (643)`. |
| E3 | El menú lateral con "Gestión de paquetes" → solo "Importar paquetes". |
| E4 | La pantalla de carga con el error del servidor (500) o con el archivo `.pdf` rechazado. |

Oculta correos y tokens en las capturas.

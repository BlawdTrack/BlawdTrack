# HU010 · Task 267 (T06) · Pruebas y evidencias

Task: **T06 · Diseñar y maquetar la pantalla de carga de archivo** (Frontend).

Pantalla **Importar paquetes** (`/main-menu/paquetes/importar`), visible en el menú lateral para el Súper Usuario y
el Administrador de Ventas dentro de **Gestión de paquetes**. El usuario elige el archivo de Zoho Inventory, el
navegador valida su formato y el backend lo lee sin registrarlo.

## Qué hace la pantalla

- **Selector de archivo:** se puede arrastrar el archivo a la zona o usar el botón "Seleccionar archivo" (también con
  teclado). El selector solo ofrece `.xlsx` y `.csv`.
- **Validación en el navegador** (antes de enviar): formato admitido (sin distinguir mayúsculas), archivo no vacío. Un
  archivo no válido no queda seleccionado y se explica el motivo. El contenido (columnas, campos obligatorios) lo
  valida el backend.
- **Estados de la carga:**
  - *Cargando:* el botón pasa a "Validando archivo…", y la zona y el botón de quitar quedan bloqueados.
  - *Error:* se muestra el mensaje del backend para un archivo inválido (`INVALID_PACKAGE_FILE`), o un aviso propio
    para archivo demasiado grande (413), sesión vencida, falta de permiso (403), error del servidor o falta de
    conexión. El archivo queda seleccionado para reintentar.
  - *Éxito:* "Archivo cargado" con el nombre y los registros leídos. "Revisar duplicados" lleva a la pantalla
    Detectar duplicados con la previsualización; "Cargar otro archivo" vuelve a empezar.
- **Pasos de la importación:** indicador de los tres pasos del mockup (Cargar archivo, Previsualizar y validar,
  Confirmar registro). Esta task cubre el primero.
- La pantalla "Detectar duplicados" sin archivo ahora ofrece el enlace **Ir a importar paquetes**.

## Resultado de las pruebas automáticas

Verificado el 10 de octubre de 2026 con Node 22 y Vitest, desde `blawdtrack/frontend`:

- Pruebas nuevas de la task: **64 aprobadas** en 5 archivos, sin fallos ni omisiones.
- Suite completa del frontend: **610 pruebas aprobadas en 52 archivos**, sin fallos.
- `npm run build` compila y el lint de los archivos de la task no tiene errores.
- Estas pruebas no necesitan el backend ni la base de datos: el servicio se simula.

| Prueba | Qué demuestra |
| --- | --- |
| `utils/packageFile.test.js` | Validación de formato (.xlsx y .csv, mayúsculas, doble extensión, sin extensión), archivo vacío y ausente; tamaño legible. |
| `utils/packageImportErrors.test.js` | El mensaje del backend para un archivo inválido; 413; 401, 403, 500 y red; respaldo para estados inesperados. |
| `services/PackageImportService.test.js` | Envía el archivo como `multipart` a `POST /api/v1/packages/import/preview` y propaga el error de axios. |
| `components/import/import.test.jsx` | Zona de carga (elegir, soltar, varios archivos, mismo archivo dos veces, bloqueada); tarjeta del archivo; los tres pasos. |
| `pages/PackageImportPage.test.jsx` | Selección válida e inválida; estado cargando (controles bloqueados, un solo envío); éxito y paso a duplicados con la previsualización; errores del backend, de red y de permiso; descartar y reintentar. |
| `config/navigation.test.js`, `App.routes.test.jsx`, `MainMenuLayout.test.jsx`, `pages/DuplicateDetectionPage.test.jsx` | El ítem "Importar paquetes" en el menú de los dos roles, su ruta compartida, y el enlace desde el estado vacío de duplicados. |

## Cómo correr las pruebas

Desde la carpeta `blawdtrack/frontend` (el prompt debe terminar en `...\blawdtrack\frontend>`), en PowerShell:

```powershell
# Solo las pruebas nuevas de esta task (64)
npx vitest run src/utils/packageFile.test.js src/utils/packageImportErrors.test.js src/services/PackageImportService.test.js src/components/import src/pages/PackageImportPage.test.jsx

# Toda la suite
npm test
```

**Evidencia automática:** captura el resumen final: `Test Files  5 passed (5)` y `Tests  64 passed (64)` para la
ejecución corta, y `Test Files  52 passed (52)` y `Tests  610 passed (610)` para la completa.

## Cómo ver la pantalla en el navegador

1. Inicia el backend y el frontend (`npm run dev -- --host` en `blawdtrack/frontend`; la URL es `http://localhost:5173`).
2. Inicia sesión con el Súper Usuario o con un Administrador de Ventas.
3. En el menú lateral abre **Gestión de paquetes → Importar paquetes**.
4. Prueba un archivo `.pdf` o `.txt` (lo rechaza al instante) y uno vacío. Con un `.xlsx` o `.csv` válido pulsa
   **Cargar y validar**.

> El envío al servidor depende del endpoint `POST /api/v1/packages/import/preview` de Luis F, que todavía no está
> fusionado. Hasta entonces, con el backend actual la carga termina en el aviso de error de la sección de estados.
> La validación del formato en el navegador y los estados de error sí se pueden ver sin ese endpoint.

## Capturas más importantes

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola con las 64 pruebas nuevas en verde (`5 passed`, `64 passed`). |
| E2 | Consola de la suite completa: `Test Files  52 passed (52)` y `Tests  610 passed (610)`. |
| E3 | Pantalla **Importar paquetes** en reposo: los pasos, la zona de carga y el botón de envío bloqueado. |
| E4 | La pantalla con un archivo `.pdf` rechazado: el aviso "Formato no compatible. Solo se permiten archivos .xlsx y .csv.". |
| E5 | La pantalla con un `.xlsx` o `.csv` válido seleccionado: la tarjeta con su nombre y tamaño y el envío habilitado. |

**Si tienes que priorizar:** E3, E4 y E5 (lo que pide la task: selector, validación de extensión y mensajes) y E2.
Oculta correos y tokens en las capturas.

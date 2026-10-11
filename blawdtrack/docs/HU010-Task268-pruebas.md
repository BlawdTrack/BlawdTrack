# HU010 · Task 268 (T07) · Pruebas y evidencias

Task: **T07 · Diseñar y maquetar la pantalla de previsualización** (Frontend).

Pantalla **Previsualización de la importación** (`/main-menu/paquetes/previsualizacion`), el paso 2 de la
importación. Muestra al administrador, antes de importar, qué leyó el backend del archivo: cuántos registros son
válidos, cuáles tienen errores y por qué, cuáles están duplicados y el rango de entrega calculado de cada paquete
válido. A ella llega el éxito de la pantalla de carga ([Task 267](HU010-Task267-pruebas.md)).

## Qué hace la pantalla

- **Aviso principal:** en éxito si todo es válido, en advertencia si una parte se excluye ("2 registros con errores y
  1 duplicado en archivo.xlsx"), en error si ningún registro se puede importar.
- **Cuatro totales:** registros leídos, válidos, con errores y duplicados.
- **Lista agrupada con filtros** (Todos, Válidos, Con errores, Duplicados, cada uno con su cantidad). El backend no
  devuelve el orden original del archivo, así que la lista va agrupada: válidos, con errores y duplicados.
- **Cada registro** muestra número de envío y orden, cliente, dirección, teléfono, horario y su resultado:
  - *Válido:* con el **rango de entrega calculado** ("Entrega: 9:00 a. m. – 4:00 p. m.").
  - *Con errores:* fila resaltada en rojo, etiqueta "Error" y el mensaje de cada campo obligatorio que falta.
  - *Duplicado:* fila resaltada en amarillo (requisito de HU-011), etiqueta "Duplicado" y la causa.
  - El resaltado no depende solo del color: todas las filas llevan su etiqueta con texto.
- **Acciones:** "Ver detalle de duplicados" (solo si hay) lleva a la pantalla de la HU-011 con la misma
  previsualización, y "Cargar otro archivo" vuelve a la carga. **No** incluye confirmar la importación: es la
  Task 269.
- **Sin archivo en previsualización:** estado vacío con el enlace "Ir a importar paquetes".

## Qué falta del backend (importante)

La previsualización del backend (`POST /api/v1/packages/import/preview`) **todavía no manda el rango de entrega**:
hoy solo se calcula al registrar (`ZohoDeliveryWindowPolicy`). La pantalla ya lo espera y, mientras no llegue, cada
paquete válido muestra **"Entrega: Sin calcular"** en vez de inventarlo.

Lo que debe agregar el backend en cada registro de `validRecords` es:

```json
"deliveryWindow": { "start": "09:00:00", "end": "16:00:00" }
```

Es el `LocalTime` que Spring ya serializa así; la pantalla también acepta `"09:00"` y `[9, 0]`. Se pidió usar la misma
`ZohoDeliveryWindowPolicy` que usa el registro, para que lo que se ve sea lo que se guarda y no replicar su regla en
el frontend.

## Resultado de las pruebas automáticas

Verificado el 10 de octubre de 2026 con Node 22 y Vitest, desde `blawdtrack/frontend`:

- Pruebas nuevas de la task: **54 aprobadas** en 3 archivos, sin fallos ni omisiones.
- Suite completa del frontend: **671 pruebas aprobadas en 55 archivos**, sin fallos.
- `npm run build` compila y el lint de los archivos de esta task no tiene errores.
- Estas pruebas no necesitan el backend ni la base de datos.

| Prueba | Qué demuestra |
| --- | --- |
| `utils/importPreview.test.js` (28) | Formato del rango de entrega (`09:00:00`, `08:30`, `[10, 0]`, medianoche, horas inválidas); agrupación de filas; datos del válido; motivo de cada campo faltante; causas del duplicado; claves únicas; totales calculados si faltan; listas ausentes; filtros. |
| `components/preview/preview.test.jsx` (19) | Fila de válido, error y duplicado (etiqueta, notas, "Sin calcular", "Sin número de envío"); totales; filtros con `aria-pressed`; lista con conteo en singular y plural y mensaje vacío; aviso de éxito, advertencia y error; el filtro cambia la lista; `StatusRow`. |
| `pages/PackageImportPreviewPage.test.jsx` (7) | Título y paso 2 resaltado; estado vacío; aviso, totales y registros de la previsualización recibida; enlaces a cargar otro archivo y al detalle de duplicados con la misma previsualización; sin duplicados no hay detalle; no hay botón de confirmar. |
| `config/navigation.test.js`, `App.routes.test.jsx`, `pages/PackageImportPage.test.jsx` | La ruta nueva compartida por Súper Usuario y Administrador de Ventas; la flecha de retorno lleva al módulo; el éxito de la carga lleva a la previsualización. |

También se extrajo `StatusRow` (el marco resaltado de una fila) para usarlo en la fila de duplicados de HU-011 y en
esta pantalla, y `useNavigationPreview` para leer la previsualización del estado de navegación en las dos pantallas.

## Cómo correr las pruebas

Desde la carpeta `blawdtrack/frontend` (el prompt debe terminar en `...\blawdtrack\frontend>`), en PowerShell:

```powershell
# Solo las pruebas nuevas de esta task (54)
npx vitest run src/utils/importPreview.test.js src/components/preview src/pages/PackageImportPreviewPage.test.jsx

# Los casos del resaltado, legibles uno por uno
npx vitest run src/components/preview --reporter=verbose

# Toda la suite
npm test
```

**Evidencia automática:** `Test Files  3 passed (3)` y `Tests  54 passed (54)` para la ejecución corta, y
`Test Files  55 passed (55)` y `Tests  671 passed (671)` para la completa.

## Cómo ver la pantalla en el navegador

1. Inicia el backend y el frontend (`npm run dev -- --host` en `blawdtrack/frontend`; la URL es `http://localhost:5173`).
2. Inicia sesión con el Súper Usuario o un Administrador de Ventas y abre
   `http://localhost:5173/main-menu/paquetes/previsualizacion`: verás el estado vacío con el enlace a importar.
3. Para verla con datos hace falta que el endpoint `POST /api/v1/packages/import/preview` de Luis F esté
   fusionado y adaptado a la comparación por fila (hoy no lo está), y que el backend mande el rango de entrega.

## Capturas más importantes

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola con las 54 pruebas nuevas en verde (`3 passed`, `54 passed`). |
| E2 | Consola de la suite completa: `Test Files  55 passed (55)` y `Tests  671 passed (671)`. |
| E3 | Consola de `npx vitest run src/components/preview --reporter=verbose`: se leen los casos del resaltado de errores y duplicados, el rango de entrega y "Sin calcular". |
| E4 | La pantalla en el navegador en estado vacío ("Sin archivo en previsualización"). |

**Si tienes que priorizar:** E3 (lo que pide la task: indicar válidos, inválidos y duplicados, el motivo de cada
error y el rango de entrega) y E2. Oculta correos y tokens en las capturas.

# HU011 · Task 115 · Pruebas y evidencias

Task: **T03 · Desarrollar el diseño y resaltado de paquetes duplicados en la previsualización** (Frontend).

La pantalla muestra, antes de confirmar una importación, qué paquetes del archivo ya están registrados o se repiten,
resaltados y con el total de válidos y de duplicados. Para que el Administrador de Ventas pueda llegar a ella, esta
task también le da el menú lateral que hasta ahora solo tenía el Súper Usuario.

## Resultado de las pruebas automáticas

Verificado el 10 de octubre de 2026 con Node 22 y Vitest, desde `blawdtrack/frontend`:

- Pruebas nuevas de la pantalla: **36 aprobadas** en 3 archivos, sin fallos ni omisiones.
- Pruebas de navegación y rutas actualizadas al nuevo comportamiento: aprobadas (ver la tabla).
- Suite completa del frontend: **538 pruebas aprobadas en 47 archivos**, sin fallos.
- `npm run build`: compila. Los datos de ejemplo quedan en un archivo aparte (605 bytes) que el bundle principal
  no carga.
- `npx eslint` sobre los archivos de esta task: sin errores. El `eslint .` completo reporta un error que ya existe
  en `develop` (`'React' is defined but never used` en `src/pages/PasswordRecoveryTestPage.jsx`), ajeno a esta task.
- Estas pruebas no necesitan el backend ni la base de datos.

| Prueba | Qué demuestra |
| --- | --- |
| `utils/duplicateReport.test.js` (15) | Nota de cada causa ("Ya registrado en la base de datos", "Repetido N veces en el archivo"); totales con causas **excluyentes**; una fila por duplicado con cliente y dirección opcionales; respuestas nulas, vacías o incompletas. |
| `components/duplicates/duplicates.test.jsx` (15) | Etiqueta con texto para Válido / Duplicado / Error; tarjeta de cifra; los cuatro totales; **lista resaltada** con número, etiqueta "Duplicado" y causa por fila; aviso en advertencia (singular y plural), sin nombre de archivo, y en éxito cuando no hay duplicados. |
| `pages/DuplicateDetectionPage.test.jsx` (6) | Título y descripción; estado vacío "Sin archivo en previsualización"; el ejemplo solo con `allowSample`; previsualización recibida por el estado de navegación; archivo sin duplicados. |
| `config/navigation.test.js` (18) | Grupo "Gestión de paquetes" con "Detectar duplicados" para Súper Usuario y Administrador de Ventas; el Administrador de Ventas solo ve paquetes y su "Restablecer contraseña"; `getGroupRoles`; flecha de retorno de la pantalla. |
| `App.routes.test.jsx` (116) | Las rutas compartidas entre los dos roles; el Administrador de Ventas **no** entra a Mensajeros ni a Administradores y vuelve al menú principal; el inicio de cada rol está dentro de sus rutas. |
| `components/layout/MainMenuLayout.test.jsx` (16) | El menú lateral muestra "Detectar duplicados" al Súper Usuario y le da al Administrador de Ventas solo sus grupos. |
| `utils/roleRoutes.test.js`, `components/ProtectedRoute.test.jsx`, `components/ProvisionalHomePage.test.jsx` | Actualizadas: el inicio del Administrador de Ventas es `/main-menu` y restablece su contraseña en `/main-menu/restablecer-contrasena`. |

Los tests de navegación y de rutas existentes se modificaron porque el comportamiento cambió a propósito (el
Administrador de Ventas ya no tiene `/ventas`); se conservaron sus escenarios y se añadieron los nuevos.

## Cómo correr las pruebas

Desde la carpeta `blawdtrack/frontend`, en PowerShell:

```powershell
# Solo las pruebas nuevas de la pantalla (36)
npx vitest run src/utils/duplicateReport.test.js src/components/duplicates src/pages/DuplicateDetectionPage.test.jsx

# Toda la suite
npm test
```

**Evidencia automática:** captura el resumen final, que debe decir `Test Files  47 passed (47)` y
`Tests  538 passed (538)` para la suite completa (y `3 passed` / `36 passed` en la ejecución corta).

## Cómo ver la pantalla en el navegador

1. Inicia el backend y el frontend (`npm run dev -- --host` en `blawdtrack/frontend`; la URL es
   `http://localhost:5173`).
2. Inicia sesión con el Súper Usuario o con una cuenta de **Administrador de Ventas** (se crea desde la pantalla de
   administradores).
3. En el menú lateral abre **Gestión de paquetes → Detectar duplicados**. Sin una importación en curso verás el
   estado vacío.
4. Pulsa **Cargar ejemplo (solo desarrollo)**: aparece el aviso, los cuatro totales y los tres duplicados resaltados.
   Ese botón solo existe en modo desarrollo.
5. Con una cuenta de Administrador de Ventas comprueba además que el menú lateral solo trae **Gestión de paquetes** y
   **Seguridad y acceso**, y que entrar por URL a `/main-menu/mensajeros` te devuelve al menú principal.

## Capturas más importantes

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola con las 36 pruebas nuevas en verde (`3 passed`, `36 passed`). |
| E2 | Consola de la suite completa: `Test Files  47 passed (47)` y `Tests  538 passed (538)`. |
| E3 | Pantalla **Detectar duplicados** con el ejemplo cargado: aviso en advertencia, los cuatro totales y las filas resaltadas con la etiqueta "Duplicado" y la causa. |
| E4 | La misma pantalla en estado vacío ("Sin archivo en previsualización"). |
| E5 | Menú lateral de un Administrador de Ventas, con **Gestión de paquetes** abierto y sin los grupos de Mensajeros ni Administradores. |

**Si tienes que priorizar:** E3 (el resaltado, que es lo que pide la task), E5 (el acceso del Administrador de
Ventas) y E2 (que no se rompió nada). Oculta correos y tokens en las capturas.

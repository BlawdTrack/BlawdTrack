# HU011 · Detección de paquetes duplicados

**Ramas:** `feature/hu011/T01/113/silesky` (Task 113) y `feature/hu011/T02/114/silesky` (Task 114), fusionadas en
`HU-011` (#101 y #102), y `feature/hu011/T03/115/silesky` (Task 115, frontend), sobre `HU-011`. `HU-011` aún no
está fusionada en `develop`.

## Resumen

Antes de confirmar una importación de paquetes, el Administrador de Ventas puede saber qué números de envío del
archivo ya están registrados en la base de datos o se repiten dentro del propio archivo. Los duplicados se
identifican fila por fila, se cuentan y se excluyen de lo que se importa.

El backend de la historia está completo y la pantalla de duplicados (Task 115) está construida y visible en el menú
para el Súper Usuario y el Administrador de Ventas. Falta conectarla a la pantalla de importación de HU-010, que
todavía no existe en el frontend, y que la importación use el servicio de exclusión.

## Criterios de aceptación

| Criterio | Estado |
|---|---|
| Comparar los números de envío del archivo contra la base de datos | ✅ Task 113 |
| Identificar números repetidos dentro del mismo archivo | ✅ Task 113 |
| Resaltar los duplicados en la previsualización | ✅ Task 115: pantalla "Detectar duplicados" con filas resaltadas, etiqueta "Duplicado" y la causa. ⏳ Falta que la pantalla de importación (HU-010) le entregue la previsualización |
| Los duplicados no se importan | ⏳ El servicio de exclusión está listo (Task 114); la importación de HU-010 aún no lo llama |
| La detección ocurre antes de confirmar | ✅ El endpoint sirve a la previsualización y la exclusión se vuelve a ejecutar al confirmar |
| Solo el Administrador de Ventas ejecuta el proceso | ✅ `ADMIN_VENTAS`; otros roles reciben 403 y sin token, 401 |
| Indicar la cantidad de registros válidos y duplicados | ✅ Contadores en la respuesta |

## Cómo funciona en el backend

`POST /api/v1/packages/shipment-numbers/compare`, exclusivo del Administrador de Ventas. Recibe los números de
envío del archivo (máximo 1000 por solicitud, 50 caracteres cada uno, sin vacíos) y devuelve una entrada por
fila, en el orden del archivo.

```mermaid
sequenceDiagram
    participant N as Navegador
    participant C as PackageImportValidationController
    participant S as ShipmentNumberComparisonServiceImpl
    participant DB as Base de datos

    N->>C: POST /api/v1/packages/shipment-numbers/compare
    Note over C: solo ADMIN_VENTAS; valida la lista
    C->>S: compare(números)
    S->>S: normaliza (recorta y pasa a mayúsculas) y agrupa por número
    S->>DB: una sola consulta IN con los números distintos
    S->>S: clasifica cada fila y calcula los contadores
    C-->>N: 200 { totalRows, validCount, ..., rows }
```

Ejemplo, si `ENV-00953` ya está registrado:

```json
{
  "totalRows": 4, "validCount": 1, "duplicateCount": 3,
  "alreadyRegisteredCount": 1, "duplicatedInFileCount": 2,
  "rows": [
    { "row": 1, "shipmentNumber": "ENV-00953", "reasons": ["ALREADY_REGISTERED"], "repeatedInRows": [] },
    { "row": 2, "shipmentNumber": "ENV-00956", "reasons": ["DUPLICATED_IN_FILE"], "repeatedInRows": [3] },
    { "row": 3, "shipmentNumber": "ENV-00956", "reasons": ["DUPLICATED_IN_FILE"], "repeatedInRows": [2] },
    { "row": 4, "shipmentNumber": "ENV-00958", "reasons": [], "repeatedInRows": [] }
  ]
}
```

- **Fila válida:** la que tiene `reasons` vacío.
- **Comparación:** no distingue mayúsculas de minúsculas ni espacios al inicio o al final.
- **Repetidos en el archivo:** se marcan **todas** las copias y `repeatedInRows` indica en qué otras filas
  aparece el número. Ninguna copia se importa.
- **Contadores excluyentes:** una fila ya registrada cuenta solo en `alreadyRegisteredCount`, aunque además esté
  repetida; así `validCount + alreadyRegisteredCount + duplicatedInFileCount = totalRows`. `duplicateCount` es
  la suma de los dos últimos.

### Exclusión de duplicados

`DuplicateExclusionService.excludeDuplicates(filas, extractorDelNúmero)` es genérico: recibe las filas que
produzca el parser de HU-010 y devuelve solo las importables, en su orden original, junto con el mismo reporte.
No tiene endpoint propio; lo llamará la importación, **dos veces**: en la previsualización y de nuevo al
confirmar, porque entre ambos pasos pueden registrarse otros paquetes. La restricción `UNIQUE` de
`paquetes.numero_envio` es la última defensa.

## Cómo funciona en el frontend

Pantalla **Detectar duplicados** (`/main-menu/paquetes/duplicados`), dentro del grupo **Gestión de paquetes** del
menú lateral. Es visible para el Súper Usuario y el Administrador de Ventas.

- **Con un archivo en previsualización:** un aviso en advertencia con la cantidad de duplicados y el nombre del
  archivo ("3 registros duplicados detectados en …"; sin duplicados, un aviso de éxito), cuatro totales (registros
  del archivo, válidos para importar, ya existentes en la base de datos y repetidos dentro del archivo) y la lista
  **Registros duplicados**. Cada fila va resaltada (fondo y barra lateral de advertencia) y lleva el número de
  envío, la etiqueta **Duplicado**, la causa ("Ya registrado en la base de datos" o "Repetido N veces en el
  archivo") y, si el backend los envía, el cliente y la dirección. El resaltado no depende solo del color.
- **Sin archivo:** el estado vacío "Sin archivo en previsualización".
- **Origen de los datos:** la pantalla recibe la respuesta de `POST /api/v1/packages/import/preview`
  (`PackageImportPreviewResponse`, de la importación de HU-010) en `location.state.preview`; la pantalla de
  importación la entregará al navegar a esta ruta. `buildDuplicateReport` la convierte en el modelo de la pantalla.
- **Solo en desarrollo:** el botón "Cargar ejemplo (solo desarrollo)" muestra la pantalla con datos de muestra
  (`src/dev/duplicatePreviewSample.js`) hasta que exista la pantalla de importación. En producción no aparece y el
  archivo de ejemplo no se descarga.

**Administrador de Ventas en el menú lateral.** Hasta esta task el Administrador de Ventas solo tenía una pantalla
provisional sin menú (`/ventas`). Ahora usa el mismo `MainMenuLayout` que el Súper Usuario: su inicio es el menú
principal y ve únicamente **Gestión de paquetes** y **Seguridad y acceso** (con su propio "Restablecer
contraseña"). `SalesHomePage` y las rutas `/ventas` se eliminaron. El menú de cada módulo se protege con los roles
de sus pantallas (`getGroupRoles`), así que el Administrador de Ventas no entra a Mensajeros ni Administradores.

> **Diferencia con el mockup:** el mockup conserva la primera fila repetida como válida y marca solo las
> siguientes. El backend excluye **todas** las copias, por decisión de este desarrollo, y la pantalla lo refleja
> marcando todas las copias. Hay que alinear el mockup con este criterio.

## Clases y archivos

### Backend (`packages`)

| Clase | Rol |
|---|---|
| `controller.PackageImportValidationController` | Endpoint de comparación, restringido a `ADMIN_VENTAS`. |
| `service.ShipmentNumberComparisonService`, `ShipmentNumberComparisonServiceImpl` | Normaliza, consulta la base de datos una vez, clasifica cada fila y calcula los contadores. |
| `service.DuplicateExclusionService`, `DuplicateExclusionServiceImpl` | Filtra las filas importables reutilizando la comparación. |
| `dto.CompareShipmentNumbersRequest` | Solicitud con las validaciones de la lista. |
| `dto.ShipmentNumberComparisonResponse`, `ShipmentNumberRowResult`, `DuplicateShipmentNumberReason` | Respuesta por fila, contadores y causas. |
| `dto.DuplicateExclusionResult` | Filas importables y reporte. |
| `model.DeliveryPackage`, `repository.DeliveryPackageRepository` | Entidad `paquetes` y consulta masiva de números existentes. |
| `db/migration/V13__crear_tabla_paquetes.sql` | Crea la tabla `paquetes` con número de envío único. |

### Frontend

| Archivo | Rol |
|---|---|
| `pages/DuplicateDetectionPage.jsx` | Pantalla: solo compone el encabezado, el estado vacío y el resultado. |
| `hooks/useDuplicatePreview.js` | Toma la previsualización de `location.state` y entrega el reporte; carga el ejemplo solo en desarrollo. |
| `utils/duplicateReport.js` | `buildDuplicateReport` y `describeDuplicate`: convierten la respuesta de previsualización en totales y filas con su nota. |
| `components/duplicates/DuplicateReportView.jsx` | Aviso (advertencia o éxito), totales y lista. |
| `components/duplicates/DuplicateCounters.jsx` | Los cuatro totales. |
| `components/duplicates/DuplicateRecordList.jsx`, `DuplicateRecordRow.jsx` | Lista y fila resaltada de un duplicado. |
| `components/PackageStatusChip.jsx` | Etiqueta Válido / Duplicado / Error, reutilizable por la previsualización de HU-010. |
| `components/StatCard.jsx` | Tarjeta con una cifra y su leyenda. |
| `components/StatusMessage.jsx` | Se le añadió el `title` opcional (primera línea en negrita). |
| `config/navigation.js`, `config/routes.js`, `components/layout/navIcons.js` | Grupo "Gestión de paquetes", ruta de la pantalla, `getGroupRoles` e iconos. |
| `App.jsx`, `utils/roleRoutes.js` | El Administrador de Ventas entra al `MainMenuLayout`; su inicio es el menú principal. |
| `dev/duplicatePreviewSample.js` | Datos de ejemplo, solo desarrollo. |

## Pruebas

### Backend

| Test | Qué verifica |
|---|---|
| `ShipmentNumberComparisonServiceImplTest` | Una sola consulta a la base de datos y filas en su orden original; todas las copias de un repetido con sus `repeatedInRows`; una fila ya registrada y repetida informa ambas causas pero cuenta una vez. |
| `PackageShipmentNumberComparisonIntegrationTest` | Comparación masiva con la base de datos de pruebas y contadores; 403 para Super Usuario y Mensajero; 401 sin token; 400 con lista vacía. |
| `DuplicateExclusionServiceImplTest` | Quedan solo las filas sin duplicados y en orden; sin duplicados se importa todo; archivo vacío no consulta la base de datos. |
| `DuplicateExclusionIntegrationTest` | Excluye registrados y repetidos con la base de datos de pruebas; detecta un número registrado después de la previsualización. |

Guías de ejecución y evidencias: [`HU011-Task113-pruebas.md`](../HU011-Task113-pruebas.md),
[`HU011-Task114-pruebas.md`](../HU011-Task114-pruebas.md) y [`HU011-Task115-pruebas.md`](../HU011-Task115-pruebas.md).

### Frontend

| Test | Qué verifica |
|---|---|
| `utils/duplicateReport.test.js` | Notas de cada causa; totales con causas excluyentes; filas con cliente y dirección opcionales; respuestas vacías o incompletas. |
| `components/duplicates/duplicates.test.jsx` | Chip por estado; tarjeta de cifra; totales; lista resaltada con etiqueta y causa; aviso en advertencia, singular, sin nombre de archivo y en éxito sin duplicados. |
| `pages/DuplicateDetectionPage.test.jsx` | Estado vacío; el ejemplo solo con `allowSample`; previsualización recibida por el estado de navegación; sin duplicados. |
| `config/navigation.test.js` | Grupo "Gestión de paquetes" para los dos roles; el Administrador de Ventas solo ve paquetes y su restablecer contraseña; `getGroupRoles`; retorno de la pantalla. |
| `App.routes.test.jsx` | Rutas compartidas entre Súper Usuario y Administrador de Ventas; el segundo no entra a Mensajeros ni Administradores; el inicio de cada rol está en sus rutas. |
| `components/layout/MainMenuLayout.test.jsx` | El menú lateral del Súper Usuario y del Administrador de Ventas con el grupo de paquetes. |
| `utils/roleRoutes.test.js`, `components/ProtectedRoute.test.jsx`, `components/ProvisionalHomePage.test.jsx` | Se actualizaron al nuevo inicio y a la nueva ruta de restablecer contraseña del Administrador de Ventas. |

## Limitaciones conocidas

- **Sin importación:** no existe aún el servicio ni el endpoint que registre paquetes (HU-010). Hasta entonces
  los duplicados se detectan, pero nada los excluye de un registro real. El parser de archivos de Zoho está en
  la rama `feat/HU010-task263-…`, sin fusionar.
- **Límite de 1000 números por solicitud:** un archivo mayor tendría que partirse, y los repetidos entre partes
  no se detectarían. Subir el límite o validar el archivo completo en el servidor lo resolvería.
- **La comparación recibe solo números de envío**, no filas completas (cliente, dirección...). La exclusión
  genérica permite trabajar con filas completas desde la importación.
- **Contrato de la previsualización de HU-010:** la pantalla espera `PackageImportPreviewResponse`, donde cada
  duplicado trae número, ocurrencias y causas pero **no** cliente ni dirección (el mockup sí los muestra). La
  pantalla los muestra si llegan. Además, esa previsualización usa el contrato antiguo de la comparación
  (`importableShipmentNumbers`, `DuplicateShipmentNumberResponse`), que la Task 113 reemplazó: al juntar ambas
  ramas, `PackageImportPreviewService` dejará de compilar hasta que se adapte, por ejemplo a
  `DuplicateExclusionService`.
- **Código compartido con HU-010:** la rama incluye el commit `7a7cbe2` (PR #98 de HU-010) por `cherry-pick`.
  Al fusionarse #98, pueden aparecer conflictos en los archivos de comparación; debe prevalecer el contrato de
  este documento.

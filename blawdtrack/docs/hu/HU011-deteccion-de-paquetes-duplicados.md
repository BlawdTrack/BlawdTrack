# HU011 · Detección de paquetes duplicados

**Ramas:** `feature/hu011/T01/113/silesky` (Task 113) y `feature/hu011/T02/114/silesky` (Task 114), apiladas sobre
`HU-011`. Aún no están fusionadas en `develop`.

## Resumen

Antes de confirmar una importación de paquetes, el Administrador de Ventas puede saber qué números de envío del
archivo ya están registrados en la base de datos o se repiten dentro del propio archivo. Los duplicados se
identifican fila por fila, se cuentan y se excluyen de lo que se importa.

El backend de la historia está completo. Falta el frontend (previsualización con resaltado) y que la
importación de HU-010 use el servicio de exclusión.

## Criterios de aceptación

| Criterio | Estado |
|---|---|
| Comparar los números de envío del archivo contra la base de datos | ✅ Task 113 |
| Identificar números repetidos dentro del mismo archivo | ✅ Task 113 |
| Resaltar los duplicados en la previsualización | ⏳ Frontend sin implementar. La respuesta trae lo necesario (`reasons` y `repeatedInRows` por fila) |
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

Todavía no hay pantalla. El mockup de HU-011 muestra una alerta con la cantidad de duplicados, cuatro contadores
(registros del archivo, válidos, ya existentes en la base de datos y repetidos en el archivo) y el listado de
duplicados con una nota por fila ("Ya registrado en la base de datos" o "Repetido en la fila N").

> **Diferencia con el mockup:** el mockup conserva la primera fila repetida como válida y marca solo las
> siguientes. El backend excluye **todas** las copias, por decisión de este desarrollo. Hay que alinear el
> frontend o el mockup con este criterio.

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

## Pruebas

### Backend

| Test | Qué verifica |
|---|---|
| `ShipmentNumberComparisonServiceImplTest` | Una sola consulta a la base de datos y filas en su orden original; todas las copias de un repetido con sus `repeatedInRows`; una fila ya registrada y repetida informa ambas causas pero cuenta una vez. |
| `PackageShipmentNumberComparisonIntegrationTest` | Comparación masiva con la base de datos de pruebas y contadores; 403 para Super Usuario y Mensajero; 401 sin token; 400 con lista vacía. |
| `DuplicateExclusionServiceImplTest` | Quedan solo las filas sin duplicados y en orden; sin duplicados se importa todo; archivo vacío no consulta la base de datos. |
| `DuplicateExclusionIntegrationTest` | Excluye registrados y repetidos con la base de datos de pruebas; detecta un número registrado después de la previsualización. |

Guías de ejecución y evidencias: [`HU011-Task113-pruebas.md`](../HU011-Task113-pruebas.md) y
[`HU011-Task114-pruebas.md`](../HU011-Task114-pruebas.md).

### Frontend

Sin tests: no hay frontend de esta historia.

## Limitaciones conocidas

- **Sin importación:** no existe aún el servicio ni el endpoint que registre paquetes (HU-010). Hasta entonces
  los duplicados se detectan, pero nada los excluye de un registro real. El parser de archivos de Zoho está en
  la rama `feat/HU010-task263-…`, sin fusionar.
- **Límite de 1000 números por solicitud:** un archivo mayor tendría que partirse, y los repetidos entre partes
  no se detectarían. Subir el límite o validar el archivo completo en el servidor lo resolvería.
- **La comparación recibe solo números de envío**, no filas completas (cliente, dirección...). La exclusión
  genérica permite trabajar con filas completas desde la importación.
- **Código compartido con HU-010:** la rama incluye el commit `7a7cbe2` (PR #98 de HU-010) por `cherry-pick`.
  Al fusionarse #98, pueden aparecer conflictos en los archivos de comparación; debe prevalecer el contrato de
  este documento.

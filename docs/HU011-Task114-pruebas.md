# HU011 · Task 114 · Pruebas y evidencias

Task: **T02 · Desarrollar la detección de duplicados internos en el archivo y cálculo de totales.**

La detección de duplicados internos y los totales ya los resuelve la comparación de la Task 113
(ver `HU011-Task113-pruebas.md`). Esta task añade el servicio que **excluye** esos duplicados del
proceso de importación, para que la importación de HU-010 lo reutilice.

## Resultado de las pruebas automáticas

Verificado el 1 de octubre de 2026 con Java 21 y Maven Wrapper:

- `DuplicateExclusionServiceImplTest`: **3 pruebas aprobadas**, sin fallos ni omisiones.
- `DuplicateExclusionIntegrationTest`: **2 pruebas aprobadas**, sin fallos ni omisiones.
- Pruebas de la comparación (Task 113), que este servicio reutiliza: 7 aprobadas, sin cambios.
- Suite completa del backend: **345 pruebas contabilizadas: 344 aprobadas y 1 omitida**, sin fallos
  (`BUILD SUCCESS`).
- Estas pruebas usan H2 en memoria; no modifican la base MySQL.

| Prueba | Qué demuestra |
| --- | --- |
| `DuplicateExclusionServiceImplTest` · conserva solo las filas sin duplicados | De 5 filas (una registrada, un número repetido dos veces y dos únicas) quedan **solo las 2 únicas**, en su orden original, con totales exactos: 5 filas, 2 válidas, 1 ya registrada, 2 repetidas en el archivo y 3 duplicadas. |
| `DuplicateExclusionServiceImplTest` · sin duplicados | Si no hay duplicados se importan todas las filas. |
| `DuplicateExclusionServiceImplTest` · archivo vacío | Devuelve cero filas y totales en cero **sin consultar la base de datos**. |
| `DuplicateExclusionIntegrationTest` · excluye registrados y repetidos | Con la base de datos real de pruebas, excluye el número ya registrado y las dos copias del repetido. |
| `DuplicateExclusionIntegrationTest` · revalidación al confirmar | Un número que se registra **después** de la previsualización se detecta al ejecutar de nuevo la exclusión. |

Desde la carpeta `blawdtrack/backend`, ejecuta en PowerShell:

```powershell
.\mvnw.cmd test "-Dtest=DuplicateExclusionServiceImplTest,DuplicateExclusionIntegrationTest"
```

Para toda la suite:

```powershell
.\mvnw.cmd test
```

**Evidencia automática:** captura las líneas `Tests run` y `BUILD SUCCESS`.
Los informes específicos están en `blawdtrack/backend/target/surefire-reports/`
(archivos `*DuplicateExclusion*.txt`). La ejecución completa de esta tarea quedó en
`blawdtrack/backend/target/task114-tests.log`.

## Cómo se usa el servicio

`DuplicateExclusionService.excludeDuplicates(rows, shipmentNumberOf)` es genérico: recibe las filas
del archivo (la clase que produzca el parser de HU-010) y una función que extrae el número de envío.
Devuelve:

- `importable`: las filas sin duplicados, en el orden original.
- `report`: el mismo reporte de la comparación (`rows` con `reasons` por fila y los contadores
  `totalRows`, `validCount`, `duplicateCount`, `alreadyRegisteredCount`, `duplicatedInFileCount`).

Reglas:

- Si un número se repite en el archivo, se excluyen **todas** sus copias.
- Debe ejecutarse de nuevo al **confirmar** la importación: entre la previsualización y la confirmación
  pueden registrarse otros paquetes. La restricción UNIQUE de `paquetes.numero_envio` sigue siendo la
  última defensa.
- La función que extrae el número de envío no puede devolver `null`.

Este servicio no expone un endpoint nuevo: lo llamará el proceso de importación (HU-010).

## Capturas más importantes

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola con `DuplicateExclusionServiceImplTest` y `DuplicateExclusionIntegrationTest` en verde (5 pruebas) y `BUILD SUCCESS`. |
| E2 | Consola de la suite completa: `Tests run: 345, Failures: 0, Errors: 0, Skipped: 1`. |

**Si tienes que priorizar:** E1 prueba la exclusión de duplicados y la revalidación; E2 demuestra que no
se rompió nada existente.

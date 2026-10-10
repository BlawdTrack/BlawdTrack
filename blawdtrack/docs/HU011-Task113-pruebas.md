# HU011 · Task 113 · Pruebas y evidencias

Task: **T01 · Implementar la lógica de comparación de números de envío contra la base de datos.**

## Resultado de las pruebas automáticas

Verificado el 1 de octubre de 2026 con Java 21 y Maven Wrapper:

- `ShipmentNumberComparisonServiceImplTest`: **3 pruebas aprobadas**, sin fallos ni omisiones.
- `PackageShipmentNumberComparisonIntegrationTest`: **4 pruebas aprobadas**, sin fallos ni omisiones.
- Suite completa del backend: **340 pruebas contabilizadas: 339 aprobadas y 1 omitida**, sin fallos
  (`BUILD SUCCESS`).
- Estas pruebas usan H2 en memoria; no modifican la base MySQL.
- La comprobación manual con Postman (sección siguiente) no se ejecutó; queda como pasos para quien
  quiera repetirla contra su entorno.

La cobertura incluye:

| Prueba | Qué demuestra |
| --- | --- |
| `ShipmentNumberComparisonServiceImplTest` · clasifica en una sola consulta | Todos los números del archivo se contrastan con **una única consulta** a la base de datos, sin importar mayúsculas ni espacios, y cada fila conserva su posición original. |
| `ShipmentNumberComparisonServiceImplTest` · marca todas las copias repetidas | Un número repetido dentro del archivo se marca en **todas** sus filas (no se importa ninguna copia) e indica en qué otras filas aparece. |
| `ShipmentNumberComparisonServiceImplTest` · ambas causas | Una fila ya registrada y además repetida informa las dos causas, pero se cuenta una sola vez (como "ya registrada"). |
| `PackageShipmentNumberComparisonIntegrationTest` · comparación masiva | Con la base de datos real de pruebas: filas, contadores (`totalRows`, `validCount`, `duplicateCount`, `alreadyRegisteredCount`, `duplicatedInFileCount`) y causas por fila. |
| `PackageShipmentNumberComparisonIntegrationTest` · solo administrador de ventas | Super Usuario y Mensajero reciben **403 Forbidden**. |
| `PackageShipmentNumberComparisonIntegrationTest` · sin token | **401 Unauthorized** antes de validar el cuerpo. |
| `PackageShipmentNumberComparisonIntegrationTest` · lista vacía | **400 Bad Request** con `code = VALIDATION_ERROR`. |

Desde la carpeta `blawdtrack/backend`, ejecuta en PowerShell:

```powershell
.\mvnw.cmd test "-Dtest=ShipmentNumberComparisonServiceImplTest,PackageShipmentNumberComparisonIntegrationTest"
```

Para toda la suite:

```powershell
.\mvnw.cmd test
```

**Evidencia automática:** captura las líneas `Tests run` y `BUILD SUCCESS`.
Los informes específicos están en
`blawdtrack/backend/target/surefire-reports/` (archivos `*ShipmentNumberComparison*.txt`).
La ejecución completa de esta tarea quedó en `blawdtrack/backend/target/task113-tests.log`.

## Contrato del endpoint

`POST /api/v1/packages/shipment-numbers/compare` · requiere rol **ADMIN_VENTAS**.

Solicitud (máximo 1000 números por solicitud, 50 caracteres cada uno):

```json
{ "shipmentNumbers": ["ENV-00953", "ENV-00956", "env-00956", "ENV-00958"] }
```

Respuesta (una entrada por fila, en el orden del archivo). Ejemplo si `ENV-00953` ya existe en la base de datos:

```json
{
  "totalRows": 4,
  "validCount": 1,
  "duplicateCount": 3,
  "alreadyRegisteredCount": 1,
  "duplicatedInFileCount": 2,
  "rows": [
    { "row": 1, "shipmentNumber": "ENV-00953", "reasons": ["ALREADY_REGISTERED"], "repeatedInRows": [] },
    { "row": 2, "shipmentNumber": "ENV-00956", "reasons": ["DUPLICATED_IN_FILE"], "repeatedInRows": [3] },
    { "row": 3, "shipmentNumber": "ENV-00956", "reasons": ["DUPLICATED_IN_FILE"], "repeatedInRows": [2] },
    { "row": 4, "shipmentNumber": "ENV-00958", "reasons": [], "repeatedInRows": [] }
  ]
}
```

Reglas:

- Una fila es **válida** cuando `reasons` está vacío.
- Los contadores son excluyentes: `validCount + alreadyRegisteredCount + duplicatedInFileCount = totalRows`.
  Una fila ya registrada y repetida cuenta solo en `alreadyRegisteredCount`, aunque `reasons` incluya ambas causas.
- Si un número se repite en el archivo, **ninguna** de sus copias se considera importable.
- La comparación ignora mayúsculas/minúsculas y espacios al inicio o al final.

## Comprobación manual opcional en Postman

Requiere el backend en marcha (`./mvnw.cmd spring-boot:run` con `JWT_SECRET` definido y MySQL activo) y una cuenta
de **Administrador de Ventas** activa. El seeder solo crea el Super Usuario; el administrador de ventas se crea
desde la pantalla de administradores (HU006).

1. `POST {{baseUrl}}/api/v1/auth/login` con `{"email": "...", "password": "..."}` de la cuenta de administrador
   de ventas. Copia el `token` de la respuesta.
2. `POST {{baseUrl}}/api/v1/packages/shipment-numbers/compare`, cabecera
   `Authorization: Bearer <token>`, `Content-Type: application/json` y el cuerpo del ejemplo anterior.
3. Repite la solicitud 2 con el token del Super Usuario y comprueba **403**; sin cabecera, **401**; con
   `{"shipmentNumbers": []}`, **400**.

La tabla `paquetes` se crea con la migración `V13__crear_tabla_paquetes.sql`, que Flyway aplica al arrancar
con MySQL. Para ver un "ya registrado" en una prueba manual, inserta antes un número en esa tabla.

## Capturas más importantes

Oculta tokens y contraseñas en las evidencias.

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola con `ShipmentNumberComparisonServiceImplTest` y `PackageShipmentNumberComparisonIntegrationTest` en verde (7 pruebas) y `BUILD SUCCESS`. |
| E2 | Consola de la suite completa: `Tests run: 340, Failures: 0, Errors: 0, Skipped: 1`. |
| E3 | (Postman, opcional) **200 OK** con `rows` y contadores para un administrador de ventas. |
| E4 | (Postman, opcional) **403 Forbidden** con el token del Super Usuario o de un Mensajero. |

**Si tienes que priorizar:** E1 y E2 prueban los requisitos principales (comparación contra la base de datos,
duplicados dentro del archivo, restricción de rol).

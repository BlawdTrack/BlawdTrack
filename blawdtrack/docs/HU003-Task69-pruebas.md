# HU003 · Task 69 · Pruebas y evidencias

## Resultado de las pruebas automáticas

Verificado el 16 de septiembre de 2026 con Java 21 y Maven Wrapper:

- CourierRegistrationTest: **18 pruebas aprobadas**, sin fallos ni omisiones.
- Suite completa: **73 pruebas contabilizadas: 72 aprobadas y 1 omitida**, sin fallos.
- Estas pruebas usan H2 en memoria; no modifican tu base MySQL.
- La colección de Postman queda preparada para ejecución manual; no se ejecutó contra tu MySQL.

La cobertura incluye alta y persistencia del perfil, BCrypt, rol y estado impuestos por
el servidor, normalización del correo, duplicados contra cualquier usuario,
rechazo de ADMIN_VENTAS y MENSAJERO, ausencia de token/token inválido y 10 casos de
validación. También verifica login real del mensajero recién creado y rollback de
la cuenta cuando falla el guardado del perfil (fallo simulado del repositorio dentro
de la transacción real; no es una prueba de solicitudes concurrentes).

Desde la carpeta `blawdtrack`, ejecuta en PowerShell:

```powershell
$env:JAVA_HOME = "$env:USERPROFILE/.jdks/temurin-21.0.12.1"
./mvnw.cmd "-Dtest=CourierRegistrationTest" test
```

Para toda la suite:

```powershell
./mvnw.cmd test
```

**Evidencia automática:** captura las líneas `Tests run` y `BUILD SUCCESS`.
El informe específico está en
`target/surefire-reports/com.blawdgourmet.blawdtrack.couriers.CourierRegistrationTest.txt`.
La ejecución completa de esta tarea quedó en `target/task69-tests.log`.

## Preparación para probar en Postman

1. Inicia el MySQL de desarrollo y verifica que exista la base `blawdtrack`.
   La configuración actual apunta a `localhost:3306`, usuario `root` y contraseña
   vacía. Si tu instalación usa otros valores, define
   `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y
   `SPRING_DATASOURCE_PASSWORD` en la terminal.
   El archivo compose actual tiene otros datos y puerto dinámico: no equivale a
   esta configuración sin ajustarla.
2. Desde `blawdtrack`, inicia el backend. Si ya tienes un JWT_SECRET configurado,
   conserva ese valor. Para una sesión local nueva puedes generar uno así:

```powershell
$env:JAVA_HOME = "$env:USERPROFILE/.jdks/temurin-21.0.12.1"
if (-not $env:JWT_SECRET) {
    $bytes = New-Object byte[] 64
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    $env:JWT_SECRET = [Convert]::ToBase64String($bytes)
}
./mvnw.cmd spring-boot:run
```

3. Espera el mensaje de inicio de Spring Boot. La URL predeterminada es
   `http://localhost:8080`.
4. Importa `HU003-Task69.postman_collection.json` en Postman.
5. En las variables de la colección define `baseUrl`, `adminEmail` y
   `adminPassword`. El seeder crea `alicia@blawdgourmet.com` con
   `ChangeMe123` únicamente si esa cuenta no existe; si ya cambiaste la
   contraseña, usa la actual.
6. Envía las solicitudes **01 a 08 en orden**. Los scripts guardan automáticamente
   los tokens. El login 01 genera una cédula y correos nuevos para cada ejecución.

La solicitud 02 crea un mensajero real en tu base de desarrollo. Para repetir toda
la secuencia empieza nuevamente por 01. Repetir solo 02 devuelve 409 porque la
cuenta ya existe. No cambies variables entre las solicitudes de una misma secuencia.

## Capturas más importantes

En cada captura incluye el nombre de la solicitud, método/URL, estado HTTP y
respuesta. Puedes mostrar el Body de la solicitud cuando ayude a explicar el caso;
oculta contraseñas y tokens en las evidencias.

| Evidencia | Solicitud | Qué demuestra y qué capturar |
| --- | --- | --- |
| E1 | 02 · Alta correcta | **201 Created**, IDs, `status: ACTIVE`, `role: MENSAJERO`; no se devuelve contraseña. |
| E2 | 03 · Cédula duplicada | **409 Conflict**, `COURIER_CONFLICT` y mensaje de cédula registrada. El correo es distinto para aislar esta validación. |
| E3 | 04 · Correo duplicado | **409 Conflict** y mensaje de correo registrado. La cédula es distinta. |
| E4 | 08 · Mensajero sin permisos | **403 Forbidden** después de ejecutar el login 07. Usa un cuerpo válido y datos nuevos. |
| E5 | 06 · Sin token | **401 Unauthorized** con Authorization configurado como No Auth. |
| E6 | 05 · Datos inválidos | **400 Bad Request**, `VALIDATION_FAILED` y campos `email` y `maxPackageWeightKg`. |

**Si tienes que priorizar:** E1, E2, E3 y E4 prueban directamente los requisitos
principales. Añade la captura de las 18 pruebas aprobadas; E5 y E6 completan la
evidencia de seguridad y validación.

Los 401 y 403 pueden tener cuerpo vacío; el estado HTTP es la evidencia esperada.
La solicitud 07 debe devolver 200 y rol MENSAJERO: además demuestra que la nueva
cuenta puede autenticarse con la contraseña registrada. No captures el token visible.

## Comprobación opcional en MySQL

Copia `courierEmail` desde las variables de la colección y reemplaza
`CORREO_DE_LA_PRUEBA`. La consulta no muestra la contraseña ni su hash completo:

```sql
SELECT u.id AS usuario_id, m.id AS mensajero_id,
       u.cedula, u.nombre_completo, u.correo, u.estado,
       r.nombre AS rol, m.horario, m.capacidad_maxima_carga_kg,
       (u.contrasena_hash LIKE '$2%' AND LENGTH(u.contrasena_hash) = 60)
           AS formato_bcrypt
FROM usuarios u
JOIN roles r ON r.id = u.rol_id
JOIN mensajeros m ON m.usuario_id = u.id
WHERE u.correo = 'CORREO_DE_LA_PRUEBA';
```

Se espera una fila, estado ACTIVE, rol MENSAJERO, carga 25.50 y
`formato_bcrypt = 1`. Esta consulta comprueba el formato del hash; la prueba
automática también verifica que BCrypt reconoce la contraseña original.

## Problemas comunes

- **401 en 01:** verifica las credenciales reales del Super Usuario.
- **401 en 02:** vuelve a ejecutar 01 y comprueba que obtuvo 200.
- **403 en 02:** la cuenta del login no tiene rol SUPER_USUARIO.
- **409 en 02:** ya enviaste esa alta; inicia otra secuencia desde 01.
- **No conecta:** revisa que el backend haya iniciado, el puerto y la conexión MySQL.
- **Error JWT_SECRET:** configura la variable en la misma terminal donde arrancas el backend.


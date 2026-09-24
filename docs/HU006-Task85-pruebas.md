# HU006 · Task 85 · Pruebas y evidencias

## Resultado de las pruebas automáticas

Verificado con Java 25 y Maven Wrapper sobre la rama de T01.

- `DocumentValidatorTest`: **pruebas aprobadas**, sin fallos.
- `DocumentNormalizerTest`: **pruebas aprobadas**, sin fallos.
- `AdminRegistrationValidationTest`: **pruebas aprobadas**, sin fallos.
- Comando ejecutado:

```powershell
./mvnw.cmd -q -Dtest="DocumentValidatorTest,DocumentNormalizerTest,AdminRegistrationValidationTest" test
```

La validación cubre:

- formato válido de documento según tipo (`CEDULA`, `DIMEX`, `PASAPORTE`),
- normalización de separadores y mayúsculas,
- bloqueo de correos inválidos y duplicados,
- rechazo de documentos duplicados antes de guardar,
- permiso solo para `SUPER_USUARIO`,
- respuesta uniforme `ApiError` con `code` y `status` en los casos de error.

## Casos manuales que se validan en el endpoint

### 1. Alta correcta

- Método: `POST /api/v1/admins`
- Rol requerido: `SUPER_USUARIO`
- Estado esperado: `201 Created`
- Datos de ejemplo:

```json
{
  "nombreCompleto": "Ana Admin",
  "numeroTelefono": "88888888",
  "correoElectronico": "ana.admin@example.com",
  "contrasenaInicial": "Clave1234",
  "documentType": "CEDULA",
  "documentNumber": "123456789"
}
```

Se espera que el registro se persista y que el backend devuelva la entidad creada.

### 2. Documento inválido

- Caso: `documentType = "CEDULA"` y `documentNumber = "12345678"`
- Estado esperado: `400 Bad Request`
- Código esperado: `VALIDATION_ERROR`
- Campo esperado: `documentNumber`

### 3. Correo inválido

- Caso: `correoElectronico = "user@host"`
- Estado esperado: `400 Bad Request`
- Código esperado: `VALIDATION_ERROR`
- Campo esperado: `correoElectronico`

### 4. Documento duplicado

- Caso: repetir un documento ya registrado con un formato equivalente, por ejemplo:
  `"1-2345-6789"` frente a `"123456789"`
- Estado esperado: `409 Conflict`
- Código esperado: `DOCUMENTO_DUPLICADO`

### 5. Correo duplicado sin distinguir mayúsculas/minúsculas

- Caso: `Duplicado@Example.com` cuando ya existe `duplicado@example.com`
- Estado esperado: `409 Conflict`
- Código esperado: `DUPLICATE_EMAIL`

### 6. Sin permisos

- Caso: usar un token con rol `ADMIN_VENTAS` o `MENSAJERO`
- Estado esperado: `403 Forbidden`

### 7. Sin token

- Caso: enviar la petición sin `Authorization`
- Estado esperado: `401 Unauthorized`

## Preparación para ejecución manual

1. Inicia el backend con la configuración de desarrollo.
2. Asegúrate de que el usuario `SUPER_USUARIO` exista o pueda autenticarse.
3. Importa la colección Postman relacionada si aplica a la tarea.
4. Ejecuta las solicitudes en el orden indicado y documenta el estado HTTP y el cuerpo de respuesta.

## Evidencia recomendada

Captura como mínimo:

- alta correcta con `201 Created`,
- documento inválido con `400` y `documentNumber`,
- documento duplicado con `409` y `DOCUMENTO_DUPLICADO`,
- correo duplicado con `409` y `DUPLICATE_EMAIL`,
- solicitud sin permisos con `403`,
- solicitud sin token con `401`.

Si necesitas priorizar, estos cinco casos validan el requisito principal: formato, unicidad, permisos y respuesta uniforme de error.

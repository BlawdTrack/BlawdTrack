# BlawdTrack – Módulo de Inicio de Sesión (HU-001 / CU-001)

Este paquete contiene **únicamente** el código relacionado con el inicio de
sesión (HU-001 / CU-001), separado del código de administradores (HU-006).

## Incluido

- `audit/controller/AuthController.java` — endpoint `POST /api/v1/auth/login`.
- `audit/service/AuthService.java` — lógica de autenticación (valida
  credenciales, valida estado activo, genera el JWT).
- `audit/dto/LoginRequest.java`, `LoginResponse.java`, `UserSummaryResponse.java`.
- `audit/exception/InvalidCredentialsException.java`,
  `InactiveAccountException.java`.
- Infraestructura compartida necesaria para que el proyecto compile y corra
  de forma independiente:
  - `security/*` (JWT, filtro de autenticación, `SecurityConfig`).
  - `users/model/*`, `users/repository/*` (entidades `User`, `Role`,
    `Permission`).
  - `users/bootstrap/RoleDataInitializer.java` (siembra los roles
    `SUPER_USUARIO`, `ADMIN_VENTAS`, `MENSAJERO`).
  - `users/constant/RoleName.java`, `PermissionCode.java`.
  - `common/dto/ApiError.java` y `common/exception/GlobalExceptionHandler.java`
    (recortado: solo maneja las excepciones de este módulo).

## No incluido (pertenece al paquete de Administradores)

- Registro de administradores (`AdminController`, `AdminService`,
  `AdminRegistrationRequest/Response`, `CedulaValidator`, `ValidCedula`).
- Auditoría de creación de administradores (`AuditLog`,
  `AuditLogRepository`, `AuditService`/`AuditServiceImpl`).
- Excepciones `DuplicateResourceException` y `BusinessConfigurationException`.

## Nota

Ambos módulos comparten las entidades de usuario/rol y la capa de seguridad
JWT. Si necesita probar de punta a punta un flujo que dependa de crear un
administrador y luego iniciar sesión con él, necesitará combinar este
paquete con el de Administradores (o el repositorio completo del proyecto).

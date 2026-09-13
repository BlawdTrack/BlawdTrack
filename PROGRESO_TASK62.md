# Progreso — Task #62: Endpoint de solicitud de recuperación de contraseña

Rama: `feature/62/genesis-silesky` (creada localmente desde `develop`, sin push).

## Resumen de lo implementado

- `POST /api/v1/auth/password-reset/request` recibe `{ "email": "..." }` y
  **siempre** responde `200` con el mensaje neutro:
  > "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña."
- Internamente: si el correo existe y la cuenta está **activa**, se genera un
  token (UUID), se hashea con el mismo `PasswordEncoder` (BCrypt) que ya usa
  el proyecto, y se persiste junto con su fecha de expiración (15 minutos,
  constante nombrada) y `usado = false`. Si el correo no existe o la cuenta
  está **inactiva**, no se persiste nada — pero la respuesta HTTP es idéntica.
- El valor plano del token (el que se enviaría por correo) **no se persiste
  ni se expone en la respuesta HTTP**; queda disponible en el resultado del
  service (`PasswordResetResult`) para que la futura task de envío de correo
  lo consuma llamando al service directamente.
- El envío real del correo y el endpoint de confirmación/cambio de
  contraseña **no** se implementaron (fuera de alcance de esta task).

## Archivos creados

| Archivo | Ruta |
|---|---|
| Entidad | [PasswordResetToken.java](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/entity/PasswordResetToken.java) |
| Repositorio | [PasswordResetTokenRepository.java](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/repository/PasswordResetTokenRepository.java) |
| Service (interfaz) | [PasswordResetService.java](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/service/PasswordResetService.java) |
| Service (resultado interno) | [PasswordResetResult.java](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/service/PasswordResetResult.java) |
| Service (impl) | [PasswordResetServiceImpl.java](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/service/impl/PasswordResetServiceImpl.java) |
| Controller | [PasswordResetController.java](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/controller/PasswordResetController.java) |
| DTO request | [PasswordResetRequestDTO.java](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/dto/PasswordResetRequestDTO.java) |
| DTO response | [PasswordResetResponseDTO.java](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/dto/PasswordResetResponseDTO.java) |
| Migración Flyway | [V2__crear_tabla_tokens_recuperacion_contrasena.sql](blawdtrack/src/main/resources/db/migration/V2__crear_tabla_tokens_recuperacion_contrasena.sql) |
| Test unitario | [PasswordResetServiceImplTest.java](blawdtrack/src/test/java/com/blawdgourmet/blawdtrack/auth/service/impl/PasswordResetServiceImplTest.java) |

No se modificó ningún archivo existente (ver "Reutilización" abajo — no hizo
falta tocar `SecurityConfig` ni nada de Task #52).

## Confirmación: no se duplicó lógica de Task #52

- **Búsqueda por correo**: `PasswordResetServiceImpl` llama directamente a
  `UserRepository.findByEmail(String)` ([UserRepository.java:27](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/users/repository/UserRepository.java#L27)),
  el mismo método (con su `@EntityGraph`) que ya usa `UserDetailsServiceImpl`
  para login. No se creó una segunda vía de búsqueda de usuario.
- **Validación de cuenta activa**: se reutiliza `User.isActive()`
  ([User.java:43-45](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/users/model/User.java#L43-L45)),
  la misma lógica que ya usa `UserPrincipal.isEnabled()/isAccountNonLocked()`.
  No se reimplementó ninguna comparación de estado.
- **Hashing**: se inyecta el bean `PasswordEncoder` ya definido en
  `SecurityConfig` ([SecurityConfig.java:27-30](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/config/SecurityConfig.java#L27-L30),
  `BCryptPasswordEncoder`) para hashear el token, el mismo mecanismo que ya
  usa el proyecto para `contrasena_hash`. No se agregó un segundo algoritmo
  de hashing.
- **Ruta pública**: no hizo falta tocar `SecurityConfig`, porque el nuevo
  endpoint cae bajo el patrón `/api/v1/auth/**` que ya está en `permitAll()`
  ([SecurityConfig.java:45](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/auth/config/SecurityConfig.java#L45)).

## Decisiones de diseño por ambigüedad (para que el equipo las revise)

1. **Ruta del endpoint**: la task pedía `/api/auth/password-reset/request`,
   pero todo el módulo de auth ya existente cuelga de `/api/v1/auth/**`
   (`AuthController`, y el `permitAll()` de `SecurityConfig`). Usé
   `/api/v1/auth/password-reset/request` para seguir el prefijo real del
   proyecto — usar la ruta literal de la task habría quedado fuera del
   `permitAll()` y habría exigido tocar `SecurityConfig`, o habría devuelto
   401 antes de llegar al controller.
2. **Nombre de tabla/columnas en español**: la task sugería la tabla
   `password_reset_tokens` con columna `user_id`, pero la convención
   *no negociable* del proyecto exige nombres de tabla/columna en español
   (como `usuarios`, `roles_permisos`, `rol_id`). Prioricé la convención:
   tabla `tokens_recuperacion_contrasena`, columna `usuario_id` (siguiendo el
   mismo patrón que `rol_id` en `usuarios`), y `token_hash` (mismo patrón que
   `contrasena_hash`) en vez de `token`, para dejar explícito en el nombre
   que es un hash y no el valor plano.
3. **Generación del token**: usé `UUID.randomUUID()` (una de las dos opciones
   que planteaba la task, junto a `SecureRandom`) por simplicidad; da 122
   bits de entropía, que es holgado para un token de un solo uso con 15
   minutos de vida.
4. **Constante de expiración**: es un `private static final long` en
   `PasswordResetServiceImpl` (no una propiedad en `application.properties`
   como `security.jwt.expiration-ms`), porque la task pedía explícitamente
   "constante nombrada, fácil de ajustar". Si el equipo prefiere que sea
   externalizable como el JWT, es un cambio menor.
5. **`PasswordResetResult`**: no estaba en la lista de archivos de la task,
   pero hizo falta para cumplir el punto 3 de la especificación ("el valor
   plano... debe quedar disponible en el resultado del service"). Es un
   `record` interno al paquete `service`, no se expone por HTTP.
6. **`PasswordResetResponseDTO`**: tampoco estaba en la lista de archivos;
   lo añadí para responder con un DTO (`{ "message": "..." }`) en vez de un
   `Map` suelto, siguiendo el patrón de `LoginResponse`.
7. **Mensajes de validación en español**: `PasswordResetRequestDTO` usa
   mensajes de `@NotBlank`/`@Email` en español (p. ej. "El correo es
   obligatorio"), siendo texto de UI. `LoginRequest` (Task #52) los tiene
   en inglés — ver hallazgo #2 abajo, no lo toqué.
8. **Sin invalidación de tokens previos**: tal como pedía la task, no
   implementé invalidar tokens anteriores al pedir uno nuevo (no encontré un
   patrón claro para eso en el proyecto existente). Cada solicitud crea una
   fila nueva; puede quedar más de un token activo por usuario a la vez.
   Queda para revisión del equipo si se necesita en una task futura.

## Hallazgos fuera de alcance (no corregidos)

1. **Inconsistencia `estado`/`UserStatus`**: la migración `V1` define
   `estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'`
   ([V1__crear_tablas_roles_usuarios.sql:30](blawdtrack/src/main/resources/db/migration/V1__crear_tablas_roles_usuarios.sql#L30)),
   pero `User.status` es `@Enumerated(EnumType.STRING)` sobre
   `UserStatus.ACTIVE/INACTIVE` ([UserStatus.java](blawdtrack/src/main/java/com/blawdgourmet/blawdtrack/users/model/UserStatus.java)),
   que Hibernate persiste como `"ACTIVE"`/`"INACTIVE"` (inglés), no
   `"ACTIVO"`. El `DEFAULT 'ACTIVO'` de la columna nunca coincide con lo que
   escribe la aplicación. No es parte de esta task — no lo toqué.
2. **Mensajes de validación en inglés en `LoginRequest`**: contradice la
   convención de "textos de UI en español" que sí seguí en los DTOs nuevos
   de esta task. Preexistente de Task #52, no lo toqué.

## Cómo se validó

- `mvnw compile` (offline) — compila sin errores.
- `mvnw test -Dtest=PasswordResetServiceImplTest,UserDetailsServiceImplTest` —
  6/6 tests verdes (3 nuevos de esta task + los 3 existentes de Task #52, para
  confirmar que no rompí nada de esa capa).
- No se corrió la migración Flyway contra una base MySQL real (no había una
  disponible en este entorno); se revisó manualmente contra la sintaxis y el
  estilo de `V1__crear_tablas_roles_usuarios.sql`.

## Pendiente (a cargo del usuario)

- No se hizo `git push` ni se abrió PR — la rama `feature/62/genesis-silesky`
  quedó local, lista para revisión.

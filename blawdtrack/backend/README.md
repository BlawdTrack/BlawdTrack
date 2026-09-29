# BlawdTrack · Backend

API REST de BlawdTrack, hecha con **Spring Boot 4.1.1** y **Java 21**. Para entender cómo encaja con el
resto del sistema, ver [`docs/arquitectura.md`](../../docs/arquitectura.md); para el detalle de cada
historia de usuario, [`docs/hu/`](../../docs/hu/README.md).

## Requisitos

- **JDK 21**
- **MySQL** corriendo en `localhost:3306` con una base llamada `blawdtrack`.
  El repositorio trae un `compose.yaml` con un MySQL de ejemplo; si lo usas, ajusta la URL y las
  credenciales (ver la configuración).
- **Maven**: no hace falta instalarlo, el proyecto incluye el wrapper (`mvnw` / `mvnw.cmd`).

## Configuración

La configuración está en `src/main/resources/application.properties` y se ajusta con variables de entorno:

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `JWT_SECRET` | **Sí, sin valor por defecto** | Clave para firmar los JWT (mínimo 32 bytes, aleatoria y privada). Nunca se guarda en el repositorio. |
| `JWT_EXPIRATION_MS` | No (`3600000`, una hora) | Vigencia del token. |
| `MAIL_HOST`, `MAIL_PORT` | No (`localhost:1025`) | Servidor SMTP. En desarrollo sirve cualquier servidor local de captura de correo. |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | No | Credenciales SMTP. |
| `MAIL_SMTP_AUTH`, `MAIL_STARTTLS_ENABLED` | No (`false`) | Autenticación y TLS del SMTP. |
| `MAIL_FROM` | No | Remitente de los correos. |
| `MAIL_LINK_URL` | No (`http://localhost:5173/recovery`) | Enlace base del correo de recuperación de contraseña. |

La conexión a MySQL (URL, usuario y contraseña) está en `spring.datasource.*` del mismo archivo. El
esquema lo crea Flyway al arrancar (`src/main/resources/db/migration`); Hibernate solo lo valida.

Al arrancar, la aplicación siembra los permisos, los tres roles y un **Super Usuario de desarrollo**
(`superadmin@blawdgourmet.com`). Su contraseña inicial está definida en `DataSeeder` solo para
desarrollo: **cámbiala antes de cualquier despliegue real**.

## Levantar el backend

Desde esta carpeta (`blawdtrack/backend`):

```bash
# Linux / macOS / Git Bash
export JWT_SECRET="una-clave-larga-y-aleatoria-de-al-menos-32-caracteres"
./mvnw spring-boot:run
```

```powershell
# Windows PowerShell
$env:JWT_SECRET = "una-clave-larga-y-aleatoria-de-al-menos-32-caracteres"
.\mvnw.cmd spring-boot:run
```

Cuando veas `Started BlawdtrackApplication`, la API responde en `http://localhost:8080`. Si falla al
arrancar, lo más común es que falte `JWT_SECRET` o que MySQL no esté disponible.

## Estructura

```
src/main/java/com/blawdgourmet/blawdtrack
├── auth        login, JWT, recuperación de contraseña, correo, siembra del Super Usuario
├── users       usuarios, roles, permisos, administradores, validación de documentos
├── couriers    mensajeros
├── audit       historial de auditoría
└── common      errores unificados y principal autenticado
src/main/resources
├── application.properties
├── db/migration        migraciones Flyway (V1…V10)
└── templates/mail      plantillas HTML de los correos
src/test                pruebas (ver más abajo)
```

## Pruebas

### Tecnologías

- **JUnit 5** (incluye tests parametrizados con `@ParameterizedTest`, `@ValueSource` y `@CsvSource`).
- **AssertJ** para las aserciones.
- **Mockito** para los tests unitarios (`@Mock`, `@InjectMocks`) y `@MockitoBean` / `@MockitoSpyBean` para
  reemplazar beans en los tests de integración.
- **Spring Boot Test**: `@SpringBootTest` levanta la aplicación completa; **MockMvc**
  (`@AutoConfigureMockMvc`) prueba los endpoints sin abrir un servidor; `@DataJpaTest` prueba solo los
  repositorios.
- **H2 en memoria** en modo compatible con MySQL: los tests no necesitan MySQL ni Docker. Flyway está
  desactivado en los tests y el esquema se genera desde las entidades (`ddl-auto=create-drop`); solo
  `DatabaseMigrationTest` activa Flyway para validar las migraciones.
- La configuración exclusiva de pruebas está en `src/test/resources/application.properties`.

### Cómo correrlas

Desde `blawdtrack/backend`:

```bash
./mvnw test                                                  # todas
./mvnw test -Dtest=CourierRegistrationTest                   # una clase
./mvnw test -Dtest=CourierRegistrationTest,AdminDeletionIntegrationTest   # varias
./mvnw test -Dtest=CourierRegistrationTest#superUsuarioCreaCuentaActivaConRolFijoYContrasenaCifrada  # un método
./mvnw test "-Dtest=com.blawdgourmet.blawdtrack.couriers.**.*Test"         # un paquete
```

En Windows usa `mvnw.cmd`. El detalle de cada ejecución queda en `target/surefire-reports/` (un `.txt` por
clase con el mensaje de los fallos).

### Cómo escribir un test nuevo

1. **Lógica de un servicio sin base de datos:** test unitario con `@ExtendWith(MockitoExtension.class)`.
2. **Un endpoint:** `@SpringBootTest` + `@AutoConfigureMockMvc` + `@Transactional` y `mvc.perform(...)`.
   `@Transactional` deshace los datos de cada test.
3. Crea los usuarios de prueba con `users.saveAndFlush(...)` y su token con
   `jwt.generateToken(new UserPrincipal(user))`; envíalo como `Authorization: Bearer ...`.
4. Usa un `documentType` y `documentNumber` únicos por test para no chocar con los datos que siembra la
   aplicación al arrancar (roles, permisos y el Super Usuario).
5. Si un test crea datos por la API y luego los consulta o borra, llama a `entityManager.flush()` y
   `entityManager.clear()` para reproducir lo que ocurre entre dos peticiones reales.

### Reglas del equipo

- No se modifica un test para que pase: si algo falla, se corrige el código de producción.
- H2 y Flyway desactivado viven solo en `src/test/resources`, nunca en el `application.properties`
  principal, que usa MySQL.

## Más documentación

- [Arquitectura](../../docs/arquitectura.md)
- [Historias de usuario](../../docs/hu/README.md)
- [`docs/`](../../docs): colecciones de Postman y guías de pruebas manuales de algunas historias.

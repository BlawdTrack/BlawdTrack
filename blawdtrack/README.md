# BlawdTrack · Código fuente (Release 1)

Sistema de seguimiento de paquetes y mensajeros de **Blawd Gourmet**. Esta entrega incluye la base de
seguridad y la gestión de usuarios (inicio de sesión, recuperación de contraseña, mensajeros,
administradores, roles y permisos) y la carga y revisión de paquetes (importación CSV/XLSX, detección de
duplicados, rango de entrega).

## Contenido del paquete

| Carpeta | Contenido |
|---|---|
| [`backend/`](backend/README.md) | API REST: Java 21 y Spring Boot 4.1.1, con MySQL y migraciones Flyway. |
| [`frontend/`](frontend/README.md) | Aplicación web: React 19, Vite 8 y MUI 9. |
| [`docs/`](docs/README.md) | Arquitectura, documentación por historia de usuario y guías de pruebas. |
| [`katalon/`](katalon/README.md) | Pruebas funcionales de extremo a extremo (Katalon Studio) y su entorno Docker. |

## Tecnologías y versiones requeridas

| Herramienta | Versión | Dónde se define |
|---|---|---|
| Java (JDK) | **21** | `backend/pom.xml` (`java.version`) |
| Spring Boot | 4.1.1 | `backend/pom.xml` |
| Maven | No hace falta instalarlo: el backend trae el wrapper (`mvnw` / `mvnw.cmd`) | `backend/.mvn/wrapper` |
| MySQL | **8.x**. Las pruebas de extremo a extremo se ejecutan con MySQL **8.4** | `katalon/environment/docker-compose.e2e.yml` |
| Node.js | **20 o superior** (el Dockerfile del frontend usa 20; la integración continua del equipo usa 22). Se necesita también npm | `frontend/Dockerfile` |
| React / Vite | 19 / 8 | `frontend/package.json` |

El `compose.yaml` de `backend/` levanta un MySQL de ejemplo con la imagen `mysql:latest`, sin versión fija;
para la versión exacta de producción de Blawd Gourmet: **POR COMPLETAR**.

## Puesta en marcha

### 1. Base de datos

1. Crea una base vacía en MySQL:
   ```sql
   CREATE DATABASE blawdtrack;
   ```
2. No hay un script SQL único del esquema: **Flyway crea las tablas al arrancar el backend** con las
   migraciones de `backend/src/main/resources/db/migration` (V1 a V24). Solo hace falta que la base exista
   y que el usuario tenga permisos sobre ella.
3. Al arrancar, el backend siembra los permisos, los tres roles y un Super Usuario de desarrollo.

### 2. Variables de entorno

El backend lee su configuración de variables de entorno (lista completa, con valores de relleno, en
[`backend/src/main/resources/application-example.properties`](backend/src/main/resources/application-example.properties)).
Las principales:

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `JWT_SECRET` | **Sí** | Clave para firmar los tokens (mínimo 32 caracteres, aleatoria y privada). Sin ella el backend no arranca. |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | No en desarrollo (por defecto `jdbc:mysql://localhost:3306/blawdtrack`, usuario `root`, clave vacía) | Conexión a MySQL. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_LINK_URL` | No en desarrollo | Correo de recuperación de contraseña y de credenciales (por defecto SMTP local en `localhost:1025`). |
| `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME` | No en desarrollo (`no-reply@blawdtrack.local` y `Blawd Gourmet`) | Correo y nombre del remitente. El correo debe estar verificado en Brevo > Senders; usa el de la empresa. |

El frontend usa `VITE_API_URL` (URL del backend), definida en `frontend/.env` (por defecto `http://localhost:8080/api`);
ajústala si el backend corre en otro puerto o equipo.

### 3. Backend

```bash
cd backend
export JWT_SECRET="<clave-aleatoria-de-32-o-mas-caracteres>"   # PowerShell: $env:JWT_SECRET = "..."
./mvnw spring-boot:run                                                      # Windows: .\mvnw.cmd spring-boot:run
```

La API queda en `http://localhost:8080`. Pruebas: `./mvnw test` (usan H2 en memoria, no necesitan MySQL).

### 4. Frontend

```bash
cd frontend
npm install
npm run dev              # normalmente http://localhost:5173
```

Pruebas: `npm test`. Versión de producción: `npm run build`.

### 5. Documentación de la API (Swagger / OpenAPI)

Swagger está **oculto por defecto** (esas URL responden 404). Para usarlo en desarrollo, arranca el backend con la
variable `SWAGGER_ENABLED=true` (por ejemplo `$env:SWAGGER_ENABLED = "true"` en PowerShell). Con el backend corriendo
(`http://localhost:8080`):

| Qué | URL |
|---|---|
| Swagger UI (probar los endpoints) | `http://localhost:8080/swagger-ui.html` |
| Especificación OpenAPI (JSON) | `http://localhost:8080/v3/api-docs` |

Casi todos los endpoints exigen sesión. Para probarlos: en Swagger abre `POST /api/v1/auth/login`, envía un correo y
contraseña válidos, copia el `token` de la respuesta y pégalo en el botón **Authorize** (solo el token, sin la palabra
`Bearer`). Los endpoints están descritos también en [`docs/arquitectura.md`](docs/arquitectura.md) y en
[`docs/hu/`](docs/hu/README.md).

## Roles del sistema

| Rol | Valor interno | Alcance |
|---|---|---|
| Súper Usuario | `SUPER_USUARIO` | Gestiona usuarios, roles y permisos. Sus permisos no se pueden editar. |
| Administrador de Ventas | `ADMIN_VENTAS` | Opera paquetes y reportes. Permisos editables dentro de su alcance. |
| Mensajero | `MENSAJERO` | Consulta y actualiza los paquetes que tiene asignados. Permisos editables dentro de su alcance. |

El Súper Usuario de desarrollo es `superadmin@blawdgourmet.com`. Su contraseña inicial está definida en
`backend/src/main/java/com/blawdgourmet/blawdtrack/auth/config/DataSeeder.java`; en un despliegue real puede
definirse otra con la variable `SUPER_USER_INITIAL_PASSWORD` (perfil `prod`).

## Notas de la entrega

- Este código no contiene credenciales reales. Las claves, contraseñas y servidores se configuran con
  variables de entorno (ver arriba).
- Para enviar correos reales con Brevo, o para el perfil de producción (`prod`), ver `backend/README.md`.

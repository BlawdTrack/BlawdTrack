# BlawdTrack

Sistema de seguimiento de paquetes y mensajeros de Blawd Gourmet. Hoy incluye la base de seguridad y la
gestión de usuarios: inicio de sesión, recuperación de contraseña, mensajeros, administradores, roles y
permisos. Los módulos de paquetes y entregas están por construir.

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| [`blawdtrack/backend`](blawdtrack/backend/README.md) | API REST en Spring Boot 4 y Java 21. |
| [`blawdtrack/frontend`](blawdtrack/frontend/README.md) | Aplicación web en React 19 y Vite. |
| [`docs`](docs) | Arquitectura, documentación por historia de usuario, colecciones de Postman y guías de pruebas. |
| [`guia_commits.md`](guia_commits.md) | Estándar de commits y ramas del equipo. |

## Empezar

1. **Backend:** necesita JDK 21, MySQL y la variable de entorno `JWT_SECRET`.
   Ver [`blawdtrack/backend/README.md`](blawdtrack/backend/README.md).
2. **Frontend:** necesita Node.js y npm. Ver [`blawdtrack/frontend/README.md`](blawdtrack/frontend/README.md).
3. Abre el frontend (normalmente `http://localhost:5173`) e inicia sesión con el Super Usuario de
   desarrollo que crea el backend al arrancar.

## Documentación

- [Arquitectura](docs/arquitectura.md): capas, modelo de datos, autenticación, roles y errores.
- [Historias de usuario](docs/hu/README.md): un documento por HU (HU001 a HU009) con las clases que la
  implementan, cómo funciona en backend y frontend, y qué prueba cada test.

## Convenciones del equipo

- Commits: `tipo(alcance): descripción corta #ID_AzureDevOps`, con `feat`, `fix`, `refactor` o `docs`,
  pequeños y separados por responsabilidad. Ver [`guia_commits.md`](guia_commits.md).
- Código: nombres en inglés; tablas, columnas y textos de negocio en español. Las personas se identifican
  siempre con `documentType` + `documentNumber`.
- Pruebas: no se modifica un test para que pase; si falla, se corrige el código.

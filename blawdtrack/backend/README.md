# BlawdTrack — backend (Luis, corregido) + frontend (nuestro sandbox)

Este paquete junta las dos partes para probar el login real de punta a
punta. Yo ya verifiqué lo que se puede verificar sin correr un servidor
Java (ver "Qué alcancé a comprobar" abajo) — lo que sigue es que tú lo
levantes localmente, donde sí tienes salida a Maven Central.

## 1. Levanta el backend

Los comandos se ejecutan desde la carpeta `blawdtrack/`.

```
./mvnw spring-boot:run
```
(en Windows: `mvnw.cmd spring-boot:run`)

La primera vez va a tardar un poco porque Maven descarga las dependencias
(Spring Boot 4.1.1, JJWT, etc.). Cuando veas algo como:
```
Started BlawdtrackApplication in X seconds
```
significa que ya está arriba en `http://localhost:8080`.

Si falla en vez de eso, copia el error completo — puede ser algo que no
alcancé a ver en la revisión estática (por ejemplo, algo que solo aparece
al resolver dependencias reales).

## 2. Levanta el frontend (en otra terminal, sin cerrar la del backend)

```
cd frontend
npm install
npm run dev
```

El `.env` de este paquete ya viene con `VITE_USE_MOCK_AUTH=false`, así que
apenas lo abras va a intentar pegarle al backend real en
`http://localhost:8080/api`, no al mock.

## 3. Prueba

Abre la URL que te dé Vite (normalmente `http://localhost:5173`) y entra
con:
- `alicia@blawdgourmet.com` / `ChangeMe123` → debería llevarte a la
  pantalla de "Sesión activa" con rol `SUPER_USUARIO`.
- `inactivo@blawdgourmet.com` / `Inactivo123` → debería mostrar el aviso
  ámbar de cuenta inactiva.
- Cualquier otra combinación → error rojo de credenciales.

Si algo no calza (por ejemplo CORS, o el shape de la respuesta), copia el
error de la consola del navegador (F12) y seguimos desde ahí.

## Qué alcancé a comprobar yo (y qué no)

✅ Verificado:
- `pom.xml` corregido (`spring-boot-starter-webmvc`).
- Cero errores de sintaxis genuinos en los 27 archivos `.java` del
  backend (los únicos errores al compilar sin las librerías son,
  como se espera, imports no resueltos — nada de llaves, paréntesis
  o `;` mal puestos).
- El frontend compila (`npm run build`) con `VITE_USE_MOCK_AUTH=false`
  seteado, sin errores.
- El contrato que espera el frontend (`authMock.js`,
  `AuthContext.jsx`) coincide campo por campo con lo que devuelve el
  backend real (`LoginResponse`, `ApiError`).

❌ No pude verificar (requiere Maven Central, bloqueado en este entorno):
- Que las dependencias de Spring Boot/JJWT/Lombok realmente resuelvan y
  el `.jar` compile de verdad.
- Que el servidor arranque y conecte a H2 sin errores.
- Que el login funcione end-to-end contra una petición HTTP real desde el
  navegador (CORS, headers, etc., en la práctica y no solo leyendo el
  código).

Esas tres son exactamente las que vas a confirmar tú al seguir los pasos
de arriba.

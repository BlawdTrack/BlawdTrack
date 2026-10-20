# Pruebas de extremo a extremo con Katalon: guía del equipo

Esta carpeta deja listo todo lo que se necesita **antes** de escribir los casos de Katalon: un entorno que se levanta
y se reinicia con un comando, cuentas conocidas, datos de prueba, archivos de importación y selectores estables.
**Todavía no hay proyecto ni casos de Katalon**; se crean encima de esta base.

## Contenido
1. [Por qué un entorno aparte y por qué Docker](#1-por-qué-un-entorno-aparte-y-por-qué-docker)
2. [Requisitos](#2-requisitos)
3. [Uso rápido](#3-uso-rápido)
4. [Los scripts](#4-los-scripts)
5. [Direcciones y puertos](#5-direcciones-y-puertos)
6. [Cuentas de prueba](#6-cuentas-de-prueba)
7. [Datos de prueba (paquetes)](#7-datos-de-prueba-paquetes)
8. [Archivos de importación](#8-archivos-de-importación)
9. [Selectores (`data-testid`)](#9-selectores-data-testid)
10. [Cómo armar los casos en Katalon](#10-cómo-armar-los-casos-en-katalon)
11. [Qué datos usar para cada HU](#11-qué-datos-usar-para-cada-hu)
12. [Qué no se puede probar todavía](#12-qué-no-se-puede-probar-todavía)
13. [Problemas frecuentes](#13-problemas-frecuentes)
14. [Reglas del equipo](#14-reglas-del-equipo)
15. [Estructura de la carpeta](#15-estructura-de-la-carpeta)

---

## 1. Por qué un entorno aparte y por qué Docker
Katalon solo necesita una URL; Docker no es obligatorio para Katalon. Se usa para que **el entorno al que apuntan las
pruebas sea siempre el mismo**:

- Las HU borran paquetes (HU-012), importan archivos (HU-010 y HU-011) y necesitan más de 100 paquetes (HU-014). Con la
  base de desarrollo los datos cambiarían en cada corrida y los resultados no se podrían repetir, además de arriesgar
  datos reales de trabajo.
- **Un comando** (`up.ps1`) deja todo listo en cualquier equipo y en la integración continua, sin instalar MySQL, Java 21
  ni Node.
- Usa **MySQL real con las migraciones de Flyway**, que es lo que corre en producción. Las pruebas del backend usan H2 y
  no ven problemas propios de MySQL.
- **Es desechable**: `down.ps1` o `up.ps1 -Fresh` borran la base y se parte siempre del mismo estado.
- **Convive con el entorno de desarrollo**: usa puertos propios (5174, 8081, 8025, 3307).
- **Mailpit** captura los correos (enlace de recuperación de contraseña, contraseñas temporales) sin enviar correos
  reales.
- El `JWT_SECRET` se genera en cada arranque y no se guarda en ningún archivo.

Costos: requiere Docker Desktop y memoria, y la primera construcción tarda varios minutos.

## 2. Requisitos
- **Docker Desktop encendido** (probado con Docker 28).
- **Windows PowerShell 5.1** (con el que se probaron los scripts; los archivos `.ps1` son solo ASCII a propósito).
- Puertos libres: 5174, 8081, 8025, 1025 y 3307.
- Unos 4 GB de memoria libres para los contenedores.
- Para escribir y correr los casos: Katalon Studio. Para correrlos por línea de comandos o en integración continua se
  usa `katalonc` (Katalon Runtime Engine). **Por confirmar:** qué licencia tiene el equipo para eso.

## 3. Uso rápido
```powershell
cd <ruta-del-repo>\blawdtrack\katalon\scripts
.\up.ps1 -Fresh     # construye, levanta, espera al backend y carga cuentas y datos
```
Cuando termina imprime las direcciones. Abre http://localhost:5174 e inicia sesión con una de las cuentas de la
sección 6. Para apagar y borrar la base:
```powershell
.\down.ps1
```

## 4. Los scripts
Todos están en `katalon/scripts/` y se ejecutan desde esa carpeta.

| Script | Para qué | Notas |
|---|---|---|
| `up.ps1` | Construye las imágenes, levanta MySQL, Mailpit, backend y frontend, espera a que el backend responda y ejecuta `prepare-data.ps1`. | `-Fresh` borra antes la base. `-TimeoutSeconds` (240 por defecto) es lo que espera al backend. La primera vez tarda varios minutos. |
| `prepare-data.ps1` | Crea o reutiliza las cuentas y recarga los paquetes de prueba. | Se puede repetir las veces que haga falta. `-SkipFixtures` solo prepara las cuentas. Úsalo **antes de cada corrida de Katalon** para partir de datos limpios. |
| `down.ps1` | Apaga el entorno y borra la base. | El siguiente `up.ps1` empieza de cero. |

Comandos útiles de Docker (con el entorno levantado):
```powershell
docker ps                                   # contenedores del entorno (blawdtrack-e2e-*)
docker logs blawdtrack-e2e-backend          # registros del backend
docker logs blawdtrack-e2e-frontend         # registros del frontend
docker exec -it -e MYSQL_PWD=e2e-root blawdtrack-e2e-mysql mysql -uroot blawdtrack   # consola de MySQL
```

## 5. Direcciones y puertos
| Servicio | URL | Para qué |
|---|---|---|
| Frontend | http://localhost:5174 | Pruebas de interfaz (Web UI). |
| Backend | http://localhost:8081 | Pruebas de API (Web Service), por ejemplo `POST /api/v1/auth/login`. |
| Correos (Mailpit) | http://localhost:8025 | Ver los correos enviados; la API de Mailpit está en `/api/v1/messages`. |
| MySQL | `localhost:3307` (usuario `root`, contraseña `e2e-root`) | Consultar o preparar datos. |

El enlace de recuperación de contraseña de los correos apunta a `http://localhost:5174/recovery`.

## 6. Cuentas de prueba
Están en `environment/test-accounts.json` y las crea `prepare-data.ps1` por la API. Son cuentas desechables de este
entorno; no son credenciales reales.

| Rol | Correo | Contraseña |
|---|---|---|
| Súper Usuario (lo siembra el backend) | `superadmin@blawdgourmet.com` | `ultra_gorGon_1!` |
| Administrador de Ventas | `ventas.e2e@blawdgourmet.test` | `Katalon2026` |
| Mensajero | `mensajero.e2e@blawdgourmet.test` | `Katalon2026` |

Regla del equipo: el Súper Usuario tiene acceso a todos los módulos y todas las funciones.

> No cambies estas contraseñas desde una prueba. Si una prueba las cambia (por ejemplo la de restablecer contraseña),
> vuelve a correr `prepare-data.ps1` para restaurarlas.

## 7. Datos de prueba (paquetes)
`environment/fixtures/e2e-packages.sql` se aplica solo a la base de este entorno (nunca lo carga la aplicación) y se
puede repetir: borra todo lo que empieza con `E2E-` y lo vuelve a crear. Existe porque en `develop` ningún flujo
asigna, despacha ni entrega paquetes, así que sin él no se podrían probar la línea de tiempo completa, la evidencia
de entrega ni la eliminación según el estado.

| Número de envío | Estado | Para qué sirve |
|---|---|---|
| `E2E-PEND-01` | Pendiente | Eliminable; ficha con un solo evento. |
| `E2E-ASIG-01` | Asignado | Eliminable; muestra el nombre del mensajero. |
| `E2E-ENV-01` | Despachado | No eliminable. |
| `E2E-TRANS-01` | En tránsito | No eliminable. |
| `E2E-NOENT-01` | No entregado | No eliminable. |
| `E2E-ENTR-01` | Entregado | Foto, firma e historial completo (5 eventos). |
| `E2E-DEL-P1..P3` | Pendiente | Para borrar sin perder los demás. |
| `E2E-DEL-A1..A2` | Asignado | Para borrar sin perder los demás. |
| `E2E-BULK-001..120` | Pendiente | Más de 100 paquetes para "Cargar más". |

Si una prueba borra un paquete, `prepare-data.ps1` lo recrea.

## 8. Archivos de importación
En `environment/import-files/` hay tres CSV con el formato de Zoho. Resultado esperado en la previsualización:

| Archivo | Válidos | Inválidos | Duplicados | Para qué |
|---|---|---|---|---|
| `importacion-valida.csv` | 4 | 0 | 0 | Importación correcta, con horarios de entrega variados (09-16, 09-14, 14-16, 10-14). |
| `importacion-con-errores.csv` | 1 | 4 | 0 | Campos obligatorios vacíos. |
| `importacion-con-duplicados.csv` | 2 | 0 | 2 | `E2E-PEND-01` ya está registrado (necesita haber corrido `prepare-data.ps1`); `E2E-DUP-001` viene dos veces con datos distintos (se conserva el primero y la copia queda como duplicado en el archivo); `E2E-DUP-002` viene en dos filas con los mismos datos y se agrupa en un solo paquete. |

Los paquetes que se importan empiezan con `E2E-`, así que el siguiente `prepare-data.ps1` los borra y el archivo
se puede importar otra vez.

## 9. Selectores (`data-testid`)
Los campos de texto ya tienen `id` o `aria-label`. Para botones, contadores, filas y diálogos se añadió `data-testid`.
En Katalon, un objeto de prueba se define con XPath o CSS, por ejemplo `//*[@data-testid='import-confirm']` o
`[data-testid="import-confirm"]`.

| Zona | `data-testid` |
|---|---|
| Inicio de sesión | `login-submit`, `login-forgot-password` |
| Navegación | `nav-<ruta>` (por ejemplo `nav-/main-menu/paquetes/buscar`), `main-menu-link`, `logout-button` |
| Formularios | `form-submit`, `form-discard`, `edit-save`, `edit-discard`, `confirm-dialog-confirm`, `confirm-dialog-cancel`, `leave-dialog-leave`, `leave-dialog-stay`, `document-search-submit`, `document-search-clear` |
| Importación | `import-select-file`, `import-file-input`, `import-review`, `import-cancel`, `import-count-{read,valid,invalid,duplicate}`, `import-filter-{all,valid,invalid,duplicate}`, `import-row-{valid,invalid,duplicate}`, `import-confirm`, `import-load-another`, `import-result-{read,registered,invalid,duplicate}`, `import-result-another` |
| Búsqueda de paquetes | `package-search-input`, `package-search-clear`, `package-search-summary`, `package-search-empty-clear`, `package-result-row`, `package-load-more`, `package-load-more-count` |
| Ficha del paquete | `package-detail-card`, `package-courier-name`, `package-history-list`, `package-history-entry`, `delete-package-button`, `delete-package-cancel`, `delete-package-confirm` |
| Comprobante de entrega | `package-proof-card`, `package-proof-summary`, `package-proof-empty`, `delivery-photo`, `delivery-photo-image`, `delivery-photo-retry` |
| Recuperar contraseña (HU-002) | `recovery-submit`, `recovery-email-sent`, `recovery-resend`, `recovery-use-another`, `new-password-submit`, `new-password-success`, `new-password-go-login`, `new-password-invalid-link`, `new-password-request-link` |

Notas:
- `import-file-input` es el `<input type="file">`: con Katalon se sube el archivo con `uploadFile` o `sendKeys` sobre
  ese elemento.
- `src/components/e2eSelectors.test.jsx` (en `frontend/`) fija los principales: si un refactor los quita, esa prueba
  falla antes de que se rompan los casos de Katalon. **Si agregas un `data-testid`, agrégalo también a esta tabla.**

## 10. Cómo armar los casos en Katalon
Recomendación de organización (aún no creada):

- **Una suite por HU** (por ejemplo `HU-010`, `HU-011`…) más una suite de humo con inicio de sesión y navegación.
- **Dos capas:** casos de **API** (Web Service) para reglas y respuestas, y casos de **interfaz** (Web UI) para los
  flujos que ve la persona. La API es más rápida y estable; la interfaz solo para lo que importa visualmente.
- **Perfiles** (Profiles) con las direcciones de la sección 5 y las cuentas de la sección 6, en vez de escribirlas en
  cada caso.
- **Objetos de prueba** por `data-testid`, nunca por texto ni por clases de MUI (cambian).
- **Inicio de sesión por API:** `POST http://localhost:8081/api/v1/auth/login` con `{"email": "...", "password": "..."}`
  devuelve un `token` que se envía como `Authorization: Bearer <token>`. Sirve para preparar datos sin pasar por la
  pantalla.
- **Antes de cada corrida:** `prepare-data.ps1` (o `up.ps1 -Fresh` si quieres base nueva). Los casos que modifican
  datos deben poder repetirse con eso.
- **Esperas:** la lista de paquetes y la previsualización cargan por red; usa esperas por elemento, no pausas fijas.
- **Correo:** para recuperación de contraseña, consulta `http://localhost:8025/api/v1/messages` y toma el enlace del
  último mensaje.

Endpoints de paquetes que usan las HU (bajo `/api/v1/packages`): `GET /search`, `GET /{numero}`,
`GET /{numero}/history`, `DELETE /{numero}`, `POST /import` y la previsualización de importación.

## 11. Qué datos usar para cada HU
| HU | Qué se prueba | Cuenta | Datos |
|---|---|---|---|
| HU-010 | Previsualización con horario de entrega | Administrador de Ventas o Súper Usuario | `importacion-valida.csv` |
| HU-011 | Duplicados y errores | Ventas o Súper Usuario | `importacion-con-duplicados.csv`, `importacion-con-errores.csv`; `E2E-PEND-01` como paquete ya registrado |
| HU-012 | Eliminar paquetes (solo Pendiente/Asignado) | Ventas o Súper Usuario | `E2E-DEL-*` para borrar; `E2E-ENV-01`, `E2E-TRANS-01`, `E2E-ENTR-01` para comprobar que no se puede |
| HU-013 | Línea de tiempo de la ficha | Cualquiera con acceso | `E2E-ENTR-01` (completa) y un paquete recién importado (evento "Registrado como Pendiente") |
| HU-014 | "Cargar más" | Ventas o Súper Usuario | `E2E-BULK-001..120` (la interfaz pide 100 por página) |
| Acceso | Qué ve cada rol | Las tres | — |

## 12. Qué no se puede probar todavía
- En `develop` ningún flujo escribe eventos de la línea de tiempo después del registro (asignar, despachar,
  entregar), ni la evidencia de entrega. Esos casos se prueban **solo con los datos del fixture**, no generándolos
  desde la aplicación.
- Los criterios escritos de las HU todavía no mencionan que el Súper Usuario accede a todo; los casos se basan en la
  regla del equipo.
- No se verificó la ejecución con `katalonc` ni en integración continua.

## 13. Problemas frecuentes
| Síntoma | Causa y solución |
|---|---|
| `Docker no responde` | Docker Desktop no está encendido. Enciéndelo y espera a que diga "running". |
| El backend no responde en 240 segundos | Revisa `docker logs blawdtrack-e2e-backend`. Si el equipo anda justo de memoria, sube `-TimeoutSeconds`. |
| Puerto ocupado (5174, 8081, 8025, 3307) | Cierra lo que lo use o cambia el puerto en `environment/docker-compose.e2e.yml`. No uses 3306, 8080 ni 5173: son los de desarrollo. |
| Aparece `WARNING: DOCKER_INSECURE_NO_IPTABLES_RAW is set` | Es un aviso de Docker, no un error. Los scripts lo toleran. |
| Una cuenta no inicia sesión | Una prueba cambió la contraseña. Corre `prepare-data.ps1`. |
| Faltan o sobran paquetes `E2E-` | Corre `prepare-data.ps1`. |
| Quiero empezar de cero | `.\up.ps1 -Fresh` |
| Los scripts fallan con caracteres raros | Los `.ps1` son solo ASCII y los demás archivos usan saltos de línea LF (`.gitattributes`); no los guardes con otra codificación. |

## 14. Reglas del equipo
- **No agregues datos de demostración a la aplicación.** Los datos de prueba viven solo en `environment/fixtures/` y los
  carga únicamente `prepare-data.ps1`.
- Las contraseñas de `test-accounts.json` son solo de este entorno desechable; nunca uses credenciales reales aquí.
- No guardes el `JWT_SECRET` ni otros secretos en la carpeta.
- Si cambias el comportamiento de una pantalla, revisa que sus `data-testid` sigan existiendo y actualiza la sección 9.
- Los archivos nuevos de scripts deben ser compatibles con Windows PowerShell 5.1 (sin `&&`, sin `?.`, solo ASCII).

## 15. Estructura de la carpeta
```
katalon/
  README.md                         esta guía
  .gitattributes                    saltos de línea LF para Docker y SQL
  scripts/
    up.ps1  down.ps1  prepare-data.ps1
  environment/
    docker-compose.e2e.yml          MySQL, Mailpit, backend y frontend
    backend.Dockerfile  frontend.Dockerfile  frontend.nginx.conf
    test-accounts.json              cuentas conocidas
    fixtures/e2e-packages.sql       paquetes de prueba
    import-files/*.csv              archivos de importación
```

# Pruebas de extremo a extremo con Katalon: guía del equipo

Esta carpeta deja listo todo lo que se necesita **antes** de escribir los casos de Katalon: un entorno que se levanta
y se reinicia con un comando, cuentas conocidas, datos de prueba, archivos de importación y selectores estables.
El proyecto de Katalon Studio está en `project/` y trae 5 casos de la HU-011 (sección 16), 7 de la HU-012 (sección 17) y 9 de la HU007.
Para HU007, consultar el [inventario, preparación de datos y ejecución](../docs/HU007-pruebas.md#suite-funcional-de-katalon).
Su suite conserva una preparación de datos propia; las cuentas de `prepare-data.ps1` no sustituyen sus precondiciones.

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
16. [Proyecto de Katalon Studio (HU-011)](#16-proyecto-de-katalon-studio-hu-011)
17. [Pruebas de la HU-012 (eliminar paquetes)](#17-pruebas-de-la-hu-012-eliminar-paquetes)
18. [Pruebas de la HU-010 (importar paquetes)](#18-pruebas-de-la-hu-010-importar-paquetes)
19. [Pruebas de las HU-001 a HU-009 (usuarios y accesos)](#19-pruebas-de-las-hu-001-a-hu-009-usuarios-y-accesos)

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

Cuando termina imprime las direcciones. Abre <http://localhost:5174> e inicia sesión con una de las cuentas de la
sección 6. Para apagar y borrar la base:

```powershell
.\down.ps1
```

## 4. Los scripts

Todos están en `katalon/scripts/` y se ejecutan desde esa carpeta.

| Script | Para qué | Notas |
| --- | --- | --- |
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
| --- | --- | --- |
| Frontend | <http://localhost:5174> | Pruebas de interfaz (Web UI). |
| Backend | <http://localhost:8081> | Pruebas de API (Web Service), por ejemplo `POST /api/v1/auth/login`. |
| Correos (Mailpit) | <http://localhost:8025> | Ver los correos enviados; la API de Mailpit está en `/api/v1/messages`. |
| MySQL | `localhost:3307` (usuario `root`, contraseña `e2e-root`) | Consultar o preparar datos. |

El enlace de recuperación de contraseña de los correos apunta a `http://localhost:5174/recovery`.

## 6. Cuentas de prueba

Están en `environment/test-accounts.json` y las crea `prepare-data.ps1` por la API. Son cuentas desechables de este
entorno; no son credenciales reales.

| Rol | Correo | Contraseña |
| --- | --- | --- |
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
| --- | --- | --- |
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

En `environment/import-files/` hay CSV con el formato de Zoho (los `hu010-*` se describen en la sección 18). Resultado esperado en la previsualización:

| Archivo | Válidos | Inválidos | Duplicados | Para qué |
| --- | --- | --- | --- | --- |
| `importacion-valida.csv` | 4 | 0 | 0 | Importación correcta, con horarios de entrega variados (09-16, 09-14, 14-16, 10-14). |
| `importacion-con-errores.csv` | 2 | 3 | 0 | Campos obligatorios vacíos (orden, cliente o dirección). `E2E-ERR-005` no trae teléfono y es válido: el teléfono no es obligatorio. |
| `importacion-con-duplicados.csv` | 2 | 0 | 2 | `E2E-PEND-01` ya está registrado (necesita haber corrido `prepare-data.ps1`); `E2E-DUP-001` viene dos veces con datos distintos (se conserva el primero y la copia queda como duplicado en el archivo); `E2E-DUP-002` viene en dos filas con los mismos datos y se agrupa en un solo paquete. |

Los paquetes que se importan empiezan con `E2E-`, así que el siguiente `prepare-data.ps1` los borra y el archivo
se puede importar otra vez.

## 9. Selectores (`data-testid`)

Los campos de texto ya tienen `id` o `aria-label`. Para botones, contadores, filas y diálogos se añadió `data-testid`.
En Katalon, un objeto de prueba se define con XPath o CSS, por ejemplo `//*[@data-testid='import-confirm']` o
`[data-testid="import-confirm"]`.

| Zona | `data-testid` |
| --- | --- |
| Inicio de sesión | `login-submit`, `login-forgot-password` |
| Navegación | `nav-<ruta>` (por ejemplo `nav-/main-menu/paquetes/buscar`), `main-menu-link`, `logout-button` |
| Formularios | `form-submit`, `form-discard`, `edit-save`, `edit-discard`, `confirm-dialog-confirm`, `confirm-dialog-cancel`, `leave-dialog-leave`, `leave-dialog-stay`, `document-search-submit`, `document-search-clear` |
| Importación | `import-select-file`, `import-file-input`, `import-help-toggle`, `import-review`, `import-cancel`, `import-summary`, `import-count-{read,valid,invalid,duplicate}`, `import-filter-{all,valid,invalid,duplicate}`, `import-row-{valid,invalid,duplicate}`, `import-confirm`, `import-load-another`, `import-result-{read,registered,invalid,duplicate}`, `import-result-another` |
| Búsqueda de paquetes | `package-search-field`, `package-search-input`, `package-search-submit`, `package-search-clear`, `package-search-summary`, `package-search-empty-title`, `package-search-empty-clear`, `package-result-row`, `package-load-more`, `package-load-more-count` |
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
| --- | --- | --- | --- |
| HU-010 | Importar Excel y CSV, formato no permitido, errores, cancelar y datos registrados | Ventas o Súper Usuario; Mensajero para denegación | `hu010-*` y `importacion-valida.csv` (sección 18) |
| HU-011 | Duplicados y errores | Ventas o Súper Usuario | `importacion-con-duplicados.csv`, `importacion-con-errores.csv`; `E2E-PEND-01` como paquete ya registrado |
| HU-012 | Eliminar paquetes (solo Pendiente/Asignado) | Ventas o Súper Usuario | `E2E-DEL-*` para borrar; `E2E-ENV-01`, `E2E-TRANS-01`, `E2E-ENTR-01` para comprobar que no se puede |
| HU-013 | Línea de tiempo de la ficha | Cualquiera con acceso | `E2E-ENTR-01` (completa) y un paquete recién importado (evento "Registrado como Pendiente") |
| HU-014 | Búsqueda por envío, orden, cliente, dirección, teléfono y horario; resultados vacíos, actualización automática, limpieza y permisos | Administrador de Ventas; Mensajero para denegación | `E2E-PEND-01` y `E2E-ASIG-01` |
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
| --- | --- |
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

```text
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

## 16. Proyecto de Katalon Studio (HU-011 y HU-014)

El proyecto está en `katalon/project/` y contiene pruebas funcionales para HU-011 y HU-014.

### Qué hace falta

- Katalon Studio (edición gratuita) instalado y con sesión iniciada con una cuenta de Katalon.
- Chrome instalado. Katalon Studio trae el controlador.
- El entorno levantado con `scripts\up.ps1`. Como el frontend se construye dentro de la imagen, **vuelve a correr `up.ps1 -Fresh` después de actualizar el código** para que tenga los últimos `data-testid`.

### Cómo abrirlo y correrlo

1. En Katalon Studio: `File > Open Project` y elige la carpeta `katalon\project`. Si pide migrar el proyecto, acepta.
2. En el explorador abre `Test Suites/HU-011` o `Test Suites/HU-014` y pulsa Run (Chrome). También se puede correr un caso suelto desde `Test Cases/HU-011` o `Test Cases/HU-014`.
3. Las capturas de evidencia quedan en `katalon\project\evidence` y el reporte de Katalon en `Reports/` (se puede exportar a HTML, CSV o PDF).

Los diez casos HU-014 recrean los fixtures al iniciar y generan capturas PNG en `katalon\project\evidence`:

| Caso | Evidencia |
| --- | --- |
| `TC-HU014-01` a `TC-HU014-06` | Una captura individual para cada criterio de búsqueda; el primero también valida los datos básicos del paquete. |
| `TC-HU014-07` | Mensaje al buscar texto sin coincidencias. |
| `TC-HU014-08` | Actualización al cambiar el término sin pulsar un botón. |
| `TC-HU014-09` | Listado completo restaurado al limpiar. |
| `TC-HU014-10` | Acceso denegado al Mensajero. |

`TC-HU014-08` refleja literalmente el criterio de aceptación de actualización automática. Actualmente el buscador solo
aplica el término al pulsar "Buscar" o Enter, por lo que este caso debe fallar hasta que ese comportamiento se implemente.

El caso `TC-HU011-01` ejecuta solo `scripts\prepare-data.ps1` al empezar, así que se puede repetir sin volver a levantar nada. Ningún caso registra paquetes, por lo que no hace falta reiniciar los datos entre corridas.

### Casos

| Caso | Archivo de importación | Qué comprueba |
| --- | --- | --- |
| TC-HU011-01 Duplicado contra la base de datos | `hu011-tc01-duplicado-base-datos.csv` | `E2E-PEND-01` (ya registrado) se resalta como duplicado y no cuenta entre los válidos. |
| TC-HU011-02 Duplicado dentro del archivo | `hu011-tc02-duplicado-en-archivo.csv` | `E2E-HU011-B01` repetido con otros datos: la primera fila queda válida y la copia se excluye como duplicada. |
| TC-HU011-03 Sin duplicados | `importacion-valida.csv` | Avisa que todos los registros son válidos y se puede confirmar. |
| TC-HU011-04 Conteos antes de confirmar | `importacion-con-duplicados.csv` | 4 leídos, 2 válidos y 2 duplicados, también en el botón de confirmar. |
| TC-HU011-06 Rol sin permiso (el 05 se retiró de la suite) | (sin archivo) | El Mensajero vuelve a su inicio, no ve la importación y la API responde 403. |

### Estructura

- `Test Cases/HU-011/` (definición de cada caso) y `Scripts/HU-011/<caso>/Script*.groovy` (su código). Katalon exige esa carpeta `Scripts/`: si el código está junto al `.tc`, el caso se ejecuta como "Skipped" sin ningún error.
- `Keywords/com/blawd/Env.groovy`: rutas de los archivos y preparación de datos.
- `Keywords/com/blawd/Ui.groovy`: inicio de sesión, subida del archivo, lectura de totales y comprobaciones. Los objetos se buscan por `data-testid`.
- `Keywords/com/blawd/Api.groovy`: inicio de sesión y códigos HTTP del backend.
- `Profiles/default.glbl`: direcciones y cuentas del entorno de pruebas (las de la sección 6).

### Notas

- El selector de archivo de la importación está oculto; `Ui.uploadAndReview` lo muestra desde la prueba antes de subir el archivo. La aplicación no cambia.
- Los casos entran a la pantalla por su dirección (`/main-menu/paquetes/importar`). Si la sesión no se conserva al recargar, cámbialo por un clic en el menú (`nav-/main-menu/paquetes/importar`).
- Los archivos del proyecto se escribieron sin abrir Katalon Studio: si al abrirlo marca algún error, corrígelo ahí y avisa para dejarlo en el repositorio.

## 17. Pruebas de la HU-012 (eliminar paquetes)

Cubren la TASK 339 (pruebas funcionales de la HU-012). Están en `Test Cases/HU-012/` y la suite es `Test Suites/HU-012`.
Se abren y se corren igual que los de la HU-011 (sección 16).

### Casos

| Caso | Paquete | Qué comprueba |
| --- | --- | --- |
| TC-HU012-01 Eliminar paquete Pendiente | `E2E-DEL-P1` | Desde la lista: pide confirmar, muestra "Paquete … eliminado correctamente." y la fila desaparece; la API responde 404. |
| TC-HU012-02 Eliminar paquete Asignado | `E2E-DEL-A1` | Desde la ficha (con el mensajero asignado): mensaje de éxito y "ya no está en el sistema ni en la lista del mensajero"; la API responde 404 y la base ya no lo tiene. |
| TC-HU012-03 Cancelar en el diálogo | `E2E-DEL-P2` | "Cancelar" y Esc cierran el diálogo sin eliminar; el paquete sigue en la lista. |
| TC-HU012-04 Paquete Enviado o posterior | `E2E-ENV-01`, `E2E-TRANS-01`, `E2E-NOENT-01` | Botón en gris con "No eliminable en …"; al pulsarlo avisa que ya no puede eliminarse y no abre el diálogo; la API responde 409. |
| TC-HU012-05 Paquete Entregado | `E2E-ENTR-01` | Lo mismo desde la lista y desde la ficha; la API responde 409. |
| TC-HU012-06 Registro de auditoría | `E2E-DEL-P3` | Tras eliminar, hay un registro `ELIMINAR_PAQUETE` con fecha, hora y la cuenta del Administrador de Ventas. |
| TC-HU012-07 Rol sin permiso | `E2E-DEL-A2` | El Mensajero vuelve a su inicio, no ve "Eliminar", la API responde 403 y el paquete sigue. |

### Notas

- Los casos que eliminan (01, 02 y 06) ejecutan `scripts\prepare-data.ps1` al empezar, así que se pueden repetir sin
  volver a levantar nada. Cada caso usa su propio paquete, de modo que el orden de la suite no importa.

- **Lo que la interfaz todavía no muestra se comprueba en la base** del entorno de pruebas (con `docker exec`, igual
  que `prepare-data.ps1`): la lista del mensajero llega con la HU-022 (TC-HU012-02) y la pantalla de auditoría de
  paquetes con la HU-028 (TC-HU012-06). `Keywords/com/blawd/Packages.groovy` tiene esas consultas.

- Los avisos flotantes no tienen `data-testid`: `Packages.verifyMessage` los reconoce por `role="status"` y su texto.
- Desde #155 el Súper Usuario también puede eliminar; el único rol sin permiso es el Mensajero.

## 18. Pruebas de la HU-010 (importar paquetes)

Están en `Test Cases/HU-010/` y la suite es `Test Suites/HU-010`. Se abren y se corren igual que los de la HU-011
(sección 16). Los casos que importan ejecutan `scripts\prepare-data.ps1` al empezar, así que se pueden repetir sin
volver a levantar nada. Código compartido en `Keywords/com/blawd/Imports.groovy`.

### Casos

| Caso | Archivo | Qué comprueba |
| --- | --- | --- |
| TC-HU010-01 Importar Excel válido | `hu010-tc01-valido.xlsx` | Previsualización con 4 válidos; al confirmar, aviso "4 paquetes registrados" y cada paquete queda en la lista como Pendiente. |
| TC-HU010-02 Importar CSV válido | `importacion-valida.csv` | Lo mismo con el CSV. |
| TC-HU010-03 Formato no permitido | `hu010-tc03-formato-no-permitido.pdf` y `.txt` | Aviso "Formato no compatible. Solo se permiten archivos .xlsx y .csv.", el archivo no queda seleccionado y "Revisar datos" sigue bloqueado. |
| TC-HU010-04 Falta columna obligatoria | `hu010-tc04-sin-columna-telefono.csv` | Debe marcar las 2 filas con error por el teléfono y no dejar confirmar. **Falla hoy** (ver abajo). |
| TC-HU010-05 Filas válidas e inválidas | `importacion-con-errores.csv` | 5 leídos, 2 válidos y 3 con error, con el motivo de cada fila antes de confirmar; solo se registran los 2 válidos. |
| TC-HU010-06 Todas inválidas | `hu010-tc06-todo-invalido.csv` | "Ningún registro se puede importar"; "Confirmar importación" bloqueado. |
| TC-HU010-07 Cancelar en la previsualización | `importacion-valida.csv` | "Cambiar archivo" y "Cancelar" salen sin registrar nada. |
| TC-HU010-08 Datos importados correctos | `importacion-valida.csv` | En la lista, orden, envío, cliente, dirección, teléfono y horario de los 4 paquetes coinciden con el archivo. |
| TC-HU010-09 Rol sin permiso | (sin archivo) | El Mensajero vuelve a su inicio, no ve la importación y la API responde 403. |

### Notas

- **TC-HU010-04 falla a propósito.** Refleja literalmente el criterio ("sin teléfono: error que indica el campo faltante").
  El backend (`RequiredPackageFieldsValidator`) solo exige número de envío, número de orden, cliente y dirección, así que
  hoy un archivo sin teléfono se acepta como válido. El caso pasará cuando el teléfono sea obligatorio o cuando el
  criterio cambie.

- `hu010-tc01-valido.xlsx` tiene los mismos datos que `importacion-valida.csv` pero con números `E2E-HU010-XLS-*`, para
  que el 01 y el 02 no choquen entre sí. Se generó con un script, sin Excel.

- El horario que muestra la lista es el texto de la columna Notes (`Antes de las 3 p.m.`); sin nota queda el horario por
  defecto `9:00 a.m. a 4:00 p.m.`.

- Escritos sin abrir Katalon Studio: si al correrlos marca algún error, corrígelo ahí y avisa para dejarlo en el
  repositorio.

## 19. Pruebas de las HU-001 a HU-009 (usuarios y accesos)

Cubren el inicio de sesión (HU-001), la recuperación de contraseña (HU-002), los mensajeros (HU-003, HU-004 y HU-005), los administradores (HU-006 y HU-008) y los roles y permisos (HU-009). La HU-007 tiene su propia suite (`TS-HU007-Pruebas-Funcionales`, ver `docs/HU007-pruebas.md`). Hay una suite por HU en `Test Suites/` (`HU-001`, `HU-002`, ...) y sus casos están en `Test Cases/HU-00X/`. Se abren y se corren igual que los de la HU-011 (sección 16).

### Cómo funcionan

- **Cuentas propias por caso.** Cada caso crea por la API los mensajeros o administradores que necesita (documento, correo y teléfono únicos en cada corrida, con la contraseña `Katalon2026`), así que se pueden repetir sin reiniciar el entorno. Las cuentas compartidas de la sección 6 solo se usan para iniciar sesión. Los casos ejecutan `scripts\prepare-data.ps1` al empezar, por si alguna se alteró.
- **Correo (Mailpit).** HU-002, HU-003 y HU-006 leen los correos de `http://localhost:8025` (`Keywords/com/blawd/Mail.groovy`): el enlace de recuperación y la contraseña temporal. La dirección está en la variable global `mailUrl` del perfil `default`.
- **Selectores de rueda.** El horario y la capacidad de carga se eligen con ruedas: la prueba abre el selector, hace clic en un valor visible y pulsa "Listo" (`Ui.pickTime` y `Ui.pickWeight`). La rueda solo muestra 4 valores a cada lado del actual, por eso los casos usan valores cercanos (9:00 am, 12:00 pm, 5 kg y 22 kg).
- **Base de datos.** Lo que la pantalla no muestra (estado de la cuenta, rol y auditoría) se consulta en la base del entorno de pruebas con `docker exec`, igual que en la HU-012 (`Packages.query`, `Users.auditAfter` y `Users.auditForUserAfter`).
- **Permisos (HU-009).** Los casos que cambian permisos del Administrador de Ventas compartido los restablecen al terminar (`DELETE /api/v1/users/CEDULA/900000001/permissions`), aunque el caso falle.
- **Avisos y errores.** Los avisos flotantes se reconocen por `role="status"` (`Packages.verifyMessage`), los avisos fijos por `role="alert"` (`Ui.verifyAlert`) y el error de un campo por su texto de ayuda (`Ui.verifyFieldError`); no tienen `data-testid`. No se agregaron `data-testid` nuevos: se usan los de la sección 9, los `id` y `name` de los campos y las etiquetas de accesibilidad.
- **Sesión.** `GET /api/v1/auth/session` responde 204 con sesión válida y 401 si no.

### HU-001 (inicio de sesión y control de acceso por rol)

| Caso | Qué comprueba |
| --- | --- |
| TC-HU001-01 El Super Usuario inicia sesion | Llega a `/main-menu` y ve todos los módulos. |
| TC-HU001-02 El Administrador de Ventas inicia sesion | Llega a `/main-menu` y solo ve paquetes (no ve mensajeros, administradores ni roles). |
| TC-HU001-03 El Mensajero inicia sesion | Llega a `/mensajero`; el menú no le ofrece paquetes ni administración. |
| TC-HU001-04 Credenciales incorrectas | Aviso "Correo o contraseña incorrectos"; la API responde 401 con el mismo código y mensaje para contraseña mala y correo inexistente. |
| TC-HU001-05 Cuenta inactiva | Aviso "Tu cuenta está inactiva"; la API responde 403 `ACCOUNT_INACTIVE`. |
| TC-HU001-06 Rutas protegidas por rol | Sin sesión todo lleva a `/login`; con sesión, una ruta ajena devuelve a Ventas a `/main-menu` y al Mensajero a `/mensajero`. |
| TC-HU001-07 Cerrar sesion | "Cerrar sesión" lleva a `/login` y las rutas protegidas ya no abren. |
| TC-HU001-08 Sesion cerrada al desactivar la cuenta | Al desactivar la cuenta, su token deja de valer (204 antes, 401 después). |

### HU-002 (recuperación de contraseña)

| Caso | Qué comprueba |
| --- | --- |
| TC-HU002-01 Solicitar el enlace con un correo registrado | "Revisa tu correo" y el correo con el enlace llega a Mailpit. |
| TC-HU002-02 Correo no registrado: misma respuesta | Un correo inexistente ve la misma pantalla y no recibe correo. |
| TC-HU002-03 Una cuenta inactiva no recibe el correo | Una cuenta inactiva ve la misma pantalla y no recibe correo. |
| TC-HU002-04 Restablecer la contrasena con el enlace | Con el enlace se define una contraseña nueva; la cuenta entra con la nueva y ya no con la anterior. |
| TC-HU002-05 Reglas de la contrasena nueva | El botón "Guardar nueva contraseña" se bloquea con menos de 8 caracteres, sin letras, sin números o con confirmación distinta. |
| TC-HU002-06 El enlace se puede usar una sola vez | El enlace usado queda invalidado ("Enlace no válido"). |
| TC-HU002-07 Enlace vencido | Con el enlace vencido (se adelanta la expiración en la base) aparece "Enlace no válido". |
| TC-HU002-08 No se puede reutilizar una contrasena reciente | No se acepta reutilizar una de las últimas contraseñas. |

### HU-003 (registro de mensajeros)

| Caso | Qué comprueba |
| --- | --- |
| TC-HU003-01 Registrar un mensajero | Se crea con el formulario completo; la cuenta queda `ACTIVE` con rol `MENSAJERO` y se encuentra en "Actualizar mensajero". |
| TC-HU003-02 Correo con la contrasena temporal y acceso | Llega el correo de bienvenida con la contraseña temporal y con ella se inicia sesión. |
| TC-HU003-03 Campos obligatorios vacios | El formulario vacío marca los campos obligatorios. |
| TC-HU003-04 La capacidad de carga es positiva | La API rechaza capacidad 0 y negativa (400) y acepta una positiva. |
| TC-HU003-05 Cedula, correo y telefono unicos | Correo repetido marcado en pantalla; cédula, teléfono y correo repetidos responden 409. |
| TC-HU003-06 Formato del documento | Cédula de 8 dígitos o con letras responde 400; la de 9 dígitos se acepta. |
| TC-HU003-07 Solo el Super Usuario puede registrar | Ventas y Mensajero: sin opción, ruta bloqueada y API 403. |

### HU-004 (edición de mensajeros)

| Caso | Qué comprueba |
| --- | --- |
| TC-HU004-01 Buscar un mensajero por documento y abrir su formulario | Se busca por documento y el formulario trae nombre, correo y teléfono. |
| TC-HU004-02 Editar el telefono de un mensajero | Cambiar el teléfono muestra el aviso de éxito y queda guardado. |
| TC-HU004-03 Editar el horario y la capacidad de carga | Cambiar horario (9:00 am a 12:00 pm) y capacidad (22 kg) con las ruedas. |
| TC-HU004-04 La capacidad de carga es positiva | La API rechaza capacidad 0 y negativa al editar (400). |
| TC-HU004-05 Historial de modificaciones | El historial muestra "Campos modificados: Teléfono". |
| TC-HU004-06 No se puede usar un correo ya registrado | Un correo de otro usuario muestra "El correo ya está registrado". |
| TC-HU004-07 Cambiar el estado de acceso cierra la sesion | Pasar a Inactivo avisa que la sesión se cerrará; tras guardar el token falla (401) y el login da 403. |
| TC-HU004-08 Rol sin permiso | Ventas y Mensajero: API 403 y la ruta devuelve a Ventas. |

### HU-005 (desactivación de mensajeros)

| Caso | Qué comprueba |
| --- | --- |
| TC-HU005-01 Desactivar un mensajero con confirmacion | Desactivar con confirmación: aviso, fila "Inactivo", estado `INACTIVE` y login 403. |
| TC-HU005-02 Cancelar en el dialogo de confirmacion | "Cancelar" no desactiva. |
| TC-HU005-03 Documento de un mensajero que no existe | Un documento inexistente avisa "No se encontró ningún mensajero con ese documento." |
| TC-HU005-04 El registro del mensajero se conserva | El mensajero desactivado sigue en el sistema, como Inactivo. |
| TC-HU005-05 Registro de auditoria de la desactivacion | Queda un registro `DESACTIVAR_MENSAJERO` con fecha y responsable. |
| TC-HU005-06 Rol sin permiso | Ventas y Mensajero: API 403, la cuenta sigue Activa y la ruta se bloquea. |

### HU-006 (creación de administradores)

| Caso | Qué comprueba |
| --- | --- |
| TC-HU006-01 Crear un administrador | Se crea con el formulario completo; la cuenta queda `ACTIVE` con rol `ADMIN_VENTAS`. |
| TC-HU006-02 Correo con la contrasena temporal y acceso | Llega el correo con la contraseña temporal y con ella se inicia sesión. |
| TC-HU006-03 Ningun campo puede estar vacio | El formulario vacío marca los cuatro campos obligatorios. |
| TC-HU006-04 Formato del documento segun su tipo | Una cédula de 8 dígitos se marca en pantalla y la API responde 400. |
| TC-HU006-05 Correo y documento no se repiten | Correo repetido marcado en pantalla; documento repetido responde 409. |
| TC-HU006-06 Registro de auditoria de la creacion | Queda un registro `CREAR_ADMINISTRADOR` con fecha, responsable y documento. |
| TC-HU006-07 Solo el Super Usuario puede crear administradores | Ventas y Mensajero: API 403 y la ruta bloquea a Ventas. |

### HU-008 (eliminación de administradores)

| Caso | Qué comprueba |
| --- | --- |
| TC-HU008-01 Eliminar un administrador con confirmacion | Eliminar con confirmación: aviso, la cuenta desaparece y no puede iniciar sesión. |
| TC-HU008-02 Cancelar en el dialogo de confirmacion | "Cancelar" no elimina. |
| TC-HU008-03 Administrador no existente | Un documento inexistente avisa "No se encontró ningún administrador con ese documento." |
| TC-HU008-04 Administrador con una sesion abierta | Con una sesión abierta el diálogo lo avisa; tras eliminar el token falla (401). |
| TC-HU008-05 Registro de auditoria de la eliminacion | Queda un registro `ELIMINAR_ADMINISTRADOR` con fecha, responsable y documento. |
| TC-HU008-06 Rol sin permiso | Ventas y Mensajero: API 403, la cuenta sigue y la ruta bloquea a Ventas. |

### HU-009 (roles y permisos)

| Caso | Qué comprueba |
| --- | --- |
| TC-HU009-01 Ver los permisos del Administrador de Ventas | La matriz del Administrador de Ventas muestra sus permisos de fábrica. |
| TC-HU009-02 Quitar un permiso y aplicar los cambios | Quitar "Importar paquetes" y aplicar: aviso y la API responde 403 al importar. |
| TC-HU009-03 Restablecer los permisos predeterminados | "Restablecer predeterminados" devuelve el permiso y la API ya no responde 403. |
| TC-HU009-04 Permisos que no se pueden editar | Los permisos "no editables" tienen la casilla bloqueada. |
| TC-HU009-05 Descartar los cambios sin guardar | Descartar pide "Salir sin guardar" y no guarda nada. |
| TC-HU009-06 Permisos del rol Mensajero | El rol Mensajero tiene su propia matriz de tres permisos. |
| TC-HU009-07 Usuario no existente | Un documento inexistente avisa "Usuario no existente". |
| TC-HU009-08 Solo el Super Usuario administra permisos | Ventas y Mensajero: API 403 y la ruta bloquea a Ventas. |

### Notas

- **Escritos sin abrir Katalon Studio.** Se revisó la sintaxis de todo el Groovy con el compilador de Groovy y los selectores, las respuestas de la API y los mensajes se comprobaron contra el entorno de Docker con un navegador automatizado, pero los casos no se ejecutaron en Katalon: si al correrlos marca algún error, corrígelo ahí y avisa para dejarlo en el repositorio.
- **Mensajes que se comprueban.** Los textos de los avisos están copiados de la aplicación (por ejemplo "Mensajero desactivado correctamente."). Si cambian, hay que actualizar el caso.
- **Importar sin archivo.** Para saber si un rol tiene el permiso de importar, los casos de HU-009 llaman a la previsualización sin archivo: con permiso responde un error de formato (distinto de 403) y sin permiso responde 403.
- **Lo que no se prueba.** "No recibir nuevas asignaciones" y "reasignar paquetes" (HU-005) dependen del módulo de asignación, que aún no existe; el vencimiento real del enlace de recuperación (15 minutos) se simula adelantando la fecha en la base.

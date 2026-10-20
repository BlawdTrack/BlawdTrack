# Pruebas de extremo a extremo (base para Katalon)

Esta carpeta deja listo el terreno para las pruebas de Katalon: un entorno que se levanta y se reinicia con un
comando, cuentas conocidas, datos de prueba y selectores estables. **Aquí todavía no hay proyecto ni casos de
Katalon.**

## Requisitos
- Docker Desktop encendido.
- Windows PowerShell 5.1 (con el que se probaron los scripts).

## Uso
```powershell
cd <repo>\blawdtrack\katalon\scripts
.\up.ps1          # construye, levanta, espera al backend y carga cuentas y datos (la primera vez tarda varios minutos)
.\up.ps1 -Fresh   # igual, pero antes borra la base de pruebas
.\prepare-data.ps1  # solo recarga cuentas y paquetes de prueba con el entorno ya levantado
.\down.ps1        # apaga y borra la base de pruebas
```

El entorno usa puertos propios y convive con el de desarrollo:

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5174 |
| Backend | http://localhost:8081 |
| Correos (Mailpit: enlace de recuperación, contraseñas temporales) | http://localhost:8025 |
| MySQL | `localhost:3307` (usuario `root`, contraseña `e2e-root`) |

El `JWT_SECRET` se genera en cada `up.ps1` y no se guarda en ningún archivo.

## Cuentas
Están en `environment/test-accounts.json` y las crea `prepare-data.ps1` por la API:

| Rol | Correo | Contraseña |
|---|---|---|
| Súper Usuario (lo siembra el backend) | `superadmin@blawdgourmet.com` | `ultra_gorGon_1!` |
| Administrador de Ventas | `ventas.e2e@blawdgourmet.test` | `Katalon2026` |
| Mensajero | `mensajero.e2e@blawdgourmet.test` | `Katalon2026` |

## Datos de prueba
`environment/fixtures/e2e-packages.sql` se aplica solo a la base de este entorno (nunca lo carga la aplicación) y se
puede repetir: borra todo lo que empieza con `E2E-` y lo vuelve a crear. Existe porque en `develop` ningún flujo
asigna, despacha ni entrega paquetes, así que sin él no se podrían probar la línea de tiempo completa (HU-013), la
evidencia de entrega ni la eliminación según el estado (HU-012).

| Número de envío | Para qué sirve |
|---|---|
| `E2E-PEND-01`, `E2E-ASIG-01`, `E2E-ENV-01`, `E2E-TRANS-01`, `E2E-ENTR-01`, `E2E-NOENT-01` | Un paquete por estado. `E2E-ENTR-01` trae foto, firma e historial completo. |
| `E2E-DEL-P1..P3`, `E2E-DEL-A1..A2` | Pendientes y asignados para eliminar sin perder los demás. |
| `E2E-BULK-001..120` | Más de 100 paquetes para "Cargar más" (HU-014). |

`environment/import-files/` trae tres CSV de Zoho para la importación (HU-010 y HU-011): uno válido (con horarios
variados), uno con campos obligatorios vacíos y uno con duplicados (ya registrado, repetido con datos distintos y
repetido con los mismos datos). Los paquetes que importan empiezan con `E2E-`, así que el siguiente `prepare-data.ps1`
los borra.

## Selectores
Los campos de texto ya tienen `id` o `aria-label`. Para botones, contadores, filas y diálogos se añadió `data-testid`:

| Zona | `data-testid` |
|---|---|
| Inicio de sesión | `login-submit`, `login-forgot-password` |
| Navegación | `nav-<ruta>` (por ejemplo `nav-/main-menu/paquetes/buscar`), `main-menu-link`, `logout-button` |
| Formularios | `form-submit`, `form-discard`, `edit-save`, `edit-discard`, `confirm-dialog-confirm`, `confirm-dialog-cancel`, `leave-dialog-leave`, `leave-dialog-stay`, `document-search-submit`, `document-search-clear` |
| Importación | `import-select-file`, `import-file-input`, `import-review`, `import-cancel`, `import-count-{read,valid,invalid,duplicate}`, `import-filter-{all,valid,invalid,duplicate}`, `import-row-{valid,invalid,duplicate}`, `import-confirm`, `import-load-another`, `import-result-{read,registered,invalid,duplicate}`, `import-result-another` |
| Búsqueda de paquetes | `package-search-input`, `package-search-clear`, `package-search-summary`, `package-search-empty-clear`, `package-result-row`, `package-load-more`, `package-load-more-count` |
| Ficha del paquete | `package-detail-card`, `package-courier-name`, `package-history-list`, `package-history-entry`, `delete-package-button`, `delete-package-cancel`, `delete-package-confirm` |

`src/components/e2eSelectors.test.jsx` fija los principales para que un refactor no los quite sin avisar.

# HU007 · Inventario y ejecución de pruebas

## Alcance e inventario

Esta entrega incorpora las fuentes de las pruebas funcionales al proyecto Katalon existente. Las pruebas de backend y frontend ya estaban versionadas en `develop`; no se duplican ni se modifican. HU011 conserva sus archivos y configuración.

| Tipo | Archivos | Estado |
| --- | --- | --- |
| Backend: 35 pruebas unitarias | `AdminAuditHistoryAdapterTest` (2), `AdminQueryServiceTest` (6), `AdminSessionPolicyTest` (3), `AdminUpdateServiceTest` (5), `DocumentNormalizerTest` (4), `DocumentValidatorTest` (15) | Ya versionadas; 35 aprobadas al repetir la ejecución el 26/10/2026 con Java 21 y Maven Surefire. |
| Frontend: 74 pruebas | `src/pages/EditAdmin.test.jsx`, `src/services/AdminService.test.js`, `src/utils/adminEdit.test.js`, `src/utils/adminErrors.test.js`, `src/utils/adminAudit.test.js` | Ya versionadas; 74 aprobadas en 5 archivos al repetir la ejecución el 26/10/2026 con Vitest. |
| Funcionales: 9 casos | `katalon/project/Test Cases/HU-007/`, `Scripts/HU-007/`, `Object Repository/HU007/` y `Test Suites/TS-HU007-Pruebas-Funcionales.*` | Fuentes incorporadas. El reporte original del 22/10/2026 registra 9 aprobados. La ejecución posterior a esta integración queda pendiente. |
| Usabilidad | Inspección de 52 criterios por pantalla: listado de administradores y modal de eliminación | Informe `HU007_Task335_Informe_Usabilidad_Final_Revisado.docx`, destinado a Drive y Azure DevOps por indicación del responsable. No se copia a Git ni se cambia su clasificación. El modal de eliminación se relaciona también con HU008. |

Las clases de backend están bajo `backend/src/test/java/com/blawdgourmet/blawdtrack/`, en `audit/`, `users/service/` y `users/validation/`. También existen `users/AdminLookupIntegrationTest.java` y `users/AdminUpdateIntegrationTest.java`; no forman parte del conteo de las 35 unitarias.

Los documentos históricos de Tasks 91 y 92 conservan los nombres y resultados de aquella implementación. La clase `AdminServiceImplTest` que citan ya no existe en el árbol actual; este inventario utiliza las clases vigentes.

## Repetir backend y frontend

Desde `blawdtrack/backend`, con JDK 21 configurado en `JAVA_HOME`:

```powershell
.\mvnw.cmd test "-Dtest=AdminAuditHistoryAdapterTest,AdminQueryServiceTest,AdminSessionPolicyTest,AdminUpdateServiceTest,DocumentNormalizerTest,DocumentValidatorTest"
```

La verificación local utilizó Maven 3.9.16 instalado por el wrapper directamente: el lanzador `mvnw.cmd` falló antes de iniciar Maven en este entorno. No se modificó el wrapper. La primera ejecución directa tomó Java 8 y falló antes de ejecutar pruebas; al seleccionar JDK 21 se obtuvo `BUILD SUCCESS`, sin fallos, errores ni omisiones.

Desde `blawdtrack/frontend`:

```powershell
npm.cmd test -- src/pages/EditAdmin.test.jsx src/services/AdminService.test.js src/utils/adminEdit.test.js src/utils/adminErrors.test.js src/utils/adminAudit.test.js
```

## Suite funcional de Katalon

Abrir **el proyecto existente** `katalon/project/BlawdTrack.prj` en Katalon Studio. Seleccionar `Test Suites/TS-HU007-Pruebas-Funcionales` y ejecutar en Chrome. El reporte original utilizó Katalon Studio 11.6.0.

| Orden | Caso | Verificación |
| --- | --- | --- |
| 01 | Actualizar-Nombre-Completo | Guarda el nombre y verifica persistencia. |
| 02 | Actualizar-Correo-Valido | Cambia el correo y conserva los demás campos. |
| 03 | Cambiar-Contrasena | Rechaza la contraseña anterior y acepta la nueva. |
| 04 | Desactivar-Administrador-Sesion-Activa | Revoca la sesión y restaura el estado activo. |
| 05 | Actualizar-Administrador-Inexistente | Rechaza la actualización de un documento inexistente. |
| 06 | Actualizar-Correo-Invalido | Rechaza el correo inválido y conserva los datos. |
| 07 | Actualizar-Nombre-Vacio | Rechaza el nombre vacío y conserva los datos. |
| 08 | Administrador-Sin-Autorizacion | Devuelve 403 al intentar actualizar con un administrador de ventas. |
| 09 | Verificar-Historial-Auditoria | Comprueba el registro persistente, el actor y la restauración del nombre. |

### Entorno y datos previos

La suite original apunta al frontend `http://localhost:5173/` y backend `http://localhost:8080`. Se añadieron dos variables opcionales, `BLAWDTRACK_APP_URL` y `BLAWDTRACK_API_URL`, para cambiar las direcciones sin editar scripts. No utiliza las credenciales del perfil global de HU011.

Configurar estas variables en el proceso que inicia Katalon, sin guardar sus valores en Git:

| Variable obligatoria | Valor que representa |
| --- | --- |
| `BLAWDTRACK_SUPER_USER_EMAIL` | Correo de la cuenta de Súper Usuario del entorno de prueba. |
| `BLAWDTRACK_SUPER_USER_PASSWORD` | Contraseña de esa cuenta. |
| `BLAWDTRACK_SUPER_USER_NAME` | Nombre exacto del actor esperado en la auditoría (TC09). |
| `BLAWDTRACK_ADMIN_ORIGINAL_PASSWORD` | Contraseña inicial del administrador de prueba. |
| `BLAWDTRACK_ADMIN_NEW_PASSWORD` | Contraseña diferente y válida que asigna TC03. |

Antes de cada ejecución completa, preparar un administrador de ventas **de prueba** activo con cédula `1-2345-6789` (normalizada `123456789`), correo `carlos.katalon@example.com` y la contraseña original indicada en el entorno. El nombre esperado tras TC01 es `Carlos Alejandro Prueba Katalon`. TC02 deja el correo `carlos.actualizado.katalon@example.com`; TC03 deja la contraseña nueva. Los casos posteriores dependen de ese estado, por lo que se debe conservar el orden de la suite y ejecutarla secuencialmente.

La suite modifica nombre, correo y contraseña del administrador de prueba y genera auditoría. TC04 restaura el estado activo y TC09 restaura el nombre capturado al iniciar ese caso. No hay una restauración global: antes de repetir la suite se deben restablecer el correo y la contraseña iniciales. Para ejecutar un caso aislado, preparar el estado correspondiente a su posición en la suite.

El entorno Docker compartido usa puertos 5174/8081; se pueden seleccionar mediante las variables opcionales. `prepare-data.ps1` prepara otras cuentas, **no crea este administrador ni restablece su estado inicial**. Cambiar los puertos no sustituye esa preparación.

### Qué se conservó y qué se excluyó

- Se conservaron los nueve casos enlazados en la suite, sus nueve scripts, dieciséis objetos referenciados y los GUID de casos/suite.
- Se actualizaron las rutas de la suite a `Test Cases/HU-007/` y las direcciones admiten variables de entorno. Las aserciones de los casos se conservaron.
- Se retiraron de los `.tc` metadatos de usuarios de TestOps y se dejó el archivo de hooks sin los ejemplos deshabilitados del generador.
- No se copió `TC-HU007-03-Verificar-Nueva-Contrasena`: no participa en la suite original de nueve casos; TC03 ya verifica el acceso con la nueva contraseña.
- No se copió otro `.prj`, perfiles, configuración local, `Libs/`, `bin/`, `Reports/`, capturas ni archivos de construcción del proyecto externo.
- No se incorporaron salidas de Surefire/Vitest ni el PDF de Katalon. El archivo local preexistente `frontend/HU007-Vitest-Output.txt` se conserva sin modificar y debe quedar fuera del commit.

### Validación de la integración

El 26/10/2026 se verificaron los nueve enlaces activos y únicos de la suite, los nueve XML de casos y su correspondencia con los scripts, y los dieciséis XML de objetos referenciados, sin referencias faltantes ni objetos sobrantes. Se compararon los scripts con los originales: únicamente cambió la parametrización de las URLs. No se detectaron asignaciones literales de contraseñas o tokens en los scripts incorporados. Ningún archivo existente de HU011 cambió y `git diff --check` pasó. Esta revisión estructural no sustituye la compilación y ejecución en Katalon Studio.

## Revisión del PR

Destino: `develop`. Rama de preparación: `feature/hu007/pruebas`.

Título sugerido: **HU007: incorporar pruebas funcionales de actualización de administradores**.

Incluir las fuentes Katalon de HU007, este inventario y los enlaces de documentación. Explicar que las 35 unitarias y 74 pruebas de frontend ya estaban incluidas y volvieron a pasar. Diferenciar el resultado histórico de Katalon (9 aprobados el 22/10/2026) de la validación estructural de esta integración; no declarar una nueva ejecución funcional hasta completarla con los datos y variables anteriores.

Vincular el informe de usabilidad desde Drive/Azure DevOps en la descripción del PR cuando esté disponible. No adjuntar reportes generados ni credenciales, ni volver a incluir fuentes de otras historias. Usar el ID real de la tarea de Azure DevOps al redactar el commit según la guía del equipo.

# HU007 · Tasks 93, 94 y 95 (T03, T04 y T05) · Pruebas y evidencias

Tasks (Frontend), hechas juntas en una sola pantalla porque son partes del mismo flujo:

- **T03 (93) · Crear la interfaz de búsqueda y formulario de actualización de administrador.**
- **T04 (94) · Integrar el formulario de actualización con la API REST**, restringido al Súper Usuario.
- **T05 (95) · Desarrollar componentes de notificación y manejo de errores para la actualización.**

Pantalla **Actualizar administrador** (`/main-menu/admins/update`), en el menú *Gestión de usuarios → Administradores*. Sigue
el diseño y el comportamiento de **Actualizar mensajero** (HU-004): en una sola vista, la lista con búsqueda a la izquierda
y el formulario del elegido a la derecha. Se apoya en el backend de las [Task 91](HU007-Task91-pruebas.md) y
[Task 92](HU007-Task92-pruebas.md).

## Qué hace la pantalla

- **Lista y búsqueda (T03):** los administradores de ventas con su correo, documento y estado (Activo / Inactivo), y la
  búsqueda por **tipo y número de documento** ("Buscar" / "Limpiar"). Si el documento no coincide con nadie dice
  "Administrador no encontrado".
- **Formulario prellenado (T03):** al pulsar **Editar**, la pantalla consulta el perfil actual al backend
  (`GET /api/v1/admins/{tipo}/{número}`, que además confirma que existe) y muestra nombre completo, correo, nueva
  contraseña (opcional, vacía) y el interruptor de **Estado de acceso**. El documento se ve pero no se edita.
- **Guardado (T04):** una sola llamada `PATCH /api/v1/admins/{tipo}/{número}` con **solo los campos que cambiaron**. El
  botón se bloquea mientras guarda. Al terminar, la lista refleja el cambio y la pantalla vuelve a "Elige un administrador".
- **Solo Súper Usuario (T04):** la ruta está protegida con `ProtectedRoute` (solo `SUPER_USER`) y el backend responde 403 a
  cualquier otro rol; el Administrador de Ventas y el Mensajero no ven la opción ni entran por URL.
- **Validación en el navegador:** nombre requerido (máx. 120), correo con forma válida, contraseña de al menos 8
  caracteres que combine letras y números.
- **Cambios sin guardar:** si hay cambios, al volver o al elegir a otro administrador pide confirmar.

## Avisos y errores (T05)

| Situación | Aviso |
| --- | --- |
| Guardado correcto | "Actualización exitosa. Los datos del administrador han sido modificados." Si cambió el estado o la contraseña, agrega "Su sesión activa se cerró." |
| Cambia el interruptor de estado | Advertencia: "la sesión activa del administrador se cerrará de inmediato al guardar". |
| Guardar sin cambios | Advertencia: "No se detectaron cambios en la información del administrador." |
| Formulario con errores | Mensaje en cada campo y aviso "Por favor corrija los errores…"; no se llama a la API. |
| El administrador no existe (404), al elegirlo o al guardar | Advertencia "Administrador no existente. Puede que ya se haya eliminado: la lista se actualizó." y la lista se vuelve a cargar. |
| Correo ya usado (409 `DUPLICATE_EMAIL`) | "Este correo electrónico ya está registrado." en el campo correo. |
| 400 | Mensaje en los campos que el backend marca, o "Revisa los datos ingresados…". |
| 401 / 403 | "Tu sesión expiró…" / "No tienes permisos para modificar administradores. Solo el Súper Usuario puede hacerlo." |
| 5xx / sin conexión | "Ocurrió un error inesperado en el servidor…" / "No pudimos conectar con el servidor…". |
| La lista no carga | Alerta con el botón **Reintentar**. |

## Historial

La auditoría de administradores (pantalla *Eliminar administrador → Ver auditoría*) ahora muestra también las
modificaciones: etiquetas **Actualización**, **Activación**, **Desactivación** y **Contraseña**. Para que se entienda a
quién se refiere cada una (esa bitácora es general), el backend redacta el detalle como frase, por ejemplo: *"El Super
Usuario 'Alicia' modificó los datos (nombre, correo) del Administrador de Ventas 'Ana' (CEDULA 2-0345-0987)."* Las de
estado y contraseña agregan "Su sesión activa se cerró de inmediato." La contraseña nunca se registra.

## Cómo está hecho

Mismas piezas que Actualizar mensajero:

| Pieza | Equivale a |
| --- | --- |
| `pages/EditAdmin.jsx` | `EditMessenger.jsx` (solo coordina) |
| `hooks/useAdminEditor.js` | `useCourierEditor.js` (una llamada en lugar de tres) |
| `components/AdminEditListPanel.jsx` | `CourierFleetPanel.jsx` |
| `components/AdminDetailPanel.jsx`, `AdminEditForm.jsx` | `CourierDetailPanel.jsx`, `CourierEditForm.jsx` |
| `utils/adminEdit.js` | `courierEdit.js` (formulario, cambios, validación) |
| `utils/adminErrors.js` → `normalizeAdminUpdateError` | `courierErrors.js` |
| `services/AdminService.js` → `getAdministrator`, `updateAdministrator` | `CourierService.js` |

Se reutilizaron `SearchableListPanel`, `AccountRow` (con un nuevo `actionTone` para el botón verde "Editar"),
`useDocumentSearch`, `useAdmins` (con `patch`), `SplitScreen`, `Toast`, `UnsavedChangesGuard` y `ConfirmLeaveDialog`.

## Resultado de las pruebas automáticas

Verificado el 14 de octubre de 2026 con Node 22 y Vitest, desde `blawdtrack/frontend`:

- Pruebas de estas tasks: **69 aprobadas** en 5 archivos (más las de navegación y rutas actualizadas).
- Suite completa del frontend: **760 pruebas aprobadas en 59 archivos**, sin fallos.
- `npm run build` compila. `eslint` no reporta errores en los archivos de estas tasks (el de `PasswordRecoveryTestPage.jsx`
  ya existe en `develop`).
- Estas pruebas simulan el servicio: no necesitan el backend ni la base de datos.
- Backend (cambio del detalle de la bitácora): `AdminUpdateIntegrationTest` y `AdminServiceImplTest` siguen en verde;
  las clases de administradores, auditoría y mensajeros suman **92 pruebas aprobadas**.

| Prueba | Qué demuestra |
| --- | --- |
| `pages/EditAdmin.test.jsx` (20) | T03: lista con estados, búsqueda por documento y "no encontrado", formulario prellenado, Descartar. T04: guarda solo lo que cambió, envía correo/contraseña/estado, bloquea el botón al guardar, valida en el navegador. T05: aviso de éxito (con la sesión cerrada), advertencia del estado, sin cambios, 404 al elegir y al guardar con recarga de la lista, correo repetido en su campo, 403/500/sin conexión, reintentar la lista. |
| `utils/adminEdit.test.js` (16) | Lectura del administrador, valores iniciales, qué cambió y si cierra la sesión, validación. |
| `services/AdminService.test.js` (4) | `GET` y `PATCH` a la ruta correcta con el documento codificado; el error se propaga. |
| `utils/adminErrors.test.js` (21, 8 nuevas) | Mensajes de cada error del `PATCH`: 404, 409 en el campo correo, 400, 401, 403, 5xx, sin red. |
| `utils/adminAudit.test.js` (8, 4 nuevas) | Etiquetas de las modificaciones en la auditoría. |
| `config/navigation.test.js`, `App.routes.test.jsx`, `pages/ModuleMenuPage.test.jsx` | La opción "Actualizar administrador" y su ruta, solo para el Súper Usuario. |

## Cómo correr las pruebas

Desde `blawdtrack/frontend` (el prompt debe terminar en `...\blawdtrack\frontend>`), en PowerShell:

```powershell
# Solo las de estas tasks
npx vitest run src/pages/EditAdmin.test.jsx src/utils/adminEdit.test.js src/services/AdminService.test.js src/utils/adminErrors.test.js src/utils/adminAudit.test.js

# Los casos de la pantalla, legibles uno por uno
npx vitest run src/pages/EditAdmin.test.jsx --reporter=verbose

# Toda la suite
npm test
```

## Cómo ver la pantalla en el navegador

1. Inicia el backend (con esta rama o `develop` más las Tasks 91 y 92) y el frontend (`npm run dev -- --host`).
2. Entra con el Súper Usuario → *Gestión de usuarios → Administradores → Actualizar administrador*.
3. Busca un administrador, pulsa **Editar**, cambia el nombre y guarda: aparece el aviso verde. Cambia el estado: aparece
   la advertencia de la sesión. Para ver el aviso de "no existente", elimina al administrador desde otra pestaña y pulsa
   **Editar** en la lista que ya estaba abierta.

## Capturas más importantes

| Evidencia | Qué demuestra y qué capturar |
| --- | --- |
| E1 | Consola de las pruebas de estas tasks en verde (5 archivos, 69 pruebas). |
| E2 | Consola de la suite completa: `Test Files  59 passed (59)` y `Tests  760 passed (760)`. |
| E3 | Consola de `EditAdmin.test.jsx --reporter=verbose`: se leen los casos de búsqueda, guardado y avisos. |
| E4 | La pantalla en el navegador con un administrador elegido: formulario prellenado y estado de acceso. |
| E5 | El aviso de éxito tras guardar, y la advertencia al cambiar el estado. |

**Si tienes que priorizar:** E3 y E4. Oculta correos y tokens en las capturas.

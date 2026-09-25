# Frontend role-access configuration

The existing API only supports replacing a role's complete permission set:
`PUT /api/v1/roles/{roleId}/permissions` with `{ "permissionIds": [number] }`.
It does not expose a read endpoint for role IDs, permission IDs, or the current
permission set. The frontend therefore keeps saving disabled until those
values are supplied from the system database.

Set these Vite environment variables when building the frontend:

| Variable | Value |
| --- | --- |
| `VITE_ACCESS_ROLE_ADMIN_VENTAS_ID` | Database ID for `ADMIN_VENTAS` |
| `VITE_ACCESS_ROLE_MENSAJERO_ID` | Database ID for `MENSAJERO` |
| `VITE_ACCESS_ROLE_ADMIN_VENTAS_PERMISSIONS` | Comma-separated current permission codes for `ADMIN_VENTAS` |
| `VITE_ACCESS_ROLE_MENSAJERO_PERMISSIONS` | Comma-separated current permission codes for `MENSAJERO` |
| `VITE_ACCESS_PERMISSION_<CODE>_ID` | Database ID for each permission code below |

The permission variables are required for:

- `PAQUETE_IMPORTAR`
- `PAQUETE_ELIMINAR`
- `PAQUETE_CONSULTAR`
- `PAQUETE_BUSCAR`
- `PAQUETE_EXPORTAR`
- `PAQUETE_GENERAR_QR`
- `PAQUETE_ASIGNAR`
- `PAQUETE_CONSULTAR_ASIGNADOS`
- `PAQUETE_ACTUALIZAR_ESTADO`
- `COSTO_VIAJE_REGISTRAR`
- `REPORTE_CONSULTAR`
- `REPORTE_IMPRIMIR`
- `COMPROBANTE_CONSULTAR`
- `COSTO_CONSULTAR`

Permission-code lists must match the role's current rows in `roles_permisos`.
The IDs are configuration values, not secrets. Do not put database credentials
or connection strings in frontend environment variables.

The backend only accepts the operational permissions defined for each role and
then replaces the role's entire permission set. Any other permission currently
attached to that role will be removed by a successful update; review the current
database assignments before enabling this feature.

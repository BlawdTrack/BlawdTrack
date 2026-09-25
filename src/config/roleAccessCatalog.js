const permissionDefinitions = [
  { code: 'PAQUETE_IMPORTAR', description: 'Importar paquetes', group: 'packages' },
  { code: 'PAQUETE_ELIMINAR', description: 'Eliminar paquetes', group: 'packages' },
  { code: 'PAQUETE_CONSULTAR', description: 'Consultar paquetes', group: 'packages' },
  { code: 'PAQUETE_BUSCAR', description: 'Buscar paquetes', group: 'packages' },
  { code: 'PAQUETE_EXPORTAR', description: 'Exportar paquetes', group: 'packages' },
  { code: 'PAQUETE_GENERAR_QR', description: 'Generar QR de paquetes', group: 'packages' },
  { code: 'PAQUETE_ASIGNAR', description: 'Asignar paquetes', group: 'packages' },
  { code: 'PAQUETE_CONSULTAR_ASIGNADOS', description: 'Consultar paquetes asignados', group: 'packages' },
  { code: 'PAQUETE_ACTUALIZAR_ESTADO', description: 'Actualizar estado de paquetes', group: 'packages' },
  { code: 'COSTO_VIAJE_REGISTRAR', description: 'Registrar costo de viaje', group: 'costs' },
  { code: 'REPORTE_CONSULTAR', description: 'Consultar reportes', group: 'reports' },
  { code: 'REPORTE_IMPRIMIR', description: 'Imprimir reportes', group: 'reports' },
  { code: 'COMPROBANTE_CONSULTAR', description: 'Consultar comprobantes', group: 'proofs' },
  { code: 'COSTO_CONSULTAR', description: 'Consultar costos', group: 'costs' },
];

const parseId = (value) => {
  if (!value) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const getPermissionId = (code) => (
  parseId(import.meta.env[`VITE_ACCESS_PERMISSION_${code}_ID`])
);

const parsePermissionCodes = (value) => (
  new Set((value ?? '').split(',').map((code) => code.trim()).filter(Boolean))
);

const makeRole = (code, name, roleIdValue, permissionsValue, defaultCodes) => {
  const currentCodes = permissionsValue === undefined
    ? null
    : parsePermissionCodes(permissionsValue);

  return {
    code,
    name,
    id: parseId(roleIdValue),
    currentPermissionsConfigured: currentCodes !== null,
    permissions: permissionDefinitions
      .filter((permission) => (
        code === 'ADMIN_VENTAS'
          ? [
            'PAQUETE_IMPORTAR',
            'PAQUETE_ELIMINAR',
            'PAQUETE_CONSULTAR',
            'PAQUETE_BUSCAR',
            'PAQUETE_EXPORTAR',
            'PAQUETE_GENERAR_QR',
            'PAQUETE_ASIGNAR',
            'REPORTE_CONSULTAR',
            'REPORTE_IMPRIMIR',
            'COMPROBANTE_CONSULTAR',
            'COSTO_CONSULTAR',
          ].includes(permission.code)
          : [
            'PAQUETE_CONSULTAR_ASIGNADOS',
            'PAQUETE_ACTUALIZAR_ESTADO',
            'COSTO_VIAJE_REGISTRAR',
          ].includes(permission.code)
      ))
      .map((permission) => ({
        ...permission,
        id: getPermissionId(permission.code),
        defaultGranted: currentCodes
          ? currentCodes.has(permission.code)
          : defaultCodes.includes(permission.code),
      })),
  };
};

export const ROLE_ACCESS_CATALOG = [
  makeRole(
    'ADMIN_VENTAS',
    'Administrador de Ventas',
    import.meta.env.VITE_ACCESS_ROLE_ADMIN_VENTAS_ID,
    import.meta.env.VITE_ACCESS_ROLE_ADMIN_VENTAS_PERMISSIONS,
    [
      'PAQUETE_IMPORTAR',
      'PAQUETE_ELIMINAR',
      'PAQUETE_CONSULTAR',
      'PAQUETE_BUSCAR',
      'PAQUETE_EXPORTAR',
      'PAQUETE_GENERAR_QR',
      'PAQUETE_ASIGNAR',
      'REPORTE_CONSULTAR',
      'REPORTE_IMPRIMIR',
      'COMPROBANTE_CONSULTAR',
      'COSTO_CONSULTAR',
    ]
  ),
  makeRole(
    'MENSAJERO',
    'Mensajero',
    import.meta.env.VITE_ACCESS_ROLE_MENSAJERO_ID,
    import.meta.env.VITE_ACCESS_ROLE_MENSAJERO_PERMISSIONS,
    [
      'PAQUETE_CONSULTAR_ASIGNADOS',
      'PAQUETE_ACTUALIZAR_ESTADO',
      'COSTO_VIAJE_REGISTRAR',
    ]
  ),
];

export const PERMISSION_GROUPS = [
  { id: 'packages', title: 'Gestión de paquetes' },
  { id: 'reports', title: 'Reportes' },
  { id: 'proofs', title: 'Comprobantes' },
  { id: 'costs', title: 'Costos' },
];

export const hasRoleAccessConfiguration = (role) => (
  Boolean(role?.id)
  && role.currentPermissionsConfigured
  && role.permissions.every((permission) => Boolean(permission.id))
);

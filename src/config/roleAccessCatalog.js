const operationalPermissions = [
  { code: 'PAQUETE_IMPORTAR', description: 'Importar paquetes' },
  { code: 'PAQUETE_ELIMINAR', description: 'Eliminar paquetes' },
  { code: 'PAQUETE_CONSULTAR', description: 'Consultar paquetes' },
  { code: 'PAQUETE_BUSCAR', description: 'Buscar paquetes' },
  { code: 'PAQUETE_EXPORTAR', description: 'Exportar paquetes' },
  { code: 'PAQUETE_GENERAR_QR', description: 'Generar QR de paquetes' },
  { code: 'PAQUETE_ASIGNAR', description: 'Asignar paquetes' },
  { code: 'REPORTE_CONSULTAR', description: 'Consultar reportes' },
  { code: 'REPORTE_IMPRIMIR', description: 'Imprimir reportes' },
  { code: 'COMPROBANTE_CONSULTAR', description: 'Consultar comprobantes' },
  { code: 'COSTO_CONSULTAR', description: 'Consultar costos' },
  { code: 'PAQUETE_CONSULTAR_ASIGNADOS', description: 'Consultar paquetes asignados' },
  { code: 'PAQUETE_ACTUALIZAR_ESTADO', description: 'Actualizar estado de paquetes' },
  { code: 'COSTO_VIAJE_REGISTRAR', description: 'Registrar costos del viaje' },
];

const visualOnlySalesPermissions = [
  { code: 'IMPORTACION_VALIDAR', description: 'Validar la importación de paquetes' },
  { code: 'PAQUETE_DUPLICADOS_CONSULTAR', description: 'Consultar paquetes duplicados' },
  { code: 'PAQUETE_CONSULTAR_POR_MENSAJERO', description: 'Consultar paquetes por mensajero' },
  { code: 'PAQUETE_CONSULTAR_POR_ESTADO', description: 'Consultar paquetes por estado' },
  { code: 'NOTIFICACION_GESTIONAR', description: 'Gestionar notificaciones' },
];

const makeOperationalPermissions = (codes, defaults, configuredCodes) => {
  const configured = configuredCodes === undefined
    ? null
    : new Set(configuredCodes.split(',').map((code) => code.trim()).filter(Boolean));

  return codes.map((code) => {
    const definition = operationalPermissions.find((permission) => permission.code === code);
    if (!definition) {
      throw new Error(`No existe una definición para el permiso ${code}.`);
    }

    return {
      ...definition,
      id: parseId(import.meta.env[`VITE_ACCESS_PERMISSION_${code}_ID`]),
      editable: true,
      defaultGranted: configured
        ? configured.has(code)
        : defaults.includes(code),
    };
  });
};

const parseId = (value) => {
  if (!value) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const adminSalesCodes = [
  'PAQUETE_IMPORTAR',
  'IMPORTACION_VALIDAR',
  'PAQUETE_DUPLICADOS_CONSULTAR',
  'PAQUETE_ELIMINAR',
  'PAQUETE_CONSULTAR',
  'PAQUETE_BUSCAR',
  'PAQUETE_CONSULTAR_POR_MENSAJERO',
  'PAQUETE_CONSULTAR_POR_ESTADO',
  'PAQUETE_EXPORTAR',
  'PAQUETE_GENERAR_QR',
  'PAQUETE_ASIGNAR',
  'REPORTE_CONSULTAR',
  'REPORTE_IMPRIMIR',
  'COMPROBANTE_CONSULTAR',
  'COSTO_CONSULTAR',
  'NOTIFICACION_GESTIONAR',
];

const adminSalesEditableCodes = adminSalesCodes.filter((code) => (
  operationalPermissions.some((permission) => permission.code === code)
));

export const ROLE_ACCESS_CATALOG = [
  {
    code: 'SUPER_USUARIO',
    name: 'Super Usuario',
    editable: false,
    currentPermissionsConfigured: true,
    permissions: [
      'Gestionar usuarios',
      'Gestionar roles y permisos',
      'Consultar auditoría',
      'Administrar la configuración del sistema',
      'Acceso total al sistema',
    ].map((description, index) => ({
      code: `SUPER_USUARIO_${index + 1}`,
      description,
      editable: false,
      defaultGranted: true,
    })),
  },
  {
    code: 'ADMIN_VENTAS',
    name: 'Administrador de Ventas',
    id: parseId(import.meta.env.VITE_ACCESS_ROLE_ADMIN_VENTAS_ID),
    editable: true,
    currentPermissionsConfigured:
      import.meta.env.VITE_ACCESS_ROLE_ADMIN_VENTAS_PERMISSIONS !== undefined,
    permissions: [
      ...makeOperationalPermissions(
        adminSalesEditableCodes,
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
        ],
        import.meta.env.VITE_ACCESS_ROLE_ADMIN_VENTAS_PERMISSIONS
      ),
      ...visualOnlySalesPermissions.map((permission) => ({
        ...permission,
        editable: false,
        defaultGranted: true,
      })),
    ].sort((left, right) => adminSalesCodes.indexOf(left.code) - adminSalesCodes.indexOf(right.code)),
  },
  {
    code: 'MENSAJERO',
    name: 'Mensajero',
    id: parseId(import.meta.env.VITE_ACCESS_ROLE_MENSAJERO_ID),
    editable: true,
    currentPermissionsConfigured:
      import.meta.env.VITE_ACCESS_ROLE_MENSAJERO_PERMISSIONS !== undefined,
    permissions: makeOperationalPermissions(
      [
        'PAQUETE_CONSULTAR_ASIGNADOS',
        'PAQUETE_ACTUALIZAR_ESTADO',
        'COSTO_VIAJE_REGISTRAR',
      ],
      [
        'PAQUETE_CONSULTAR_ASIGNADOS',
        'PAQUETE_ACTUALIZAR_ESTADO',
        'COSTO_VIAJE_REGISTRAR',
      ],
      import.meta.env.VITE_ACCESS_ROLE_MENSAJERO_PERMISSIONS
    ).map((permission) => ({
      ...permission,
      description: {
        PAQUETE_CONSULTAR_ASIGNADOS: 'Consultar paquetes asignados',
        PAQUETE_ACTUALIZAR_ESTADO: 'Actualizar estado de paquetes',
        COSTO_VIAJE_REGISTRAR: 'Registrar costos del viaje',
      }[permission.code],
    })),
  },
];

export const getRoleAccessConfigurationErrors = (role) => {
  if (!role?.editable) return [];

  const missing = [];
  if (!role.id) missing.push('el ID del rol');
  if (!role.permissions.filter((permission) => permission.editable)
    .every((permission) => Boolean(permission.id))) {
    missing.push('los IDs de sus permisos editables');
  }
  if (!role.currentPermissionsConfigured) {
    missing.push('los permisos actuales del rol');
  }
  return missing;
};

export const hasRoleAccessConfiguration = (role) => (
  role?.editable && getRoleAccessConfigurationErrors(role).length === 0
);

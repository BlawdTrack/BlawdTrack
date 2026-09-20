// Usuarios de prueba compartidos entre authMock.js y
// passwordRecoveryMock.js. El valor de 'role' es el string real que
// devuelve el backend (RoleName.java: SUPER_USUARIO/ADMIN_VENTAS/MENSAJERO),
// no el nombre de la constante en inglés. El backend real (rama
// feature/HU001-LuisMadrigal) no devuelve 'permissions' en el login, así
// que se quitó de aquí también.

export const mockUsers = [
  {
    email: 'alicia@blawdgourmet.com',
    password: 'ChangeMe123',
    id: 1,
    fullName: 'Alicia (Super Usuario)',
    role: 'SUPER_USUARIO',
    status: 'ACTIVE',
  },
  {
    email: 'admin.ventas@blawdgourmet.com',
    password: 'Ventas123',
    id: 2,
    fullName: 'Administrador de Ventas (prueba)',
    role: 'ADMIN_VENTAS',
    status: 'ACTIVE',
  },
  {
    email: 'mensajero@blawdgourmet.com',
    password: 'Mensajero123',
    id: 3,
    fullName: 'Mensajero (prueba)',
    role: 'MENSAJERO',
    status: 'ACTIVE',
  },
  {
    email: 'inactivo@blawdgourmet.com',
    password: 'Inactivo123',
    id: 4,
    fullName: 'Cuenta inactiva (prueba)',
    role: 'MENSAJERO',
    status: 'INACTIVE',
  },
];

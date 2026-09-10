// Datos de prueba para simular POST /api/v1/auth/login mientras el backend
// de HU-001 no está desplegado. El contrato (request/response/error) está
// tomado de la rama feature/HU-001-login (AuthController, LoginResponse,
// ErrorResponse) para que el cambio a datos reales sea solo quitar el mock.
//
// TODO: eliminar este archivo cuando el endpoint real esté disponible.

const MOCK_DELAY_MS = 600;

const mockUsers = [
  {
    email: 'alicia@blawdgourmet.com',
    password: 'ChangeMe123',
    id: 1,
    fullName: 'Alicia (Super Usuario)',
    role: 'SUPER_USER',
    permissions: [
      'USER_CREATE', 'USER_UPDATE', 'USER_DEACTIVATE', 'USER_DELETE',
      'ROLE_ASSIGN', 'PACKAGE_IMPORT', 'PACKAGE_DELETE', 'PACKAGE_VIEW',
      'PACKAGE_SEARCH', 'PACKAGE_EXPORT', 'PACKAGE_GENERATE_QR',
      'PACKAGE_ASSIGN', 'PACKAGE_VIEW_ASSIGNED', 'PACKAGE_UPDATE_STATUS',
      'TRIP_COST_REGISTER', 'REPORT_VIEW', 'REPORT_PRINT',
      'PROOF_OF_DELIVERY_VIEW', 'COST_VIEW',
    ],
  },
  {
    email: 'admin.ventas@blawdgourmet.com',
    password: 'Ventas123',
    id: 2,
    fullName: 'Administrador de Ventas (prueba)',
    role: 'SALES_ADMIN',
    permissions: [
      'PACKAGE_IMPORT', 'PACKAGE_DELETE', 'PACKAGE_VIEW', 'PACKAGE_SEARCH',
      'PACKAGE_EXPORT', 'PACKAGE_GENERATE_QR', 'PACKAGE_ASSIGN',
      'REPORT_VIEW', 'REPORT_PRINT', 'PROOF_OF_DELIVERY_VIEW', 'COST_VIEW',
    ],
  },
  {
    email: 'mensajero@blawdgourmet.com',
    password: 'Mensajero123',
    id: 3,
    fullName: 'Mensajero (prueba)',
    role: 'COURIER',
    permissions: ['PACKAGE_VIEW_ASSIGNED', 'PACKAGE_UPDATE_STATUS', 'TRIP_COST_REGISTER'],
  },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockLogin(email, password) {
  await delay(MOCK_DELAY_MS);

  const user = mockUsers.find(
    (candidate) => candidate.email.toLowerCase() === String(email).toLowerCase()
  );

  if (!user || user.password !== password) {
    const error = new Error('Invalid email or password');
    // Misma forma que un error real de axios, para que el hook/página
    // no necesiten cambiar cuando se conecte el endpoint real.
    error.response = {
      status: 401,
      data: {
        code: 'AUTH_FAILED',
        message: 'Correo o contraseña incorrectos',
        status: 401,
      },
    };
    throw error;
  }

  return {
    token: `mock-jwt-token-${user.id}-${Date.now()}`,
    type: 'Bearer',
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };
}

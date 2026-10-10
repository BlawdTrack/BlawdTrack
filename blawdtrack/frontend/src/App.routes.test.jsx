import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { useAuth } from './hooks/useAuth';
import { ROLES } from './config/roles';
import { ROLE_HOME_ROUTES, getHomeRoute } from './utils/roleRoutes';
import { ROUTES } from './config/routes';

// Las pantallas se mockean: aquí solo importa qué pantalla queda visible según
// el rol (varias hacen peticiones al backend al montarse).
vi.mock('./pages/MainMenuPage', () => ({ default: () => <div>Pantalla menú principal</div> }));
vi.mock('./pages/ModuleMenuPage', () => ({ default: () => <div>Pantalla menú de módulo</div> }));
vi.mock('./pages/AdminManagement', () => ({ default: () => <div>Pantalla administradores</div> }));
vi.mock('./pages/AdminRegistrationPage', () => ({ default: () => <div>Pantalla registro de administrador</div> }));
vi.mock('./pages/CourierRegistrationPage', () => ({ default: () => <div>Pantalla registro de mensajero</div> }));
vi.mock('./pages/EditMessenger', () => ({ default: () => <div>Pantalla edición de mensajero</div> }));
vi.mock('./pages/RoleAccessManagement', () => ({ default: () => <div>Pantalla roles y permisos</div> }));
vi.mock('./pages/SalesHomePage',() => ({ default: () => <div>Pantalla ventas</div> }));
vi.mock('./pages/CourierHomePage', () => ({ default: () => <div>Pantalla mensajero</div> }));
vi.mock('./pages/OwnPasswordResetPage', () => ({ default: () => <div>Pantalla restablecer mi contraseña</div> }));
vi.mock('./pages/PasswordRecoveryRequestPage',() => ({ default: () => <div>Pantalla recuperación</div> }));
vi.mock('./pages/NewPasswordPage', () => ({ default: () => <div>Pantalla nueva contraseña</div> }));
vi.mock('./pages/LoginPage', () => ({ default: () => <div>Pantalla de login</div> }));
vi.mock('./components/MessengerFleetList', () => ({
  MessengerFleetList: () => <div>Pantalla flota de mensajeros</div>,
}));
vi.mock('./hooks/useAuth', () => ({ useAuth: vi.fn() }));

// Rutas protegidas y la pantalla que muestra cada una. AL AGREGAR UNA RUTA
// PROTEGIDA NUEVA EN App.jsx hay que sumarla aquí y en ALLOWED_ROUTES.
const SCREENS = {
  [ROUTES.MAIN_MENU]: 'Pantalla menú principal',
  [ROUTES.MODULE_COURIERS]: 'Pantalla menú de módulo',
  [ROUTES.MODULE_ADMINS]: 'Pantalla menú de módulo',
  [ROUTES.MODULE_SECURITY]: 'Pantalla menú de módulo',
  [ROUTES.ADMIN_CREATE]: 'Pantalla registro de administrador',
  [ROUTES.ADMIN_DELETE]: 'Pantalla administradores',
  [ROUTES.COURIER_CREATE]: 'Pantalla registro de mensajero',
  [ROUTES.COURIER_DEACTIVATE]: 'Pantalla flota de mensajeros',
  [ROUTES.ROLES_PERMISSIONS]: 'Pantalla roles y permisos',
  [ROUTES.SALES_HOME]: 'Pantalla ventas',
  [ROUTES.COURIER_HOME]: 'Pantalla mensajero',
  // Cada rol restablece su propia contraseña con la sesión iniciada.
  [ROUTES.PASSWORD_RESET_OWN]: 'Pantalla restablecer mi contraseña',
  [ROUTES.SALES_PASSWORD_RESET]: 'Pantalla restablecer mi contraseña',
  [ROUTES.COURIER_PASSWORD_RESET]: 'Pantalla restablecer mi contraseña',
  // Rutas de tu feature agregadas al formato de develop
  '/editar-mensajero': 'Pantalla edición de mensajero',
};

// Política acordada (HU-001): cada rol ve únicamente lo suyo.
const ALLOWED_ROUTES = {
  // Ajustado a las constantes en inglés (SUPER_USER, SALES_ADMIN, COURIER) para que hagan match con App.jsx
  [ROLES.SUPER_USER]: [
    ROUTES.MAIN_MENU,
    ROUTES.MODULE_COURIERS,
    ROUTES.MODULE_ADMINS,
    ROUTES.MODULE_SECURITY,
    ROUTES.ADMIN_CREATE,
    ROUTES.ADMIN_DELETE,
    ROUTES.COURIER_CREATE,
    ROUTES.COURIER_DEACTIVATE,
    ROUTES.ROLES_PERMISSIONS,
    ROUTES.PASSWORD_RESET_OWN,
    '/editar-mensajero'
  ],
  [ROLES.SALES_ADMIN]: [ROUTES.SALES_HOME, ROUTES.SALES_PASSWORD_RESET],
  [ROLES.COURIER]: [ROUTES.COURIER_HOME, ROUTES.COURIER_PASSWORD_RESET],
};

function loginAs(role) {
  const user = { id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role };
  localStorage.setItem('token', 'token-no-jwt'); // no es JWT: se asume vigente
  localStorage.setItem('blawdtrack_user', JSON.stringify(user));
  useAuth.mockReturnValue({ user, expireSession: vi.fn() });
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('App - rutas protegidas por rol (HU-001)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('el inicio de cada rol está dentro de las rutas que ese rol puede ver (evita bucles de redirección)', () => {
    for (const role of Object.values(ROLES)) {
      expect(ALLOWED_ROUTES[role]).toContain(getHomeRoute(role));
    }
    expect(Object.keys(ALLOWED_ROUTES).sort()).toEqual(Object.keys(ROLE_HOME_ROUTES).sort());
  });

  it('cada ruta protegida pertenece al grupo de exactamente un rol', () => {
    for (const route of Object.keys(SCREENS)) {
      const roles = Object.entries(ALLOWED_ROUTES)
        .filter(([, routes]) => routes.includes(route))
        .map(([role]) => role);
      expect(roles).toHaveLength(1);
    }
  });

  describe.each(Object.values(ROLES))('con el rol %s', (role) => {
    it.each(Object.keys(SCREENS))('entrar por URL a %s', (route) => {
      loginAs(role);
      renderAt(route);

      if (ALLOWED_ROUTES[role].includes(route)) {
        expect(screen.getByText(SCREENS[route])).toBeTruthy();
      } else {
        // Ruta de otro rol: no se ve y se vuelve al inicio propio.
        expect(screen.queryByText(SCREENS[route])).toBeNull();
        expect(screen.getByText(SCREENS[getHomeRoute(role)])).toBeTruthy();
      }
    });
  });

  it.each(Object.keys(SCREENS))('sin sesión, entrar a %s manda a /login', (route) => {
    useAuth.mockReturnValue({ user: null, expireSession: vi.fn() });
    renderAt(route);
    expect(screen.getByText('Pantalla de login')).toBeTruthy();
    expect(screen.queryByText(SCREENS[route])).toBeNull();
  });

  // Un 'user' con rol sin inicio mapeado no puede existir con AuthContext real;
  // se simula con useAuth mockeado. Ninguna pantalla debe quedar en blanco ni
  // navegar a "null": todo termina en /login y se cierra la sesión.
  describe.each([['ROL_INEXISTENTE'], ['toString'], [undefined]])(
    'con un usuario de rol sin inicio mapeado (%s)',
    (role) => {
      function loginAsUnknownRole() {
        const logout = vi.fn();
        const user = { id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role };
        localStorage.setItem('token', 'token-no-jwt');
        localStorage.setItem('blawdtrack_user', JSON.stringify(user));
        useAuth.mockReturnValue({ user, expireSession: vi.fn(), logout });
        return logout;
      }

      it.each(Object.keys(SCREENS))('entrar por URL a %s termina en /login y cierra la sesión', (route) => {
        const logout = loginAsUnknownRole();
        renderAt(route);
        expect(screen.getByText('Pantalla de login')).toBeTruthy();
        expect(screen.queryByText(SCREENS[route])).toBeNull();
        expect(logout).toHaveBeenCalled();
      });

      it('/login muestra el formulario en vez de navegar a "null"', () => {
        loginAsUnknownRole();
        renderAt('/login');
        expect(screen.getByText('Pantalla de login')).toBeTruthy();
      });

      it('/ manda a /login', () => {
        loginAsUnknownRole();
        renderAt('/');
        expect(screen.getByText('Pantalla de login')).toBeTruthy();
      });
    }
  );

  it('la pantalla de recuperación sigue siendo pública', () => {
    useAuth.mockReturnValue({ user: null, expireSession: vi.fn() });
    renderAt(ROUTES.PASSWORD_RECOVERY);
    expect(screen.getByText('Pantalla recuperación')).toBeTruthy();
  });

  it('/recovery (destino del enlace del correo) es pública, con y sin sesión', () => {
    useAuth.mockReturnValue({ user: null, expireSession: vi.fn() });
    renderAt(`${ROUTES.PASSWORD_RESET}?token=abc`);
    expect(screen.getByText('Pantalla nueva contraseña')).toBeTruthy();
  });
});
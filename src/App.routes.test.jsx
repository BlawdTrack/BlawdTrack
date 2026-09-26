import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { useAuth } from './hooks/useAuth';
import { ROLES, ROLE_HOME_ROUTES, getHomeRoute } from './utils/roleRoutes';

// Las pantallas se mockean: aquí solo importa qué pantalla queda visible según
// el rol (varias hacen peticiones al backend al montarse).
vi.mock('./pages/AdminManagement', () => ({ default: () => <div>Pantalla administradores</div> }));
vi.mock('./pages/CourierRegistrationPage', () => ({ default: () => <div>Pantalla registro de mensajero</div> }));
vi.mock('./pages/SalesHomePage', () => ({ default: () => <div>Pantalla ventas</div> }));
vi.mock('./pages/CourierHomePage', () => ({ default: () => <div>Pantalla mensajero</div> }));
vi.mock('./pages/PasswordRecoveryRequestPage', () => ({ default: () => <div>Pantalla recuperación</div> }));
vi.mock('./pages/NewPasswordPage', () => ({ default: () => <div>Pantalla nueva contraseña</div> }));
vi.mock('./pages/LoginPage', () => ({ default: () => <div>Pantalla de login</div> }));
vi.mock('./components/MessengerFleetList', () => ({
  MessengerFleetList: () => <div>Pantalla flota de mensajeros</div>,
}));
vi.mock('./hooks/useAuth', () => ({ useAuth: vi.fn() }));

// Rutas protegidas y la pantalla que muestra cada una. AL AGREGAR UNA RUTA
// PROTEGIDA NUEVA EN App.jsx hay que sumarla aquí y en ALLOWED_ROUTES.
const SCREENS = {
  '/administradores': 'Pantalla administradores',
  '/registro-mensajero': 'Pantalla registro de mensajero',
  '/mensajeros': 'Pantalla flota de mensajeros',
  '/ventas': 'Pantalla ventas',
  '/mensajero': 'Pantalla mensajero',
};

// Política acordada (HU-001): cada rol ve únicamente lo suyo.
const ALLOWED_ROUTES = {
  [ROLES.SUPER_USUARIO]: ['/administradores', '/registro-mensajero', '/mensajeros'],
  [ROLES.ADMIN_VENTAS]: ['/ventas'],
  [ROLES.MENSAJERO]: ['/mensajero'],
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

  it('/recuperar-contrasena sigue siendo pública', () => {
    useAuth.mockReturnValue({ user: null, expireSession: vi.fn() });
    renderAt('/recuperar-contrasena');
    expect(screen.getByText('Pantalla recuperación')).toBeTruthy();
  });

  it('/recovery (destino del enlace del correo) es pública, con y sin sesión', () => {
    useAuth.mockReturnValue({ user: null, expireSession: vi.fn() });
    renderAt('/recovery?token=abc');
    expect(screen.getByText('Pantalla nueva contraseña')).toBeTruthy();
  });
});

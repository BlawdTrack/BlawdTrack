import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

// useAuth se mockea para controlar 'user' y espiar expireSession sin montar
// el AuthProvider completo.
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const USER = { id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role: 'SUPER_USUARIO' };

// JWT de mentira con el 'exp' indicado (en segundos); authStorage solo lee
// el payload, no verifica la firma.
function fakeJwt(exp) {
  return `header.${btoa(JSON.stringify({ exp }))}.firma`;
}

function saveSession(token) {
  localStorage.setItem('token', token);
  localStorage.setItem('blawdtrack_user', JSON.stringify(USER));
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Pantalla de login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/privada" element={<div>Pantalla privada</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute (T17)', () => {
  const expireSession = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    expireSession.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('sin sesión redirige a /login, sin aviso de sesión expirada', () => {
    useAuth.mockReturnValue({ user: null, expireSession });

    renderAt('/privada');

    expect(screen.getByText('Pantalla de login')).toBeTruthy();
    expect(screen.queryByText('Pantalla privada')).toBeNull();
    expect(expireSession).not.toHaveBeenCalled();
  });

  it('con sesión válida muestra la ruta protegida', () => {
    saveSession(fakeJwt(Math.floor(Date.now() / 1000) + 3600));
    useAuth.mockReturnValue({ user: USER, expireSession });

    renderAt('/privada');

    expect(screen.getByText('Pantalla privada')).toBeTruthy();
    expect(expireSession).not.toHaveBeenCalled();
  });

  it('con token vencido (exp pasado) redirige a /login y expira la sesión', () => {
    saveSession(fakeJwt(1));
    useAuth.mockReturnValue({ user: USER, expireSession });

    renderAt('/privada');

    expect(screen.getByText('Pantalla de login')).toBeTruthy();
    expect(screen.queryByText('Pantalla privada')).toBeNull();
    expect(expireSession).toHaveBeenCalled();
  });
});

describe('ProtectedRoute con allowedRoles (restricción por rol, HU-001)', () => {
  const expireSession = vi.fn();
  const logout = vi.fn();
  const VALID_TOKEN_EXP = Math.floor(Date.now() / 1000) + 3600;

  function loginAs(role) {
    const user = { ...USER, role };
    localStorage.setItem('token', fakeJwt(VALID_TOKEN_EXP));
    localStorage.setItem('blawdtrack_user', JSON.stringify(user));
    useAuth.mockReturnValue({ user, expireSession, logout });
  }

  // "/solo-super" exige SUPER_USUARIO; "/administradores" y "/mensajero" son los
  // inicios de SUPER_USUARIO y MENSAJERO, fuera de ese grupo.
  function renderRoles(path, allowedRoles) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>Pantalla de login</div>} />
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path="/solo-super" element={<div>Solo súper usuario</div>} />
          </Route>
          <Route path="/administradores" element={<div>Inicio de súper usuario</div>} />
          <Route path="/mensajero" element={<div>Inicio de mensajero</div>} />
          <Route path="/ventas" element={<div>Inicio de ventas</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  beforeEach(() => {
    localStorage.clear();
    expireSession.mockReset();
    logout.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('un rol permitido ve la ruta', () => {
    loginAs('SUPER_USUARIO');
    renderRoles('/solo-super', ['SUPER_USUARIO']);
    expect(screen.getByText('Solo súper usuario')).toBeTruthy();
  });

  it('un rol NO permitido vuelve a su propio inicio, sin cerrar la sesión', () => {
    loginAs('MENSAJERO');
    renderRoles('/solo-super', ['SUPER_USUARIO']);
    expect(screen.queryByText('Solo súper usuario')).toBeNull();
    expect(screen.getByText('Inicio de mensajero')).toBeTruthy();
    expect(expireSession).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).not.toBeNull();
  });

  it('cada rol no permitido vuelve a SU inicio, no a uno fijo', () => {
    loginAs('ADMIN_VENTAS');
    renderRoles('/solo-super', ['SUPER_USUARIO']);
    expect(screen.getByText('Inicio de ventas')).toBeTruthy();
  });

  it('sin allowedRoles basta con tener sesión, sea cual sea el rol', () => {
    loginAs('MENSAJERO');
    renderRoles('/solo-super', undefined);
    expect(screen.getByText('Solo súper usuario')).toBeTruthy();
  });

  it('con allowedRoles pero sin sesión sigue mandando a /login', () => {
    useAuth.mockReturnValue({ user: null, expireSession });
    renderRoles('/solo-super', ['SUPER_USUARIO']);
    expect(screen.getByText('Pantalla de login')).toBeTruthy();
  });

  it('mala configuración (el inicio del rol está en el grupo que no puede ver): no hay bucle infinito, falla cerrado', () => {
    // MENSAJERO cuyo inicio (/mensajero) se declaró dentro de un grupo solo para SUPER_USUARIO.
    loginAs('MENSAJERO');
    render(
      <MemoryRouter initialEntries={['/mensajero']}>
        <Routes>
          <Route path="/login" element={<div>Pantalla de login</div>} />
          <Route element={<ProtectedRoute allowedRoles={['SUPER_USUARIO']} />}>
            <Route path="/mensajero" element={<div>Inicio de mensajero</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByText('Inicio de mensajero')).toBeNull();
    // Aquí el rol SÍ es conocido: no se cierra la sesión, solo se falla cerrado.
    expect(logout).not.toHaveBeenCalled();
  });

  // Rol sin inicio mapeado (desconocido o ausente): AuthContext no deja crear un
  // 'user' así, pero ProtectedRoute lo maneja por si esa garantía se rompiera.
  describe.each([
    ['ROL_INEXISTENTE'],
    ['constructor'],
    [undefined],
  ])('con el rol sin inicio mapeado %s', (role) => {
    it('en un grupo con allowedRoles: cierra la sesión y manda a /login, sin pantalla en blanco', () => {
      loginAs(role);
      renderRoles('/solo-super', ['SUPER_USUARIO']);
      expect(screen.getByText('Pantalla de login')).toBeTruthy();
      expect(screen.queryByText('Solo súper usuario')).toBeNull();
      expect(logout).toHaveBeenCalled();
      expect(expireSession).not.toHaveBeenCalled();
    });

    it('en un grupo sin allowedRoles también: no basta con tener sesión', () => {
      loginAs(role);
      renderRoles('/solo-super', undefined);
      expect(screen.getByText('Pantalla de login')).toBeTruthy();
      expect(screen.queryByText('Solo súper usuario')).toBeNull();
      expect(logout).toHaveBeenCalled();
    });
  });
});

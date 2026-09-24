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

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { renderWithProviders, superUser } from '../test-utils';
import { ROLES } from '../config/roles';

const tree = (allowedRoles) => (
  <Routes>
    <Route path="/login" element={<div>login screen</div>} />
    <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
      <Route path="/secret" element={<div>secret screen</div>} />
    </Route>
  </Routes>
);

describe('ProtectedRoute', () => {
  it('redirects to login when there is no session', () => {
    renderWithProviders(tree([ROLES.SUPER_USER]), { route: '/secret', user: null });
    expect(screen.getByText('login screen')).toBeInTheDocument();
    expect(screen.queryByText('secret screen')).not.toBeInTheDocument();
  });

  it('renders the protected screen for an allowed role', () => {
    renderWithProviders(tree([ROLES.SUPER_USER]), { route: '/secret', user: superUser });
    expect(screen.getByText('secret screen')).toBeInTheDocument();
  });

  it('redirects to login when the role is not allowed', () => {
    renderWithProviders(tree([ROLES.SUPER_USER]), {
      route: '/secret',
      user: { ...superUser, role: ROLES.COURIER },
    });
    expect(screen.getByText('login screen')).toBeInTheDocument();
    expect(screen.queryByText('secret screen')).not.toBeInTheDocument();
  });

  it('lets any authenticated user through when no roles are given', () => {
    renderWithProviders(tree(undefined), { route: '/secret', user: { ...superUser, role: ROLES.COURIER } });
    expect(screen.getByText('secret screen')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App';
import { renderWithProviders, superUser } from './test-utils';
import { ROLES } from './config/roles';
import { ROUTES } from './config/routes';

// Heavy screens are stubbed: these tests only check routing and access rules.
vi.mock('./pages/AdminManagement', () => ({ default: () => <div>admin management screen</div> }));
vi.mock('./pages/CourierRegistrationPage', () => ({ default: () => <div>courier registration screen</div> }));
vi.mock('./components/MessengerFleetList', () => ({ MessengerFleetList: () => <div>fleet list screen</div> }));
vi.mock('./pages/LoginPage', () => ({ default: () => <div>login screen</div> }));
vi.mock('./pages/PasswordRecoveryTestPage', () => ({ default: () => <div>password recovery screen</div> }));

const protectedRoutes = [
  [ROUTES.MAIN_MENU, 'Bienvenid@ al sistema'],
  [ROUTES.COURIER_CREATE, 'courier registration screen'],
  [ROUTES.COURIER_DEACTIVATE, 'fleet list screen'],
  [ROUTES.ADMIN_DELETE, 'admin management screen'],
];

describe('App routing', () => {
  it('starts on the login screen', () => {
    renderWithProviders(<App />, { route: '/' });
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });

  it('serves the public password recovery screen without a session', () => {
    renderWithProviders(<App />, { route: ROUTES.PASSWORD_RECOVERY });
    expect(screen.getByText('password recovery screen')).toBeInTheDocument();
  });

  it.each(protectedRoutes)('sends %s to login when there is no session', (route) => {
    renderWithProviders(<App />, { route, user: null });
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });

  it.each(protectedRoutes)('sends %s to login for a non super user', (route) => {
    renderWithProviders(<App />, { route, user: { ...superUser, role: ROLES.COURIER } });
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });

  it.each(protectedRoutes)('renders %s inside the main menu for the super user', (route, text) => {
    renderWithProviders(<App />, { route, user: superUser });
    expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('no longer serves the old Spanish routes', () => {
    renderWithProviders(<App />, { route: '/administradores', user: superUser });
    expect(screen.queryByText('admin management screen')).not.toBeInTheDocument();
  });
});

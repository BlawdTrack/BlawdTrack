import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import MainMenuPage from './MainMenuPage';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

const tree = (
  <Routes>
    <Route path={ROUTES.LOGIN} element={<div>login screen</div>} />
    <Route path={ROUTES.MAIN_MENU} element={<MainMenuPage />} />
  </Routes>
);

describe('MainMenuPage', () => {
  it('shows the welcome text, the logged user and the role', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    expect(screen.getByText('Bienvenid@ al sistema')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'BlawdTrack' })).toBeInTheDocument();
    expect(screen.getByText(/Alicia Admin/)).toBeInTheDocument();
    expect(screen.getByText('Súper Usuario')).toBeInTheDocument();
  });

  it('falls back to the raw role when it has no label', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: { ...superUser, role: 'OTRO_ROL' } });
    expect(screen.getByText('OTRO_ROL')).toBeInTheDocument();
  });

  it('offers a logout button that ends the session and goes to login', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser, logout });

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });

  it('greets according to the time of day and asks what to do', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    expect(screen.getByRole('heading', { level: 2, name: /^(Buenos días|Buenas tardes|Buenas noches)$/ })).toBeInTheDocument();
    expect(screen.getByText('¿Qué deseas hacer hoy?')).toBeInTheDocument();
  });

  it('does not show how many functions each module has', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    expect(screen.queryByText(/\d+ funciones?/)).not.toBeInTheDocument();
  });

  it('offers one card per module that leads to the module menu', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

    expect(screen.getByRole('link', { name: /Mensajeros/ })).toHaveAttribute('href', ROUTES.MODULE_COURIERS);
    expect(screen.getByRole('link', { name: /Administradores/ })).toHaveAttribute('href', ROUTES.MODULE_ADMINS);
    expect(screen.getByRole('link', { name: /Seguridad y acceso/ })).toHaveAttribute('href', ROUTES.MODULE_SECURITY);
  });
});

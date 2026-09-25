import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import MainMenuLayout from './MainMenuLayout';
import { renderWithProviders, superUser } from '../../test-utils';
import { ROUTES } from '../../config/routes';

const tree = (
  <Routes>
    <Route path={ROUTES.LOGIN} element={<div>login screen</div>} />
    <Route element={<MainMenuLayout />}>
      <Route path={ROUTES.MAIN_MENU} element={<div>menu content</div>} />
      <Route path={ROUTES.COURIER_CREATE} element={<div>create courier content</div>} />
      <Route path={ROUTES.COURIER_DEACTIVATE} element={<div>deactivate content</div>} />
    </Route>
  </Routes>
);

const sidebar = () => screen.getByRole('complementary');

describe('MainMenuLayout sidebar', () => {
  it('renders the four module titles from the mockup', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    ['Seguridad y acceso', 'Mensajeros', 'Administradores', 'Roles y permisos'].forEach((title) =>
      expect(bar.getAllByText(title).length).toBeGreaterThan(0)
    );
  });

  it('does not show a login entry nor any HU label', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    expect(within(sidebar()).queryByText(/iniciar sesión/i)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/HU-?\d+/i);
  });

  it('shows the brand logo and name', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    expect(within(sidebar()).getByAltText('BlawdTrack')).toBeInTheDocument();
    expect(within(sidebar()).getByText('Blawd Gourmet')).toBeInTheDocument();
  });

  it('shows the logged user: name, role and the first letter of the email', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    expect(bar.getByText('Alicia Admin')).toBeInTheDocument();
    expect(bar.getByText('Súper Usuario')).toBeInTheDocument();
    expect(bar.getByText('A', { selector: 'div' })).toBeInTheDocument();
    expect(bar.queryByText('AA')).not.toBeInTheDocument();
  });

  it('shows the initial of a different user email', () => {
    renderWithProviders(tree, {
      route: ROUTES.MAIN_MENU,
      user: { ...superUser, email: 'zeta@blawdgourmet.com', fullName: 'Otro Usuario' },
    });
    expect(within(sidebar()).getByText('Z', { selector: 'div' })).toBeInTheDocument();
  });

  it('navigates to different screens for "Crear mensajero" and "Desactivar mensajero"', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

    await user.click(within(sidebar()).getByRole('link', { name: 'Crear mensajero' }));
    expect(screen.getByText('create courier content')).toBeInTheDocument();

    await user.click(within(sidebar()).getByRole('link', { name: 'Desactivar mensajero' }));
    expect(screen.getByText('deactivate content')).toBeInTheDocument();
    expect(screen.queryByText('create courier content')).not.toBeInTheDocument();
  });

  it('renders unimplemented screens as non-clickable items', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());

    ['Actualizar mensajero', 'Crear administrador', 'Roles y permisos'].forEach((label) => {
      expect(bar.queryByRole('link', { name: label })).not.toBeInTheDocument();
    });
    await user.click(bar.getByText('Actualizar mensajero'));
    expect(screen.getByText('menu content')).toBeInTheDocument();
  });

  it('logs out and returns to the login screen', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser, logout });

    await user.click(within(sidebar()).getByRole('button', { name: /cerrar sesión/i }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });
});

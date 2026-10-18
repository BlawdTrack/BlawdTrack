import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import ModuleMenuPage from './ModuleMenuPage';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

const tree = (
  <Routes>
    <Route path={ROUTES.MAIN_MENU} element={<div>main menu screen</div>} />
    <Route path={ROUTES.MODULE_USERS} element={<ModuleMenuPage groupId="users" />} />
    <Route path={ROUTES.MODULE_COURIERS} element={<ModuleMenuPage groupId="couriers" />} />
    <Route path={ROUTES.MODULE_ADMINS} element={<ModuleMenuPage groupId="admins" />} />
    <Route path={ROUTES.MODULE_SETTINGS} element={<ModuleMenuPage groupId="settings" />} />
  </Routes>
);

describe('ModuleMenuPage', () => {
  it('lists the functions of the module as links to their screens', () => {
    renderWithProviders(tree, { route: ROUTES.MODULE_COURIERS, user: superUser });

    expect(screen.getByRole('heading', { level: 1, name: 'Mensajeros' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear mensajero/ })).toHaveAttribute('href', ROUTES.COURIER_CREATE);
    expect(screen.getByRole('link', { name: /Actualizar mensajero/ })).toHaveAttribute('href', ROUTES.COURIER_UPDATE);
    expect(screen.getByRole('link', { name: /Desactivar mensajero/ })).toHaveAttribute('href', ROUTES.COURIER_DEACTIVATE);
  });

  it('lists Mensajeros and Administradores as submenus in Gestión de usuarios, not their functions', () => {
    renderWithProviders(tree, { route: ROUTES.MODULE_USERS, user: superUser });

    expect(screen.getByRole('heading', { level: 1, name: 'Gestión de usuarios' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mensajeros/ })).toHaveAttribute('href', ROUTES.MODULE_COURIERS);
    expect(screen.getByRole('link', { name: /Administradores/ })).toHaveAttribute('href', ROUTES.MODULE_ADMINS);
    expect(screen.queryByRole('link', { name: /Crear mensajero/ })).not.toBeInTheDocument();
  });

  it('lists Roles y permisos in Gestión de usuarios as a direct card after the two submenus', () => {
    renderWithProviders(tree, { route: ROUTES.MODULE_USERS, user: superUser });

    const links = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href) => href !== ROUTES.MAIN_MENU);
    expect(links.slice(0, 3)).toEqual([ROUTES.MODULE_COURIERS, ROUTES.MODULE_ADMINS, ROUTES.ROLES_PERMISSIONS]);
    expect(screen.getByRole('link', { name: /Roles y permisos/ })).toHaveAttribute('href', ROUTES.ROLES_PERMISSIONS);
  });

  it('lists Restablecer contraseña in the Ajustes menu, for the sales admin too', () => {
    renderWithProviders(tree, { route: ROUTES.MODULE_SETTINGS, user: { ...superUser, role: 'ADMIN_VENTAS' } });

    expect(screen.getByRole('heading', { level: 1, name: 'Ajustes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Restablecer contraseña/ })).toHaveAttribute('href', ROUTES.PASSWORD_RESET_OWN);
  });

  it('lists the functions of the administradores submenu', () => {
    renderWithProviders(tree, { route: ROUTES.MODULE_ADMINS, user: superUser });

    expect(screen.getByRole('link', { name: /Crear administrador/ })).toHaveAttribute('href', ROUTES.ADMIN_CREATE);
    expect(screen.getByRole('link', { name: /Actualizar administrador/ })).toHaveAttribute('href', ROUTES.ADMIN_UPDATE);
    expect(screen.getByRole('link', { name: /Eliminar administrador/ })).toHaveAttribute('href', ROUTES.ADMIN_DELETE);
  });

  it('goes back to the main menu when the role has no such module', () => {
    renderWithProviders(tree, {
      route: ROUTES.MODULE_COURIERS,
      user: { ...superUser, role: 'OTRO_ROL' },
    });

    expect(screen.getByText('main menu screen')).toBeInTheDocument();
  });
});

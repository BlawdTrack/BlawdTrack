import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
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
  it('shows the role once in the banner, without a second welcome or the user name', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    expect(screen.getAllByText('Súper Usuario')).toHaveLength(1);
    expect(screen.queryByText('Bienvenid@ al sistema')).not.toBeInTheDocument();
    expect(screen.queryByText(/Alicia Admin/)).not.toBeInTheDocument();
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
    expect(screen.getByRole('heading', { level: 1, name: /^(Buenos días|Buenas tardes|Buenas noches)$/ })).toBeInTheDocument();
    expect(screen.getByText('¿Qué deseas hacer hoy?')).toBeInTheDocument();
  });

  it('does not show how many functions each module has', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    expect(screen.queryByText(/\d+ funciones?/)).not.toBeInTheDocument();
  });

  it('splits the modules into the sections Operación diaria, Administración and Mensajería', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

    ['Operación diaria', 'Administración', 'Mensajería'].forEach((name) =>
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
    );
    expect(screen.getByRole('region', { name: 'Operación diaria' })).toContainElement(
      screen.getByRole('heading', { level: 3, name: 'Importación de paquetes' })
    );
    expect(screen.getByRole('region', { name: 'Administración' })).toContainElement(
      screen.getByRole('heading', { level: 3, name: 'Gestión de usuarios' })
    );
  });

  it('links the implemented modules to their menu, or to their screen when they have only one', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

    expect(screen.getByRole('link', { name: /Gestión de usuarios/ })).toHaveAttribute('href', ROUTES.MODULE_USERS);
    expect(screen.getByRole('link', { name: /Importación de paquetes/ })).toHaveAttribute('href', ROUTES.PACKAGE_IMPORT);
    expect(screen.queryByRole('link', { name: /Seguridad y acceso/ })).not.toBeInTheDocument();
  });

  it('shows the modules that are not built yet as disabled "Próximamente" cards, without a link', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

    ['Gestión de paquetes', 'Asignación y seguimiento', 'Reportes y notificaciones', 'Operación de mensajero'].forEach((title) => {
      const heading = screen.getByRole('heading', { level: 3, name: title });
      expect(heading.closest('a')).toBeNull();
      expect(heading.parentElement.closest('[aria-disabled="true"]')).not.toBeNull();
    });
    expect(screen.getAllByText('Próximamente')).toHaveLength(4);
  });

  it('says the module is coming soon when the cursor is over a future card', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

    const card = screen.getByRole('heading', { level: 3, name: 'Reportes y notificaciones' }).closest('[aria-disabled]');
    await user.hover(card);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Disponible próximamente');
    // Un módulo que ya existe no lleva el aviso.
    await user.unhover(card);
    await user.hover(screen.getByRole('link', { name: /Gestión de usuarios/ }));
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('shows the sales admin only the modules of their role, in the Operación diaria and Control y consulta sections', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: { ...superUser, role: 'ADMIN_VENTAS' } });

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Operación diaria',
      'Control y consulta',
      'Resumen de hoy',
    ]);
    expect(screen.getByRole('link', { name: /Importación de paquetes/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Control y consulta' })).toContainElement(
      screen.getByRole('heading', { level: 3, name: 'Reportes y notificaciones' })
    );
    expect(screen.getByText('Reportes de entregas con filtros, exportación e historial de notificaciones.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Gestión de usuarios' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mensajería' })).not.toBeInTheDocument();
  });

  it('shows the sales admin the four counts of the day without data until the packages module exists', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: { ...superUser, role: 'ADMIN_VENTAS' } });

    const summary = within(screen.getByRole('region', { name: 'Resumen de hoy' }));
    ['Pendientes de asignar', 'En tránsito', 'Entregados', 'No entregados'].forEach((label) =>
      expect(summary.getByText(label)).toBeInTheDocument()
    );
    expect(summary.getAllByText('—')).toHaveLength(4);
    expect(summary.getByText('Disponible próximamente')).toBeInTheDocument();
  });

  it('does not show the day summary to the super user', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

    expect(screen.queryByRole('region', { name: 'Resumen de hoy' })).not.toBeInTheDocument();
  });
});

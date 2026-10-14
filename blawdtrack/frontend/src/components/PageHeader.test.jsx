import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PageHeader from './PageHeader';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

const renderAt = (route) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={ROUTES.MAIN_MENU} element={<div>main menu content</div>} />
        <Route path={ROUTES.MODULE_USERS} element={<PageHeader title="Gestión de usuarios" />} />
        <Route path={ROUTES.MODULE_COURIERS} element={<PageHeader title="Mensajeros" />} />
        <Route path={ROUTES.COURIER_CREATE} element={<PageHeader title="Crear mensajero" />} />
        <Route path="/otra" element={<PageHeader title="Otra pantalla" />} />
      </Routes>
    </MemoryRouter>
  );

describe('PageHeader', () => {
  it('shows only the title', () => {
    renderAt(ROUTES.COURIER_CREATE);
    expect(screen.getByRole('heading', { level: 1, name: 'Crear mensajero' })).toBeInTheDocument();
  });

  it('has a "Menú principal" link before the title on a module menu', () => {
    renderAt(ROUTES.MODULE_USERS);
    const link = screen.getByRole('link', { name: 'Menú principal' });
    expect(link).toHaveAttribute('href', ROUTES.MAIN_MENU);
    expect(link.compareDocumentPosition(screen.getByRole('heading', { level: 1 }))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('goes to the main menu from a function screen', async () => {
    const user = userEvent.setup();
    renderAt(ROUTES.COURIER_CREATE);

    await user.click(screen.getByRole('link', { name: 'Menú principal' }));

    expect(screen.getByText('main menu content')).toBeInTheDocument();
  });

  it('takes each role back to its own home: the courier to theirs, not to the main menu', () => {
    renderWithProviders(
      <Routes>
        <Route path={ROUTES.MODULE_SETTINGS} element={<PageHeader title="Ajustes" />} />
      </Routes>,
      { route: ROUTES.MODULE_SETTINGS, user: { ...superUser, role: 'MENSAJERO' } }
    );

    expect(screen.getByRole('link', { name: 'Menú principal' })).toHaveAttribute('href', ROUTES.COURIER_HOME);
  });

  it('has no breadcrumb trail and no big "Volver" button, only the arrow', () => {
    renderAt(ROUTES.COURIER_CREATE);
    expect(screen.queryByRole('navigation', { name: 'Ruta de navegación' })).not.toBeInTheDocument();
    expect(screen.queryByText('Volver')).not.toBeInTheDocument();
  });

  it('has an arrow before the title that goes from a function to the submenu that lists it, keeping the main menu link', () => {
    renderAt(ROUTES.COURIER_CREATE);
    const arrow = screen.getByRole('link', { name: 'Volver a Mensajeros' });
    expect(arrow).toHaveAttribute('href', ROUTES.MODULE_COURIERS);
    expect(arrow.compareDocumentPosition(screen.getByRole('heading', { level: 1 }))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByRole('link', { name: 'Menú principal' })).toHaveAttribute('href', ROUTES.MAIN_MENU);
  });

  it('goes from a submenu back to Gestión de usuarios', async () => {
    const user = userEvent.setup();
    renderAt(ROUTES.MODULE_COURIERS);
    expect(screen.getByRole('link', { name: 'Volver a Gestión de usuarios' })).toHaveAttribute('href', ROUTES.MODULE_USERS);

    await user.click(screen.getByRole('link', { name: 'Volver a Gestión de usuarios' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Gestión de usuarios' })).toBeInTheDocument();
  });

  it('has no arrow on a group menu, only the main menu link', () => {
    renderAt(ROUTES.MODULE_USERS);
    expect(screen.queryByRole('link', { name: /^volver a/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Menú principal' })).toBeInTheDocument();
  });

  it('has no link on screens that are not part of a module', () => {
    renderAt('/otra');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders without a router (isolated screens) and without a link', () => {
    render(<PageHeader title="Aislada" />);
    expect(screen.getByRole('heading', { name: 'Aislada' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

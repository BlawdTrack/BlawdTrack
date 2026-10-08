import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, within, fireEvent, waitFor } from '@testing-library/react';
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
      <Route path={ROUTES.COURIER_UPDATE} element={<div>update courier content</div>} />
      <Route path={ROUTES.COURIER_DEACTIVATE} element={<div>deactivate content</div>} />
      <Route path={ROUTES.ROLES_PERMISSIONS} element={<div>roles content</div>} />
      <Route path={ROUTES.ADMIN_CREATE} element={<div>create admin content</div>} />
    </Route>
  </Routes>
);

const sidebar = () => screen.getByRole('complementary');
// Los grupos del menú arrancan cerrados: hay que abrirlos para llegar a sus enlaces.
const openGroup = (user, name) => user.click(within(sidebar()).getByRole('button', { name }));

describe('MainMenuLayout sidebar', () => {
  it('renders the four module titles from the mockup', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    ['Gestión de mensajeros', 'Gestión de administradores', 'Seguridad y acceso'].forEach((title) =>
      expect(bar.getByRole('button', { name: title })).toBeInTheDocument()
    );
    expect(bar.queryByRole('button', { name: 'Roles y permisos' })).not.toBeInTheDocument();
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

    await openGroup(user, 'Gestión de mensajeros');
    await user.click(within(sidebar()).getByRole('link', { name: 'Crear mensajero' }));
    expect(screen.getByText('create courier content')).toBeInTheDocument();

    await user.click(within(sidebar()).getByRole('link', { name: 'Desactivar mensajero' }));
    expect(screen.getByText('deactivate content')).toBeInTheDocument();
    expect(screen.queryByText('create courier content')).not.toBeInTheDocument();
  });

  it('navigates to "Actualizar mensajero", "Roles y permisos" and "Crear administrador" now that they are implemented', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    await openGroup(user, 'Gestión de mensajeros');
    await openGroup(user, 'Gestión de administradores');
    await openGroup(user, 'Seguridad y acceso');

    await user.click(bar.getByRole('link', { name: 'Actualizar mensajero' }));
    expect(screen.getByText('update courier content')).toBeInTheDocument();

    await user.click(bar.getByRole('link', { name: 'Roles y permisos' }));
    expect(screen.getByText('roles content')).toBeInTheDocument();

    await user.click(bar.getByRole('link', { name: 'Crear administrador' }));
    expect(screen.getByText('create admin content')).toBeInTheDocument();
  });

  it('logs out and returns to the login screen', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser, logout });

    await user.click(within(sidebar()).getByRole('button', { name: /cerrar sesión/i }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });

  it('starts with every group closed and opens or closes one from its title', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    const groupButton = bar.getByRole('button', { name: 'Gestión de mensajeros' });

    expect(groupButton).toHaveAttribute('aria-expanded', 'false');
    await user.click(groupButton);
    expect(groupButton).toHaveAttribute('aria-expanded', 'true');
    await user.click(groupButton);
    expect(groupButton).toHaveAttribute('aria-expanded', 'false');
  });

  describe('collapsed sidebar', () => {
    afterEach(() => localStorage.clear());

    it('collapses to one icon per group that opens a menu with its screens, and remembers the choice', async () => {
      const user = userEvent.setup();
      renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

      await user.click(within(sidebar()).getByRole('button', { name: 'Colapsar menú' }));

      const bar = within(sidebar());
      expect(bar.queryByText('Blawd Gourmet')).not.toBeInTheDocument();
      ['Gestión de mensajeros', 'Gestión de administradores', 'Seguridad y acceso'].forEach((name) =>
        expect(bar.getByRole('button', { name })).toBeInTheDocument()
      );
      expect(bar.queryByRole('link', { name: 'Crear mensajero' })).not.toBeInTheDocument();
      expect(bar.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
      expect(localStorage.getItem('blawdtrack.sidebarCollapsed')).toBe('true');

      await user.click(bar.getByRole('button', { name: 'Gestión de mensajeros' }));
      await user.click(await screen.findByRole('menuitem', { name: 'Crear mensajero' }));
      expect(screen.getByText('create courier content')).toBeInTheDocument();

      await user.click(bar.getByRole('button', { name: 'Seguridad y acceso' }));
      expect(await screen.findByRole('menuitem', { name: 'Roles y permisos' })).toBeInTheDocument();
      await user.keyboard('{Escape}');

      await user.click(bar.getByRole('button', { name: 'Expandir menú' }));
      expect(within(sidebar()).getByText('Blawd Gourmet')).toBeInTheDocument();
      expect(localStorage.getItem('blawdtrack.sidebarCollapsed')).toBe('false');
    });

    describe('hover flyouts', () => {
      const collapse = async (user) => {
        renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
        await user.click(within(sidebar()).getByRole('button', { name: 'Colapsar menú' }));
      };
      const trigger = (name) => within(sidebar()).getByRole('button', { name });
      const stubPanelRect = (rect) =>
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 220, height: 160, right: 310, ...rect });

      afterEach(() => vi.restoreAllMocks());

      it('opens a group menu on hover and closes it when the cursor leaves', async () => {
        const user = userEvent.setup();
        await collapse(user);

        await user.hover(trigger('Gestión de mensajeros'));
        expect(await screen.findByRole('menuitem', { name: 'Desactivar mensajero' })).toBeInTheDocument();

        await user.unhover(trigger('Gestión de mensajeros'));
        await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Desactivar mensajero' })).not.toBeInTheDocument());
      });

      it('keeps the menu open while the cursor is inside it', async () => {
        const user = userEvent.setup();
        await collapse(user);

        await user.hover(trigger('Gestión de mensajeros'));
        const item = await screen.findByRole('menuitem', { name: 'Desactivar mensajero' });
        await user.unhover(trigger('Gestión de mensajeros'));
        await user.hover(item);

        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(screen.getByRole('menuitem', { name: 'Desactivar mensajero' })).toBeInTheDocument();
      });

      it('switches straight to the neighbouring group when the cursor is not heading to the open menu', async () => {
        const user = userEvent.setup();
        await collapse(user);
        stubPanelRect({ left: 90, top: 100, bottom: 260 });

        fireEvent.mouseEnter(trigger('Gestión de mensajeros'));
        fireEvent.mouseMove(trigger('Gestión de mensajeros'), { clientX: 40, clientY: 100 });
        await screen.findByRole('menuitem', { name: 'Crear mensajero' });

        fireEvent.mouseMove(trigger('Gestión de administradores'), { clientX: 45, clientY: 150 });
        fireEvent.mouseEnter(trigger('Gestión de administradores'));

        expect(await screen.findByRole('menuitem', { name: 'Crear administrador' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Crear mensajero' })).not.toBeInTheDocument();
      });

      it('does not open the neighbouring group while the cursor travels diagonally to the open menu', async () => {
        const user = userEvent.setup();
        await collapse(user);
        stubPanelRect({ left: 90, top: 100, bottom: 260 });

        fireEvent.mouseEnter(trigger('Gestión de mensajeros'));
        fireEvent.mouseMove(trigger('Gestión de mensajeros'), { clientX: 40, clientY: 100 });
        await screen.findByRole('menuitem', { name: 'Crear mensajero' });

        // Pasa por encima de "Administradores" yendo en diagonal hacia el menú de Mensajeros.
        fireEvent.mouseMove(trigger('Gestión de administradores'), { clientX: 70, clientY: 150 });
        fireEvent.mouseEnter(trigger('Gestión de administradores'));
        fireEvent.mouseLeave(trigger('Gestión de administradores'));
        const menu = screen.getByRole('menuitem', { name: 'Desactivar mensajero' });
        fireEvent.mouseEnter(menu.closest('[class*="MuiPopper"]').firstElementChild);

        await new Promise((resolve) => setTimeout(resolve, 450));
        expect(screen.getByRole('menuitem', { name: 'Desactivar mensajero' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Crear administrador' })).not.toBeInTheDocument();
      });
    });
  });
});

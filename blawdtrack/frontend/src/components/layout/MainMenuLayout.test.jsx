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
      <Route path={ROUTES.MODULE_SETTINGS} element={<div>settings content</div>} />
    </Route>
  </Routes>
);

const sidebar = () => screen.getByRole('complementary');
// El sidebar lleva montadas las dos versiones del logo; solo una se ve a la vez.
const visibleLogos = (bar) =>
  bar.getAllByAltText('BlawdTrack').filter((logo) => {
    try {
      expect(logo).toBeVisible();
      return true;
    } catch {
      return false;
    }
  });
// Los grupos del menú arrancan cerrados: hay que abrirlos para llegar a sus enlaces.
const openGroup = (user, name) => user.click(within(sidebar()).getByRole('button', { name }));

describe('MainMenuLayout sidebar', () => {
  afterEach(() => localStorage.clear());

  it('renders the two module titles, with mensajeros and administradores inside Gestión de usuarios', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    ['Gestión de usuarios', 'Importación de paquetes'].forEach((title) =>
      expect(bar.getByRole('button', { name: title })).toBeInTheDocument()
    );
    expect(bar.queryByRole('button', { name: 'Seguridad y acceso' })).not.toBeInTheDocument();
    ['Mensajeros', 'Administradores'].forEach((title) =>
      expect(bar.queryByRole('button', { name: title })).not.toBeInTheDocument()
    );
    expect(bar.queryByRole('button', { name: 'Roles y permisos' })).not.toBeInTheDocument();
  });

  it('holds Mensajeros and Administradores inside Gestión de usuarios as sections that start closed and open from their title', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());

    // Cerrado el grupo, no se ve ninguna sección; abierto, aparecen las dos pero sin sus funciones.
    expect(bar.queryByRole('button', { name: 'Mensajeros' })).not.toBeInTheDocument();
    await openGroup(user, 'Gestión de usuarios');
    const mensajeros = bar.getByRole('button', { name: 'Mensajeros' });
    const administradores = bar.getByRole('button', { name: 'Administradores' });
    expect(mensajeros).toHaveAttribute('aria-expanded', 'false');
    expect(administradores).toHaveAttribute('aria-expanded', 'false');
    expect(bar.queryByRole('link', { name: /Crear mensajero/ })).not.toBeInTheDocument();
    expect(bar.queryByRole('link', { name: /Crear administrador/ })).not.toBeInTheDocument();

    // Cada sección se abre y se cierra por separado.
    await user.click(mensajeros);
    expect(mensajeros).toHaveAttribute('aria-expanded', 'true');
    expect(bar.getByRole('link', { name: /Crear mensajero/ })).toBeInTheDocument();
    expect(bar.queryByRole('link', { name: /Crear administrador/ })).not.toBeInTheDocument();

    await user.click(administradores);
    expect(bar.getByRole('link', { name: /Crear administrador/ })).toBeInTheDocument();
    expect(mensajeros.compareDocumentPosition(administradores)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    await user.click(mensajeros);
    expect(mensajeros).toHaveAttribute('aria-expanded', 'false');
    // El pliegue se anima: el contenido deja de ser accesible al terminar.
    await waitFor(() => expect(bar.queryByRole('link', { name: /Crear mensajero/ })).not.toBeInTheDocument());
    expect(bar.getByRole('link', { name: /Crear administrador/ })).toBeInTheDocument();
  });

  it('shows the functions of the expanded sidebar without icons, so the hierarchy is told by indentation and color', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());

    await openGroup(user, 'Gestión de usuarios');
    await openGroup(user, 'Mensajeros');
    await openGroup(user, 'Administradores');

    ['Crear mensajero', 'Actualizar mensajero', 'Crear administrador', 'Roles y permisos'].forEach((name) =>
      expect(bar.getByRole('link', { name }).querySelector('svg')).toBeNull()
    );
  });

  it('writes the menu titles in cream white and everything under them in gray', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    const CREAM = 'rgb(250, 248, 245)';
    const GRAY = 'rgba(255, 255, 255, 0.65)';

    await openGroup(user, 'Gestión de usuarios');
    await openGroup(user, 'Mensajeros');

    expect(bar.getByRole('button', { name: 'Gestión de usuarios' })).toHaveStyle({ color: CREAM });
    expect(bar.getByRole('button', { name: 'Importación de paquetes' })).toHaveStyle({ color: CREAM });
    // Se mide el submenú que no se pulsó: el cursor sobre el pulsado lo pondría crema por el hover.
    expect(bar.getByRole('button', { name: 'Administradores' })).toHaveStyle({ color: GRAY });
    expect(within(bar.getByRole('link', { name: 'Crear mensajero' })).getByText('Crear mensajero')).toHaveStyle({ color: GRAY });
  });

  it('lists in the sidebar the same modules as the main menu, in its order, with the future ones disabled', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    const names = [
      'Importación de paquetes',
      'Gestión de paquetes',
      'Asignación y seguimiento',
      'Gestión de usuarios',
      'Reportes y notificaciones',
      'Operación de mensajero',
    ];
    const items = names.map((name) => bar.getByRole('button', { name }));

    items.slice(1).forEach((item, index) =>
      expect(items[index].compareDocumentPosition(item)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    );
    ['Gestión de paquetes', 'Asignación y seguimiento', 'Reportes y notificaciones', 'Operación de mensajero'].forEach((name) =>
      expect(bar.getByRole('button', { name })).toHaveAttribute('aria-disabled', 'true')
    );
    expect(bar.getByRole('button', { name: 'Gestión de usuarios' })).not.toHaveAttribute('aria-disabled');
  });

  it('says a future module is coming soon when the cursor is over it in the sidebar, and does not navigate', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());

    await user.hover(bar.getByRole('button', { name: 'Reportes y notificaciones' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Disponible próximamente');

    await user.click(bar.getByRole('button', { name: 'Reportes y notificaciones' }));
    expect(screen.getByText('menu content')).toBeInTheDocument();
  });

  it('keeps the future modules in the collapsed sidebar, each with the coming-soon notice', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    await user.click(within(sidebar()).getByRole('button', { name: 'Colapsar menú' }));

    const future = within(sidebar()).getByRole('button', { name: 'Asignación y seguimiento' });
    expect(future).toHaveAttribute('aria-disabled', 'true');
    await user.hover(future);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Disponible próximamente');
  });

  it('shows the packages group with "Importar paquetes" to the super user', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

    await openGroup(user, 'Importación de paquetes');

    expect(within(sidebar()).getByRole('link', { name: /Importar paquetes/ })).toHaveAttribute(
      'href',
      ROUTES.PACKAGE_IMPORT
    );
    expect(within(sidebar()).queryByRole('link', { name: /Detectar duplicados/ })).not.toBeInTheDocument();
  });

  it('gives the sales admin the same sidebar, but only with packages and their own password reset', async () => {
    const user = userEvent.setup();
    const salesAdmin = { ...superUser, id: 2, fullName: 'Vera Ventas', role: 'ADMIN_VENTAS' };
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: salesAdmin });
    const bar = within(sidebar());

    expect(bar.getByRole('button', { name: 'Importación de paquetes' })).toBeInTheDocument();
    expect(bar.getByRole('link', { name: 'Ajustes' })).toHaveAttribute('href', ROUTES.MODULE_SETTINGS);
    expect(bar.queryByRole('button', { name: 'Gestión de usuarios' })).not.toBeInTheDocument();
    expect(bar.getByText('Administrador de Ventas')).toBeInTheDocument();

    await openGroup(user, 'Importación de paquetes');
    expect(bar.getByRole('link', { name: /Importar paquetes/ })).toBeInTheDocument();
    expect(bar.queryByRole('link', { name: /Roles y permisos/ })).not.toBeInTheDocument();
  });

  it('has a settings gear at the bottom of the sidebar, above the user, that goes to the settings menu', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());

    const gear = bar.getByRole('link', { name: 'Ajustes' });
    expect(gear).toHaveAttribute('href', ROUTES.MODULE_SETTINGS);
    // Va después de los grupos y antes del usuario.
    expect(bar.getByRole('button', { name: 'Importación de paquetes' }).compareDocumentPosition(gear)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(gear.compareDocumentPosition(bar.getByRole('button', { name: /cerrar sesión/i }))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    await user.click(gear);
    expect(screen.getByText('settings content')).toBeInTheDocument();
  });

  it('keeps the settings gear when the sidebar is collapsed', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });

    await user.click(within(sidebar()).getByRole('button', { name: 'Colapsar menú' }));

    expect(within(sidebar()).getByRole('link', { name: 'Ajustes' })).toHaveAttribute('href', ROUTES.MODULE_SETTINGS);
  });

  it('does not show a login entry nor any HU label', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    expect(within(sidebar()).queryByText(/iniciar sesión/i)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/HU-?\d+/i);
  });

  it('shows the brand logo with the collapse button next to it and no "Blawd Gourmet" caption', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    expect(visibleLogos(bar)).toHaveLength(1);
    expect(bar.getByRole('button', { name: 'Colapsar menú' })).toBeInTheDocument();
    expect(bar.queryByText('Blawd Gourmet')).not.toBeInTheDocument();
  });

  it('keeps both versions of the logo mounted and only swaps which one is visible when the sidebar collapses and expands', async () => {
    const user = userEvent.setup();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    const bar = within(sidebar());
    // Dos versiones (horizontal e isologo) siempre en el DOM: cambiar no monta ni decodifica una imagen nueva.
    const mounted = bar.getAllByAltText('BlawdTrack');
    expect(mounted).toHaveLength(2);
    const [expandedLogo] = visibleLogos(bar);

    await user.click(bar.getByRole('button', { name: 'Colapsar menú' }));
    const [collapsedLogo] = visibleLogos(bar);
    expect(visibleLogos(bar)).toHaveLength(1);
    expect(collapsedLogo).not.toBe(expandedLogo);
    expect(bar.getAllByAltText('BlawdTrack')).toEqual(mounted);

    await user.click(bar.getByRole('button', { name: 'Expandir menú' }));
    expect(visibleLogos(bar)).toEqual([expandedLogo]);
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

    await openGroup(user, 'Gestión de usuarios');
    await openGroup(user, 'Mensajeros');
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
    await openGroup(user, 'Gestión de usuarios');
    await openGroup(user, 'Mensajeros');
    await openGroup(user, 'Administradores');

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
    const groupButton = bar.getByRole('button', { name: 'Gestión de usuarios' });

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
      ['Gestión de usuarios', 'Importación de paquetes'].forEach((name) =>
        expect(bar.getByRole('button', { name })).toBeInTheDocument()
      );
      expect(bar.queryByRole('link', { name: 'Crear mensajero' })).not.toBeInTheDocument();
      expect(bar.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
      expect(localStorage.getItem('blawdtrack.sidebarCollapsed')).toBe('true');

      await user.click(bar.getByRole('button', { name: 'Gestión de usuarios' }));
      await user.click(await screen.findByRole('menuitem', { name: 'Mensajeros' }));
      await user.click(await screen.findByRole('menuitem', { name: 'Crear mensajero' }));
      expect(screen.getByText('create courier content')).toBeInTheDocument();

      // Roles y permisos es una función propia del grupo: sale en el primer cuadro, junto a las dos filas de submenú.
      await user.click(bar.getByRole('button', { name: 'Gestión de usuarios' }));
      expect(await screen.findByRole('menuitem', { name: 'Roles y permisos' })).toBeInTheDocument();
      await user.keyboard('{Escape}');

      await user.click(bar.getByRole('button', { name: 'Expandir menú' }));
      expect(within(sidebar()).getByRole('button', { name: 'Colapsar menú' })).toBeInTheDocument();
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

        await user.hover(trigger('Gestión de usuarios'));
        expect(await screen.findByRole('menuitem', { name: 'Mensajeros' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Administradores' })).toBeInTheDocument();

        await user.unhover(trigger('Gestión de usuarios'));
        await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Mensajeros' })).not.toBeInTheDocument());
      });

      it('keeps the menu open while the cursor is inside it', async () => {
        const user = userEvent.setup();
        await collapse(user);

        await user.hover(trigger('Gestión de usuarios'));
        const item = await screen.findByRole('menuitem', { name: 'Mensajeros' });
        await user.unhover(trigger('Gestión de usuarios'));
        await user.hover(item);

        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(screen.getByRole('menuitem', { name: 'Mensajeros' })).toBeInTheDocument();
      });

      it('opens the functions of Mensajeros or Administradores in a second box next to the hovered row', async () => {
        const user = userEvent.setup();
        await collapse(user);

        await user.hover(trigger('Gestión de usuarios'));
        await user.hover(await screen.findByRole('menuitem', { name: 'Mensajeros' }));
        ['Crear mensajero', 'Actualizar mensajero', 'Desactivar mensajero'].forEach((name) =>
          expect(screen.getByRole('menuitem', { name })).toBeInTheDocument()
        );
        expect(screen.queryByRole('menuitem', { name: 'Crear administrador' })).not.toBeInTheDocument();

        await user.hover(screen.getByRole('menuitem', { name: 'Administradores' }));
        expect(await screen.findByRole('menuitem', { name: 'Crear administrador' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Eliminar administrador' })).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Crear mensajero' })).not.toBeInTheDocument());
      });

      it('keeps both boxes open while the cursor is inside the second one and navigates from it', async () => {
        const user = userEvent.setup();
        await collapse(user);

        await user.hover(trigger('Gestión de usuarios'));
        await user.hover(await screen.findByRole('menuitem', { name: 'Administradores' }));
        const create = await screen.findByRole('menuitem', { name: 'Crear administrador' });
        await user.hover(create);

        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(screen.getByRole('menuitem', { name: 'Administradores' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Crear administrador' })).toBeInTheDocument();

        await user.click(create);
        expect(screen.getByText('create admin content')).toBeInTheDocument();
      });

      it('does not jump to the other row while the cursor travels diagonally to the second box', async () => {
        const user = userEvent.setup();
        await collapse(user);
        await user.hover(trigger('Gestión de usuarios'));
        const mensajeros = await screen.findByRole('menuitem', { name: 'Mensajeros' });
        const administradores = screen.getByRole('menuitem', { name: 'Administradores' });

        fireEvent.mouseEnter(mensajeros);
        fireEvent.mouseMove(mensajeros, { clientX: 150, clientY: 100 });
        await screen.findByRole('menuitem', { name: 'Crear mensajero' });
        stubPanelRect({ left: 300, top: 100, bottom: 260 });

        // Cruza la fila "Administradores" yendo en diagonal hacia el cuadro de Mensajeros.
        fireEvent.mouseMove(administradores, { clientX: 250, clientY: 150 });
        fireEvent.mouseEnter(administradores);
        fireEvent.mouseLeave(administradores);
        const secondBox = screen.getByRole('menuitem', { name: 'Crear mensajero' }).closest('[class*="MuiPopper"]').firstElementChild;
        fireEvent.mouseEnter(secondBox);

        await new Promise((resolve) => setTimeout(resolve, 450));
        expect(screen.getByRole('menuitem', { name: 'Crear mensajero' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Crear administrador' })).not.toBeInTheDocument();
      });

      it('switches straight to the neighbouring group when the cursor is not heading to the open menu', async () => {
        const user = userEvent.setup();
        await collapse(user);
        stubPanelRect({ left: 90, top: 100, bottom: 260 });

        fireEvent.mouseEnter(trigger('Gestión de usuarios'));
        fireEvent.mouseMove(trigger('Gestión de usuarios'), { clientX: 40, clientY: 100 });
        await screen.findByRole('menuitem', { name: 'Mensajeros' });

        fireEvent.mouseMove(trigger('Importación de paquetes'), { clientX: 45, clientY: 150 });
        fireEvent.mouseEnter(trigger('Importación de paquetes'));

        expect(await screen.findByRole('menuitem', { name: 'Importar paquetes' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Mensajeros' })).not.toBeInTheDocument();
      });

      it('does not open the neighbouring group while the cursor travels diagonally to the open menu', async () => {
        const user = userEvent.setup();
        await collapse(user);
        stubPanelRect({ left: 90, top: 100, bottom: 260 });

        fireEvent.mouseEnter(trigger('Gestión de usuarios'));
        fireEvent.mouseMove(trigger('Gestión de usuarios'), { clientX: 40, clientY: 100 });
        await screen.findByRole('menuitem', { name: 'Mensajeros' });

        // Pasa por encima de "Paquetes" yendo en diagonal hacia el menú de Usuarios.
        fireEvent.mouseMove(trigger('Importación de paquetes'), { clientX: 70, clientY: 150 });
        fireEvent.mouseEnter(trigger('Importación de paquetes'));
        fireEvent.mouseLeave(trigger('Importación de paquetes'));
        const menu = screen.getByRole('menuitem', { name: 'Mensajeros' });
        fireEvent.mouseEnter(menu.closest('[class*="MuiPopper"]').firstElementChild);

        await new Promise((resolve) => setTimeout(resolve, 450));
        expect(screen.getByRole('menuitem', { name: 'Mensajeros' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Importar paquetes' })).not.toBeInTheDocument();
      });
    });
  });
});

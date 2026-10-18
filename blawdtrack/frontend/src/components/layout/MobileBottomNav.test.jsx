import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import { renderWithProviders } from '../../test-utils';
import { NAVIGATION_GROUPS, SETTINGS_MENU } from '../../config/navigation';
import { ROUTES } from '../../config/routes';

function LocationProbe() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

const renderNav = (route) =>
  renderWithProviders(
    <>
      <MobileBottomNav groups={NAVIGATION_GROUPS} settings={SETTINGS_MENU} />
      <LocationProbe />
    </>,
    { route }
  );

const tab = (label) => screen.getByText(label);
const ORANGE = 'rgb(194, 81, 0)';

describe('MobileBottomNav', () => {
  it('renders one tab per group and a last one for Ajustes', () => {
    renderNav(ROUTES.MAIN_MENU);
    ['Usuarios', 'Importación', 'Ajustes'].forEach((label) => expect(tab(label)).toBeInTheDocument());
    expect(screen.queryByText('Acceso')).not.toBeInTheDocument();
  });

  it('highlights only the tab of the current module', () => {
    renderNav(ROUTES.COURIER_DEACTIVATE);
    expect(tab('Usuarios')).toHaveStyle({ color: ORANGE });
    expect(tab('Importación')).not.toHaveStyle({ color: ORANGE });
    expect(tab('Ajustes')).not.toHaveStyle({ color: ORANGE });
  });

  it('highlights nothing on the main menu', () => {
    renderNav(ROUTES.MAIN_MENU);
    ['Usuarios', 'Importación', 'Ajustes'].forEach((label) =>
      expect(tab(label)).not.toHaveStyle({ color: ORANGE })
    );
  });

  it('navigates to the menu of each module, and straight to the screen of a single-screen one', async () => {
    const user = userEvent.setup();
    renderNav(ROUTES.MAIN_MENU);

    await user.click(tab('Usuarios'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.MODULE_USERS);

    await user.click(tab('Importación'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.PACKAGE_IMPORT);

    await user.click(tab('Ajustes'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.MODULE_SETTINGS);
  });

  it('highlights Usuarios on the module menu itself and on the menus of its submenus', () => {
    [ROUTES.MODULE_USERS, ROUTES.MODULE_COURIERS, ROUTES.MODULE_ADMINS].forEach((route) => {
      const { unmount } = renderNav(route);
      expect(tab('Usuarios')).toHaveStyle({ color: ORANGE });
      unmount();
    });
  });

  it('highlights Usuarios on the roles & permissions screen, now part of Gestión de usuarios', () => {
    renderNav(ROUTES.ROLES_PERMISSIONS);
    expect(tab('Usuarios')).toHaveStyle({ color: ORANGE });
    expect(tab('Ajustes')).not.toHaveStyle({ color: ORANGE });
  });

  it('highlights Ajustes on its menu and on the password reset screen', () => {
    [ROUTES.MODULE_SETTINGS, ROUTES.PASSWORD_RESET_OWN].forEach((route) => {
      const { unmount } = renderNav(route);
      expect(tab('Ajustes')).toHaveStyle({ color: ORANGE });
      unmount();
    });
  });

  it('has no Ajustes tab for a role without settings', () => {
    renderWithProviders(<MobileBottomNav groups={NAVIGATION_GROUPS} />, { route: ROUTES.MAIN_MENU });
    expect(screen.queryByText('Ajustes')).not.toBeInTheDocument();
  });
});

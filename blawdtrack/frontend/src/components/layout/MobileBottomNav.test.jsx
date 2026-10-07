import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import { renderWithProviders } from '../../test-utils';
import { NAVIGATION_GROUPS } from '../../config/navigation';
import { ROUTES } from '../../config/routes';

function LocationProbe() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

const renderNav = (route) =>
  renderWithProviders(
    <>
      <MobileBottomNav groups={NAVIGATION_GROUPS} />
      <LocationProbe />
    </>,
    { route }
  );

const tab = (label) => screen.getByText(label);
const ORANGE = 'rgb(255, 108, 14)';

describe('MobileBottomNav', () => {
  it('renders one tab per group', () => {
    renderNav(ROUTES.MAIN_MENU);
    ['Mensajeros', 'Admins', 'Acceso'].forEach((label) => expect(tab(label)).toBeInTheDocument());
  });

  it('highlights only the tab of the current module', () => {
    renderNav(ROUTES.COURIER_DEACTIVATE);
    expect(tab('Mensajeros')).toHaveStyle({ color: ORANGE });
    expect(tab('Admins')).not.toHaveStyle({ color: ORANGE });
    expect(tab('Acceso')).not.toHaveStyle({ color: ORANGE });
  });

  it('highlights nothing on the main menu', () => {
    renderNav(ROUTES.MAIN_MENU);
    ['Mensajeros', 'Admins', 'Acceso'].forEach((label) =>
      expect(tab(label)).not.toHaveStyle({ color: ORANGE })
    );
  });

  it('navigates to the first available screen of each module', async () => {
    const user = userEvent.setup();
    renderNav(ROUTES.MAIN_MENU);

    await user.click(tab('Mensajeros'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.COURIER_CREATE);

    await user.click(tab('Admins'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.ADMIN_CREATE);

    await user.click(tab('Acceso'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.PASSWORD_RESET_OWN);
  });

  it('highlights Acceso on the roles & permissions screen, now part of Seguridad y acceso', () => {
    renderNav(ROUTES.ROLES_PERMISSIONS);
    expect(tab('Acceso')).toHaveStyle({ color: ORANGE });
    expect(tab('Mensajeros')).not.toHaveStyle({ color: ORANGE });
  });
});

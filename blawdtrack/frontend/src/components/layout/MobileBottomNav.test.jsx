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
const square = (label) => tab(label).previousSibling;
const ORANGE = 'rgb(255, 108, 14)';

describe('MobileBottomNav', () => {
  it('renders one tab per group with the mockup labels', () => {
    renderNav(ROUTES.MAIN_MENU);
    ['Acceso', 'Mensajeros', 'Admins', 'Permisos'].forEach((label) => expect(tab(label)).toBeInTheDocument());
  });

  it('highlights only the tab of the current module', () => {
    renderNav(ROUTES.COURIER_DEACTIVATE);
    expect(square('Mensajeros')).toHaveStyle({ backgroundColor: ORANGE });
    expect(square('Admins')).not.toHaveStyle({ backgroundColor: ORANGE });
    expect(square('Acceso')).not.toHaveStyle({ backgroundColor: ORANGE });
    expect(tab('Mensajeros')).toHaveStyle({ color: ORANGE });
  });

  it('highlights nothing on the main menu', () => {
    renderNav(ROUTES.MAIN_MENU);
    ['Acceso', 'Mensajeros', 'Admins', 'Permisos'].forEach((label) =>
      expect(square(label)).not.toHaveStyle({ backgroundColor: ORANGE })
    );
  });

  it('navigates to the first available screen of each module', async () => {
    const user = userEvent.setup();
    renderNav(ROUTES.MAIN_MENU);

    await user.click(tab('Mensajeros'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.COURIER_CREATE);

    await user.click(tab('Admins'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.ADMIN_DELETE);

    await user.click(tab('Acceso'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.PASSWORD_RECOVERY);
  });

  it('does nothing when the module has no built screens (Permisos)', async () => {
    const user = userEvent.setup();
    renderNav(ROUTES.MAIN_MENU);
    await user.click(tab('Permisos'));
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.MAIN_MENU);
  });
});

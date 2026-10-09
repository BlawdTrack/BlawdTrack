import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { ProvisionalHomePage } from './ProvisionalHomePage';
import { renderWithProviders } from '../test-utils';
import { ROUTES } from '../config/routes';

function LocationProbe() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

const renderHome = (role) =>
  renderWithProviders(
    <>
      <ProvisionalHomePage title="Inicio" description="Provisional" />
      <LocationProbe />
    </>,
    { user: { id: 9, fullName: 'Usuario Prueba', email: 'prueba@blawdgourmet.com', role }, route: '/inicio' }
  );

describe('ProvisionalHomePage (restablecer contraseña desde el inicio)', () => {
  afterEach(() => cleanup());

  it.each([
    ['ADMIN_VENTAS', ROUTES.SALES_PASSWORD_RESET],
    ['MENSAJERO', ROUTES.COURIER_PASSWORD_RESET],
  ])('el rol %s llega a restablecer su propia contraseña', async (role, expectedRoute) => {
    const user = userEvent.setup();
    renderHome(role);

    await user.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

    expect(screen.getByTestId('path')).toHaveTextContent(expectedRoute);
  });

  it('con un rol desconocido no ofrece restablecer contraseña', () => {
    renderHome('ROL_QUE_NO_EXISTE');

    expect(screen.queryByRole('button', { name: 'Restablecer contraseña' })).toBeNull();
  });
});

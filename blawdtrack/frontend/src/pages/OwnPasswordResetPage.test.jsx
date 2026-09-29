import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { OwnPasswordResetPage } from './OwnPasswordResetPage';
import { requestOwnPasswordReset } from '../services/PasswordRecoveryService';
import { renderWithProviders } from '../test-utils';
import { ROUTES } from '../config/routes';

vi.mock('../services/PasswordRecoveryService', () => ({ requestOwnPasswordReset: vi.fn() }));

const USERS = {
  SUPER_USUARIO: { id: 1, fullName: 'Alicia Admin', email: 'alicia@blawdgourmet.com', role: 'SUPER_USUARIO' },
  ADMIN_VENTAS: { id: 2, fullName: 'Vera Ventas', email: 'vera@blawdgourmet.com', role: 'ADMIN_VENTAS' },
  MENSAJERO: { id: 3, fullName: 'Marco Mensajero', email: 'marco@blawdgourmet.com', role: 'MENSAJERO' },
};

function LocationProbe() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

const renderPage = (user) =>
  renderWithProviders(
    <>
      <OwnPasswordResetPage />
      <LocationProbe />
    </>,
    { user, route: '/restablecer' }
  );

describe('OwnPasswordResetPage (restablecer la propia contraseña)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it.each(Object.values(USERS))('muestra el correo de la propia cuenta y no pide ninguno ($role)', (user) => {
    renderPage(user);

    expect(screen.getByText(user.email)).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('button', { name: 'Enviarme el enlace' })).toBeTruthy();
  });

  it('envía el enlace sin indicar ningún correo y confirma que revise su bandeja', async () => {
    requestOwnPasswordReset.mockResolvedValue({ message: 'ok' });
    const user = userEvent.setup();
    renderPage(USERS.MENSAJERO);

    await user.click(screen.getByRole('button', { name: 'Enviarme el enlace' }));

    await waitFor(() => expect(requestOwnPasswordReset).toHaveBeenCalledTimes(1));
    expect(requestOwnPasswordReset).toHaveBeenCalledWith();
    expect((await screen.findByRole('status')).textContent).toContain('marco@blawdgourmet.com');
    expect(screen.getByRole('button', { name: 'Enviar de nuevo' })).toBeTruthy();
  });

  it('si el servidor no pudo enviar el correo muestra el motivo y no dice que se envió', async () => {
    requestOwnPasswordReset.mockRejectedValue({
      response: { status: 503, data: { code: 'CORREO_NO_ENVIADO', message: 'No se pudo enviar el correo de restablecimiento.' } },
    });
    const user = userEvent.setup();
    renderPage(USERS.SUPER_USUARIO);

    await user.click(screen.getByRole('button', { name: 'Enviarme el enlace' }));

    expect((await screen.findByRole('alert')).textContent).toContain('No se pudo enviar el correo');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('sin respuesta del servidor muestra el error de conexión', async () => {
    requestOwnPasswordReset.mockRejectedValue(new Error('Network Error'));
    const user = userEvent.setup();
    renderPage(USERS.ADMIN_VENTAS);

    await user.click(screen.getByRole('button', { name: 'Enviarme el enlace' }));

    expect((await screen.findByRole('alert')).textContent).toContain('No se pudo conectar');
  });

  it.each([
    ['SUPER_USUARIO', ROUTES.MAIN_MENU],
    ['ADMIN_VENTAS', ROUTES.SALES_HOME],
    ['MENSAJERO', ROUTES.COURIER_HOME],
  ])('Volver lleva al inicio del rol %s', async (role, home) => {
    const user = userEvent.setup();
    renderPage(USERS[role]);

    await user.click(screen.getByRole('button', { name: 'Volver' }));

    expect(screen.getByTestId('path')).toHaveTextContent(home);
  });
});

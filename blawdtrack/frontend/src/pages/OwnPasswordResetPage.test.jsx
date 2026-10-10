import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OwnPasswordResetPage } from './OwnPasswordResetPage';
import { requestOwnPasswordReset } from '../services/PasswordRecoveryService';
import { renderWithProviders } from '../test-utils';

vi.mock('../services/PasswordRecoveryService', () => ({ requestOwnPasswordReset: vi.fn() }));

const USERS = {
  SUPER_USUARIO: { id: 1, fullName: 'Alicia Admin', email: 'alicia@blawdgourmet.com', role: 'SUPER_USUARIO' },
  ADMIN_VENTAS: { id: 2, fullName: 'Vera Ventas', email: 'vera@blawdgourmet.com', role: 'ADMIN_VENTAS' },
  MENSAJERO: { id: 3, fullName: 'Marco Mensajero', email: 'marco@blawdgourmet.com', role: 'MENSAJERO' },
};

const renderPage = (user) => renderWithProviders(<OwnPasswordResetPage />, { user, route: '/restablecer' });

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

  it('tiene un solo botón de acción (enviar el enlace) más el icono de ayuda del correo', () => {
    renderPage(USERS.MENSAJERO);

    expect(screen.getByRole('button', { name: 'Enviarme el enlace' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '¿Cuánto tarda en llegar el correo?' })).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Volver' })).toBeNull();
  });

  it('tras enviar bloquea "Enviar de nuevo" y muestra la espera con el tiempo restante', async () => {
    requestOwnPasswordReset.mockResolvedValue({ message: 'ok' });
    const user = userEvent.setup();
    renderPage(USERS.MENSAJERO);

    await user.click(screen.getByRole('button', { name: 'Enviarme el enlace' }));

    expect((await screen.findByRole('button', { name: 'Enviar de nuevo' })).disabled).toBe(true);
    expect(screen.getByText('Enviando el correo…')).toBeTruthy();
    expect(screen.getByText('2:00')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });
});

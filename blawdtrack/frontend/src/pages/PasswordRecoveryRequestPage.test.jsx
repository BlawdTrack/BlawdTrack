import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordRecoveryRequestPage from './PasswordRecoveryRequestPage';
import { requestPasswordReset } from '../services/PasswordRecoveryService';

vi.mock('../services/PasswordRecoveryService', () => ({ requestPasswordReset: vi.fn() }));

const fillAndSubmit = async (user, email) => {
  const input = screen.getByLabelText(/correo electrónico registrado/i);
  await user.clear(input);
  if (email) await user.type(input, email);
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
};

describe('PasswordRecoveryRequestPage (HU-002 T04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el formulario de solicitud', () => {
    render(<PasswordRecoveryRequestPage />);
    expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar enlace' })).toBeInTheDocument();
  });

  it('con el correo vacío muestra el error y no llama al servicio', async () => {
    const user = userEvent.setup();
    render(<PasswordRecoveryRequestPage />);

    await fillAndSubmit(user, '');

    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeInTheDocument();
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it('con un formato inválido muestra el error y no llama al servicio', async () => {
    const user = userEvent.setup();
    render(<PasswordRecoveryRequestPage />);

    await fillAndSubmit(user, 'no-es-correo');

    expect(screen.getByText('Ingresa un correo electrónico con un formato válido.')).toBeInTheDocument();
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it('el error del campo desaparece al volver a escribir', async () => {
    const user = userEvent.setup();
    render(<PasswordRecoveryRequestPage />);

    await fillAndSubmit(user, '');
    await user.type(screen.getByLabelText(/correo electrónico registrado/i), 'a');

    expect(screen.queryByText('El correo electrónico es obligatorio.')).not.toBeInTheDocument();
  });

  it('envía el correo sin espacios y muestra la confirmación condicional', async () => {
    requestPasswordReset.mockResolvedValue({ message: 'ok' });
    const user = userEvent.setup();
    render(<PasswordRecoveryRequestPage />);

    await fillAndSubmit(user, '  ana@blawd.com  ');

    expect(requestPasswordReset).toHaveBeenCalledWith('ana@blawd.com');
    expect(await screen.findByRole('heading', { name: 'Revisa tu correo' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Si ana@blawd.com está registrado y activo');
    // No afirma un envío ni un tiempo de expiración concreto.
    expect(screen.getByRole('status')).not.toHaveTextContent(/minutos|horas/i);
  });

  it('tras enviar bloquea "Enviar de nuevo" y muestra la espera con el tiempo restante', async () => {
    requestPasswordReset.mockResolvedValue({ message: 'ok' });
    const user = userEvent.setup();
    render(<PasswordRecoveryRequestPage />);

    await fillAndSubmit(user, 'ana@blawd.com');

    expect((await screen.findByRole('button', { name: 'Enviar de nuevo' })).disabled).toBe(true);
    expect(screen.getByText('Enviando el correo…')).toBeInTheDocument();
    expect(screen.getByText('2:00')).toBeInTheDocument();
    expect(requestPasswordReset).toHaveBeenCalledTimes(1);
  });

  it('"Usar otro correo" vuelve al formulario conservando lo escrito', async () => {
    requestPasswordReset.mockResolvedValue({});
    const user = userEvent.setup();
    render(<PasswordRecoveryRequestPage />);
    await fillAndSubmit(user, 'ana@blawd.com');

    await user.click(await screen.findByRole('button', { name: 'Usar otro correo' }));

    expect(screen.getByLabelText(/correo electrónico registrado/i)).toHaveValue('ana@blawd.com');
  });

  it('un error con respuesta del servidor muestra el texto genérico, no el mensaje crudo', async () => {
    requestPasswordReset.mockRejectedValue({ response: { status: 500, data: { message: 'Internal error' } } });
    const user = userEvent.setup();
    render(<PasswordRecoveryRequestPage />);

    await fillAndSubmit(user, 'ana@blawd.com');

    expect(await screen.findByText(/No se pudo procesar la solicitud/)).toBeInTheDocument();
    expect(screen.queryByText('Internal error')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Revisa tu correo' })).not.toBeInTheDocument();
  });

  it('sin respuesta del servidor muestra el aviso de conexión', async () => {
    requestPasswordReset.mockRejectedValue(new Error('Network Error'));
    const user = userEvent.setup();
    render(<PasswordRecoveryRequestPage />);

    await fillAndSubmit(user, 'ana@blawd.com');

    expect(await screen.findByText(/No pudimos conectar con el servidor/)).toBeInTheDocument();
  });

  it('"Volver a iniciar sesión" llama al callback', async () => {
    const onBackToLogin = vi.fn();
    const user = userEvent.setup();
    render(<PasswordRecoveryRequestPage onBackToLogin={onBackToLogin} />);

    await user.click(screen.getByRole('button', { name: 'Volver a iniciar sesión' }));

    await waitFor(() => expect(onBackToLogin).toHaveBeenCalledTimes(1));
  });
});

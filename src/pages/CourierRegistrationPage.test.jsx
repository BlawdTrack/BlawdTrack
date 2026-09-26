import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourierRegistrationPage } from './CourierRegistrationPage';
import { registerCourier } from '../services/CourierService';

vi.mock('../services/CourierService', () => ({ registerCourier: vi.fn() }));

const httpError = (status, data) => ({ response: { status, data } });

async function pickTime(user, label, hour, period) {
  await user.click(screen.getByRole('textbox', { name: label }));
  const pick = (name, text) =>
    user.click(within(screen.getByRole('listbox', { name })).getAllByRole('option', { name: text })[0]);
  await pick(/: hora$/i, hour);
  await pick(/: am o pm$/i, period);
  await user.click(screen.getByRole('button', { name: 'Listo' }));
}

async function fillForm(user) {
  await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Lucía Bermúdez');
  await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@blawdgourmet.com');
  await user.type(screen.getByLabelText(/número de documento/i), '1-1204-0388');
  await pickTime(user, /hora de entrada/i, '08', 'am');
  await pickTime(user, /hora de salida/i, '04', 'pm');
  await user.click(screen.getByRole('textbox', { name: /capacidad máxima/i }));
  screen.getByRole('listbox', { name: /capacidad máxima/i }).focus();
  await user.keyboard('{ArrowDown>19/}');
  await user.click(screen.getByRole('button', { name: 'Listo' }));
}

const submit = (user) => user.click(screen.getByRole('button', { name: /registrar mensajero/i }));

describe('CourierRegistrationPage', () => {
  beforeEach(() => {
    registerCourier.mockReset();
  });

  it('shows the success message with the response email and clears the form', async () => {
    registerCourier.mockResolvedValue({ email: 'ana@blawdgourmet.com' });
    const user = userEvent.setup();
    render(<CourierRegistrationPage />);

    await fillForm(user);
    await submit(user);

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('ana@blawdgourmet.com');
    expect(status).toHaveTextContent('contraseña temporal');
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('');
    expect(registerCourier).toHaveBeenCalledWith(
      expect.objectContaining({ documentType: 'CEDULA', maxPackageWeightKg: 20, schedule: '8:00 am – 4:00 pm' })
    );
  });

  it('shows a duplicate email error inline and keeps the typed values', async () => {
    registerCourier.mockRejectedValue(
      httpError(409, { code: 'COURIER_CONFLICT', message: 'El correo ya está registrado' })
    );
    const user = userEvent.setup();
    render(<CourierRegistrationPage />);

    await fillForm(user);
    await submit(user);

    expect(await screen.findByText('Este correo electrónico ya está registrado.')).toBeInTheDocument();
    const email = screen.getByLabelText(/correo electrónico/i);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveValue('ana@blawdgourmet.com');
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Ana Lucía Bermúdez');
  });

  it('shows a global alert when there is no connection', async () => {
    registerCourier.mockRejectedValue(new Error('Network Error'));
    const user = userEvent.setup();
    render(<CourierRegistrationPage />);

    await fillForm(user);
    await submit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectar con el servidor');
  });
});

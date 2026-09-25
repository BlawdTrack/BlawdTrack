import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourierRegistrationPage } from './CourierRegistrationPage';
import { registerCourier } from '../services/CourierService';

vi.mock('../services/CourierService', () => ({ registerCourier: vi.fn() }));

const httpError = (status, data) => ({ response: { status, data } });

async function fillForm(user) {
  await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Lucía Bermúdez');
  await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@blawdgourmet.com');
  await user.type(screen.getByLabelText(/número de documento/i), '1-1204-0388');
  await user.type(screen.getByLabelText(/horario/i), '8:00 am – 4:00 pm');
  await user.type(screen.getByLabelText(/capacidad máxima/i), '20');
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
      expect.objectContaining({ documentType: 'CEDULA', maxPackageWeightKg: 20 })
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

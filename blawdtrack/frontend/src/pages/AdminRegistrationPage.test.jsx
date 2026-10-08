import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminRegistrationPage } from './AdminRegistrationPage';
import { registerAdministrator } from '../services/AdminService';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders, superUser } from '../test-utils';
import ModuleMenuPage from './ModuleMenuPage';
import { ROUTES } from '../config/routes';

vi.mock('../services/AdminService', () => ({ registerAdministrator: vi.fn() }));

const httpError = (status, data) => ({ response: { status, data } });

async function fillForm(user) {
  await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Lucía Bermúdez');
  await user.type(screen.getByLabelText(/número de documento/i), '1-1204-0388');
  await user.type(screen.getByLabelText(/teléfono/i), '8888-8888');
  await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@blawdgourmet.com');
  await user.type(screen.getByLabelText(/contraseña inicial/i), 'Clave1234');
}

const submit = (user) => user.click(screen.getByRole('button', { name: /registrar administrador/i }));

describe('AdminRegistrationPage', () => {
  beforeEach(() => {
    registerAdministrator.mockReset();
  });

  it('returns to the admins module menu with a success notice that names the email', async () => {
    registerAdministrator.mockResolvedValue({ correoElectronico: 'ana@blawdgourmet.com' });
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path={ROUTES.ADMIN_CREATE} element={<AdminRegistrationPage />} />
        <Route path={ROUTES.MODULE_ADMINS} element={<ModuleMenuPage groupId="admins" />} />
      </Routes>,
      { route: ROUTES.ADMIN_CREATE, user: superUser }
    );

    await fillForm(user);
    await submit(user);

    expect(await screen.findByRole('heading', { level: 1, name: 'Administradores' })).toBeInTheDocument();
    const notice = await screen.findByRole('status');
    expect(notice).toHaveTextContent('Administrador registrado correctamente');
    expect(notice).toHaveTextContent('ana@blawdgourmet.com');
    expect(registerAdministrator).toHaveBeenCalledWith({
      documentType: 'CEDULA',
      documentNumber: '1-1204-0388',
      nombreCompleto: 'Ana Lucía Bermúdez',
      numeroTelefono: '8888-8888',
      correoElectronico: 'ana@blawdgourmet.com',
      contrasenaInicial: 'Clave1234'
    });
  });

  it('lets the user reveal the initial password and shows only the rules that apply to it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminRegistrationPage />);

    const password = screen.getByLabelText(/contraseña inicial/i);
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /mostrar contraseña/i }));
    expect(password).toHaveAttribute('type', 'text');

    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.queryByText(/últimas 3 contraseñas/i)).not.toBeInTheDocument();
  });

  it('blocks the submit and shows inline errors when required fields are empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminRegistrationPage />);

    await submit(user);

    expect(registerAdministrator).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/nombre completo/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a duplicate document error inline and keeps the typed values', async () => {
    registerAdministrator.mockRejectedValue(
      httpError(409, { code: 'DOCUMENTO_DUPLICADO', message: 'El documento ya está registrado' })
    );
    const user = userEvent.setup();
    renderWithProviders(<AdminRegistrationPage />);

    await fillForm(user);
    await submit(user);

    expect(await screen.findByText('Este documento ya está registrado.')).toBeInTheDocument();
    const documentNumber = screen.getByLabelText(/número de documento/i);
    expect(documentNumber).toHaveAttribute('aria-invalid', 'true');
    expect(documentNumber).toHaveValue('1-1204-0388');
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Ana Lucía Bermúdez');
  });

  it('shows a duplicate email error inline', async () => {
    registerAdministrator.mockRejectedValue(
      httpError(409, { code: 'DUPLICATE_EMAIL', message: 'El correo ya está registrado' })
    );
    const user = userEvent.setup();
    renderWithProviders(<AdminRegistrationPage />);

    await fillForm(user);
    await submit(user);

    expect(await screen.findByText('Este correo electrónico ya está registrado.')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a global alert when there is no connection', async () => {
    registerAdministrator.mockRejectedValue(new Error('Network Error'));
    const user = userEvent.setup();
    renderWithProviders(<AdminRegistrationPage />);

    await fillForm(user);
    await submit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectar con el servidor');
  });
});

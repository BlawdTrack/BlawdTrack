import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AdminRegistrationPage } from './AdminRegistrationPage';
import { ROUTES } from '../config/routes';

describe('AdminRegistrationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows required errors and does not call onSubmit when empty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminRegistrationPage onSubmit={onSubmit} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /crear administrador/i }));

    expect(await screen.findAllByText('Requerido.')).toHaveLength(5);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Ningún campo puede quedar vacío.')).toBeInTheDocument();
  });

  it('calls onSubmit once with trimmed values when valid', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminRegistrationPage onSubmit={onSubmit} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/nombre completo/i), '  Rodrigo Castillo Pérez   ');
    const documentTypeSelect = screen.getByRole('combobox');
    await user.click(documentTypeSelect);
    await user.click(screen.getByRole('option', { name: /pasaporte/i }));
    await user.type(screen.getByLabelText(/número de documento/i), '  A12345678  ');
    await user.type(screen.getByLabelText(/correo electrónico/i), '  rodrigo@blawdgourmet.com  ');
    await user.type(screen.getByLabelText(/teléfono/i), '  8888-8888  ');
    await user.type(screen.getByLabelText(/contraseña inicial/i), '  contra123  ');
    await user.click(screen.getByRole('button', { name: /crear administrador/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      documentType: 'PASAPORTE',
      documentNumber: 'A12345678',
      fullName: 'Rodrigo Castillo Pérez',
      phone: '8888-8888',
      email: 'rodrigo@blawdgourmet.com',
      initialPassword: 'contra123',
    });
  });

  it('changes the document placeholder when the type changes and toggles password visibility', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminRegistrationPage />
      </MemoryRouter>
    );

    const documentNumber = screen.getByLabelText(/número de documento/i);
    expect(documentNumber).toHaveAttribute('placeholder', 'Ej. 1-2345-6789');

    const documentTypeSelect = screen.getByRole('combobox');
    await user.click(documentTypeSelect);
    await user.click(screen.getByRole('option', { name: /dimex/i }));
    expect(documentNumber).toHaveAttribute('placeholder', 'Ej. 155812345678');

    const passwordField = screen.getByLabelText(/contraseña inicial/i);
    expect(passwordField).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /mostrar contraseña/i }));
    expect(passwordField).toHaveAttribute('type', 'text');
  });

  it('shows the submitting state and disables the submit button', async () => {
    render(
      <MemoryRouter>
        <AdminRegistrationPage isSubmitting />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /creando/i });
    expect(button).toBeDisabled();
  });

  it('clears and navigates back to main menu on cancel', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[ROUTES.ADMIN_CREATE]}>
        <AdminRegistrationPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('');
    expect(screen.queryByText('Requerido.')).not.toBeInTheDocument();
  });

  it('renders the empty audit state and then the list when entries exist', () => {
    const { rerender } = render(
      <MemoryRouter>
        <AdminRegistrationPage auditEntries={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText('No hay registros de auditoría recientes.')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <AdminRegistrationPage
          auditEntries={[
            { id: 1, when: '2025-02-01', action: 'Creación', target: 'Rodrigo Castillo', by: 'Súper Usuario' },
          ]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('2025-02-01')).toBeInTheDocument();
    expect(screen.getByText('Creación')).toBeInTheDocument();
    expect(screen.getByText('Rodrigo Castillo')).toBeInTheDocument();
    expect(screen.getByText('Súper Usuario')).toBeInTheDocument();
  });

  it('shows validation errors for invalid email, weak password and long fields', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminRegistrationPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/correo electrónico/i), 'correo-no-valido');
    await user.type(screen.getByLabelText(/contraseña inicial/i), '123');
    await user.type(screen.getByLabelText(/nombre completo/i), 'a'.repeat(121));
    await user.type(screen.getByLabelText(/teléfono/i), '1'.repeat(21));
    await user.click(screen.getByRole('button', { name: /crear administrador/i }));

    expect(await screen.findByText('Correo con formato inválido.')).toBeInTheDocument();
    expect(screen.getByText('Mínimo 8 caracteres, combinando letras y números.')).toBeInTheDocument();
    expect(screen.getByText('Máximo 120 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Máximo 20 caracteres.')).toBeInTheDocument();
  });
});

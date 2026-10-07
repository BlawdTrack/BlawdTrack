import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminManagement from './AdminManagement';
import { getAdministrators, getAdminAuditLog, deleteAdministrator } from '../services/AdminService';

vi.mock('../services/AdminService', () => ({
  getAdministrators: vi.fn(),
  getAdminAuditLog: vi.fn(),
  deleteAdministrator: vi.fn(),
}));

const admin = {
  id: 1,
  name: 'Fernanda Vindas Rojas',
  email: 'fernanda@blawdgourmet.com',
  documentType: 'CEDULA',
  documentNumber: '2-0345-0987',
  identification: '2-0345-0987',
  hasActiveSession: false,
};

const auditEntry = (overrides) => ({
  id: 1,
  action: 'CREAR_ADMINISTRADOR',
  actorName: 'Alicia Admin',
  details: "El Super Usuario 'Alicia Admin' creó al Administrador de Ventas 'Fernanda Vindas Rojas'.",
  timestamp: '2026-09-15T10:24:00',
  ...overrides,
});

describe('AdminManagement audit log', () => {
  beforeEach(() => {
    getAdministrators.mockReset();
    getAdminAuditLog.mockReset();
    deleteAdministrator.mockReset();
    getAdministrators.mockResolvedValue([admin]);
  });

  it('fetches and renders the audit log on mount, mapping action codes to labels', async () => {
    getAdminAuditLog.mockResolvedValue([
      auditEntry({ id: 1, action: 'CREAR_ADMINISTRADOR' }),
      auditEntry({ id: 2, action: 'ELIMINAR_ADMINISTRADOR', details: 'Eliminación registrada.' }),
    ]);

    render(<AdminManagement />);

    expect(await screen.findByText('Creación')).toBeInTheDocument();
    expect(screen.getByText('Eliminación')).toBeInTheDocument();
    expect(screen.getAllByText('Por Súper Usuario').length).toBeGreaterThan(0);
    expect(screen.getByText(auditEntry().details)).toBeInTheDocument();
  });

  it('shows the empty-state message when there are no audit entries', async () => {
    getAdminAuditLog.mockResolvedValue([]);
    render(<AdminManagement />);

    expect(await screen.findByText('No hay registros de auditoría recientes.')).toBeInTheDocument();
  });

  it('does not break the page when the audit log request fails', async () => {
    getAdminAuditLog.mockRejectedValue(new Error('network down'));
    render(<AdminManagement />);

    expect(await screen.findByText('Fernanda Vindas Rojas')).toBeInTheDocument();
    expect(screen.getByText('No hay registros de auditoría recientes.')).toBeInTheDocument();
  });

  it('refetches the real audit log after a successful deletion instead of guessing it locally', async () => {
    getAdminAuditLog
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([auditEntry({ id: 2, action: 'ELIMINAR_ADMINISTRADOR', details: 'Eliminación registrada por el backend.' })]);
    deleteAdministrator.mockResolvedValue();

    const user = userEvent.setup();
    render(<AdminManagement />);

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Sí, eliminar' }));

    expect(await screen.findByText('Eliminación registrada por el backend.')).toBeInTheDocument();
    expect(deleteAdministrator).toHaveBeenCalledWith('CEDULA', '2-0345-0987');
    expect(getAdminAuditLog).toHaveBeenCalledTimes(2);
  });

  it('shows why the list could not be loaded instead of an empty list', async () => {
    getAdminAuditLog.mockResolvedValue([]);
    getAdministrators.mockRejectedValue(new Error('network down'));
    render(<AdminManagement />);

    expect(await screen.findByText('No se pudieron cargar los datos. Verifica la conexión con el servidor.')).toBeInTheDocument();
  });

  it('tells whether each administrator has an open session', async () => {
    getAdminAuditLog.mockResolvedValue([]);
    getAdministrators.mockResolvedValue([
      admin,
      { ...admin, id: 2, name: 'Celeste Torres', documentNumber: '1-1111-1111', identification: '1-1111-1111', hasActiveSession: true },
    ]);
    render(<AdminManagement />);

    expect(await screen.findByText('Sesión activa')).toBeInTheDocument();
    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
    expect(screen.getByText('2 registrados')).toBeInTheDocument();
  });

  it('filters the administrators by document and says when none matches', async () => {
    getAdminAuditLog.mockResolvedValue([]);
    getAdministrators.mockResolvedValue([
      admin,
      { ...admin, id: 2, name: 'Celeste Torres', documentNumber: '1-1111-1111', identification: '1-1111-1111' },
    ]);
    const user = userEvent.setup();
    render(<AdminManagement />);
    await screen.findByText('Celeste Torres');

    await user.type(screen.getByRole('textbox', { name: 'Número de documento' }), '1111');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.queryByText('Fernanda Vindas Rojas')).not.toBeInTheDocument();
    expect(screen.getByText('1 de 2 registrados')).toBeInTheDocument();

    await user.clear(screen.getByRole('textbox', { name: 'Número de documento' }));
    await user.type(screen.getByRole('textbox', { name: 'Número de documento' }), '999');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText(/No se encontró ningún administrador con ese documento/)).toBeInTheDocument();
  });

  it.each([
    [404, 'Administrador no existente.'],
    [403, 'No cuenta con permisos para eliminar administradores.'],
  ])('keeps the dialog open with a clear message when the backend answers %i', async (status, message) => {
    getAdminAuditLog.mockResolvedValue([]);
    deleteAdministrator.mockRejectedValue({ response: { status } });
    const user = userEvent.setup();
    render(<AdminManagement />);

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Sí, eliminar' }));

    expect(await dialog.findByText(message)).toBeInTheDocument();
    // Sigue en la lista (y en el cuadro abierto): un fallo no la elimina.
    expect(screen.getAllByText('Fernanda Vindas Rojas', { selector: 'p' })).toHaveLength(2);
  });

  it('removes the administrator from the list and confirms with a notice that can be closed', async () => {
    getAdminAuditLog.mockResolvedValue([]);
    deleteAdministrator.mockResolvedValue();
    const user = userEvent.setup();
    render(<AdminManagement />);

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Sí, eliminar' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Administrador eliminado correctamente.');
    expect(screen.queryByText('Fernanda Vindas Rojas')).not.toBeInTheDocument();
    expect(screen.getByText('No hay administradores registrados.')).toBeInTheDocument();
  });
});

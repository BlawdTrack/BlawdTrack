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
    expect(screen.getAllByText('Súper Usuario', { selector: 'p' }).length).toBeGreaterThan(0);
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
});

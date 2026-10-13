import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RoleAccessManagement from './RoleAccessManagement';
import * as RoleAccessService from '../services/RoleAccessService';

vi.mock('../services/RoleAccessService', () => ({
  getUserPermissions: vi.fn(),
  replaceUserPermissions: vi.fn(),
  resetUserPermissions: vi.fn(),
}));

const COURIER_PERMISSIONS = {
  userId: 5,
  documentType: 'CEDULA',
  documentNumber: '123456789',
  fullName: 'María Solano',
  role: 'MENSAJERO',
  editable: true,
  customized: false,
  rolePermissions: ['COSTO_VIAJE_REGISTRAR', 'PAQUETE_ACTUALIZAR_ESTADO', 'PAQUETE_CONSULTAR_ASIGNADOS'],
  effectivePermissions: ['COSTO_VIAJE_REGISTRAR', 'PAQUETE_ACTUALIZAR_ESTADO', 'PAQUETE_CONSULTAR_ASIGNADOS'],
  allowedPermissions: ['COSTO_VIAJE_REGISTRAR', 'PAQUETE_ACTUALIZAR_ESTADO', 'PAQUETE_CONSULTAR_ASIGNADOS'],
};

const renderPage = () => render(
  <MemoryRouter>
    <RoleAccessManagement />
  </MemoryRouter>
);

const search = async (number = '123456789', type) => {
  if (type) {
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Pasaporte' }));
  }
  fireEvent.change(screen.getByLabelText('Número de documento'), { target: { value: number } });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
};

describe('RoleAccessManagement (HU-009 permisos por usuario)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    RoleAccessService.getUserPermissions.mockResolvedValue(COURIER_PERMISSIONS);
  });

  afterEach(() => cleanup());

  it('busca al usuario por tipo y número de documento y muestra su matriz', async () => {
    renderPage();
    await search('A12345678', 'PASAPORTE');

    expect(await screen.findByText('María Solano')).toBeTruthy();
    expect(RoleAccessService.getUserPermissions).toHaveBeenCalledWith('PASAPORTE', 'A12345678');
    expect(screen.getByRole('switch', { name: /Registrar costos del viaje: permitido/ })).toBeTruthy();
  });

  it('muestra "Usuario no existente" cuando el backend responde 404', async () => {
    RoleAccessService.getUserPermissions.mockRejectedValue({
      response: { status: 404, data: { code: 'USUARIO_NO_EXISTENTE', message: 'Usuario no existente' } },
    });
    renderPage();
    await search('999999999');

    expect((await screen.findByRole('alert')).textContent).toBe('Usuario no existente');
    expect(screen.queryByText('Matriz de control de acceso')).toBeNull();
  });

  it('aplica solo los cambios hechos y envía el conjunto deseado de permisos', async () => {
    RoleAccessService.replaceUserPermissions.mockResolvedValue({
      ...COURIER_PERMISSIONS,
      customized: true,
      effectivePermissions: ['COSTO_VIAJE_REGISTRAR', 'PAQUETE_CONSULTAR_ASIGNADOS'],
    });
    renderPage();
    await search();
    await screen.findByText('María Solano');

    expect(screen.getByRole('button', { name: /Aplicar cambios/ }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('switch', { name: /Actualizar estado de paquetes/ }));
    fireEvent.click(screen.getByRole('button', { name: /Aplicar cambios/ }));

    await waitFor(() => expect(RoleAccessService.replaceUserPermissions).toHaveBeenCalledWith(
      'CEDULA',
      '123456789',
      expect.arrayContaining(['COSTO_VIAJE_REGISTRAR', 'PAQUETE_CONSULTAR_ASIGNADOS'])
    ));
    const sent = RoleAccessService.replaceUserPermissions.mock.calls[0][2];
    expect(sent).not.toContain('PAQUETE_ACTUALIZAR_ESTADO');
    expect(await screen.findByText(/permisos personalizados/)).toBeTruthy();
  });

  it('restablece los predeterminados del rol en el backend cuando el usuario tiene excepciones', async () => {
    RoleAccessService.getUserPermissions.mockResolvedValue({
      ...COURIER_PERMISSIONS,
      customized: true,
      effectivePermissions: ['PAQUETE_CONSULTAR_ASIGNADOS'],
    });
    RoleAccessService.resetUserPermissions.mockResolvedValue(COURIER_PERMISSIONS);
    renderPage();
    await search();
    await screen.findByText('María Solano');

    fireEvent.click(screen.getByRole('button', { name: /Restablecer predeterminados/ }));

    await waitFor(() => expect(RoleAccessService.resetUserPermissions).toHaveBeenCalledWith('CEDULA', '123456789'));
    expect(await screen.findByRole('switch', { name: /Actualizar estado de paquetes: permitido/ })).toBeTruthy();
  });

  it('un rol no editable (Super Usuario) muestra los permisos fijos y bloquea las acciones', async () => {
    RoleAccessService.getUserPermissions.mockResolvedValue({
      ...COURIER_PERMISSIONS,
      fullName: 'Super Uno',
      role: 'SUPER_USUARIO',
      editable: false,
      allowedPermissions: [],
    });
    renderPage();
    await search();
    await screen.findByText('Super Uno');

    screen.getAllByRole('switch').forEach((toggle) => expect(toggle.disabled).toBe(true));
    expect(screen.getByRole('button', { name: /Restablecer predeterminados/ }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: /Aplicar cambios/ }).disabled).toBe(true);
  });
  it('Descartar sin cambios vuelve directo a la búsqueda', async () => {
    renderPage();
    await search();
    await screen.findByText('María Solano');

    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));

    expect(await screen.findByText('Busca a un usuario')).toBeTruthy();
    expect(screen.queryByText('María Solano')).toBeNull();
  });

  it('Descartar con cambios pide confirmación antes de volver a la búsqueda', async () => {
    renderPage();
    await search();
    await screen.findByText('María Solano');

    fireEvent.click(screen.getByRole('switch', { name: /Actualizar estado de paquetes/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));

    expect(screen.getByText('María Solano')).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});

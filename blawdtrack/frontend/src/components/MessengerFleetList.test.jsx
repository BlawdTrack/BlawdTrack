import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MessengerFleetList } from './MessengerFleetList';
import * as CourierService from '../services/CourierService';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { fullName: 'Súper Usuario' }, logout: vi.fn() }),
}));

vi.mock('../services/CourierService', () => ({
  listCouriers: vi.fn(),
  deactivateCourier: vi.fn(),
  getCourierDeactivations: vi.fn(),
}));

const DEACTIVATION = {
  timestamp: '2026-09-29T14:05:00',
  courierName: 'María Solano',
  documentType: 'CEDULA',
  documentNumber: '123456789',
  actorName: 'Súper Usuario',
};

const COURIER = {
  id: 7,
  documentType: 'CEDULA',
  documentNumber: '123456789',
  fullName: 'María Solano',
  schedule: 'Lunes a viernes',
  status: 'ACTIVE',
};

describe('MessengerFleetList (HU-005 desactivar mensajero)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    CourierService.listCouriers.mockResolvedValue([COURIER]);
    CourierService.getCourierDeactivations.mockResolvedValue([]);
  });

  afterEach(() => cleanup());

  it('pide confirmación antes de desactivar y no llama al backend al cancelar', async () => {
    render(<MessengerFleetList />);

    fireEvent.click(await screen.findByRole('button', { name: 'Desactivar' }));
    expect(await screen.findByText('Desactivar mensajero')).toBeTruthy();
    expect(CourierService.deactivateCourier).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(CourierService.deactivateCourier).not.toHaveBeenCalled();
  });

  it('al confirmar desactiva por id, marca Inactivo y muestra la auditoría del backend', async () => {
    CourierService.deactivateCourier.mockResolvedValue({ ...COURIER, status: 'INACTIVE' });
    // Al montar aún no hay desactivaciones; tras desactivar, el backend ya la registró.
    CourierService.getCourierDeactivations.mockResolvedValueOnce([]).mockResolvedValue([DEACTIVATION]);
    render(<MessengerFleetList />);

    fireEvent.click(await screen.findByRole('button', { name: 'Desactivar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Sí, desactivar' }));

    await waitFor(() => expect(CourierService.deactivateCourier).toHaveBeenCalledWith(7));
    expect(await screen.findByText('Inactivo', { selector: 'button' })).toBeTruthy();
    expect(await screen.findByText(/Mensajero María Solano · 123456789/)).toBeTruthy();
    expect(CourierService.getCourierDeactivations).toHaveBeenCalledTimes(2);
  });

  it('muestra al abrir la pantalla las desactivaciones guardadas aunque el mensajero ya esté activo', async () => {
    // El mensajero fue desactivado y luego reactivado: la auditoría sigue en la base de datos.
    CourierService.getCourierDeactivations.mockResolvedValue([DEACTIVATION]);
    render(<MessengerFleetList />);

    expect(await screen.findByText(/Mensajero María Solano · 123456789/)).toBeTruthy();
    expect(screen.getByText('Desactivación')).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Desactivar' })).toBeTruthy();
  });

  it('lista todas las desactivaciones guardadas, no solo la última', async () => {
    CourierService.getCourierDeactivations.mockResolvedValue([
      DEACTIVATION,
      { ...DEACTIVATION, timestamp: '2026-09-28T09:00:00' },
    ]);
    render(<MessengerFleetList />);

    await waitFor(() => expect(screen.getAllByText('Desactivación')).toHaveLength(2));
  });

  it('si el backend responde 409 muestra el motivo y no marca al mensajero como inactivo', async () => {
    CourierService.deactivateCourier.mockRejectedValue({
      response: { status: 409, data: { message: 'El mensajero tiene paquetes o entregas pendientes y no puede desactivarse' } },
    });
    render(<MessengerFleetList />);

    fireEvent.click(await screen.findByRole('button', { name: 'Desactivar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Sí, desactivar' }));

    expect(await screen.findByText(/tiene paquetes o entregas pendientes/)).toBeTruthy();
    // Solo la carga inicial: una desactivación rechazada no vuelve a consultar la auditoría.
    expect(CourierService.getCourierDeactivations).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Inactivo', { selector: 'button' })).toBeNull();
  });
});

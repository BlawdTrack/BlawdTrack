import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessengerFleetList } from './MessengerFleetList';
import * as CourierService from '../services/CourierService';

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { fullName: 'Súper Usuario' }, logout: logoutMock }),
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
    expect(await screen.findByText('Por Súper Usuario')).toBeTruthy();
    expect(screen.getByText('Estado de acceso: Inactivo (sesión cerrada inmediatamente)')).toBeTruthy();
    expect(CourierService.getCourierDeactivations).toHaveBeenCalledTimes(2);
  });

  it('muestra al abrir la pantalla las desactivaciones guardadas aunque el mensajero ya esté activo', async () => {
    // El mensajero fue desactivado y luego reactivado: la auditoría sigue en la base de datos.
    CourierService.getCourierDeactivations.mockResolvedValue([DEACTIVATION]);
    render(<MessengerFleetList />);

    expect(await screen.findByText('Por Súper Usuario')).toBeTruthy();
    expect(screen.getByText('1 registro')).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Desactivar' })).toBeTruthy();
  });

  it('lista todas las desactivaciones guardadas, no solo la última', async () => {
    CourierService.getCourierDeactivations.mockResolvedValue([
      DEACTIVATION,
      { ...DEACTIVATION, timestamp: '2026-09-28T09:00:00' },
    ]);
    render(<MessengerFleetList />);

    await waitFor(() => expect(screen.getAllByText('Por Súper Usuario')).toHaveLength(2));
    expect(screen.getByText('2 registros')).toBeTruthy();
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

  it('muestra el motivo si no se puede cargar la flota', async () => {
    CourierService.listCouriers.mockRejectedValue({ response: { status: 500, data: { message: 'Fallo del servidor' } } });
    render(<MessengerFleetList />);

    expect(await screen.findByText('Fallo del servidor')).toBeTruthy();
    expect(logoutMock).not.toHaveBeenCalled();
  });

  it('cierra la sesión si al cargar la flota el backend responde 401', async () => {
    CourierService.listCouriers.mockRejectedValue({ response: { status: 401, data: {} } });
    render(<MessengerFleetList />);

    await waitFor(() => expect(logoutMock).toHaveBeenCalledTimes(1));
  });

  it('filtra la flota por documento y avisa cuando ninguno coincide', async () => {
    CourierService.listCouriers.mockResolvedValue([
      COURIER,
      { ...COURIER, id: 8, documentNumber: '987654321', fullName: 'Pedro Mora' },
    ]);
    const user = userEvent.setup();
    render(<MessengerFleetList />);
    await screen.findByText('Pedro Mora');

    await user.type(screen.getByRole('textbox', { name: 'Número de documento' }), '9876');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.queryByText('María Solano', { selector: 'p' })).toBeNull();
    expect(screen.getByText('Pedro Mora')).toBeTruthy();

    await user.clear(screen.getByRole('textbox', { name: 'Número de documento' }));
    await user.type(screen.getByRole('textbox', { name: 'Número de documento' }), '000');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText('No se encontró ningún mensajero con ese documento.')).toBeTruthy();
  });

  it('deja a un mensajero ya inactivo sin botón para desactivarlo', async () => {
    CourierService.listCouriers.mockResolvedValue([{ ...COURIER, status: 'INACTIVE' }]);
    render(<MessengerFleetList />);

    const button = await screen.findByText('Inactivo', { selector: 'button' });
    expect(button).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Desactivar' })).toBeNull();
  });

  it('muestra un aviso al desactivar con éxito y se puede cerrar con la X', async () => {
    CourierService.deactivateCourier.mockResolvedValue({ ...COURIER, status: 'INACTIVE' });
    const user = userEvent.setup();
    render(<MessengerFleetList />);

    await user.click(await screen.findByRole('button', { name: 'Desactivar' }));
    await user.click(await screen.findByRole('button', { name: 'Sí, desactivar' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Mensajero desactivado correctamente.');
    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
  });

  it('explica cuándo se puede desactivar con un icono de ayuda, sin una franja fija en la lista', async () => {
    const user = userEvent.setup();
    render(<MessengerFleetList />);

    const help = await screen.findByRole('button', { name: '¿Cuándo se puede desactivar a un mensajero?' });
    expect(screen.queryByText(/solo puede desactivarse si está fuera de labores/i)).toBeNull();

    await user.hover(help);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Un mensajero solo puede desactivarse si está fuera de labores y sin envíos en proceso.'
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Sus paquetes pendientes deben reasignarse manualmente.');
  });

  it('recuerda en el cuadro de confirmación la regla y que los paquetes pendientes se reasignan a mano', async () => {
    render(<MessengerFleetList />);

    fireEvent.click(await screen.findByRole('button', { name: 'Desactivar' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('solo puede desactivarse si está fuera de labores y sin envíos en proceso');
    expect(dialog).toHaveTextContent('Sus paquetes pendientes deben reasignarse manualmente.');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import EditMessenger from './EditMessenger';
import { useAuth } from '../hooks/useAuth';
import * as CourierService from '../services/CourierService';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../services/CourierService', () => ({
  listCouriers: vi.fn(),
  getCourierByCedula: vi.fn(),
  updateCourier: vi.fn(),
  updateCourierStatus: vi.fn(),
  updateCourierPassword: vi.fn(),
  getCourierHistory: vi.fn().mockResolvedValue([])
}));

describe('EditMessenger Component (HU-Editar Mensajero: T04, T05, T06)', () => {
  const mockUser = {
    id: 1,
    fullName: 'Súper Usuario',
    email: 'super@blawdgourmet.com',
    role: 'Súper Usuario'
  };

  const mockCourier = {
    id: 7,
    documentNumber: '1-0345-0678',
    fullName: 'María José Solano',
    email: 'maria.solano@example.com',
    phone: '88888888',
    schedule: '6:00 am – 2:00 pm',
    maxLoadCapacityKg: 25,
    status: 'ACTIVE',
    inLabor: false,
    pendingPackages: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser, logout: vi.fn() });
    CourierService.getCourierByCedula.mockResolvedValue(mockCourier);
    CourierService.listCouriers.mockResolvedValue([mockCourier]);
    CourierService.updateCourier.mockResolvedValue({ success: true, ...mockCourier });
  });

  afterEach(() => {
    cleanup();
  });

  it('T04: Renderiza el título, buscador y prellena el formulario con los datos del mensajero', async () => {
    render(<EditMessenger initialCedula="1-0345-0678" />);

    expect(screen.getByText('Buscar mensajero por documento')).toBeTruthy();
    expect(screen.getByPlaceholderText('Ej. 1-2345-6789')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByDisplayValue('María José Solano')).toBeTruthy();
      expect(screen.getByDisplayValue('6:00 am – 2:00 pm')).toBeTruthy();
      expect(screen.getByDisplayValue('25')).toBeTruthy();
    });
  });

  it('T04: Valida en cliente que la capacidad máxima de carga sea un valor numérico positivo (> 0)', async () => {
    render(<EditMessenger initialCedula="1-0345-0678" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('25')).toBeTruthy();
    });

    const capInput = screen.getByDisplayValue('25');
    fireEvent.change(capInput, { target: { value: '-5' } });

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('La capacidad máxima de carga debe ser un valor numérico positivo.')).toBeTruthy();
    });
  });

  it('T04: Bloquea el cambio de estado si el mensajero tiene envíos en proceso o está en labores', async () => {
    const activeCourierInDuty = {
      ...mockCourier,
      inLabor: true,
      pendingPackages: 2
    };
    CourierService.listCouriers.mockResolvedValue([activeCourierInDuty]);

    render(<EditMessenger initialCedula="1-0345-0678" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('María José Solano')).toBeTruthy();
    });

    const statusSwitch = screen.getByRole('switch');
    expect(statusSwitch).toBeDisabled();
  });

  it('T05: Integra el formulario con la API REST enviando la petición HTTP de actualización', async () => {
    render(<EditMessenger initialCedula="1-0345-0678" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('María José Solano')).toBeTruthy();
    });

    const nameInput = screen.getByDisplayValue('María José Solano');
    fireEvent.change(nameInput, { target: { value: 'María José Solano Editada' } });

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(CourierService.updateCourier).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
          fullName: 'María José Solano Editada',
          schedule: '6:00 am – 2:00 pm',
          maxPackageWeightKg: 25
        })
      );
    });
  });

  it('T04 & T05: Registra en el historial de modificaciones (log) la fecha, hora y campos modificados', async () => {
    // El historial lo sirve el backend: tras guardar, GET /history ya incluye la modificación.
    CourierService.getCourierHistory.mockImplementation(async () =>
      CourierService.updateCourier.mock.calls.length > 0
        ? [{
            action: 'ACTUALIZAR_MENSAJERO',
            details: 'maxPackageWeightKg',
            timestamp: '2026-09-29T12:00:00',
            actorName: 'Super Usuario'
          }]
        : []
    );
    render(<EditMessenger initialCedula="1-0345-0678" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('25')).toBeTruthy();
    });

    const capInput = screen.getByDisplayValue('25');
    fireEvent.change(capInput, { target: { value: '35' } });

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Campos modificados: Capacidad de carga/i)).toBeTruthy();
      expect(screen.getByText('Historial de modificaciones')).toBeTruthy();
    });
    CourierService.getCourierHistory.mockResolvedValue([]);
  });

  it('T06: Muestra notificación de éxito (Toast) tras guardar los cambios correctamente', async () => {
    render(<EditMessenger initialCedula="1-0345-0678" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('María José Solano')).toBeTruthy();
    });

    const nameInput = screen.getByDisplayValue('María José Solano');
    fireEvent.change(nameInput, { target: { value: 'María José Solano Actualizada' } });

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Notificación de actualización exitosa. Los datos del mensajero han sido modificados.')).toBeTruthy();
    });
  });

  it('HU-004: Envía la nueva contraseña al endpoint real y no la deja en el formulario', async () => {
    render(<EditMessenger initialCedula="1-0345-0678" />);

    const passwordInput = await screen.findByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'Nueva2026x' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(CourierService.updateCourierPassword).toHaveBeenCalledWith(7, 'Nueva2026x');
    });
    expect(CourierService.updateCourierStatus).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('••••••••').value).toBe('');
    });
  });

  it('HU-004: Rechaza en cliente una contraseña que no cumple las reglas y no llama al backend', async () => {
    render(<EditMessenger initialCedula="1-0345-0678" />);

    const passwordInput = await screen.findByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'corta' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/al menos 8 caracteres/i)).toBeTruthy();
    });
    expect(CourierService.updateCourierPassword).not.toHaveBeenCalled();
  });

  it('HU-004: Si el backend rechaza la contraseña no muestra el toast de éxito', async () => {
    CourierService.updateCourierPassword.mockRejectedValue({ response: { data: { message: 'Revise los campos: password' } } });
    render(<EditMessenger initialCedula="1-0345-0678" />);

    const passwordInput = await screen.findByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'Nueva2026x' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Revise los campos: password').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText(/Notificación de actualización exitosa/)).toBeNull();
  });

  it('T06: Muestra mensaje de error cuando falla la API REST de actualización', async () => {
    CourierService.updateCourier.mockRejectedValue({
      response: { data: { message: 'Error de red al actualizar el mensajero.' } }
    });

    render(<EditMessenger initialCedula="1-0345-0678" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('María José Solano')).toBeTruthy();
    });

    const nameInput = screen.getByDisplayValue('María José Solano');
    fireEvent.change(nameInput, { target: { value: 'María José Solano Test' } });

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getAllByText('Error de red al actualizar el mensajero.').length).toBeGreaterThan(0);
    });
  });
});

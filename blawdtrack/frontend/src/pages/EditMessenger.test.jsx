import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
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
    id: '1-0345-0678',
    documentNumber: '1-0345-0678',
    fullName: 'María José Solano',
    email: 'maria.solano@blawdgourmet.com',
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
        '1-0345-0678',
        expect.objectContaining({
          fullName: 'María José Solano Editada',
          schedule: '6:00 am – 2:00 pm',
          maxPackageWeightKg: 25
        })
      );
    });
  });

  it('T04 & T05: Registra en el historial de modificaciones (log) la fecha, hora y campos modificados', async () => {
    render(<EditMessenger initialCedula="1-0345-0678" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('25')).toBeTruthy();
    });

    const capInput = screen.getByDisplayValue('25');
    fireEvent.change(capInput, { target: { value: '35' } });

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Capacidad: 25 kg → 35 kg/i)).toBeTruthy();
      expect(screen.getByText('Historial de modificaciones')).toBeTruthy();
    });
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

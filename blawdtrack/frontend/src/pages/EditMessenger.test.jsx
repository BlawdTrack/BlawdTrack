import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  getCourierHistory: vi.fn().mockResolvedValue([]),
  getCourierGeneralHistory: vi.fn().mockResolvedValue([])
}));

// Las ruedas de horario y capacidad son las mismas de "Crear mensajero".
async function pickTime(user, label, hour, period) {
  await user.click(screen.getByRole('textbox', { name: label }));
  const pick = (name, text) =>
    user.click(within(screen.getByRole('listbox', { name })).getAllByRole('option', { name: text })[0]);
  await pick(/: hora$/i, hour);
  await pick(/: am o pm$/i, period);
  await user.click(screen.getByRole('button', { name: 'Listo' }));
}

async function pickWeight(user, arrowDownPresses) {
  await user.click(screen.getByRole('textbox', { name: /capacidad máxima/i }));
  screen.getByRole('listbox', { name: /capacidad máxima/i }).focus();
  await user.keyboard(`{ArrowDown>${arrowDownPresses}/}`);
  await user.click(screen.getByRole('button', { name: 'Listo' }));
}

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

  const fleetRow = (name) => screen.getAllByRole('row').find((row) => within(row).queryByText(name));

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
      // Horario y capacidad se muestran en las ruedas de la pantalla de creación.
      expect(screen.getByRole('textbox', { name: /hora de entrada/i })).toHaveValue('6:00 am');
      expect(screen.getByRole('textbox', { name: /hora de salida/i })).toHaveValue('2:00 pm');
      expect(screen.getByRole('textbox', { name: /capacidad máxima/i })).toHaveValue('25 kg');
    });
  });

  it('T04: Cambiar las ruedas de horario envía el horario compuesto al backend', async () => {
    const user = userEvent.setup();
    render(<EditMessenger initialCedula="1-0345-0678" />);
    await waitFor(() => expect(screen.getByDisplayValue('María José Solano')).toBeTruthy());

    await pickTime(user, /hora de entrada/i, '08', 'am');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(CourierService.updateCourier).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ schedule: '8:00 am – 2:00 pm' })
      );
    });
  });

  it('T04: Valida en cliente que la hora de salida sea posterior a la de entrada', async () => {
    const user = userEvent.setup();
    render(<EditMessenger initialCedula="1-0345-0678" />);
    await waitFor(() => expect(screen.getByDisplayValue('María José Solano')).toBeTruthy());

    await pickTime(user, /hora de salida/i, '05', 'am');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(await screen.findByText('La hora de salida debe ser posterior a la de entrada.')).toBeTruthy();
    expect(CourierService.updateCourier).not.toHaveBeenCalled();
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
    const user = userEvent.setup();
    render(<EditMessenger initialCedula="1-0345-0678" />);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /capacidad máxima/i })).toHaveValue('25 kg');
    });

    await pickWeight(user, 10);
    expect(screen.getByRole('textbox', { name: /capacidad máxima/i })).not.toHaveValue('25 kg');

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    // Tras guardar se vuelve a "Elige un mensajero"; el historial se ve al abrir de nuevo al mensajero.
    expect(await screen.findByText('Elige un mensajero')).toBeTruthy();
    await user.click(fleetRow('María José Solano'));
    await user.click(await screen.findByRole('tab', { name: /historial/i }));

    await waitFor(() => {
      expect(screen.getByText(/Campos modificados: Capacidad de carga/i)).toBeTruthy();
      expect(screen.getByText('Historial de modificaciones')).toBeTruthy();
    });
    CourierService.getCourierHistory.mockResolvedValue([]);
  });

  it('T04: La tabla de la flota marca como Inactivo al mensajero que la API devuelve inactivo', async () => {
    CourierService.listCouriers.mockResolvedValue([
      mockCourier,
      { ...mockCourier, id: 8, documentNumber: '2-0456-0789', fullName: 'Pedro Inactivo', status: 'INACTIVE' }
    ]);
    render(<EditMessenger />);

    await waitFor(() => expect(fleetRow('Pedro Inactivo')).toBeTruthy());
    expect(within(fleetRow('Pedro Inactivo')).getByText('Inactivo')).toBeTruthy();
    expect(within(fleetRow('María José Solano')).getByText('Activo')).toBeTruthy();
  });

  it('T04: Al quitar el acceso y guardar, la tabla de la flota pasa a Inactivo', async () => {
    const user = userEvent.setup();
    render(<EditMessenger initialCedula="1-0345-0678" />);
    await waitFor(() => expect(screen.getByDisplayValue('María José Solano')).toBeTruthy());
    expect(within(fleetRow('María José Solano')).getByText('Activo')).toBeTruthy();

    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(CourierService.updateCourierStatus).toHaveBeenCalledWith(7, 'INACTIVE');
      expect(within(fleetRow('María José Solano')).getByText('Inactivo')).toBeTruthy();
    });
  });

  it('T04: Si falla el cambio de estado tras guardar los datos, el historial se recarga igualmente', async () => {
    CourierService.updateCourierStatus.mockRejectedValue({
      response: { data: { message: 'El mensajero tiene envíos activos' } }
    });
    const user = userEvent.setup();
    render(<EditMessenger initialCedula="1-0345-0678" />);
    await waitFor(() => expect(screen.getByDisplayValue('María José Solano')).toBeTruthy());
    await waitFor(() => expect(CourierService.getCourierHistory).toHaveBeenCalled());
    const historyCallsBefore = CourierService.getCourierHistory.mock.calls.length;

    fireEvent.change(screen.getByDisplayValue('María José Solano'), { target: { value: 'María José Editada' } });
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(CourierService.updateCourier).toHaveBeenCalled();
      expect(CourierService.updateCourierStatus).toHaveBeenCalled();
      expect(CourierService.getCourierHistory.mock.calls.length).toBeGreaterThan(historyCallsBefore);
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

  it('HU-004: Envía la nueva contraseña al endpoint real y no la deja en el formulario', async () => {
    render(<EditMessenger initialCedula="1-0345-0678" />);

    const passwordInput = await screen.findByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'Nueva2026x' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(CourierService.updateCourierPassword).toHaveBeenCalledWith(7, 'Nueva2026x');
    });
    expect(CourierService.updateCourierStatus).not.toHaveBeenCalled();
    // Tras guardar se cierra el formulario; al reabrirlo la contraseña no está.
    expect(await screen.findByText('Elige un mensajero')).toBeTruthy();
    fireEvent.click(fleetRow('María José Solano'));
    expect((await screen.findByPlaceholderText('••••••••')).value).toBe('');
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

  describe('flujo de edición (lista, avisos y vuelta al inicio)', () => {
    const pedro = { ...mockCourier, id: 8, documentNumber: '2-0456-0789', fullName: 'Pedro Inactivo', email: 'pedro@example.com' };

    beforeEach(() => {
      CourierService.listCouriers.mockResolvedValue([mockCourier, pedro]);
    });

    const openCourier = async (user, name) => {
      await waitFor(() => expect(fleetRow(name)).toBeTruthy());
      await user.click(fleetRow(name));
    };

    it('vuelve a "Elige un mensajero" después de guardar y deja la lista a la vista', async () => {
      const user = userEvent.setup();
      render(<EditMessenger />);
      expect(await screen.findByText('Elige un mensajero')).toBeTruthy();

      await openCourier(user, 'María José Solano');
      fireEvent.change(await screen.findByDisplayValue('María José Solano'), { target: { value: 'María José Editada' } });
      await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

      expect(await screen.findByText('Elige un mensajero')).toBeTruthy();
      expect(screen.queryByRole('button', { name: /guardar cambios/i })).toBeNull();
      expect(fleetRow('María José Editada')).toBeTruthy();
    });

    it('"Descartar" vuelve de una vez a "Elige un mensajero" sin pedir confirmación ni guardar', async () => {
      const user = userEvent.setup();
      render(<EditMessenger />);

      await openCourier(user, 'María José Solano');
      fireEvent.change(await screen.findByDisplayValue('María José Solano'), { target: { value: 'Nombre a medias' } });
      await user.click(screen.getByRole('button', { name: 'Descartar' }));

      expect(await screen.findByText('Elige un mensajero')).toBeTruthy();
      expect(screen.queryByText('¿Salir sin guardar?')).toBeNull();
      expect(screen.queryByDisplayValue('Nombre a medias')).toBeNull();
      expect(CourierService.updateCourier).not.toHaveBeenCalled();
    });

    it('"Volver" regresa a "Elige un mensajero" sin avisos cuando no hay cambios sin guardar', async () => {
      const user = userEvent.setup();
      render(<EditMessenger />);

      await openCourier(user, 'María José Solano');
      await screen.findByDisplayValue('María José Solano');
      await user.click(screen.getByRole('button', { name: 'Volver a la lista' }));

      expect(await screen.findByText('Elige un mensajero')).toBeTruthy();
      expect(screen.queryByText('¿Salir sin guardar?')).toBeNull();
    });

    it('"Volver" con cambios sin guardar pide confirmar y solo sale si se acepta', async () => {
      const user = userEvent.setup();
      render(<EditMessenger />);

      await openCourier(user, 'María José Solano');
      fireEvent.change(await screen.findByDisplayValue('María José Solano'), { target: { value: 'Nombre a medias' } });
      await user.click(screen.getByRole('button', { name: 'Volver a la lista' }));

      expect(await screen.findByText('¿Salir sin guardar?')).toBeTruthy();
      await user.click(screen.getByRole('button', { name: 'Seguir editando' }));
      await waitFor(() => expect(screen.queryByText('¿Salir sin guardar?')).toBeNull());
      expect(screen.getByDisplayValue('Nombre a medias')).toBeTruthy();

      await user.click(screen.getByRole('button', { name: 'Volver a la lista' }));
      await user.click(await screen.findByRole('button', { name: 'Salir sin guardar' }));

      expect(await screen.findByText('Elige un mensajero')).toBeTruthy();
      expect(CourierService.updateCourier).not.toHaveBeenCalled();
    });

    it('cambia de mensajero sin avisos cuando no hay cambios sin guardar', async () => {
      const user = userEvent.setup();
      render(<EditMessenger />);

      await openCourier(user, 'María José Solano');
      await screen.findByDisplayValue('María José Solano');
      await user.click(fleetRow('Pedro Inactivo'));

      expect(await screen.findByDisplayValue('Pedro Inactivo')).toBeTruthy();
      expect(screen.queryByText('¿Salir sin guardar?')).toBeNull();
    });

    it('avisa antes de cambiar de mensajero con cambios sin guardar y permite seguir editando', async () => {
      const user = userEvent.setup();
      render(<EditMessenger />);

      await openCourier(user, 'María José Solano');
      fireEvent.change(await screen.findByDisplayValue('María José Solano'), { target: { value: 'Nombre a medias' } });
      await user.click(fleetRow('Pedro Inactivo'));

      expect(await screen.findByText('¿Salir sin guardar?')).toBeTruthy();
      await user.click(screen.getByRole('button', { name: 'Seguir editando' }));

      await waitFor(() => expect(screen.queryByText('¿Salir sin guardar?')).toBeNull());
      expect(screen.getByDisplayValue('Nombre a medias')).toBeTruthy();
      expect(screen.queryByDisplayValue('Pedro Inactivo')).toBeNull();
    });

    it('descarta los cambios y abre al otro mensajero si se confirma salir sin guardar', async () => {
      const user = userEvent.setup();
      render(<EditMessenger />);

      await openCourier(user, 'María José Solano');
      fireEvent.change(await screen.findByDisplayValue('María José Solano'), { target: { value: 'Nombre a medias' } });
      await user.click(fleetRow('Pedro Inactivo'));
      await user.click(await screen.findByRole('button', { name: 'Salir sin guardar' }));

      expect(await screen.findByDisplayValue('Pedro Inactivo')).toBeTruthy();
      expect(screen.queryByDisplayValue('Nombre a medias')).toBeNull();
      expect(CourierService.updateCourier).not.toHaveBeenCalled();
    });

    it('avisa también antes de cerrar o recargar la pestaña con cambios sin guardar', async () => {
      const user = userEvent.setup();
      render(<EditMessenger />);

      const untouched = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(untouched);
      expect(untouched.defaultPrevented).toBe(false);

      await openCourier(user, 'María José Solano');
      fireEvent.change(await screen.findByDisplayValue('María José Solano'), { target: { value: 'Nombre a medias' } });

      const dirty = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(dirty);
      expect(dirty.defaultPrevented).toBe(true);
    });

    const generalEntries = [
      { action: 'DESACTIVAR_MENSAJERO', details: 'status', timestamp: '2026-10-02T14:39:00', actorName: 'Super Usuario', courierName: 'Pedro Inactivo', documentNumber: '2-0456-0789' },
      { action: 'ACTUALIZAR_MENSAJERO', details: 'phone', timestamp: '2026-10-01T09:10:00', actorName: 'Super Usuario', courierName: 'María José Solano', documentNumber: '1-0345-0678' }
    ];

    it('muestra el historial general de todos los mensajeros con el mensajero de cada cambio', async () => {
      CourierService.getCourierGeneralHistory.mockResolvedValue(generalEntries);
      const user = userEvent.setup();
      render(<EditMessenger />);
      await waitFor(() => expect(fleetRow('Pedro Inactivo')).toBeTruthy());

      await user.click(screen.getByRole('button', { name: /ver historial general/i }));

      expect(await screen.findByText('Historial general de mensajeros')).toBeTruthy();
      expect(await screen.findByText('2 registros')).toBeTruthy();
      expect(screen.getAllByText('Pedro Inactivo').length).toBeGreaterThan(1); // en la flota y en el historial
      expect(screen.getByText('2-0456-0789')).toBeTruthy();
      expect(screen.getByText('Campos modificados: Teléfono')).toBeTruthy();
      expect(CourierService.getCourierGeneralHistory).toHaveBeenCalledTimes(1);
    });

    it('el historial de la pestaña de un mensajero sigue siendo solo el de ese mensajero', async () => {
      CourierService.getCourierHistory.mockResolvedValue([
        { action: 'ACTUALIZAR_MENSAJERO', details: 'phone', timestamp: '2026-10-01T09:10:00', actorName: 'Super Usuario' }
      ]);
      const user = userEvent.setup();
      render(<EditMessenger />);

      await openCourier(user, 'María José Solano');
      await user.click(await screen.findByRole('tab', { name: /historial/i }));

      expect(await screen.findByText('Campos modificados: Teléfono')).toBeTruthy();
      expect(CourierService.getCourierHistory).toHaveBeenCalledWith(7);
      expect(CourierService.getCourierGeneralHistory).not.toHaveBeenCalled();
      CourierService.getCourierHistory.mockResolvedValue([]);
    });

    it('volver del historial general deja el formulario con lo que se estaba editando', async () => {
      CourierService.getCourierGeneralHistory.mockResolvedValue(generalEntries);
      const user = userEvent.setup();
      render(<EditMessenger />);

      await openCourier(user, 'María José Solano');
      fireEvent.change(await screen.findByDisplayValue('María José Solano'), { target: { value: 'Nombre a medias' } });
      await user.click(screen.getByRole('button', { name: /ver historial general/i }));
      expect(await screen.findByText('Historial general de mensajeros')).toBeTruthy();
      expect(screen.queryByText('¿Salir sin guardar?')).toBeNull();

      await user.click(screen.getByRole('button', { name: /volver a/i }));

      expect(await screen.findByDisplayValue('Nombre a medias')).toBeTruthy();
      expect(screen.queryByText('Historial general de mensajeros')).toBeNull();
    });

    it('elegir un mensajero estando en el historial general abre su formulario', async () => {
      CourierService.getCourierGeneralHistory.mockResolvedValue(generalEntries);
      const user = userEvent.setup();
      render(<EditMessenger />);
      await waitFor(() => expect(fleetRow('Pedro Inactivo')).toBeTruthy());

      await user.click(screen.getByRole('button', { name: /ver historial general/i }));
      await screen.findByText('Historial general de mensajeros');
      await user.click(fleetRow('Pedro Inactivo'));

      expect(await screen.findByDisplayValue('Pedro Inactivo')).toBeTruthy();
      expect(screen.queryByText('Historial general de mensajeros')).toBeNull();
    });

    it('avisa y permite reintentar si no se puede cargar el historial general', async () => {
      CourierService.getCourierGeneralHistory.mockRejectedValueOnce(new Error('sin red'));
      CourierService.getCourierGeneralHistory.mockResolvedValueOnce(generalEntries);
      const user = userEvent.setup();
      render(<EditMessenger />);
      await waitFor(() => expect(fleetRow('Pedro Inactivo')).toBeTruthy());

      await user.click(screen.getByRole('button', { name: /ver historial general/i }));
      expect(await screen.findByText(/No se pudo cargar el historial general/)).toBeTruthy();

      await user.click(screen.getByRole('button', { name: 'Reintentar' }));
      expect(await screen.findByText('2 registros')).toBeTruthy();
    });

    it('oculta y vuelve a mostrar la flota de mensajeros', async () => {
      const user = userEvent.setup();
      render(<EditMessenger />);

      await openCourier(user, 'María José Solano');
      await screen.findByDisplayValue('María José Solano');
      await user.click(screen.getByRole('button', { name: 'Ocultar la flota de mensajeros' }));

      const showButton = await screen.findByRole('button', { name: /mostrar flota/i });
      await user.click(showButton);
      expect(await screen.findByRole('button', { name: 'Ocultar la flota de mensajeros' })).toBeTruthy();
    });
  });
});

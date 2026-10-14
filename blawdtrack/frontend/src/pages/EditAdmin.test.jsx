import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditAdmin from './EditAdmin';
import {
  getAdminAuditLog,
  getAdministrator,
  getAdministratorHistory,
  getAdministrators,
  updateAdministrator,
} from '../services/AdminService';

vi.mock('../services/AdminService', () => ({
  getAdministrators: vi.fn(),
  getAdministrator: vi.fn(),
  getAdministratorHistory: vi.fn(),
  getAdminAuditLog: vi.fn(),
  updateAdministrator: vi.fn(),
}));

const listed = (overrides) => ({
  id: 1,
  name: 'Fernanda Vindas Rojas',
  email: 'fernanda@blawdgourmet.com',
  documentType: 'CEDULA',
  documentNumber: '2-0345-0987',
  identification: '2-0345-0987',
  status: 'ACTIVE',
  hasActiveSession: false,
  ...overrides,
});

const profile = (overrides) => ({
  id: 1,
  documentType: 'CEDULA',
  documentNumber: '2-0345-0987',
  fullName: 'Fernanda Vindas Rojas',
  email: 'fernanda@blawdgourmet.com',
  phone: '8888-8888',
  status: 'ACTIVE',
  ...overrides,
});

const httpError = (status, data = {}) => ({ response: { status, data } });

// Elegir a alguien es pulsar su fila de la lista (como en Actualizar mensajero).
const openEditor = async (user, name = 'Fernanda Vindas Rojas') => {
  await user.click(await screen.findByText(name));
};

const historyEntry = (overrides) => ({
  id: 1,
  action: 'ACTUALIZAR_ADMINISTRADOR',
  actorName: 'Alicia Admin',
  details: "El Super Usuario 'Alicia Admin' modificó los datos (nombre) del Administrador de Ventas 'Fernanda' (CEDULA 2-0345-0987).",
  timestamp: '2026-10-14T10:24:00',
  ...overrides,
});
const nameField = () => screen.getByLabelText('Nombre completo');
const emailField = () => screen.getByLabelText('Correo electrónico');
const passwordField = () => screen.getByLabelText('Nueva contraseña (opcional)');
const save = (user) => user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
const replace = async (user, field, text) => {
  await user.clear(field);
  await user.type(field, text);
};

describe('EditAdmin (HU-007 · Tasks 93, 94 y 95)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdministrators.mockResolvedValue([listed(), listed({ id: 2, name: 'Pablo Mora', email: 'pablo@blawdgourmet.com', documentNumber: '1-1111-2222', identification: '1-1111-2222', status: 'INACTIVE' })]);
    getAdministrator.mockResolvedValue(profile());
    updateAdministrator.mockResolvedValue(profile());
    getAdministratorHistory.mockResolvedValue([]);
    getAdminAuditLog.mockResolvedValue([]);
  });

  afterEach(() => cleanup());

  describe('Task 93 · búsqueda y formulario prellenado', () => {
    it('muestra los administradores con su estado y pide elegir uno', async () => {
      render(<EditAdmin />);

      expect(await screen.findByText('Fernanda Vindas Rojas')).toBeInTheDocument();
      expect(screen.getByText('Pablo Mora')).toBeInTheDocument();
      expect(screen.getByText('Elige un administrador')).toBeInTheDocument();
      expect(screen.getByText('Administradores de ventas')).toBeInTheDocument();
      expect(screen.getByText('2 administradores')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Estado' })).toBeInTheDocument();
      expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Inactivo').length).toBeGreaterThan(0);
    });

    it('busca por tipo y número de documento y avisa si no hay coincidencias', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await screen.findByText('Fernanda Vindas Rojas');

      await user.type(screen.getByLabelText('Número de documento'), '1-1111-2222');
      await user.click(screen.getByRole('button', { name: 'Buscar' }));
      expect(screen.getByText('Pablo Mora')).toBeInTheDocument();
      expect(screen.queryByText('Fernanda Vindas Rojas')).not.toBeInTheDocument();

      await user.clear(screen.getByLabelText('Número de documento'));
      await user.type(screen.getByLabelText('Número de documento'), '9-9999-9999');
      await user.click(screen.getByRole('button', { name: 'Buscar' }));
      expect(screen.getByText(/Administrador no encontrado/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Limpiar' }));
      expect(screen.getByText('Fernanda Vindas Rojas')).toBeInTheDocument();
    });

    it('al pulsar su fila consulta su perfil y muestra el formulario con nombre, correo, contraseña vacía y estado', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);

      await waitFor(() => expect(getAdministrator).toHaveBeenCalledWith('CEDULA', '2-0345-0987'));
      expect(await screen.findByText(/Editar · Fernanda Vindas Rojas/)).toBeInTheDocument();
      expect(screen.getByText(/CEDULA 2-0345-0987 · no editable/)).toBeInTheDocument();
      expect(nameField()).toHaveValue('Fernanda Vindas Rojas');
      expect(emailField()).toHaveValue('fernanda@blawdgourmet.com');
      expect(passwordField()).toHaveValue('');
      expect(screen.getByRole('switch', { name: 'Estado de acceso' })).toBeChecked();
    });

    it('"Descartar" vuelve a pedir que se elija un administrador', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await user.click(screen.getByRole('button', { name: 'Descartar' }));

      expect(screen.getByText('Elige un administrador')).toBeInTheDocument();
    });
  });

  describe('Historial (igual que Actualizar mensajero)', () => {
    it('la pestaña Historial lista los cambios de ese administrador y su cantidad', async () => {
      getAdministratorHistory.mockResolvedValue([
        historyEntry({ id: 2, action: 'DESACTIVAR_ADMINISTRADOR', details: 'Se desactivó. Su sesión activa se cerró de inmediato.' }),
        historyEntry({ id: 1 }),
      ]);
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);

      await waitFor(() => expect(getAdministratorHistory).toHaveBeenCalledWith('CEDULA', '2-0345-0987'));
      await user.click(await screen.findByRole('tab', { name: 'Historial (2)' }));

      expect(screen.getByText('Historial de modificaciones')).toBeInTheDocument();
      expect(screen.getByText(/modificó los datos \(nombre\)/)).toBeInTheDocument();
      expect(screen.getByText(/Se desactivó\. Su sesión activa se cerró de inmediato\./)).toBeInTheDocument();
    });

    it('sin cambios registrados lo dice', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await user.click(await screen.findByRole('tab', { name: 'Historial (0)' }));

      expect(screen.getByText('Todavía no hay cambios registrados para este administrador.')).toBeInTheDocument();
    });

    it('"Ver historial general" muestra altas, cambios, estados y eliminaciones', async () => {
      getAdminAuditLog.mockResolvedValue([
        historyEntry({ id: 3, action: 'ELIMINAR_ADMINISTRADOR', details: 'Se eliminó al Administrador de Ventas Pablo.' }),
        historyEntry({ id: 2, action: 'ACTIVAR_ADMINISTRADOR', details: 'Se activó al administrador.' }),
        historyEntry({ id: 1, action: 'CREAR_ADMINISTRADOR', details: 'Se creó al administrador.' }),
      ]);
      const user = userEvent.setup();
      render(<EditAdmin />);
      await screen.findByText('Fernanda Vindas Rojas');

      await user.click(screen.getByRole('button', { name: 'Ver historial general' }));

      expect(await screen.findByText('Historial general de administradores')).toBeInTheDocument();
      expect(screen.getByText('Eliminación')).toBeInTheDocument();
      expect(screen.getByText('Activación')).toBeInTheDocument();
      expect(screen.getByText('Creación')).toBeInTheDocument();
      expect(screen.getByText('Se eliminó al Administrador de Ventas Pablo.')).toBeInTheDocument();
    });

    it('si el historial general no carga, ofrece reintentar y "Volver" regresa', async () => {
      getAdminAuditLog.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce([]);
      const user = userEvent.setup();
      render(<EditAdmin />);
      await screen.findByText('Fernanda Vindas Rojas');
      await user.click(screen.getByRole('button', { name: 'Ver historial general' }));

      expect(await screen.findByText(/No se pudo cargar el historial general/)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Reintentar' }));
      expect(await screen.findByText('Todavía no hay cambios registrados en ningún administrador.')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Volver/ }));
      expect(screen.getByText('Elige un administrador')).toBeInTheDocument();
    });
  });

  describe('Task 94 · integración con la API', () => {
    it('guarda solo el campo que cambió y refleja el nombre nuevo en la lista', async () => {
      updateAdministrator.mockResolvedValue(profile({ fullName: 'Fernanda Nueva' }));
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await replace(user, nameField(), 'Fernanda Nueva');
      await save(user);

      await waitFor(() => expect(updateAdministrator).toHaveBeenCalledWith('CEDULA', '2-0345-0987', { fullName: 'Fernanda Nueva' }));
      expect(await screen.findByText('Fernanda Nueva')).toBeInTheDocument();
      expect(screen.queryByText('Fernanda Vindas Rojas')).not.toBeInTheDocument();
      expect(screen.getByText('Elige un administrador')).toBeInTheDocument();
    });

    it('envía el correo, la contraseña y el estado cuando cambian', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await replace(user, emailField(), 'nuevo@blawdgourmet.com');
      await user.type(passwordField(), 'NuevaClave123');
      await user.click(screen.getByRole('switch', { name: 'Estado de acceso' }));
      await save(user);

      await waitFor(() =>
        expect(updateAdministrator).toHaveBeenCalledWith('CEDULA', '2-0345-0987', {
          email: 'nuevo@blawdgourmet.com',
          password: 'NuevaClave123',
          status: 'INACTIVE',
        })
      );
    });

    it('bloquea el botón mientras guarda', async () => {
      updateAdministrator.mockReturnValue(new Promise(() => {}));
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await replace(user, nameField(), 'Otro Nombre');
      await save(user);

      await waitFor(() => expect(screen.getByRole('button', { name: /Guardar cambios|^$/ })).toBeDisabled());
      expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
    });

    it('rechaza en el navegador una contraseña débil o un correo inválido, sin llamar a la API', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await replace(user, emailField(), 'no-es-correo');
      await user.type(passwordField(), 'corta1');
      await save(user);

      expect(await screen.findByText('Ingresa un correo válido.')).toBeInTheDocument();
      expect(screen.getByText(/al menos 8 caracteres y combinar letras y números/)).toBeInTheDocument();
      expect(updateAdministrator).not.toHaveBeenCalled();
    });

    it('un nombre en blanco no se envía', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await user.clear(nameField());
      await save(user);

      expect(await screen.findByText('El nombre completo es requerido.')).toBeInTheDocument();
      expect(updateAdministrator).not.toHaveBeenCalled();
    });
  });

  describe('Task 95 · avisos y manejo de errores', () => {
    it('muestra el aviso de éxito al guardar', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await replace(user, nameField(), 'Fernanda Nueva');
      await save(user);

      expect(await screen.findByText(/Actualización exitosa\. Los datos del administrador han sido modificados\.$/)).toBeInTheDocument();
    });

    it('si cambió el estado o la contraseña, el aviso de éxito dice que su sesión se cerró', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await user.type(passwordField(), 'NuevaClave123');
      await save(user);

      expect(await screen.findByText(/han sido modificados\. Su sesión activa se cerró\./)).toBeInTheDocument();
    });

    it('al cambiar el estado avisa que la sesión activa se cerrará de inmediato', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await user.click(screen.getByRole('switch', { name: 'Estado de acceso' }));

      expect(await screen.findByText(/la sesión activa del administrador se cerrará de inmediato/)).toBeInTheDocument();
      expect(screen.getByText(/Revocado\. El administrador no puede iniciar sesión\./)).toBeInTheDocument();
    });

    it('sin cambios avisa y no llama a la API', async () => {
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await save(user);

      expect(await screen.findByText('No se detectaron cambios en la información del administrador.')).toBeInTheDocument();
      expect(updateAdministrator).not.toHaveBeenCalled();
    });

    it('si el administrador ya no existe al elegirlo, avisa y vuelve a cargar la lista', async () => {
      getAdministrator.mockRejectedValue(httpError(404, { code: 'ADMINISTRADOR_NO_EXISTENTE' }));
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);

      expect(await screen.findByText(/Administrador no existente\. Puede que ya se haya eliminado/)).toBeInTheDocument();
      expect(screen.getByText('Elige un administrador')).toBeInTheDocument();
      await waitFor(() => expect(getAdministrators).toHaveBeenCalledTimes(2));
    });

    it('si desaparece mientras se guarda, avisa y vuelve a cargar la lista', async () => {
      updateAdministrator.mockRejectedValue(httpError(404, { code: 'ADMINISTRADOR_NO_EXISTENTE' }));
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await replace(user, nameField(), 'Otro');
      await save(user);

      expect((await screen.findAllByText(/Administrador no existente/)).length).toBeGreaterThan(0);
      expect(screen.getByText('Elige un administrador')).toBeInTheDocument();
      await waitFor(() => expect(getAdministrators).toHaveBeenCalledTimes(2));
    });

    it('un correo repetido se marca en su campo', async () => {
      updateAdministrator.mockRejectedValue(httpError(409, { code: 'DUPLICATE_EMAIL' }));
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await replace(user, emailField(), 'repetido@blawdgourmet.com');
      await save(user);

      expect(await screen.findByText('Este correo electrónico ya está registrado.')).toBeInTheDocument();
      expect(screen.getByText(/Editar · /)).toBeInTheDocument();
    });

    it.each([
      [403, /No tienes permisos para modificar administradores/],
      [500, /Ocurrió un error inesperado en el servidor/],
    ])('un error %i se explica y se puede reintentar', async (status, message) => {
      updateAdministrator.mockRejectedValue(httpError(status));
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await replace(user, nameField(), 'Otro');
      await save(user);

      expect((await screen.findAllByText(message)).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
    });

    it('si no hay conexión lo dice', async () => {
      updateAdministrator.mockRejectedValue(new Error('Network Error'));
      const user = userEvent.setup();
      render(<EditAdmin />);
      await openEditor(user);
      await screen.findByText(/Editar · /);

      await replace(user, nameField(), 'Otro');
      await save(user);

      expect((await screen.findAllByText(/No pudimos conectar con el servidor/)).length).toBeGreaterThan(0);
    });

    it('si la lista no carga, ofrece reintentar', async () => {
      getAdministrators.mockRejectedValueOnce(new Error('boom'));
      const user = userEvent.setup();
      render(<EditAdmin />);

      expect(await screen.findByText(/No se pudieron cargar los datos/)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Reintentar' }));

      expect(await screen.findByText('Fernanda Vindas Rojas')).toBeInTheDocument();
    });
  });
});

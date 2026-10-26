import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NewPasswordPage from './NewPasswordPage';
import { confirmPasswordReset } from '../services/PasswordRecoveryService';

vi.mock('../services/PasswordRecoveryService', () => ({ confirmPasswordReset: vi.fn() }));

const VALID = 'Nueva1234';

const renderPage = (url = '/recovery?token=abc123', props = {}) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <NewPasswordPage {...props} />
    </MemoryRouter>
  );

const fill = async (user, password, confirm = password) => {
  await user.type(screen.getByLabelText(/^nueva contraseña/i), password);
  await user.type(screen.getByLabelText(/^confirmar contraseña/i), confirm);
};

const submit = (user) => user.click(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

const apiError = (status, code) => ({ response: { status, data: { code } } });

const requirements = () => screen.getByRole('list', { name: 'Requisitos de la contraseña' });
const rule = (name) => within(requirements()).getAllByRole('listitem').find((item) => item.textContent.includes(name));
// La nota de las últimas 3 contraseñas no se puede validar en el cliente: queda en gris y solo pasa a rojo si el backend la rechaza.
const historyNote = () => screen.getByText(/distinta de tus últimas 3 contraseñas/i);
// Estas pruebas se montan sin el tema de la app, así que se compara contra el color inicial en vez de un valor fijo.
const colorOf = (element) => getComputedStyle(element).color;
const saveButton = () => screen.getByRole('button', { name: 'Guardar nueva contraseña' });

describe('NewPasswordPage (HU-002 T05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sin token válido en el enlace', () => {
    it.each([['/recovery'], ['/recovery?token='], ['/recovery?token=%20%20']])(
      'con %s muestra "Enlace no válido" y no el formulario',
      (url) => {
        renderPage(url);
        expect(screen.getByRole('heading', { name: 'Enlace no válido' })).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('incompleto');
        expect(screen.queryByRole('button', { name: 'Guardar nueva contraseña' })).not.toBeInTheDocument();
      }
    );

    it('"Solicitar un enlace nuevo" llama al callback', async () => {
      const onRequestNewLink = vi.fn();
      const user = userEvent.setup();
      renderPage('/recovery', { onRequestNewLink });

      await user.click(screen.getByRole('button', { name: 'Solicitar un enlace nuevo' }));

      expect(onRequestNewLink).toHaveBeenCalledTimes(1);
    });
  });

  describe('validaciones del cliente', () => {
    it('muestra el paso 3 de 3 y el enlace para volver a iniciar sesión', async () => {
      const onGoToLogin = vi.fn();
      const user = userEvent.setup();
      renderPage('/recovery?token=abc123', { onGoToLogin });

      expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Volver a iniciar sesión' }));
      expect(onGoToLogin).toHaveBeenCalledTimes(1);
    });

    it('con una contraseña que no cumple las reglas el botón queda deshabilitado y no se llama al servicio', async () => {
      const user = userEvent.setup();
      renderPage();

      await fill(user, 'corta');

      expect(saveButton()).toBeDisabled();
      expect(confirmPasswordReset).not.toHaveBeenCalled();
    });

    it('los requisitos pasan a cumplido en vivo mientras se escribe', async () => {
      const user = userEvent.setup();
      renderPage();
      expect(rule('Mínimo 8 caracteres')).toHaveTextContent('Pendiente');

      await user.type(screen.getByLabelText(/^nueva contraseña/i), 'abc');
      expect(rule('Al menos una letra')).toHaveTextContent('Cumplido');
      expect(rule('Mínimo 8 caracteres')).toHaveTextContent('Pendiente');
      expect(rule('Al menos un número')).toHaveTextContent('Pendiente');

      await user.type(screen.getByLabelText(/^nueva contraseña/i), '12345');
      ['Mínimo 8 caracteres', 'Al menos una letra', 'Al menos un número'].forEach((name) =>
        expect(rule(name)).toHaveTextContent('Cumplido')
      );
    });

    it('contraseñas distintas muestran "no coinciden" bajo la confirmación y no dejan guardar', async () => {
      const user = userEvent.setup();
      renderPage();

      await fill(user, VALID, 'Otra12345');

      expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
      expect(screen.getByLabelText(/^confirmar contraseña/i)).toHaveAttribute('aria-invalid', 'true');
      expect(saveButton()).toBeDisabled();
      expect(confirmPasswordReset).not.toHaveBeenCalled();
    });

    it('el aviso de "no coinciden" desaparece al corregir la confirmación', async () => {
      const user = userEvent.setup();
      renderPage();
      await fill(user, VALID, 'Otra12345');

      await user.clear(screen.getByLabelText(/^confirmar contraseña/i));
      await user.type(screen.getByLabelText(/^confirmar contraseña/i), VALID);

      expect(screen.queryByText('Las contraseñas no coinciden.')).not.toBeInTheDocument();
    });

    it('el botón solo se habilita cuando cumple las reglas y la confirmación coincide', async () => {
      const user = userEvent.setup();
      renderPage();
      expect(saveButton()).toBeDisabled();

      await user.type(screen.getByLabelText(/^nueva contraseña/i), VALID);
      expect(saveButton()).toBeDisabled();

      await user.type(screen.getByLabelText(/^confirmar contraseña/i), VALID);
      expect(saveButton()).toBeEnabled();
    });

    it('la nota de las últimas 3 contraseñas se queda en gris aunque se cumplan las 3 del cliente', async () => {
      const user = userEvent.setup();
      renderPage();
      const initialColor = colorOf(historyNote());

      await user.type(screen.getByLabelText(/^nueva contraseña/i), VALID);

      expect(colorOf(historyNote())).toBe(initialColor);
      expect(historyNote()).toHaveTextContent('(se verifica al guardar)');
    });
  });

  describe('guardado', () => {
    it('envía el token del enlace y la contraseña, y muestra el éxito', async () => {
      confirmPasswordReset.mockResolvedValue({ message: 'ok' });
      const onGoToLogin = vi.fn();
      const user = userEvent.setup();
      renderPage('/recovery?token=abc123', { onGoToLogin });

      await fill(user, VALID);
      await submit(user);

      expect(confirmPasswordReset).toHaveBeenCalledWith('abc123', VALID);
      expect(await screen.findByRole('heading', { name: '¡Contraseña actualizada!' })).toBeInTheDocument();
      expect(screen.queryByLabelText(/^nueva contraseña/i)).not.toBeInTheDocument();
      // No promete el cierre de otras sesiones.
      expect(screen.getByRole('status')).not.toHaveTextContent(/dispositivos|sesiones/i);

      await user.click(screen.getByRole('button', { name: 'Ir a iniciar sesión' }));
      expect(onGoToLogin).toHaveBeenCalledTimes(1);
    });

    it('TOKEN_INVALIDO pasa a "Enlace no válido" con el aviso de expirado', async () => {
      confirmPasswordReset.mockRejectedValue(apiError(400, 'TOKEN_INVALIDO'));
      const user = userEvent.setup();
      renderPage();

      await fill(user, VALID);
      await submit(user);

      expect(await screen.findByRole('heading', { name: 'Enlace no válido' })).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('no es válido o ya expiró');
    });

    it('CONTRASENA_REUTILIZADA pone la nota del historial en rojo y conserva el formulario', async () => {
      confirmPasswordReset.mockRejectedValue(apiError(400, 'CONTRASENA_REUTILIZADA'));
      const user = userEvent.setup();
      renderPage();
      const initialColor = colorOf(historyNote());

      await fill(user, VALID);
      await submit(user);

      expect(await screen.findByRole('alert')).toHaveTextContent('No puedes reutilizar');
      expect(colorOf(historyNote())).not.toBe(initialColor);
      expect(screen.getByLabelText(/^nueva contraseña/i)).toBeInTheDocument();
    });

    it('la nota del historial vuelve a gris y el error se limpia al escribir otra contraseña', async () => {
      confirmPasswordReset.mockRejectedValue(apiError(400, 'CONTRASENA_REUTILIZADA'));
      const user = userEvent.setup();
      renderPage();
      const initialColor = colorOf(historyNote());
      await fill(user, VALID);
      await submit(user);
      await screen.findByRole('alert');

      await user.type(screen.getByLabelText(/^nueva contraseña/i), '9');

      expect(colorOf(historyNote())).toBe(initialColor);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('VALIDATION_ERROR del backend muestra el aviso de requisitos', async () => {
      confirmPasswordReset.mockRejectedValue(apiError(400, 'VALIDATION_ERROR'));
      const user = userEvent.setup();
      renderPage();

      await fill(user, VALID);
      await submit(user);

      expect(await screen.findByRole('alert')).toHaveTextContent('al menos 8 caracteres');
    });

    it('sin respuesta del servidor muestra el aviso de conexión', async () => {
      confirmPasswordReset.mockRejectedValue(new Error('Network Error'));
      const user = userEvent.setup();
      renderPage();

      await fill(user, VALID);
      await submit(user);

      expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectar con el servidor');
    });

    it('un error desconocido muestra el texto genérico, no el crudo del backend', async () => {
      confirmPasswordReset.mockRejectedValue({ response: { status: 500, data: { code: 'OTRO', message: 'boom' } } });
      const user = userEvent.setup();
      renderPage();

      await fill(user, VALID);
      await submit(user);

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar la contraseña');
      expect(screen.queryByText('boom')).not.toBeInTheDocument();
    });
  });
});

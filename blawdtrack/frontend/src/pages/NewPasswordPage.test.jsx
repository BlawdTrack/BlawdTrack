import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

const historyRule = () => screen.getAllByRole('listitem').find((item) => /últimas 3 contraseñas/i.test(item.textContent));

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
    it('una contraseña que no cumple las reglas muestra el error y no llama al servicio', async () => {
      const user = userEvent.setup();
      renderPage();

      await fill(user, 'corta');
      await submit(user);

      expect(screen.getByRole('alert')).toHaveTextContent('no cumple todos los requisitos');
      expect(confirmPasswordReset).not.toHaveBeenCalled();
    });

    it('contraseñas distintas muestran "no coinciden" y no llaman al servicio', async () => {
      const user = userEvent.setup();
      renderPage();

      await fill(user, VALID, 'Otra12345');
      await submit(user);

      expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden.');
      expect(confirmPasswordReset).not.toHaveBeenCalled();
    });

    it('el error se limpia al volver a escribir', async () => {
      const user = userEvent.setup();
      renderPage();
      await fill(user, 'corta');
      await submit(user);

      await user.type(screen.getByLabelText(/^nueva contraseña/i), 'x');

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('la regla del historial se queda pendiente aunque se cumplan las 3 del cliente', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText(/^nueva contraseña/i), VALID);

      expect(historyRule()).toHaveTextContent('Pendiente');
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
      expect(await screen.findByRole('heading', { name: 'Contraseña actualizada' })).toBeInTheDocument();
      expect(screen.queryByLabelText(/^nueva contraseña/i)).not.toBeInTheDocument();
      // No promete el cierre de otras sesiones.
      expect(screen.getByRole('status')).not.toHaveTextContent(/dispositivos|sesiones/i);

      await user.click(screen.getByRole('button', { name: 'Ir a iniciar sesión' }));
      expect(onGoToLogin).toHaveBeenCalledTimes(1);
    });

    it('INVALID_RESET_TOKEN pasa a "Enlace no válido" con el aviso de expirado', async () => {
      confirmPasswordReset.mockRejectedValue(apiError(400, 'INVALID_RESET_TOKEN'));
      const user = userEvent.setup();
      renderPage();

      await fill(user, VALID);
      await submit(user);

      expect(await screen.findByRole('heading', { name: 'Enlace no válido' })).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('no es válido o ya expiró');
    });

    it('PASSWORD_REUSED marca la regla del historial como no cumplida y conserva el formulario', async () => {
      confirmPasswordReset.mockRejectedValue(apiError(400, 'PASSWORD_REUSED'));
      const user = userEvent.setup();
      renderPage();

      await fill(user, VALID);
      await submit(user);

      expect(await screen.findByRole('alert')).toHaveTextContent('No puedes reutilizar');
      expect(historyRule()).toHaveTextContent('No cumplido');
      expect(screen.getByLabelText(/^nueva contraseña/i)).toBeInTheDocument();
    });

    it('la regla del historial vuelve a pendiente al escribir otra contraseña', async () => {
      confirmPasswordReset.mockRejectedValue(apiError(400, 'PASSWORD_REUSED'));
      const user = userEvent.setup();
      renderPage();
      await fill(user, VALID);
      await submit(user);
      await screen.findByRole('alert');

      await user.type(screen.getByLabelText(/^nueva contraseña/i), '9');

      expect(historyRule()).toHaveTextContent('Pendiente');
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

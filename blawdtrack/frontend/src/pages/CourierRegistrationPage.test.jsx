import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { Routes, Route, RouterProvider, createMemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { CourierRegistrationPage } from './CourierRegistrationPage';
import { registerCourier } from '../services/CourierService';
import { renderWithProviders, superUser } from '../test-utils';
import { AuthContext } from '../context/authContextInstance';
import ModuleMenuPage from './ModuleMenuPage';
import { ROUTES } from '../config/routes';

vi.mock('../services/CourierService', () => ({ registerCourier: vi.fn() }));

const httpError = (status, data) => ({ response: { status, data } });

async function pickTime(user, label, hour, period) {
  await user.click(screen.getByRole('textbox', { name: label }));
  const pick = (name, text) =>
    user.click(within(screen.getByRole('listbox', { name })).getAllByRole('option', { name: text })[0]);
  await pick(/: hora$/i, hour);
  await pick(/: am o pm$/i, period);
  await user.click(screen.getByRole('button', { name: 'Listo' }));
}

async function fillForm(user) {
  await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Lucía Bermúdez');
  await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@blawdgourmet.com');
  await user.type(screen.getByLabelText(/número de documento/i), '1-1204-0388');
  await pickTime(user, /hora de entrada/i, '08', 'am');
  await pickTime(user, /hora de salida/i, '04', 'pm');
  await user.click(screen.getByRole('textbox', { name: /capacidad máxima/i }));
  screen.getByRole('listbox', { name: /capacidad máxima/i }).focus();
  await user.keyboard('{ArrowDown>19/}');
  await user.click(screen.getByRole('button', { name: 'Listo' }));
}

const submit = (user) => user.click(screen.getByRole('button', { name: /registrar mensajero/i }));

describe('CourierRegistrationPage', () => {
  beforeEach(() => {
    registerCourier.mockReset();
  });

  it('returns to the couriers module menu with a success notice that names the response email', async () => {
    registerCourier.mockResolvedValue({ email: 'ana@blawdgourmet.com' });
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path={ROUTES.COURIER_CREATE} element={<CourierRegistrationPage />} />
        <Route path={ROUTES.MODULE_COURIERS} element={<ModuleMenuPage groupId="couriers" />} />
      </Routes>,
      { route: ROUTES.COURIER_CREATE, user: superUser }
    );

    await fillForm(user);
    await submit(user);

    expect(await screen.findByRole('heading', { level: 1, name: 'Gestión de mensajeros' })).toBeInTheDocument();
    const notice = await screen.findByRole('status');
    expect(notice).toHaveTextContent('Mensajero creado correctamente');
    expect(notice).toHaveTextContent('ana@blawdgourmet.com');
    expect(notice).toHaveTextContent('contraseña temporal');
    expect(registerCourier).toHaveBeenCalledWith(
      expect.objectContaining({ documentType: 'CEDULA', maxPackageWeightKg: 20, schedule: '8:00 am – 4:00 pm' })
    );
  });

  it('shows a duplicate email error inline and keeps the typed values', async () => {
    registerCourier.mockRejectedValue(
      httpError(409, { code: 'COURIER_CONFLICT', message: 'El correo ya está registrado' })
    );
    const user = userEvent.setup();
    renderWithProviders(<CourierRegistrationPage />);

    await fillForm(user);
    await submit(user);

    expect(await screen.findByText('Este correo electrónico ya está registrado.')).toBeInTheDocument();
    const email = screen.getByLabelText(/correo electrónico/i);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveValue('ana@blawdgourmet.com');
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Ana Lucía Bermúdez');
  });

  it('shows a global alert when there is no connection', async () => {
    registerCourier.mockRejectedValue(new Error('Network Error'));
    const user = userEvent.setup();
    renderWithProviders(<CourierRegistrationPage />);

    await fillForm(user);
    await submit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectar con el servidor');
  });

  describe('discarding and leaving with unsaved data', () => {
    const renderInRoutes = () =>
      renderWithProviders(
        <Routes>
          <Route path={ROUTES.COURIER_CREATE} element={<CourierRegistrationPage />} />
          <Route path={ROUTES.MODULE_COURIERS} element={<ModuleMenuPage groupId="couriers" />} />
        </Routes>,
        { route: ROUTES.COURIER_CREATE, user: superUser }
      );
    const menuHeading = () => screen.findByRole('heading', { level: 1, name: 'Gestión de mensajeros' });

    it('goes straight back to the couriers menu when "Descartar" is pressed with an empty form', async () => {
      const user = userEvent.setup();
      renderInRoutes();

      await user.click(screen.getByRole('button', { name: 'Descartar' }));

      expect(await menuHeading()).toBeInTheDocument();
      expect(screen.queryByText('¿Salir sin guardar?')).not.toBeInTheDocument();
    });

    it('asks first when there is typed data, and only leaves if the user confirms', async () => {
      const user = userEvent.setup();
      renderInRoutes();
      await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');

      await user.click(screen.getByRole('button', { name: 'Descartar' }));
      expect(await screen.findByText('¿Salir sin guardar?')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Seguir editando' }));
      await waitFor(() => expect(screen.queryByText('¿Salir sin guardar?')).not.toBeInTheDocument());
      expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Ana');
      expect(registerCourier).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Descartar' }));
      await user.click(await screen.findByRole('button', { name: 'Salir sin guardar' }));

      expect(await menuHeading()).toBeInTheDocument();
      expect(registerCourier).not.toHaveBeenCalled();
    });

    // El router real es de datos (`createBrowserRouter`): aquí sí puede bloquear la navegación.
    describe('with a data router', () => {
      const renderWithDataRouter = () => {
        const router = createMemoryRouter(
          [
            { path: ROUTES.COURIER_CREATE, element: <CourierRegistrationPage /> },
            { path: ROUTES.MODULE_COURIERS, element: <ModuleMenuPage groupId="couriers" /> },
            { path: '/otra', element: <p>otra pantalla</p> },
          ],
          { initialEntries: [ROUTES.COURIER_CREATE] }
        );
        render(
          <AuthContext.Provider value={{ user: superUser, logout: () => {}, login: () => {}, loading: false, error: null, resetError: () => {} }}>
            <RouterProvider router={router} />
          </AuthContext.Provider>
        );
        return router;
      };

      it('warns when leaving to another screen with typed data and lets the user stay', async () => {
        const user = userEvent.setup();
        const router = renderWithDataRouter();
        await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');

        await router.navigate('/otra');

        expect(await screen.findByText('¿Salir sin guardar?')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Seguir editando' }));
        expect(router.state.location.pathname).toBe(ROUTES.COURIER_CREATE);
        expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Ana');
      });

      it('does not block itself when the courier is created successfully', async () => {
        registerCourier.mockResolvedValue({ email: 'ana@blawdgourmet.com' });
        const user = userEvent.setup();
        const router = renderWithDataRouter();

        await fillForm(user);
        await submit(user);

        expect(await menuHeading()).toBeInTheDocument();
        expect(screen.queryByText('¿Salir sin guardar?')).not.toBeInTheDocument();
        expect(router.state.location.pathname).toBe(ROUTES.MODULE_COURIERS);
      });

      it('does not ask twice after confirming "Descartar"', async () => {
        const user = userEvent.setup();
        const router = renderWithDataRouter();
        await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');

        await user.click(screen.getByRole('button', { name: 'Descartar' }));
        await user.click(await screen.findByRole('button', { name: 'Salir sin guardar' }));

        expect(await menuHeading()).toBeInTheDocument();
        expect(screen.queryByText('¿Salir sin guardar?')).not.toBeInTheDocument();
        expect(router.state.location.pathname).toBe(ROUTES.MODULE_COURIERS);
      });
    });
  });
});

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import ModuleMenuPage from './ModuleMenuPage';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

const tree = (
  <Routes>
    <Route path={ROUTES.MAIN_MENU} element={<div>main menu screen</div>} />
    <Route path={ROUTES.MODULE_COURIERS} element={<ModuleMenuPage groupId="couriers" />} />
  </Routes>
);

describe('ModuleMenuPage', () => {
  it('lists the functions of the module as links to their screens', () => {
    renderWithProviders(tree, { route: ROUTES.MODULE_COURIERS, user: superUser });

    expect(screen.getByRole('heading', { level: 1, name: 'Gestión de mensajeros' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear mensajero/ })).toHaveAttribute('href', ROUTES.COURIER_CREATE);
    expect(screen.getByRole('link', { name: /Actualizar mensajero/ })).toHaveAttribute('href', ROUTES.COURIER_UPDATE);
    expect(screen.getByRole('link', { name: /Desactivar mensajero/ })).toHaveAttribute('href', ROUTES.COURIER_DEACTIVATE);
  });

  it('goes back to the main menu when the role has no such module', () => {
    renderWithProviders(tree, {
      route: ROUTES.MODULE_COURIERS,
      user: { ...superUser, role: 'OTRO_ROL' },
    });

    expect(screen.getByText('main menu screen')).toBeInTheDocument();
  });
});

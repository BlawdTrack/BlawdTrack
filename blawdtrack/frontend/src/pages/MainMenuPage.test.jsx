import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import MainMenuPage from './MainMenuPage';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

const tree = (
  <Routes>
    <Route path={ROUTES.LOGIN} element={<div>login screen</div>} />
    <Route path={ROUTES.MAIN_MENU} element={<MainMenuPage />} />
  </Routes>
);

describe('MainMenuPage', () => {
  it('shows the welcome text, the logged user and the role', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser });
    expect(screen.getByText('Bienvenid@ al sistema')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'BlawdTrack' })).toBeInTheDocument();
    expect(screen.getByText(/Alicia Admin/)).toBeInTheDocument();
    expect(screen.getByText('Súper Usuario')).toBeInTheDocument();
  });

  it('falls back to the raw role when it has no label', () => {
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: { ...superUser, role: 'OTRO_ROL' } });
    expect(screen.getByText('OTRO_ROL')).toBeInTheDocument();
  });

  it('offers a logout button that ends the session and goes to login', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    renderWithProviders(tree, { route: ROUTES.MAIN_MENU, user: superUser, logout });

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });
});

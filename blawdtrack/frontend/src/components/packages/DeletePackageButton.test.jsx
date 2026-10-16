import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeletePackageButton from './DeletePackageButton';
import { renderWithProviders } from '../../test-utils';
import { PACKAGE_STATES } from '../../config/packageStates';
import { ROLES } from '../../config/roles';

const userWithRole = (role) => ({ id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role });

function renderButton({ role = ROLES.SALES_ADMIN, estado = PACKAGE_STATES.PENDING, onEliminar = vi.fn() } = {}) {
  const paquete = { shipmentNumber: 'BG-2026-00125', status: estado };
  renderWithProviders(<DeletePackageButton paquete={paquete} onEliminar={onEliminar} />, { user: userWithRole(role) });
  return { paquete, onEliminar };
}

describe('DeletePackageButton (HU-012 / T05)', () => {
  it.each([ROLES.SUPER_USER, ROLES.COURIER])('no existe en el DOM para el rol %s', (role) => {
    renderButton({ role });

    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });

  it('no existe en el DOM sin sesión', () => {
    renderWithProviders(
      <DeletePackageButton paquete={{ shipmentNumber: 'BG-1', status: PACKAGE_STATES.PENDING }} onEliminar={vi.fn()} />
    );

    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });

  it.each([PACKAGE_STATES.PENDING, PACKAGE_STATES.ASSIGNED])(
    'en %s está activo, sin texto de ayuda, y emite onEliminar con el paquete',
    async (estado) => {
      const { paquete, onEliminar } = renderButton({ estado });

      const button = screen.getByRole('button', { name: 'Eliminar' });
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).not.toHaveAttribute('aria-describedby');
      expect(screen.queryByText(/No eliminable/)).not.toBeInTheDocument();

      await userEvent.click(button);

      expect(onEliminar).toHaveBeenCalledTimes(1);
      expect(onEliminar).toHaveBeenCalledWith(paquete);
    }
  );

  it.each([
    [PACKAGE_STATES.SHIPPED, 'Enviado'],
    [PACKAGE_STATES.IN_TRANSIT, 'En tránsito'],
    [PACKAGE_STATES.DELIVERED, 'Entregado'],
    [PACKAGE_STATES.NOT_DELIVERED, 'No entregado'],
  ])('en %s queda aria-disabled con su texto de ayuda y no emite onEliminar', async (estado, label) => {
    const { onEliminar } = renderButton({ estado });

    const button = screen.getByRole('button', { name: 'Eliminar' });
    const hint = screen.getByText(`No eliminable en “${label}”`);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-describedby', hint.id);
    expect(button).toHaveAccessibleDescription(`No eliminable en “${label}”`);

    await userEvent.click(button);

    expect(onEliminar).not.toHaveBeenCalled();
  });

  it('el botón no eliminable sigue siendo enfocable con el teclado', async () => {
    renderButton({ estado: PACKAGE_STATES.DELIVERED });

    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Eliminar' })).toHaveFocus();
  });
});

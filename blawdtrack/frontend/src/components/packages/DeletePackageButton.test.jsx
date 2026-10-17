import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeletePackageButton from './DeletePackageButton';
import { renderWithProviders } from '../../test-utils';
import { ROLES } from '../../config/roles';

const userWithRole = (role) => ({ id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role });

function renderButton({ role = ROLES.SALES_ADMIN, status = 'PENDING', onDelete = vi.fn() } = {}) {
  const pkg = { shipmentNumber: 'BG-2026-00125', status };
  renderWithProviders(<DeletePackageButton pkg={pkg} onDelete={onDelete} />, { user: userWithRole(role) });
  return { pkg, onDelete };
}

describe('DeletePackageButton (HU-012 / T05)', () => {
  it.each([ROLES.SUPER_USER, ROLES.COURIER])('no existe en el DOM para el rol %s', (role) => {
    renderButton({ role });

    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });

  it('no existe en el DOM sin sesión', () => {
    renderWithProviders(<DeletePackageButton pkg={{ shipmentNumber: 'BG-1', status: 'PENDING' }} onDelete={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });

  it.each(['PENDING', 'ASSIGNED'])(
    'en %s está activo, sin texto de ayuda, y emite onDelete con el paquete',
    async (status) => {
      const { pkg, onDelete } = renderButton({ status });

      const button = screen.getByRole('button', { name: 'Eliminar' });
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).not.toHaveAttribute('aria-describedby');
      expect(screen.queryByText(/No eliminable/)).not.toBeInTheDocument();

      await userEvent.click(button);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(pkg);
    }
  );

  it.each([
    ['SHIPPED', 'Enviado'],
    ['IN_TRANSIT', 'En tránsito'],
    ['DELIVERED', 'Entregado'],
    ['NOT_DELIVERED', 'No entregado'],
  ])('en %s queda aria-disabled con su texto de ayuda y no emite onDelete', async (status, label) => {
    const { onDelete } = renderButton({ status });

    const button = screen.getByRole('button', { name: 'Eliminar' });
    const hint = screen.getByText(`No eliminable en “${label}”`);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-describedby', hint.id);
    expect(button).toHaveAccessibleDescription(`No eliminable en “${label}”`);

    await userEvent.click(button);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('el botón no eliminable sigue siendo enfocable con el teclado', async () => {
    renderButton({ status: 'DELIVERED' });

    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Eliminar' })).toHaveFocus();
  });
});

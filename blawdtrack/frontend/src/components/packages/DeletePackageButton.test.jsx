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
  it('no existe en el DOM para el Mensajero', () => {
    renderButton({ role: ROLES.COURIER });

    expect(screen.queryByRole('button', { name: 'Eliminar paquete' })).not.toBeInTheDocument();
  });

  it('existe para el Súper Usuario, que accede a todas las funciones', () => {
    renderButton({ role: ROLES.SUPER_USER });

    expect(screen.getByRole('button', { name: 'Eliminar paquete' })).toBeInTheDocument();
  });

  it('no existe en el DOM sin sesión', () => {
    renderWithProviders(<DeletePackageButton pkg={{ shipmentNumber: 'BG-1', status: 'PENDING' }} onDelete={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Eliminar paquete' })).not.toBeInTheDocument();
  });

  it.each(['PENDING', 'ASSIGNED'])(
    'en %s está activo, sin texto de ayuda, y emite onDelete con el paquete',
    async (status) => {
      const { pkg, onDelete } = renderButton({ status });

      const button = screen.getByRole('button', { name: 'Eliminar paquete' });
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

    const button = screen.getByRole('button', { name: 'Eliminar paquete' });
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

    expect(screen.getByRole('button', { name: 'Eliminar paquete' })).toHaveFocus();
  });

  it('el botón no eliminable emite onBlocked con el paquete, y no onDelete (T07)', async () => {
    const onDelete = vi.fn();
    const onBlocked = vi.fn();
    const pkg = { shipmentNumber: 'BG-2026-00121', status: 'DELIVERED' };
    renderWithProviders(<DeletePackageButton pkg={pkg} onDelete={onDelete} onBlocked={onBlocked} />, {
      user: userWithRole(ROLES.SALES_ADMIN),
    });

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar paquete' }));

    expect(onBlocked).toHaveBeenCalledWith(pkg);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('el botón eliminable no emite onBlocked (T07)', async () => {
    const onBlocked = vi.fn();
    const pkg = { shipmentNumber: 'BG-2026-00125', status: 'PENDING' };
    renderWithProviders(<DeletePackageButton pkg={pkg} onDelete={vi.fn()} onBlocked={onBlocked} />, {
      user: userWithRole(ROLES.SALES_ADMIN),
    });

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar paquete' }));

    expect(onBlocked).not.toHaveBeenCalled();
  });
});

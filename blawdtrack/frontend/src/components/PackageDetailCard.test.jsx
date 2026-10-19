import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PackageDetailCard from './PackageDetailCard';
import DeletePackageButton from './packages/DeletePackageButton';
import { renderWithProviders } from '../test-utils';
import { ROLES } from '../config/roles';

const PKG = {
  shipmentNumber: 'BG-2026-00125',
  orderNumber: 'ZI-88305',
  customerName: 'Paola Herrera Sánchez',
  address: 'Atenas, Alajuela',
  status: 'PENDING',
  items: [],
  assignedCourier: null,
};

const userWithRole = (role) => ({ id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role });

function renderCardWithDeleteButton(role, onDelete = vi.fn()) {
  renderWithProviders(
    <PackageDetailCard pkg={PKG} actions={<DeletePackageButton pkg={PKG} onDelete={onDelete} />} />,
    { user: userWithRole(role) }
  );
  return onDelete;
}

describe('PackageDetailCard: acciones al pie (HU-012 / T05)', () => {
  it('sin actions no muestra el pie ni ningún botón', () => {
    renderWithProviders(<PackageDetailCard pkg={PKG} />, { user: userWithRole(ROLES.SALES_ADMIN) });

    const card = screen.getByRole('region', { name: 'Ficha del paquete BG-2026-00125' });
    expect(within(card).queryByRole('button')).not.toBeInTheDocument();
  });

  it('con el botón de eliminar, el Administrador de Ventas lo ve en la ficha y emite el paquete', async () => {
    const onDelete = renderCardWithDeleteButton(ROLES.SALES_ADMIN);

    const card = screen.getByRole('region', { name: 'Ficha del paquete BG-2026-00125' });
    await userEvent.click(within(card).getByRole('button', { name: 'Eliminar' }));

    expect(onDelete).toHaveBeenCalledWith(PKG);
  });

  it.each([ROLES.SUPER_USER, ROLES.COURIER])('el rol %s ve la ficha sin el botón de eliminar', (role) => {
    renderCardWithDeleteButton(role);

    expect(screen.getByRole('region', { name: 'Ficha del paquete BG-2026-00125' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });
});

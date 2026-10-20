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

  it.each([ROLES.SALES_ADMIN, ROLES.SUPER_USER])('con el botón de eliminar, el rol %s lo ve en la ficha y emite el paquete', async (role) => {
    const onDelete = renderCardWithDeleteButton(role);

    const card = screen.getByRole('region', { name: 'Ficha del paquete BG-2026-00125' });
    await userEvent.click(within(card).getByRole('button', { name: 'Eliminar paquete' }));

    expect(onDelete).toHaveBeenCalledWith(PKG);
  });

  it('el Mensajero ve la ficha sin el botón de eliminar', () => {
    renderCardWithDeleteButton(ROLES.COURIER);

    expect(screen.getByRole('region', { name: 'Ficha del paquete BG-2026-00125' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar paquete' })).not.toBeInTheDocument();
  });
});

describe('PackageDetailCard: dirección con enlace de mapa', () => {
  const card = () => screen.getByRole('region', { name: 'Ficha del paquete BG-2026-00125' });

  it('muestra el texto de la dirección y un botón que abre el enlace de Maps pegado en ella', () => {
    const pkg = { ...PKG, address: 'Desamparados\nhttps://maps.app.goo.gl/hkVWJQqKTxnoWTDh7' };
    renderWithProviders(<PackageDetailCard pkg={pkg} />, { user: userWithRole(ROLES.SALES_ADMIN) });

    expect(within(card()).getByText('Desamparados')).toBeInTheDocument();
    expect(within(card()).queryByText(/maps\.app\.goo\.gl/)).not.toBeInTheDocument();
    const link = within(card()).getByRole('link', { name: 'Abrir ubicación en Maps' });
    expect(link).toHaveAttribute('href', 'https://maps.app.goo.gl/hkVWJQqKTxnoWTDh7');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('una dirección de texto no lleva botón y una vacía dice "No disponible"', () => {
    const { rerender } = renderWithProviders(<PackageDetailCard pkg={PKG} />, { user: userWithRole(ROLES.SALES_ADMIN) });
    expect(within(card()).getByText('Atenas, Alajuela')).toBeInTheDocument();
    expect(within(card()).queryByRole('link')).not.toBeInTheDocument();

    rerender(<PackageDetailCard pkg={{ ...PKG, address: '' }} />);
    expect(within(card()).getAllByText('No disponible').length).toBeGreaterThan(0);
  });
});

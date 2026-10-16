import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PackageDeletionList from './PackageDeletionList';
import { renderWithProviders } from '../../test-utils';
import { PACKAGE_STATES } from '../../config/packageStates';
import { ROLES } from '../../config/roles';

const PAQUETES = [
  { shipmentNumber: 'BG-1', customerName: 'Cliente Uno', address: 'Heredia', status: PACKAGE_STATES.PENDING },
  { shipmentNumber: 'BG-2', customerName: 'Cliente Dos', address: 'Cartago', status: PACKAGE_STATES.DELIVERED },
];

const userWithRole = (role) => ({ id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role });

function renderList(role, onEliminar = vi.fn()) {
  renderWithProviders(<PackageDeletionList paquetes={PAQUETES} onEliminar={onEliminar} />, { user: userWithRole(role) });
  return onEliminar;
}

describe('PackageDeletionList (HU-012 / T05)', () => {
  it('muestra una fila por paquete con su número de envío, cliente, dirección y estado', () => {
    renderList(ROLES.SALES_ADMIN);

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('BG-1')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Cliente Uno')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Heredia')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Pendiente')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Entregado')).toBeInTheDocument();
  });

  it('el subtítulo dice qué estados se pueden eliminar', () => {
    renderList(ROLES.SALES_ADMIN);

    expect(screen.getByText('Solo se eliminan paquetes en Pendiente o Asignado')).toBeInTheDocument();
  });

  it('para el Administrador de Ventas cada fila tiene su botón, y emite el paquete de esa fila', async () => {
    const onEliminar = renderList(ROLES.SALES_ADMIN);

    expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(2);

    await userEvent.click(within(screen.getAllByRole('listitem')[0]).getByRole('button', { name: 'Eliminar' }));

    expect(onEliminar).toHaveBeenCalledWith(PAQUETES[0]);
  });

  it.each([ROLES.SUPER_USER, ROLES.COURIER])('para el rol %s la lista se ve sin botones', (role) => {
    renderList(role);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });
});

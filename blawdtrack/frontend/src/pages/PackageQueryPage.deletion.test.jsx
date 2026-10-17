import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PackageQueryPage from './PackageQueryPage';
import { getPackageByShipmentNumber } from '../services/SearchPackageService';
import { deletePackage } from '../services/PackageDeletionService';
import { renderWithProviders } from '../test-utils';
import { ROLES } from '../config/roles';

// Se conserva `normalizeShipmentNumber` real y solo se simulan las llamadas HTTP.
vi.mock('../services/SearchPackageService', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getPackageByShipmentNumber: vi.fn() };
});
vi.mock('../services/PackageDeletionService', () => ({ deletePackage: vi.fn() }));

const PENDING_PACKAGE = {
  shipmentNumber: 'BG-2026-00125',
  orderNumber: 'ZI-88305',
  customerName: 'Paola Herrera Sánchez',
  address: 'Atenas, Alajuela',
  status: 'PENDING',
  items: [],
  assignedCourier: null,
};

const userWithRole = (role) => ({ id: 1, fullName: 'Usuario de prueba', email: 'prueba@test.com', role });

async function showPackage(role = ROLES.SALES_ADMIN, pkg = PENDING_PACKAGE) {
  getPackageByShipmentNumber.mockResolvedValue(pkg);
  renderWithProviders(<PackageQueryPage />, { user: userWithRole(role), route: '/paquetes/consulta' });
  await userEvent.type(screen.getByRole('textbox', { name: 'Número de envío' }), pkg.shipmentNumber);
  await userEvent.click(screen.getByRole('button', { name: /consultar/i }));
  return screen.findByRole('region', { name: `Ficha del paquete ${pkg.shipmentNumber}` });
}

async function openDeleteDialog() {
  const card = await showPackage();
  await userEvent.click(within(card).getByRole('button', { name: 'Eliminar' }));
  return screen.findByRole('alertdialog', { name: 'Eliminar paquete' });
}

describe('PackageQueryPage: eliminar desde la ficha (HU-012 / T06)', () => {
  beforeEach(() => {
    getPackageByShipmentNumber.mockReset();
    deletePackage.mockReset();
  });

  it('el Administrador de Ventas ve "Eliminar" en la ficha y abre la confirmación con el paquete', async () => {
    const dialog = await openDeleteDialog();

    expect(within(dialog).getByText('BG-2026-00125')).toBeInTheDocument();
    expect(within(dialog).getByText('Paola Herrera Sánchez · Atenas, Alajuela')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('el Súper Usuario ve la ficha sin el botón de eliminar', async () => {
    const card = await showPackage(ROLES.SUPER_USER);

    expect(within(card).queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });

  it('Cancelar cierra sin llamar al servicio y la ficha sigue', async () => {
    const dialog = await openDeleteDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deletePackage).not.toHaveBeenCalled();
    expect(screen.getByRole('region', { name: 'Ficha del paquete BG-2026-00125' })).toBeInTheDocument();
  });

  it('al confirmar se elimina una sola vez y la ficha desaparece, con el foco en el campo de búsqueda', async () => {
    deletePackage.mockResolvedValue({ message: 'Paquete eliminado correctamente.' });
    const dialog = await openDeleteDialog();

    await userEvent.dblClick(within(dialog).getByRole('button', { name: 'Sí, eliminar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deletePackage).toHaveBeenCalledTimes(1);
    expect(deletePackage).toHaveBeenCalledWith('BG-2026-00125');
    expect(screen.queryByRole('region', { name: 'Ficha del paquete BG-2026-00125' })).not.toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: 'Número de envío' });
    expect(input).toHaveValue('');
    await waitFor(() => expect(input).toHaveFocus());
  });

  it('si el backend rechaza la eliminación, el diálogo se cierra y la ficha sigue', async () => {
    deletePackage.mockRejectedValue(
      Object.assign(new Error('409'), { response: { status: 409, data: { code: 'PAQUETE_DESPACHADO' } } })
    );
    const dialog = await openDeleteDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Sí, eliminar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('region', { name: 'Ficha del paquete BG-2026-00125' })).toBeInTheDocument();
  });
});

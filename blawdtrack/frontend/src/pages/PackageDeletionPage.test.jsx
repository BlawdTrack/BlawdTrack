import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PackageDeletionPage from './PackageDeletionPage';
import { renderWithProviders } from '../test-utils';
import { deletePackage } from '../services/PackageDeletionService';
import { ROLES } from '../config/roles';

vi.mock('../services/PackageDeletionService', () => ({ deletePackage: vi.fn() }));

const SALES_ADMIN = { id: 1, fullName: 'Admin de Ventas', email: 'ventas@test.com', role: ROLES.SALES_ADMIN };

// BG-2026-00125 está en Pendiente en el fixture temporal de la pantalla.
const rowOf = (shipmentNumber) => screen.getByText(shipmentNumber).closest('li');

async function openDialogFor(shipmentNumber) {
  await userEvent.click(within(rowOf(shipmentNumber)).getByRole('button', { name: 'Eliminar' }));
  return screen.findByRole('alertdialog');
}

describe('PackageDeletionPage (HU-012 / T06)', () => {
  beforeEach(() => {
    deletePackage.mockReset();
  });

  it('Eliminar abre el diálogo del paquete y Cancelar lo cierra sin llamar al servicio', async () => {
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });

    const dialog = await openDialogFor('BG-2026-00125');
    expect(within(dialog).getByText('BG-2026-00125')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deletePackage).not.toHaveBeenCalled();
    expect(screen.getByText('BG-2026-00125')).toBeInTheDocument();
  });

  it('al confirmar con éxito, el paquete sale de la lista sin tocar los demás', async () => {
    deletePackage.mockResolvedValue({ message: 'Paquete eliminado correctamente.' });
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });
    const rowsBefore = screen.getAllByRole('listitem').length;

    const dialog = await openDialogFor('BG-2026-00125');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Sí, eliminar' }));

    await waitFor(() => expect(screen.queryByText('BG-2026-00125')).not.toBeInTheDocument());
    expect(deletePackage).toHaveBeenCalledTimes(1);
    expect(deletePackage).toHaveBeenCalledWith('BG-2026-00125');
    expect(screen.getAllByRole('listitem')).toHaveLength(rowsBefore - 1);
  });

  it('si el backend rechaza la eliminación, el paquete sigue en la lista y el diálogo se cierra', async () => {
    deletePackage.mockRejectedValue(Object.assign(new Error('409'), { response: { status: 409, data: { code: 'PAQUETE_DESPACHADO' } } }));
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });

    const dialog = await openDialogFor('BG-2026-00125');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Sí, eliminar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByText('BG-2026-00125')).toBeInTheDocument();
  });
});

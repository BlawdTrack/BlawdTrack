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

const httpError = (status, code) => Object.assign(new Error(String(status)), { response: { status, data: { code } } });

async function confirmDeletionOf(shipmentNumber) {
  const dialog = await openDialogFor(shipmentNumber);
  await userEvent.click(within(dialog).getByRole('button', { name: 'Sí, eliminar' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
}

describe('PackageDeletionPage: mensajes de resultado (HU-012 / T07)', () => {
  beforeEach(() => {
    deletePackage.mockReset();
  });

  it('tras eliminar muestra el mensaje de éxito', async () => {
    deletePackage.mockResolvedValue({ message: 'Paquete eliminado correctamente.' });
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });

    await confirmDeletionOf('BG-2026-00125');

    expect(await screen.findByText('Paquete BG-2026-00125 eliminado correctamente.')).toBeInTheDocument();
  });

  it('pulsar un botón no eliminable muestra el aviso y no abre el diálogo', async () => {
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });

    // BG-2026-00121 está en Entregado en el fixture.
    await userEvent.click(within(rowOf('BG-2026-00121')).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('El paquete BG-2026-00121 está en “Entregado”: ya no puede eliminarse.')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(deletePackage).not.toHaveBeenCalled();
  });

  it('un 409 muestra el aviso y deja el paquete (la recarga no lo da por eliminado)', async () => {
    deletePackage.mockRejectedValue(httpError(409, 'PAQUETE_DESPACHADO'));
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });

    await confirmDeletionOf('BG-2026-00125');

    expect(await screen.findByText('El paquete BG-2026-00125 ya fue despachado y no puede eliminarse.')).toBeInTheDocument();
    expect(screen.getByText('BG-2026-00125')).toBeInTheDocument();
  });

  it('un 404 muestra el error y la recarga quita el paquete que ya no existe', async () => {
    deletePackage.mockRejectedValue(httpError(404, 'PAQUETE_NO_ENCONTRADO'));
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });
    const rowsBefore = screen.getAllByRole('listitem').length;

    await confirmDeletionOf('BG-2026-00125');

    expect(await screen.findByText('El paquete BG-2026-00125 ya no existe. La lista se actualizó.')).toBeInTheDocument();
    expect(screen.queryByText('BG-2026-00125')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(rowsBefore - 1);
  });

  it('un 403 muestra el error de permisos sin el message del backend', async () => {
    deletePackage.mockRejectedValue(httpError(403, 'ACCESS_DENIED'));
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });

    await confirmDeletionOf('BG-2026-00125');

    expect(await screen.findByText('No tienes permiso para eliminar paquetes.')).toBeInTheDocument();
    expect(screen.getByText('BG-2026-00125')).toBeInTheDocument();
  });

  it('un error de red muestra el mensaje genérico', async () => {
    deletePackage.mockRejectedValue(new Error('Network Error'));
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });

    await confirmDeletionOf('BG-2026-00125');

    expect(await screen.findByText('No se pudo eliminar el paquete. Intenta de nuevo.')).toBeInTheDocument();
  });

  it('un 401 no muestra ningún mensaje (lo atiende el flujo de sesión)', async () => {
    deletePackage.mockRejectedValue(httpError(401, 'NO_AUTENTICADO'));
    renderWithProviders(<PackageDeletionPage />, { user: SALES_ADMIN });

    await confirmDeletionOf('BG-2026-00125');

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

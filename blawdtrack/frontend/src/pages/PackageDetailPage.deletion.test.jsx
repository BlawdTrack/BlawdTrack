import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import PackageDetailPage from './PackageDetailPage';
import { getPackageByShipmentNumber, getPackageHistory } from '../services/SearchPackageService';
import { deletePackage } from '../services/PackageDeletionService';
import { renderWithProviders } from '../test-utils';
import { ROLES } from '../config/roles';
import { ROUTES, packageDetailPath } from '../config/routes';

// Se conserva `normalizeShipmentNumber` real y solo se simulan las llamadas HTTP.
vi.mock('../services/SearchPackageService', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getPackageByShipmentNumber: vi.fn(), getPackageHistory: vi.fn() };
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

function PageUnderTest() {
  return (
    <Routes>
      <Route path={ROUTES.PACKAGE_DETAIL} element={<PackageDetailPage />} />
      <Route path={ROUTES.PACKAGE_SEARCH} element={<div>Pantalla de búsqueda</div>} />
    </Routes>
  );
}

async function showPackage(role = ROLES.SALES_ADMIN, pkg = PENDING_PACKAGE) {
  getPackageByShipmentNumber.mockResolvedValue(pkg);
  renderWithProviders(<PageUnderTest />, { user: userWithRole(role), route: packageDetailPath(pkg.shipmentNumber) });
  return screen.findByRole('region', { name: `Ficha del paquete ${pkg.shipmentNumber}` });
}

async function openDeleteDialog() {
  const card = await showPackage();
  await userEvent.click(within(card).getByRole('button', { name: 'Eliminar paquete' }));
  return screen.findByRole('alertdialog', { name: 'Eliminar paquete' });
}

describe('PackageDetailPage: eliminar desde la ficha (HU-012 / T06)', () => {
  beforeEach(() => {
    getPackageByShipmentNumber.mockReset();
    getPackageHistory.mockReset();
    getPackageHistory.mockResolvedValue([]);
    deletePackage.mockReset();
  });

  it('el Administrador de Ventas ve "Eliminar" en la ficha y abre la confirmación con el paquete', async () => {
    const dialog = await openDeleteDialog();

    expect(within(dialog).getByText('BG-2026-00125')).toBeInTheDocument();
    expect(within(dialog).getByText('Paola Herrera Sánchez · Atenas, Alajuela')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('el Súper Usuario ve "Eliminar" en la ficha y abre la confirmación', async () => {
    const card = await showPackage(ROLES.SUPER_USER);

    await userEvent.click(within(card).getByRole('button', { name: 'Eliminar paquete' }));

    expect(await screen.findByRole('alertdialog', { name: 'Eliminar paquete' })).toBeInTheDocument();
  });

  it('el Mensajero ve la ficha sin el botón de eliminar', async () => {
    const card = await showPackage(ROLES.COURIER);

    expect(within(card).queryByRole('button', { name: 'Eliminar paquete' })).not.toBeInTheDocument();
  });

  it('Cancelar cierra sin llamar al servicio y la ficha sigue', async () => {
    const dialog = await openDeleteDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deletePackage).not.toHaveBeenCalled();
    expect(screen.getByRole('region', { name: 'Ficha del paquete BG-2026-00125' })).toBeInTheDocument();
  });

  it('al confirmar se elimina una sola vez y la ficha da paso al aviso de eliminado, con el foco en volver', async () => {
    deletePackage.mockResolvedValue({ message: 'Paquete eliminado correctamente.' });
    const dialog = await openDeleteDialog();

    await userEvent.dblClick(within(dialog).getByRole('button', { name: 'Sí, eliminar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deletePackage).toHaveBeenCalledTimes(1);
    expect(deletePackage).toHaveBeenCalledWith('BG-2026-00125');
    expect(screen.queryByRole('region', { name: 'Ficha del paquete BG-2026-00125' })).not.toBeInTheDocument();
    expect(screen.getByText('Paquete eliminado')).toBeInTheDocument();
    // El foco va al "Volver a la búsqueda" del aviso.
    const backInNotice = screen.getByRole('button', { name: 'Volver a la búsqueda' });
    await waitFor(() => expect(backInNotice).toHaveFocus());
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

const httpError = (status, code) => Object.assign(new Error(String(status)), { response: { status, data: { code } } });

async function confirmDeletion() {
  const dialog = await openDeleteDialog();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Sí, eliminar' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
}

describe('PackageDetailPage: mensajes de resultado (HU-012 / T07)', () => {
  beforeEach(() => {
    getPackageByShipmentNumber.mockReset();
    getPackageHistory.mockReset();
    getPackageHistory.mockResolvedValue([]);
    deletePackage.mockReset();
  });

  it('tras eliminar muestra el mensaje de éxito', async () => {
    deletePackage.mockResolvedValue({ message: 'Paquete eliminado correctamente.' });

    await confirmDeletion();

    expect(await screen.findByText('Paquete BG-2026-00125 eliminado correctamente.')).toBeInTheDocument();
  });

  it('pulsar el botón de un paquete no eliminable muestra el aviso sin abrir el diálogo', async () => {
    const card = await showPackage(ROLES.SALES_ADMIN, { ...PENDING_PACKAGE, status: 'DELIVERED' });

    await userEvent.click(within(card).getByRole('button', { name: 'Eliminar paquete' }));

    expect(await screen.findByText('El paquete BG-2026-00125 está en “Entregado”: ya no puede eliminarse.')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(deletePackage).not.toHaveBeenCalled();
  });

  it('un 409 muestra el aviso y vuelve a consultar el paquete, que aparece con su estado nuevo', async () => {
    deletePackage.mockRejectedValue(httpError(409, 'PAQUETE_DESPACHADO'));
    await openDeleteDialog();
    getPackageByShipmentNumber.mockResolvedValue({ ...PENDING_PACKAGE, status: 'IN_TRANSIT' });

    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sí, eliminar' }));

    expect(await screen.findByText('El paquete BG-2026-00125 ya salió a reparto: ya no puede eliminarse.')).toBeInTheDocument();
    expect(getPackageByShipmentNumber).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('No eliminable en “En tránsito”')).toBeInTheDocument();
  });

  it('un 404 muestra el error y la nueva consulta indica que el paquete ya no existe', async () => {
    deletePackage.mockRejectedValue(httpError(404, 'PAQUETE_NO_ENCONTRADO'));
    await openDeleteDialog();
    getPackageByShipmentNumber.mockRejectedValue(httpError(404, 'PAQUETE_NO_ENCONTRADO'));

    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sí, eliminar' }));

    expect(await screen.findByText('El paquete BG-2026-00125 ya no existe.')).toBeInTheDocument();
    expect(getPackageByShipmentNumber).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(/No se encontró un paquete con el número de envío/)).toBeInTheDocument();
  });

  it('un 403 muestra el error de permisos y no vuelve a consultar', async () => {
    deletePackage.mockRejectedValue(httpError(403, 'ACCESS_DENIED'));

    await confirmDeletion();

    expect(await screen.findByText('No tienes permiso para eliminar paquetes.')).toBeInTheDocument();
    expect(getPackageByShipmentNumber).toHaveBeenCalledTimes(1);
  });

  it('un error de red muestra el mensaje genérico', async () => {
    deletePackage.mockRejectedValue(new Error('Network Error'));

    await confirmDeletion();

    expect(await screen.findByText('No se pudo eliminar el paquete. Intenta de nuevo.')).toBeInTheDocument();
  });

  it('un 401 no muestra ningún aviso (lo atiende el flujo de sesión)', async () => {
    deletePackage.mockRejectedValue(httpError(401, 'NO_AUTENTICADO'));

    await confirmDeletion();

    expect(document.querySelector('.MuiSnackbar-root')).toBeNull();
    expect(getPackageByShipmentNumber).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import PackageDetailPage from './PackageDetailPage';
import { getPackageByShipmentNumber, getPackageHistory } from '../services/SearchPackageService';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { ROUTES, packageDetailPath } from '../config/routes';

// Se conserva `normalizeShipmentNumber` real y solo se simula la llamada HTTP.
vi.mock('../services/SearchPackageService', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getPackageByShipmentNumber: vi.fn(), getPackageHistory: vi.fn() };
});

const salesAdmin = {
  id: 2,
  fullName: 'Fernanda Vindas Rojas',
  email: 'fernanda@blawdgourmet.com',
  role: 'ADMIN_VENTAS',
};

const packageDetail = {
  id: 10,
  shipmentNumber: 'BG-2026-00121',
  orderNumber: 'ZI-88301',
  customerName: 'Mariela Solís Gómez',
  phone: '8712-4410',
  address: 'Tibás, San José',
  schedule: '8:00 am – 12:00 md',
  status: 'DELIVERED',
  items: [
    { itemId: 'ART-1', name: 'Caja de chocolates', quantity: 2, sku: 'CH-100', unitPrice: 1500 },
  ],
  deliveryEvidenceUrl: null,
  deliverySignatureUrl: 'https://cdn.blawd.test/firma.png',
  deliveryPhotoUrl: 'https://cdn.blawd.test/foto.png',
  assignedCourier: {
    courierId: 5,
    fullName: 'María José Solano',
    phone: '7012-3344',
    schedule: '6:00 am – 2:00 pm',
  },
};

function PageUnderTest() {
  return (
    <Routes>
      <Route path={ROUTES.PACKAGE_DETAIL} element={<PackageDetailPage />} />
      <Route path={ROUTES.PACKAGE_SEARCH} element={<div>Pantalla de búsqueda</div>} />
    </Routes>
  );
}

const render = (shipmentNumber) =>
  renderWithProviders(<PageUnderTest />, { user: salesAdmin, route: packageDetailPath(shipmentNumber) });

describe('PackageDetailPage (HU-013)', () => {
  beforeEach(() => {
    getPackageByShipmentNumber.mockReset();
    getPackageHistory.mockReset();
    getPackageHistory.mockResolvedValue([]);
  });

  it('consulta el paquete del número que viene en la ruta', async () => {
    getPackageByShipmentNumber.mockResolvedValue(packageDetail);

    render('bg-2026-00121');

    // El servicio recibe el número normalizado (trim + mayúsculas).
    expect(await screen.findByRole('region', { name: 'Ficha del paquete BG-2026-00121' })).toBeInTheDocument();
    expect(getPackageByShipmentNumber).toHaveBeenCalledWith('BG-2026-00121');
  });

  it('la leyenda de solo lectura vive en un ! junto al número de envío y no hay botón para volver a los resultados', async () => {
    getPackageByShipmentNumber.mockResolvedValue(packageDetail);
    render('BG-2026-00121');
    await screen.findByText('Mariela Solís Gómez');

    expect(screen.queryByText(/La ficha es de solo lectura/)).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.hover(screen.getByRole('button', { name: 'Aviso sobre la ficha' }));
    expect(await screen.findByText(/La ficha es de solo lectura/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Volver a los resultados' })).not.toBeInTheDocument();
  });

  it('muestra la ficha con los datos reales del backend cuando la consulta tiene éxito', async () => {
    getPackageByShipmentNumber.mockResolvedValue(packageDetail);
    render('BG-2026-00121');

    expect(await screen.findByText('BG-2026-00121')).toBeInTheDocument();
    expect(screen.getByText('Mariela Solís Gómez')).toBeInTheDocument();
    expect(screen.getByText('8712-4410')).toBeInTheDocument();
    expect(screen.getByText('Tibás, San José')).toBeInTheDocument();
    expect(screen.getByText('8:00 am – 12:00 md')).toBeInTheDocument();
    expect(screen.getByText('María José Solano')).toBeInTheDocument();
    expect(screen.getByText('7012-3344 · 6:00 am – 2:00 pm')).toBeInTheDocument();
    // El estado sale del dato real, no fijo.
    expect(screen.getAllByText('Entregado').length).toBeGreaterThan(0);
    expect(screen.getByTestId('package-progress-DELIVERED')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Orden ZI-88301')).toBeInTheDocument();
    // Se muestran los artículos y la evidencia de entrega del backend.
    expect(screen.getByText('Caja de chocolates')).toBeInTheDocument();
    expect(screen.getByText(/Cantidad: 2 · SKU CH-100 · Precio unitario:/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Firma' })).toHaveAttribute('href', 'https://cdn.blawd.test/firma.png');
    expect(screen.getByRole('link', { name: 'Foto' })).toHaveAttribute('href', 'https://cdn.blawd.test/foto.png');
  });

  it('informa cuando el paquete no existe (404)', async () => {
    // El backend unificó el código en PAQUETE_NO_ENCONTRADO; la decisión se toma
    // solo por el estado HTTP, así que un cambio de código no rompe la pantalla.
    getPackageByShipmentNumber.mockRejectedValue({
      response: { status: 404, data: { code: 'PAQUETE_NO_ENCONTRADO' } },
    });
    render('BG-0000');

    expect(await screen.findByText(/No se encontró un paquete con el número de envío "BG-0000"/)).toBeInTheDocument();
  });

  it('informa un error de conexión sin romper la pantalla', async () => {
    getPackageByShipmentNumber.mockRejectedValue(new Error('network down'));
    render('BG-2026-00001');

    expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeInTheDocument();
    // Un error de red sí admite reintentar la misma consulta.
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('no muestra evidencia de entrega si el paquete no está entregado', async () => {
    getPackageByShipmentNumber.mockResolvedValue({
      ...packageDetail,
      shipmentNumber: 'BG-2026-00003',
      status: 'IN_TRANSIT',
      deliverySignatureUrl: null,
      deliveryPhotoUrl: null,
    });
    render('BG-2026-00003');

    expect(await screen.findByText('BG-2026-00003')).toBeInTheDocument();
    expect(screen.queryByText('Evidencia de entrega')).toBeNull();
  });

  it('indica que un paquete entregado no tiene evidencia registrada', async () => {
    getPackageByShipmentNumber.mockResolvedValue({
      ...packageDetail,
      deliverySignatureUrl: null,
      deliveryPhotoUrl: null,
      deliveryEvidenceUrl: null,
    });
    render('BG-2026-00004');

    expect(await screen.findByText('Sin evidencia registrada')).toBeInTheDocument();
  });

  it('maneja datos incompletos sin inventar valores', async () => {
    getPackageByShipmentNumber.mockResolvedValue({
      ...packageDetail,
      orderNumber: null,
      customerName: null,
      phone: null,
      address: null,
      schedule: null,
      assignedCourier: null,
    });
    render('BG-2026-00002');

    expect(await screen.findByText('Orden no disponible')).toBeInTheDocument();
    expect(screen.getByText('No especificado')).toBeInTheDocument();
    expect(screen.getByText('Sin mensajero asignado')).toBeInTheDocument();
    // Sin cliente: "No disponible" en el bloque del cliente.
    expect(screen.getAllByText('No disponible').length).toBeGreaterThan(0);
  });

  it('muestra bajo la ficha el historial de estados del paquete', async () => {
    getPackageByShipmentNumber.mockResolvedValue({ ...packageDetail, status: 'ASSIGNED' });
    getPackageHistory.mockResolvedValue([
      { timestamp: '2026-10-16T08:15:00', action: 'ASIGNAR_PAQUETE', actorName: 'Fernanda Vindas', previousStatus: 'PENDING', newStatus: 'ASSIGNED' },
    ]);

    render('BG-2026-00121');

    expect(await screen.findByRole('region', { name: 'Historial de estados' })).toBeInTheDocument();
    expect(await screen.findByText('Asignado', { selector: 'p' })).toBeInTheDocument();
    expect(getPackageHistory).toHaveBeenCalledWith('BG-2026-00121');
  });

  it('el comprobante de entrega está siempre y avisa que aún no hay entrega mientras el paquete no se entregue', async () => {
    getPackageByShipmentNumber.mockResolvedValue(packageDetail);
    const { unmount } = render('BG-2026-00121');
    expect(await screen.findByText('COMPROBANTE DE ENTREGA')).toBeInTheDocument();
    expect(screen.queryByText('El paquete aún no registra una entrega completada.')).toBeNull();
    unmount();

    getPackageByShipmentNumber.mockResolvedValue({ ...packageDetail, status: 'IN_TRANSIT' });
    render('BG-2026-00121');
    await screen.findByText('Mariela Solís Gómez');
    expect(screen.getByText('COMPROBANTE DE ENTREGA')).toBeInTheDocument();
    expect(screen.getByText('El paquete aún no registra una entrega completada.')).toBeInTheDocument();
  });
});

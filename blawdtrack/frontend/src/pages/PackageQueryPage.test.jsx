import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PackageQueryPage from './PackageQueryPage';
import { getPackageByShipmentNumber } from '../services/SearchPackageService';
import { renderWithProviders } from '../test-utils';

// Se conserva `normalizeShipmentNumber` real y solo se simula la llamada HTTP.
vi.mock('../services/SearchPackageService', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getPackageByShipmentNumber: vi.fn() };
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

const render = () => renderWithProviders(<PackageQueryPage />, { user: salesAdmin, route: '/paquetes/consulta' });

const search = async (user, value) => {
  const input = screen.getByRole('textbox', { name: 'Número de envío' });
  if (value) await user.type(input, value);
  await user.click(screen.getByRole('button', { name: /consultar/i }));
};

describe('PackageQueryPage (HU-013)', () => {
  beforeEach(() => {
    getPackageByShipmentNumber.mockReset();
  });

  it('no consulta si el campo está vacío y muestra la validación', async () => {
    const user = userEvent.setup();
    render();

    await search(user, '');

    expect(getPackageByShipmentNumber).not.toHaveBeenCalled();
    expect(screen.getByText('Ingresa un número de envío para consultar.')).toBeInTheDocument();
  });

  it('muestra la ficha con los datos reales del backend cuando la consulta tiene éxito', async () => {
    getPackageByShipmentNumber.mockResolvedValue(packageDetail);
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00121');

    // El servicio recibe el número normalizado (trim + mayúsculas).
    expect(getPackageByShipmentNumber).toHaveBeenCalledWith('BG-2026-00121');
    expect(await screen.findByText('BG-2026-00121')).toBeInTheDocument();
    expect(screen.getByText('Mariela Solís Gómez')).toBeInTheDocument();
    expect(screen.getByText('8712-4410')).toBeInTheDocument();
    expect(screen.getByText('Tibás, San José')).toBeInTheDocument();
    expect(screen.getByText('8:00 am – 12:00 md')).toBeInTheDocument();
    expect(screen.getByText('María José Solano')).toBeInTheDocument();
    expect(screen.getByText('7012-3344 · 6:00 am – 2:00 pm')).toBeInTheDocument();
    // El estado sale del dato real, no fijo.
    expect(screen.getByText('Entregado')).toBeInTheDocument();
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
    const user = userEvent.setup();
    render();

    await search(user, 'BG-0000');

    expect(await screen.findByText(/No se encontró un paquete con el número de envío "BG-0000"/)).toBeInTheDocument();
  });

  it('informa un error de conexión sin romper la pantalla', async () => {
    getPackageByShipmentNumber.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00001');

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
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00003');

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
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00004');

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
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00002');

    expect(await screen.findByText('Orden no disponible')).toBeInTheDocument();
    expect(screen.getByText('No especificado')).toBeInTheDocument();
    expect(screen.getByText('Sin mensajero asignado')).toBeInTheDocument();
    // Sin cliente: "No disponible" en el bloque del cliente.
    expect(screen.getAllByText('No disponible').length).toBeGreaterThan(0);
  });
});

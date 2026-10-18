import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PackageQueryPage from './PackageQueryPage';
import { getPackageByShipmentNumber, getPackageHistory } from '../services/SearchPackageService';
import { renderWithProviders } from '../test-utils';

// Se conserva `normalizeShipmentNumber` real y solo se simulan las llamadas HTTP.
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

const historyEntries = [
  {
    timestamp: '2026-09-16T22:19:00',
    action: 'CAMBIAR_ESTADO_PAQUETE',
    details: 'Paquete registrado',
    actorName: 'Administrador de Ventas',
    previousStatus: null,
    newStatus: 'PENDING',
  },
  {
    timestamp: '2026-09-17T03:09:00',
    action: 'ASIGNAR_PAQUETE',
    details: 'Asignado a María José Solano',
    actorName: 'María José Solano',
    previousStatus: 'PENDING',
    newStatus: 'ASSIGNED',
  },
  {
    timestamp: '2026-09-17T08:30:00',
    action: 'CAMBIAR_ESTADO_PAQUETE',
    details: 'Entrega confirmada',
    actorName: null,
    previousStatus: 'IN_TRANSIT',
    newStatus: 'DELIVERED',
  },
];
const render = () => renderWithProviders(<PackageQueryPage />, { user: salesAdmin, route: '/paquetes/consulta' });

const search = async (user, value) => {
  const input = screen.getByRole('textbox', { name: 'Número de envío' });
  if (value) await user.type(input, value);
  await user.click(screen.getByRole('button', { name: /consultar/i }));
};

describe('PackageQueryPage (HU-013)', () => {
  beforeEach(() => {
    getPackageByShipmentNumber.mockReset();
getPackageHistory.mockReset();
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
it('muestra el historial de estados reales del paquete consultado', async () => {
    getPackageByShipmentNumber.mockResolvedValue(packageDetail);
    getPackageHistory.mockResolvedValue(historyEntries);
    const user = userEvent.setup();
    render();

    await search(user, 'bg-2026-00121');

    // El historial se pide para el mismo paquete, con el número normalizado.
    expect(getPackageHistory).toHaveBeenCalledWith('BG-2026-00121');
    expect(await screen.findByText('Historial de estados')).toBeInTheDocument();

    // Nombre descriptivo del evento, tomado del estado real de cada registro.
    expect(screen.getByText('Registrado como Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Asignado')).toBeInTheDocument();
    // "Entregado" aparece tanto en la píldora del paquete como en el historial.
    expect(screen.getAllByText('Entregado').length).toBeGreaterThanOrEqual(2);

    // Fecha · hora · responsable, con el momento real del cambio.
    expect(screen.getByText('16/09/2026 · 22:19 · Administrador de Ventas')).toBeInTheDocument();
    expect(screen.getByText('17/09/2026 · 03:09 · María José Solano')).toBeInTheDocument();

    // Un evento sin responsable muestra solo fecha y hora (sin "undefined").
    expect(screen.getByText('17/09/2026 · 08:30')).toBeInTheDocument();
  });

  it('muestra el mensaje de historial vacío sin inventar registros', async () => {
    getPackageByShipmentNumber.mockResolvedValue(packageDetail);
    getPackageHistory.mockResolvedValue([]);
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00121');

    expect(await screen.findByText('No hay historial de estados disponible para este paquete.')).toBeInTheDocument();
  });

  it('si falla el historial conserva la ficha del paquete y permite reintentar', async () => {
    getPackageByShipmentNumber.mockResolvedValue(packageDetail);
    getPackageHistory.mockRejectedValueOnce(new Error('network down'));
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00121');

    // La ficha general sigue visible aunque el historial falle.
    expect(await screen.findByText('Mariela Solís Gómez')).toBeInTheDocument();
    expect(screen.getByText(/No se pudo conectar con el servidor para cargar el historial/)).toBeInTheDocument();

    // Al reintentar con éxito, se muestran los registros.
    getPackageHistory.mockResolvedValueOnce(historyEntries);
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(await screen.findByText('Registrado como Pendiente')).toBeInTheDocument();
    expect(getPackageHistory).toHaveBeenCalledTimes(2);
  });

  it('actualiza el historial al consultar otro paquete', async () => {
    getPackageByShipmentNumber.mockResolvedValueOnce(packageDetail);
    getPackageHistory.mockResolvedValueOnce([historyEntries[2]]);
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00121');
    expect(await screen.findByText('17/09/2026 · 08:30')).toBeInTheDocument();

    // Segunda consulta: otro paquete con su propio historial.
    getPackageByShipmentNumber.mockResolvedValueOnce({ ...packageDetail, shipmentNumber: 'BG-2026-00999', status: 'PENDING' });
    getPackageHistory.mockResolvedValueOnce([historyEntries[0]]);

    const input = screen.getByRole('textbox', { name: 'Número de envío' });
    await user.clear(input);
    await user.type(input, 'BG-2026-00999');
    await user.click(screen.getByRole('button', { name: /consultar/i }));

    expect(await screen.findByText('Registrado como Pendiente')).toBeInTheDocument();
    // No se conservan eventos de la consulta anterior.
    expect(screen.queryByText('17/09/2026 · 08:30')).toBeNull();
  });

  it('muestra el comprobante de entrega real del paquete consultado', async () => {
    getPackageByShipmentNumber.mockResolvedValue(packageDetail);
    getPackageHistory.mockResolvedValue(historyEntries);
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00121');

    expect(await screen.findByRole('heading', { name: 'COMPROBANTE DE ENTREGA' })).toBeInTheDocument();
    // La fotografía sale del registro real del backend, con su firma y su fecha.
    expect(screen.getByAltText('Fotografía de la entrega del paquete BG-2026-00121'))
      .toHaveAttribute('src', 'https://cdn.blawd.test/foto.png');
    expect(screen.getByText(/Firma digital registrada al cierre de la entrega\./)).toBeInTheDocument();
    expect(screen.getByText(/Entrega registrada el 17\/09\/2026 a las 08:30\./)).toBeInTheDocument();
  });

  it('actualiza el comprobante al consultar otro paquete', async () => {
    getPackageByShipmentNumber.mockResolvedValueOnce(packageDetail);
    getPackageHistory.mockResolvedValueOnce(historyEntries);
    const user = userEvent.setup();
    render();

    await search(user, 'BG-2026-00121');
    expect(await screen.findByAltText(/BG-2026-00121/)).toBeInTheDocument();

    // Segunda consulta: paquete aún no entregado, sin evidencia de la anterior.
    getPackageByShipmentNumber.mockResolvedValueOnce({
      ...packageDetail,
      shipmentNumber: 'BG-2026-00999',
      status: 'PENDING',
      deliverySignatureUrl: null,
      deliveryPhotoUrl: null,
    });
    getPackageHistory.mockResolvedValueOnce([historyEntries[0]]);

    const input = screen.getByRole('textbox', { name: 'Número de envío' });
    await user.clear(input);
    await user.type(input, 'BG-2026-00999');
    await user.click(screen.getByRole('button', { name: /consultar/i }));

    expect(await screen.findByText('El paquete aún no registra una entrega completada.')).toBeInTheDocument();
    expect(screen.queryByAltText(/fotografía de la entrega/i)).toBeNull();
    expect(screen.queryByText(/Firma digital registrada/)).toBeNull();
  });
});

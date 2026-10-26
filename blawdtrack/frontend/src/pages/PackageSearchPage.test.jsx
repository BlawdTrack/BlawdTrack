import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { PackageSearchPage } from './PackageSearchPage';
import { fetchStatusCounts, searchPackages } from '../services/PackageService';
import { deletePackage } from '../services/PackageDeletionService';
import { renderWithProviders } from '../test-utils';
import { ROLES } from '../config/roles';

vi.mock('../services/PackageService', () => ({
  searchPackages: vi.fn(),
  fetchStatusCounts: vi.fn(),
}));
vi.mock('../services/PackageDeletionService', () => ({ deletePackage: vi.fn() }));

const salesAdmin = { id: 1, fullName: 'Celeste', email: 'celeste@blawdgourmet.com', role: ROLES.SALES_ADMIN };
const renderPage = (route = '/') => renderWithProviders(<PackageSearchPage />, { user: salesAdmin, route });

describe('PackageSearchPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    fetchStatusCounts.mockResolvedValue({ PENDING: 3, ASSIGNED: 1, SHIPPED: 0, IN_TRANSIT: 0, DELIVERED: 2, NOT_DELIVERED: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the distribution list on mount and shows the error alert', async () => {
    searchPackages.mockRejectedValueOnce({ response: { status: 500 } });
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(searchPackages).toHaveBeenCalledWith(expect.objectContaining({
      term: '',
      page: 0,
      size: 100,
      signal: expect.any(AbortSignal),
    }));
    expect(screen.getByRole('alert')).toHaveTextContent(/error inesperado/i);
  });

  it('renders the package list after the distribution results load', async () => {
    searchPackages.mockResolvedValueOnce({
      content: [{
        id: 1,
        shipmentNumber: 'BG-2026-001',
        orderNumber: 'ORD-100',
        customerName: 'Luis Madrigal',
        phone: '8888-9999',
        address: 'HEREDIA, Barva',
        status: 'PENDING',
        schedule: '08:00 AM - 12:00 PM',
      }],
      totalElements: 1,
    });
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const table = screen.getByRole('region', { name: 'Paquetes encontrados' });
    expect(within(table).getByText('BG-2026-001')).toBeInTheDocument();
    expect(within(table).getByText('Orden ORD-100')).toBeInTheDocument();
    expect(within(table).getByText('Luis Madrigal')).toBeInTheDocument();
    expect(within(table).getByText('8:00 am - 12:00 pm')).toBeInTheDocument();
    expect(within(table).getByText('Pendiente')).toBeInTheDocument();
  });

  it('con más de una página muestra "Cargar más" y suma los paquetes siguientes a la lista', async () => {
    const pkg = (id) => ({
      id, shipmentNumber: `BG-2026-00${id}`, orderNumber: `ORD-${id}`, customerName: `Cliente ${id}`,
      phone: '8888-9999', address: 'HEREDIA', status: 'PENDING', schedule: null,
    });
    searchPackages
      .mockResolvedValueOnce({ content: [pkg(2)], page: 0, size: 1, totalElements: 2, totalPages: 2 })
      .mockResolvedValueOnce({ content: [pkg(1)], page: 1, size: 1, totalElements: 2, totalPages: 2 });
    renderPage();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText('Mostrando 1 de 2 paquetes')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cargar más paquetes' }));
    });

    const table = screen.getByRole('region', { name: 'Paquetes encontrados' });
    expect(within(table).getByText('BG-2026-002')).toBeInTheDocument();
    expect(within(table).getByText('BG-2026-001')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cargar más paquetes' })).not.toBeInTheDocument();
  });

  it('no muestra "Cargar más" cuando la lista cabe en una sola página', async () => {
    searchPackages.mockResolvedValueOnce({
      content: [{ id: 1, shipmentNumber: 'BG-2026-001', customerName: 'Luis', status: 'PENDING' }],
      page: 0, size: 100, totalElements: 1, totalPages: 1,
    });
    renderPage();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.queryByRole('button', { name: 'Cargar más paquetes' })).not.toBeInTheDocument();
  });

  it('updates the table when the user presses Buscar', async () => {
    const distributionPayload = {
      content: [{
        id: 1,
        shipmentNumber: 'BG-2026-001',
        orderNumber: 'ORD-100',
        customerName: 'Luis Madrigal',
        phone: '8888-9999',
        address: 'HEREDIA, Barva',
        status: 'PENDING',
        schedule: '08:00 AM',
      }],
      totalElements: 1,
    };
    const searchPayload = {
      content: [{
        id: 2,
        shipmentNumber: 'BG-2026-002',
        orderNumber: 'ORD-200',
        customerName: 'Marta López',
        phone: '2222-3333',
        address: 'LIMÓN, Pococí',
        status: 'ASSIGNED',
        schedule: '09:30 AM',
      }],
      totalElements: 1,
    };

    searchPackages.mockResolvedValueOnce(distributionPayload);
    renderPage();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    searchPackages.mockResolvedValueOnce(searchPayload);
    fireEvent.change(input, { target: { value: 'Limon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const table = screen.getByRole('region', { name: 'Paquetes encontrados' });
    expect(within(table).getByText('BG-2026-002')).toBeInTheDocument();
    expect(within(table).queryByText('BG-2026-001')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('1 de 1 paquetes coinciden con “Limon”');
  });

  it('does not render the results table when the backend returns no content', async () => {
    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.queryByRole('region', { name: 'Paquetes encontrados' })).toBeNull();
  });

  it('does not render the results table while results are still null', async () => {
    searchPackages.mockImplementation(() => new Promise(() => {}));
    renderPage();

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    fireEvent.change(input, { target: { value: 'Limon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.queryByRole('region', { name: 'Paquetes encontrados' })).toBeNull();
  });

  it('shows the result count and clears the search term', async () => {
    searchPackages.mockResolvedValueOnce({
      content: [{
        id: 1,
        shipmentNumber: 'BG-2026-001',
        address: 'HEREDIA, Barva',
        status: 'PENDING',
        schedule: '08:00 AM',
      }],
      totalElements: 46,
    });
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByRole('status')).toHaveTextContent('46 paquetes en la lista de distribución');
    expect(within(screen.getByRole('region', { name: 'Paquetes encontrados' })).getAllByText('BG-2026-001')).toHaveLength(1);
    expect(screen.getByRole('region', { name: 'Paquetes encontrados' })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Paquetes encontrados' })).getByText('BG-2026-001')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Paquetes encontrados' })).getAllByText('Pendiente')).toHaveLength(1);
    expect(within(screen.getByRole('region', { name: 'Paquetes encontrados' })).getByText('8:00 am')).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    fireEvent.change(input, { target: { value: 'Heredia' } });
    expect(input).toHaveValue('Heredia');
    expect(screen.queryByRole('button', { name: 'Limpiar' })).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('46 paquetes en la lista de distribución');

    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    fireEvent.change(input, { target: { value: 'Limon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByRole('status')).toHaveTextContent('0 de 46 paquetes coinciden con “Limon”');

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(input).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('46 paquetes en la lista de distribución');
  });

  it('shows the empty-state card for a search with no matches and hides it after clearing', async () => {
    searchPackages.mockResolvedValueOnce({ content: [{ id: 1, shipmentNumber: 'BG-2026-001' }], totalElements: 1 });
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    fireEvent.change(input, { target: { value: 'Limon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText('Sin resultados para “Limon”')).toBeInTheDocument();
    expect(screen.getByText('Sin resultados para “Limon”')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 de 1 paquetes coinciden con “Limon”');

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(input).toHaveValue('');
    expect(screen.queryByText('Sin resultados para “Limon”')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 paquete en la lista de distribución');
  });

  it('does not show the empty state when the term is empty, while loading or when there is an error', async () => {
    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.queryByText(/Sin resultados para/i)).not.toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    searchPackages.mockImplementation(() => new Promise(() => {}));
    fireEvent.change(input, { target: { value: 'Limon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByText(/Sin resultados para/i)).not.toBeInTheDocument();

    searchPackages.mockRejectedValueOnce({ response: { status: 500 } });
    fireEvent.change(input, { target: { value: 'Mango' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByText(/Sin resultados para/i)).not.toBeInTheDocument();
  });

  it('also clears the empty state when the bar clear button is used', async () => {
    searchPackages.mockResolvedValueOnce({ content: [{ id: 1, shipmentNumber: 'BG-2026-001' }], totalElements: 1 });
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    fireEvent.change(input, { target: { value: 'Limon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText('Sin resultados para “Limon”')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(input).toHaveValue('');
    expect(screen.queryByText('Sin resultados para “Limon”')).not.toBeInTheDocument();
  });

  describe('filtro por estado, eliminar y estados vacíos', () => {
    const pkg = (id, status, extra = {}) => ({
      id, shipmentNumber: `BG-2026-00${id}`, orderNumber: `ORD-${id}`, customerName: `Cliente ${id}`,
      phone: '8888-9999', address: 'HEREDIA', status, schedule: null, ...extra,
    });
    const settle = () => act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    it('las pestañas de estado muestran la cantidad de cada estado y filtran al instante sin escribir nada', async () => {
      searchPackages
        .mockResolvedValueOnce({ content: [pkg(2, 'PENDING'), pkg(1, 'DELIVERED')], totalElements: 2 })
        .mockResolvedValueOnce({ content: [pkg(1, 'DELIVERED')], totalElements: 1 });
      renderPage();
      await settle();

      expect(screen.getByTestId('package-status-count-all')).toHaveTextContent('6');
      expect(screen.getByTestId('package-status-count-PENDING')).toHaveTextContent('3');
      expect(screen.getByTestId('package-status-count-IN_TRANSIT')).toHaveTextContent('0');

      fireEvent.click(screen.getByTestId('package-status-DELIVERED'));
      await settle();

      expect(searchPackages).toHaveBeenLastCalledWith(expect.objectContaining({ term: '', status: 'DELIVERED' }));
      expect(screen.getByTestId('package-status-DELIVERED')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('package-search-summary')).toHaveTextContent('1 de 2 paquetes coinciden con en estado “Entregado”');
      expect(within(screen.getByRole('region', { name: 'Paquetes encontrados' })).queryByText('BG-2026-002')).toBeNull();
    });

    it('un estado sin paquetes dice que no hay paquetes en ese estado y se puede limpiar', async () => {
      searchPackages
        .mockResolvedValueOnce({ content: [pkg(1, 'PENDING')], totalElements: 1 })
        .mockResolvedValueOnce({ content: [], totalElements: 0 });
      renderPage();
      await settle();

      fireEvent.click(screen.getByTestId('package-status-IN_TRANSIT'));
      await settle();

      expect(screen.getByText('Sin paquetes en estado “En tránsito”')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
      expect(screen.queryByText('Sin paquetes en estado “En tránsito”')).not.toBeInTheDocument();
      expect(screen.getByTestId('package-status-all')).toHaveAttribute('aria-pressed', 'true');
    });

    it('sin paquetes en la lista explica qué hacer y lleva a la importación', async () => {
      searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
      renderPage();
      await settle();

      expect(screen.getByText('Aún no hay paquetes en la lista')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Ir a Importación de paquetes' })).toHaveAttribute('href', '/main-menu/paquetes/importar');
    });

    it('un número de envío que no existe muestra que no hubo resultados', async () => {
      searchPackages
        .mockResolvedValueOnce({ content: [pkg(1, 'PENDING')], totalElements: 1 })
        .mockResolvedValueOnce({ content: [], totalElements: 0 });
      renderPage();
      await settle();

      fireEvent.change(screen.getByRole('textbox', { name: 'Buscar paquetes' }), { target: { value: 'BG-2026-999' } });
      fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
      await settle();

      expect(screen.getByTestId('package-search-empty-title')).toHaveTextContent('Sin resultados para “BG-2026-999”');
    });

    it('Eliminar en una fila pide confirmación, elimina el paquete, avisa y vuelve a pedir la lista y los conteos', async () => {
      searchPackages
        .mockResolvedValueOnce({ content: [pkg(2, 'PENDING'), pkg(1, 'PENDING')], totalElements: 2 })
        .mockResolvedValueOnce({ content: [pkg(1, 'PENDING')], totalElements: 1 });
      deletePackage.mockResolvedValue({});
      renderPage();
      await settle();

      fireEvent.click(screen.getByRole('button', { name: 'Eliminar paquete BG-2026-002' }));
      await settle();
      const dialog = screen.getByRole('alertdialog', { name: 'Eliminar paquete' });
      expect(within(dialog).getByText('BG-2026-002')).toBeInTheDocument();

      fireEvent.click(within(dialog).getByRole('button', { name: /Sí, eliminar/ }));
      await settle();

      expect(deletePackage).toHaveBeenCalledWith('BG-2026-002');
      expect(screen.getByText('Paquete BG-2026-002 eliminado correctamente.')).toBeInTheDocument();
      expect(searchPackages).toHaveBeenCalledTimes(2);
      expect(fetchStatusCounts).toHaveBeenCalledTimes(2);
    });

    it('Eliminar en un paquete despachado avisa por qué no se puede y no abre la confirmación', async () => {
      searchPackages.mockResolvedValueOnce({ content: [pkg(1, 'SHIPPED')], totalElements: 1 });
      renderPage();
      await settle();

      fireEvent.click(screen.getByRole('button', { name: 'Eliminar paquete BG-2026-001' }));
      await settle();

      expect(screen.getByText(/está en “Enviado”: ya no puede eliminarse/)).toBeInTheDocument();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('muestra el aviso que deja la importación al llegar desde ahí', async () => {
    searchPackages.mockResolvedValue({ content: [], totalElements: 0 });
    renderPage({ pathname: '/', state: { notice: { message: '2 paquetes registrados de zoho.xlsx.', severity: 'success' } } });
    await act(async () => {});

    expect(screen.getByText('2 paquetes registrados de zoho.xlsx.')).toBeInTheDocument();
  });
});

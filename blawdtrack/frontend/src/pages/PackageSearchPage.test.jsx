import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { PackageSearchPage } from './PackageSearchPage';
import { searchPackages } from '../services/PackageService';

vi.mock('../services/PackageService', () => ({
  searchPackages: vi.fn(),
}));

describe('PackageSearchPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires the search automatically after the debounce and shows the error alert', async () => {
    searchPackages.mockRejectedValueOnce({ response: { status: 500 } });
    render(<PackageSearchPage />);

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
        status: 'PENDIENTE',
        schedule: '08:00 AM - 12:00 PM',
      }],
      totalElements: 1,
    });
    render(<PackageSearchPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const table = screen.getByRole('table', { name: 'Listado de paquetes' });
    expect(within(table).getByText('N.º ENVÍO')).toBeInTheDocument();
    expect(within(table).getByText('BG-2026-001')).toBeInTheDocument();
    expect(within(table).getByText('Orden ORD-100')).toBeInTheDocument();
    expect(within(table).getByText('Luis Madrigal')).toBeInTheDocument();
    expect(within(table).getByText('8:00 am - 12:00 pm')).toBeInTheDocument();
    expect(within(table).getByText('Pendiente')).toBeInTheDocument();
  });

  it('updates the table when the user types a search term without a dedicated button', async () => {
    const distributionPayload = {
      content: [{
        id: 1,
        shipmentNumber: 'BG-2026-001',
        orderNumber: 'ORD-100',
        customerName: 'Luis Madrigal',
        phone: '8888-9999',
        address: 'HEREDIA, Barva',
        status: 'PENDIENTE',
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
        status: 'ASIGNADO',
        schedule: '09:30 AM',
      }],
      totalElements: 1,
    };

    searchPackages.mockResolvedValueOnce(distributionPayload);
    render(<PackageSearchPage />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    searchPackages.mockResolvedValueOnce(searchPayload);
    fireEvent.change(input, { target: { value: 'Limon' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    const table = screen.getByRole('table', { name: 'Listado de paquetes' });
    expect(within(table).getByText('BG-2026-002')).toBeInTheDocument();
    expect(within(table).queryByText('BG-2026-001')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('1 de 1 paquetes coinciden con “Limon”');
  });

  it('does not render the results table when the backend returns no content', async () => {
    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    render(<PackageSearchPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.queryByRole('table')).toBeNull();
  });

  it('does not render the results table while results are still null', async () => {
    searchPackages.mockImplementation(() => new Promise(() => {}));
    render(<PackageSearchPage />);

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    fireEvent.change(input, { target: { value: 'Limon' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.queryByRole('table')).toBeNull();
  });

  it('shows the result count and clears the search term', async () => {
    searchPackages.mockResolvedValueOnce({
      content: [{
        id: 1,
        shipmentNumber: 'BG-2026-001',
        address: 'HEREDIA, Barva',
        status: 'PENDIENTE',
        schedule: '08:00 AM',
      }],
      totalElements: 46,
    });
    render(<PackageSearchPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByRole('status')).toHaveTextContent('46 paquetes en la lista de distribución');

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    fireEvent.click(screen.getByRole('button', { name: 'Heredia' }));
    expect(input).toHaveValue('Heredia');
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(input).toHaveValue('');

    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    fireEvent.change(input, { target: { value: 'Limon' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.getByRole('status')).toHaveTextContent('0 de 46 paquetes coinciden con “Limon”');

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(input).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('46 paquetes en la lista de distribución');
  });
});

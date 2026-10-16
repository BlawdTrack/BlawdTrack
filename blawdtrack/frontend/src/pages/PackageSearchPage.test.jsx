import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getAllByText('BG-2026-001')).toHaveLength(1);
    expect(screen.getByRole('table', { name: 'Paquetes encontrados' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /BG-2026-001/ })).toBeInTheDocument();
    expect(screen.getAllByText('Pendiente')).toHaveLength(1);
    expect(screen.getByText('08:00 AM')).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    fireEvent.change(input, { target: { value: 'Heredia' } });
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

  it('shows the empty-state card for a search with no matches and hides it after clearing', async () => {
    searchPackages.mockResolvedValueOnce({ content: [{ id: 1, shipmentNumber: 'BG-2026-001' }], totalElements: 1 });
    render(<PackageSearchPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    fireEvent.change(input, { target: { value: 'Limon' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByRole('heading', { name: 'Sin resultados para “Limon”', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Sin resultados para “Limon”' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 de 1 paquetes coinciden con “Limon”');

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(input).toHaveValue('');
    expect(screen.queryByRole('heading', { name: 'Sin resultados para “Limon”', level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 paquete en la lista de distribución');
  });

  it('does not show the empty state when the term is empty, while loading or when there is an error', async () => {
    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    render(<PackageSearchPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.queryByText(/Sin resultados para/i)).not.toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    searchPackages.mockImplementation(() => new Promise(() => {}));
    fireEvent.change(input, { target: { value: 'Limon' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.queryByText(/Sin resultados para/i)).not.toBeInTheDocument();

    searchPackages.mockRejectedValueOnce({ response: { status: 500 } });
    fireEvent.change(input, { target: { value: 'Mango' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.queryByText(/Sin resultados para/i)).not.toBeInTheDocument();
  });

  it('also clears the empty state when the bar clear button is used', async () => {
    searchPackages.mockResolvedValueOnce({ content: [{ id: 1, shipmentNumber: 'BG-2026-001' }], totalElements: 1 });
    render(<PackageSearchPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const input = screen.getByRole('textbox', { name: 'Buscar paquetes' });
    searchPackages.mockResolvedValueOnce({ content: [], totalElements: 0 });
    fireEvent.change(input, { target: { value: 'Limon' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByRole('heading', { name: 'Sin resultados para “Limon”', level: 2 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(input).toHaveValue('');
    expect(screen.queryByRole('heading', { name: 'Sin resultados para “Limon”', level: 2 })).not.toBeInTheDocument();
  });
});

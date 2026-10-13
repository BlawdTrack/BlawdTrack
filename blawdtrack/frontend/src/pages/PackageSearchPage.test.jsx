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
    expect(screen.getByText('BG-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Heredia')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('8:00 am')).toBeInTheDocument();

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

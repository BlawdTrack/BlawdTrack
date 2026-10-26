import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PackageSearchEmptyState from './PackageSearchEmptyState';

describe('PackageSearchEmptyState', () => {
  it('shows the empty state with the expected title, help text and clear action', () => {
    const onClear = vi.fn();

    render(<PackageSearchEmptyState term="Limon" onClear={onClear} />);

    expect(screen.getByTestId('package-search-empty-title')).toHaveTextContent('Sin resultados para “Limon”');
    expect(screen.getByText(/Revisa la ortografía o prueba con menos letras/)).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Limpiar búsqueda' });
    fireEvent.click(button);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders a long term in the title', () => {
    const longTerm = 'a'.repeat(100);
    render(<PackageSearchEmptyState term={longTerm} onClear={() => {}} />);

    expect(screen.getByText(`Sin resultados para “${longTerm}”`)).toBeInTheDocument();
  });

  it('un término con forma de número de envío muestra que no hubo resultados', () => {
    render(<PackageSearchEmptyState term="BG-2026-999" onClear={() => {}} />);

    expect(screen.getByTestId('package-search-empty-title')).toHaveTextContent('Sin resultados para “BG-2026-999”');
    expect(screen.getByText(/Revisa la ortografía o prueba con menos letras/)).toBeInTheDocument();
  });

  it('un filtro de estado sin término dice que no hay paquetes en ese estado', () => {
    render(<PackageSearchEmptyState term="" statusLabel="Entregado" onClear={() => {}} />);

    expect(screen.getByText('Sin paquetes en estado “Entregado”')).toBeInTheDocument();
  });
});

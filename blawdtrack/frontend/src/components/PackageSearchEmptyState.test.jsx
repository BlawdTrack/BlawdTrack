import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PackageSearchEmptyState from './PackageSearchEmptyState';

describe('PackageSearchEmptyState', () => {
  it('shows the empty state with the expected title, help text and clear action', () => {
    const onClear = vi.fn();

    render(<PackageSearchEmptyState term="Limon" onClear={onClear} />);

    expect(screen.getByText('Sin resultados para “Limon”')).toBeInTheDocument();
    expect(screen.getByText('Revisa el número de envío o prueba con otro criterio: orden, cliente, dirección, teléfono u horario de preferencia.')).toBeInTheDocument();

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
});

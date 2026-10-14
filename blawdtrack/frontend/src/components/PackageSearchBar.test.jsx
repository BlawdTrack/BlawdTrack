import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PackageSearchBar } from './PackageSearchBar';

describe('PackageSearchBar', () => {
  it('renders the live search label, placeholder and triggers onChange', () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();
    const { rerender } = render(
      <PackageSearchBar value="" onChange={handleChange} onClear={handleClear} isLoading={false} maxLength={100} />
    );

    expect(screen.getByText('BÚSQUEDA EN VIVO')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('N.º de envío, orden, cliente, dirección, teléfono u horario')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar paquetes'), { target: { value: 'cafe' } });
    expect(handleChange).toHaveBeenCalledWith('cafe');
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(handleClear).toHaveBeenCalledOnce();

    rerender(<PackageSearchBar value="cafe" onChange={handleChange} onClear={handleClear} isLoading={false} maxLength={100} />);
    expect(screen.getByDisplayValue('cafe')).toBeInTheDocument();
  });

  it('shows the progress indicator only while loading and respects the max length', () => {
    const { rerender } = render(
      <PackageSearchBar value="" onChange={() => {}} onClear={() => {}} isLoading={false} maxLength={10} />
    );

    expect(screen.queryByRole('progressbar')).toBeNull();
    const input = screen.getByLabelText('Buscar paquetes');
    expect(input).toHaveAttribute('maxlength', '10');

    rerender(<PackageSearchBar value="" onChange={() => {}} onClear={() => {}} isLoading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpiar' })).toBeInTheDocument();
  });

  it('does not submit on Enter', () => {
    const handleChange = vi.fn();
    render(<PackageSearchBar value="" onChange={handleChange} onClear={() => {}} isLoading={false} maxLength={50} />);
    const input = screen.getByLabelText('Buscar paquetes');

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(handleChange).not.toHaveBeenCalled();
  });
});

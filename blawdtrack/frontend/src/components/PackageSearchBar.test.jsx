import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PackageSearchBar } from './PackageSearchBar';

const renderBar = (props = {}) => render(
  <PackageSearchBar
    value=""
    onChange={() => {}}
    field="all"
    onFieldChange={() => {}}
    onSearch={() => {}}
    onClear={() => {}}
    isLoading={false}
    maxLength={100}
    {...props}
  />
);

describe('PackageSearchBar', () => {
  it('renders the title with its help, the field selector and the search input', () => {
    const handleChange = vi.fn();
    renderBar({ onChange: handleChange });

    expect(screen.getByText('Paquete a buscar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '¿Cómo puedo buscar paquetes?' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Buscar por' })).toHaveTextContent('Todos los campos');
    expect(screen.getByTestId('package-search-field')).toBe(screen.getByRole('combobox', { name: 'Buscar por' }));

    fireEvent.change(screen.getByLabelText('Buscar paquetes'), { target: { value: 'cafe' } });
    expect(handleChange).toHaveBeenCalledWith('cafe');
  });

  it('shows the placeholder of the selected field', () => {
    renderBar({ field: 'phone' });

    expect(screen.getByPlaceholderText('Ej. 8888-8888')).toBeInTheDocument();
  });

  it('lets the user pick the field to search by', () => {
    const handleFieldChange = vi.fn();
    renderBar({ onFieldChange: handleFieldChange });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Buscar por' }));
    fireEvent.click(screen.getByRole('option', { name: 'Cliente' }));

    expect(handleFieldChange).toHaveBeenCalledWith('customerName');
  });

  it('searches with the Buscar button and with Enter', () => {
    const handleSearch = vi.fn();
    renderBar({ value: 'cafe', onSearch: handleSearch });

    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    fireEvent.keyDown(screen.getByLabelText('Buscar paquetes'), { key: 'Enter', code: 'Enter' });

    expect(handleSearch).toHaveBeenCalledTimes(2);
  });

  it('shows Limpiar only while a search is applied', () => {
    const handleClear = vi.fn();
    const { rerender } = renderBar({ onClear: handleClear });
    expect(screen.queryByRole('button', { name: 'Limpiar' })).toBeNull();

    rerender(
      <PackageSearchBar
        value="cafe"
        onChange={() => {}}
        field="all"
        onFieldChange={() => {}}
        onSearch={() => {}}
            onClear={handleClear}
        isLoading={false}
        isFiltering
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(handleClear).toHaveBeenCalledOnce();
  });

  it('shows Buscando... and disables Buscar only while loading, and respects the max length', () => {
    const { rerender } = renderBar({ maxLength: 10 });

    expect(screen.queryByText('Buscando...')).toBeNull();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled();
    expect(screen.getByLabelText('Buscar paquetes')).toHaveAttribute('maxlength', '10');

    rerender(
      <PackageSearchBar
        value=""
        onChange={() => {}}
        field="all"
        onFieldChange={() => {}}
        onSearch={() => {}}
            onClear={() => {}}
        isLoading
      />
    );
    expect(screen.getByText('Buscando...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });
});

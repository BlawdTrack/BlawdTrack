import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PackageResultsTable from './PackageResultsTable';

describe('PackageResultsTable', () => {
  const packages = [
    {
      id: 1,
      shipmentNumber: 'BG-2026-001',
      orderNumber: 'ORD-100',
      customerName: 'Luis Madrigal',
      phone: '8888-9999',
      address: 'Heredia, Barva',
      schedule: '08:00 AM - 12:00 PM',
      status: 'PENDIENTE',
    },
  ];

  it('renders the table headings and row data', () => {
    render(<PackageResultsTable packages={packages} />);

    const table = screen.getByRole('table', { name: 'Listado de paquetes' });
    expect(within(table).getByText('N.º ENVÍO')).toBeInTheDocument();
    expect(within(table).getByText('CLIENTE')).toBeInTheDocument();
    expect(within(table).getByText('DIRECCIÓN')).toBeInTheDocument();
    expect(within(table).getByText('HORARIO')).toBeInTheDocument();
    expect(within(table).getByText('ESTADO')).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    expect(within(table).getByText('BG-2026-001')).toBeInTheDocument();
  });

  it('does not render anything when data is empty', () => {
    const { rerender } = render(<PackageResultsTable packages={[]} />);
    expect(screen.queryByRole('table')).toBeNull();

    rerender(<PackageResultsTable packages={null} />);
    expect(screen.queryByRole('table')).toBeNull();

    rerender(<PackageResultsTable packages={undefined} />);
    expect(screen.queryByRole('table')).toBeNull();
  });
});

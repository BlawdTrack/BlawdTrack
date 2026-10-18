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

  it('renders one row per package inside a labelled list', () => {
    render(<PackageResultsTable packages={packages} />);

    const list = screen.getByRole('region', { name: 'Paquetes encontrados' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(within(list).getByText('BG-2026-001')).toBeInTheDocument();
    expect(within(list).getByText('Orden ORD-100')).toBeInTheDocument();
    expect(within(list).getByText('Heredia, Barva')).toBeInTheDocument();
    expect(within(list).getByText('Horario: 8:00 am - 12:00 pm')).toBeInTheDocument();
    expect(within(list).getByText('Pendiente')).toBeInTheDocument();
  });

  it('does not render anything when data is empty', () => {
    const { rerender } = render(<PackageResultsTable packages={[]} />);
    expect(screen.queryByRole('region', { name: 'Paquetes encontrados' })).toBeNull();

    rerender(<PackageResultsTable packages={null} />);
    expect(screen.queryByRole('region', { name: 'Paquetes encontrados' })).toBeNull();

    rerender(<PackageResultsTable packages={undefined} />);
    expect(screen.queryByRole('region', { name: 'Paquetes encontrados' })).toBeNull();
  });
});

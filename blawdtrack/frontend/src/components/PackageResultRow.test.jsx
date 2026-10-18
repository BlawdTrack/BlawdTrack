import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PackageResultRow from './PackageResultRow';

describe('PackageResultRow', () => {
  it('renders package information with formatted metadata and status badge', () => {
    render(
      <ul>
        <PackageResultRow
            pkg={{
              id: 12,
              shipmentNumber: 'BG-2026-001',
              orderNumber: 'ORD-100',
              customerName: 'Luis Madrigal',
              phone: '8888-9999',
              address: null,
              schedule: '08:00 AM - 12:00 PM',
              status: 'PENDIENTE',
            }}
        />
      </ul>
    );

    expect(screen.getByText('BG-2026-001')).toHaveStyle({ fontWeight: '700' });
    expect(screen.getByText('Orden ORD-100')).toBeInTheDocument();
    expect(screen.getByText('Luis Madrigal')).toBeInTheDocument();
    expect(screen.getByText('8888-9999')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(1);
    expect(screen.getByText('Horario: 8:00 am - 12:00 pm')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });
});

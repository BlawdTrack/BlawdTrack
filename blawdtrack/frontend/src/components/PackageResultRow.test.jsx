import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PackageResultRow from './PackageResultRow';

describe('PackageResultRow', () => {
  it('renders package information with formatted metadata and status badge', () => {
    render(
      <MemoryRouter>
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
                status: 'PENDING',
              }}
          />
        </ul>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'BG-2026-001' })).toHaveAttribute('href', '/main-menu/paquetes/buscar/BG-2026-001');
    expect(screen.getByText('Orden ORD-100')).toBeInTheDocument();
    expect(screen.getByText('Luis Madrigal')).toBeInTheDocument();
    expect(screen.getByText('8888-9999')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(1);
    expect(screen.getByText('Horario: 8:00 am - 12:00 pm')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('muestra el texto de la dirección y un botón Maps cuando trae un enlace pegado', () => {
    render(
      <MemoryRouter>
        <ul>
          <PackageResultRow
            pkg={{ id: 1, shipmentNumber: 'BG-1', customerName: 'Ana', address: 'Desamparados\nhttps://maps.app.goo.gl/hkVWJQqKTxnoWTDh7', status: 'PENDING' }}
          />
        </ul>
      </MemoryRouter>
    );

    expect(screen.getByText('Desamparados')).toBeInTheDocument();
    expect(screen.queryByText(/maps\.app\.goo\.gl/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir ubicación en Maps' })).toHaveAttribute('href', 'https://maps.app.goo.gl/hkVWJQqKTxnoWTDh7');
  });
});

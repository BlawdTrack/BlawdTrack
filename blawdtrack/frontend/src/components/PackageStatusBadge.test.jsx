import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PackageStatusBadge from './PackageStatusBadge';

describe('PackageStatusBadge', () => {
  it.each([
    ['ENTREGADO', 'Entregado'],
    ['EN_TRANSITO', 'En tránsito'],
    ['ENVIADO', 'Enviado'],
    ['ASIGNADO', 'Asignado'],
    ['PENDIENTE', 'Pendiente'],
    ['NO_ENTREGADO', 'No entregado'],
  ])('renders the label for %s', (status, label) => {
    render(<PackageStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('defaults to pendiente when the payload is null', () => {
    render(<PackageStatusBadge status={null} />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('uses title case for unknown statuses', () => {
    render(<PackageStatusBadge status="estado_desconocido" />);
    expect(screen.getByText('Estado desconocido')).toBeInTheDocument();
  });
});

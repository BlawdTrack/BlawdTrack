import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PackageStatusBadge from './PackageStatusBadge';

describe('PackageStatusBadge', () => {
  it.each([
    ['DELIVERED', 'Entregado'],
    ['IN_TRANSIT', 'En tránsito'],
    ['SHIPPED', 'Enviado'],
    ['ASSIGNED', 'Asignado'],
    ['PENDING', 'Pendiente'],
    ['NOT_DELIVERED', 'No entregado'],
  ])('renders the label for %s', (status, label) => {
    render(<PackageStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('says the state is unknown when the payload is null or not a state of the cycle', () => {
    const { rerender } = render(<PackageStatusBadge status={null} />);
    expect(screen.getByText('Estado desconocido')).toBeInTheDocument();

    rerender(<PackageStatusBadge status="CANCELADO" />);
    expect(screen.getByText('Estado desconocido')).toBeInTheDocument();
  });
});

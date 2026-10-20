import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import PackageProgress from './PackageProgress';

const stepNames = () =>
  within(screen.getByRole('region', { name: 'Avance del paquete' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent.replace(/^\d+/, ''));

describe('PackageProgress', () => {
  it('muestra los cinco pasos y marca el actual', () => {
    render(<PackageProgress status="ASSIGNED" />);

    expect(stepNames()).toEqual(['Pendiente', 'Asignado', 'Enviado', 'En tránsito', 'Entregado']);
    expect(screen.getByTestId('package-progress-ASSIGNED')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByTestId('package-progress-PENDING')).not.toHaveAttribute('aria-current');
  });

  it('en un paquete entregado todos los pasos anteriores quedan cumplidos', () => {
    render(<PackageProgress status="DELIVERED" />);

    expect(screen.getByTestId('package-progress-DELIVERED')).toHaveAttribute('aria-current', 'step');
  });

  it('un paquete no entregado cambia el último paso a "No entregado" y lo marca como actual', () => {
    render(<PackageProgress status="NOT_DELIVERED" />);

    expect(stepNames().at(-1)).toBe('No entregado');
    expect(screen.getByTestId('package-progress-DELIVERED')).toHaveAttribute('aria-current', 'step');
  });

  it('no muestra nada con un estado fuera del catálogo', () => {
    render(<PackageProgress status="OTRO" />);

    expect(screen.queryByRole('region', { name: 'Avance del paquete' })).not.toBeInTheDocument();
  });
});

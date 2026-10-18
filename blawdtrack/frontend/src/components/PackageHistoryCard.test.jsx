import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PackageHistoryCard from './PackageHistoryCard';
import { PACKAGE_HISTORY_STATE } from '../hooks/usePackageHistory';

// Tres eventos reales del backend, con distintos responsables y un estado final
// de entrega para comprobar que el color del indicador sale del valor real y no
// de la posición del registro.
const entries = [
  {
    timestamp: '2026-09-16T22:19:00',
    action: 'CAMBIAR_ESTADO_PAQUETE',
    details: 'Paquete registrado',
    actorName: 'Administrador de Ventas',
    previousStatus: null,
    newStatus: 'PENDING',
  },
  {
    timestamp: '2026-09-17T03:09:00',
    action: 'ASIGNAR_PAQUETE',
    details: 'Asignado a la mensajera',
    actorName: 'María José Solano',
    previousStatus: 'PENDING',
    newStatus: 'ASSIGNED',
  },
  {
    timestamp: '2026-09-17T08:30:00',
    action: 'CAMBIAR_ESTADO_PAQUETE',
    details: 'Entrega confirmada',
    actorName: null,
    previousStatus: 'IN_TRANSIT',
    newStatus: 'DELIVERED',
  },
];

describe('PackageHistoryCard', () => {
  it('pinta cada indicador con el color de su estado real (verde de avance, naranja de entrega)', () => {
    render(<PackageHistoryCard state={PACKAGE_HISTORY_STATE.SUCCESS} entries={entries} />);

    expect(screen.getByTestId('history-dot-0')).toHaveStyle({ backgroundColor: '#2E8055' });
    expect(screen.getByTestId('history-dot-1')).toHaveStyle({ backgroundColor: '#2E8055' });
    expect(screen.getByTestId('history-dot-2')).toHaveStyle({ backgroundColor: '#FF6B00' });
  });

  it('muestra el estado y, cuando existen, la fecha, la hora y el responsable', () => {
    render(<PackageHistoryCard state={PACKAGE_HISTORY_STATE.SUCCESS} entries={entries} />);

    expect(screen.getByText('Registrado como Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Asignado')).toBeInTheDocument();
    expect(screen.getByText('Entregado')).toBeInTheDocument();
    expect(screen.getByText('16/09/2026 · 22:19 · Administrador de Ventas')).toBeInTheDocument();
    // Sin responsable, la segunda línea se queda solo con fecha y hora.
    expect(screen.getByText('17/09/2026 · 08:30')).toBeInTheDocument();
  });

  it('muestra el mensaje de historial vacío', () => {
    render(
      <PackageHistoryCard
        state={PACKAGE_HISTORY_STATE.EMPTY}
        message="No hay historial de estados disponible para este paquete."
      />
    );

    expect(screen.getByText('No hay historial de estados disponible para este paquete.')).toBeInTheDocument();
  });

  it('permite reintentar cuando la consulta del historial falla', () => {
    const onRetry = vi.fn();
    render(
      <PackageHistoryCard
        state={PACKAGE_HISTORY_STATE.ERROR}
        message="No se pudo cargar el historial. Inténtalo de nuevo."
        retryable
        onRetry={onRetry}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

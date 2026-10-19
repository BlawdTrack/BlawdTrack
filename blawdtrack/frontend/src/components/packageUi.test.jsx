import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import PackageStatusChip from './PackageStatusChip';
import StatCard from './StatCard';
import StatusMessage from './StatusMessage';

afterEach(() => cleanup());

describe('PackageStatusChip', () => {
  it.each([
    ['valid', 'Válido'],
    ['duplicate', 'Duplicado'],
    ['error', 'Error'],
  ])('muestra el texto del estado %s, para no depender solo del color', (kind, label) => {
    render(<PackageStatusChip kind={kind} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('un estado desconocido se trata como error en vez de quedar sin etiqueta', () => {
    render(<PackageStatusChip kind="otro" />);

    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});

describe('StatCard', () => {
  it('muestra la cifra y su leyenda como elemento de lista', () => {
    render(
      <ul>
        <StatCard value={7} label="válidos para importar" tone="success" />
      </ul>
    );

    const item = screen.getByRole('listitem');
    expect(within(item).getByText('7')).toBeInTheDocument();
    expect(within(item).getByText('válidos para importar')).toBeInTheDocument();
  });

  it('acepta el tono neutro por defecto y cae en él si el tono no existe', () => {
    render(
      <ul>
        <StatCard value={1} label="uno" />
        <StatCard value={2} label="dos" tone="inexistente" />
      </ul>
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('StatusMessage con título', () => {
  it('muestra el título en negrita sobre el mensaje', () => {
    render(<StatusMessage severity="warning" title="Aviso" message="Detalle del aviso" />);

    const alert = screen.getByRole('alert');
    expect(within(alert).getByText('Aviso')).toBeInTheDocument();
    expect(within(alert).getByText('Detalle del aviso')).toBeInTheDocument();
  });

  it('sin título sigue mostrando solo el mensaje', () => {
    render(<StatusMessage severity="error" message="Solo mensaje" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Solo mensaje');
  });
});

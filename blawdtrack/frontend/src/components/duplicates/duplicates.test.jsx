import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import PackageStatusChip from '../PackageStatusChip';
import StatCard from '../StatCard';
import StatusMessage from '../StatusMessage';
import DuplicateCounters from './DuplicateCounters';
import DuplicateRecordList from './DuplicateRecordList';
import DuplicateReportView from './DuplicateReportView';

const report = {
  fileName: 'zoho.xlsx',
  totalRecords: 9,
  validCount: 5,
  duplicateCount: 3,
  alreadyRegisteredCount: 2,
  duplicatedInFileCount: 1,
  duplicates: [
    { shipmentNumber: 'BG-1', customerName: 'Ana Mora', address: 'Moravia, San José', note: 'Ya registrado en la base de datos' },
    { shipmentNumber: 'BG-2', customerName: null, address: null, note: 'Repetido 2 veces en el archivo' },
    { shipmentNumber: 'BG-3', customerName: null, address: null, note: 'Ya registrado en la base de datos · Repetido 3 veces en el archivo' },
  ],
};

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

describe('DuplicateCounters', () => {
  it('muestra los cuatro totales con su leyenda', () => {
    render(<DuplicateCounters report={report} />);

    const totals = within(screen.getByRole('list', { name: 'Totales de la detección de duplicados' }));
    expect(totals.getAllByRole('listitem')).toHaveLength(4);
    expect(totals.getByText('9').parentElement).toHaveTextContent('registros en el archivo');
    expect(totals.getByText('5').parentElement).toHaveTextContent('válidos para importar');
    expect(totals.getByText('2').parentElement).toHaveTextContent('ya existen en la base de datos');
    expect(totals.getByText('1').parentElement).toHaveTextContent('repetidos dentro del mismo archivo');
  });
});

describe('DuplicateRecordList', () => {
  it('resalta cada duplicado con su número, la etiqueta "Duplicado" y la causa', () => {
    render(<DuplicateRecordList duplicates={report.duplicates} />);

    expect(screen.getByRole('heading', { name: 'Registros duplicados' })).toBeInTheDocument();
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    rows.forEach((row) => expect(within(row).getByText('Duplicado')).toBeInTheDocument());
    expect(within(rows[0]).getByText('BG-1')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Ya registrado en la base de datos')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Repetido 2 veces en el archivo')).toBeInTheDocument();
  });

  it('muestra cliente y dirección solo cuando el backend los envía', () => {
    render(<DuplicateRecordList duplicates={report.duplicates} />);

    const rows = screen.getAllByRole('listitem');
    expect(within(rows[0]).getByText('Ana Mora')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Moravia, San José')).toBeInTheDocument();
    expect(within(rows[1]).queryByText('Ana Mora')).not.toBeInTheDocument();
  });
});

describe('DuplicateReportView', () => {
  it('con duplicados avisa en advertencia cuántos hay y dónde, y muestra totales y lista', () => {
    render(<DuplicateReportView report={report} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('3 registros duplicados detectados en zoho.xlsx');
    expect(alert).toHaveTextContent('Se excluyen de la importación. El resto del archivo se puede confirmar sin cambios.');
    expect(screen.getByRole('list', { name: 'Totales de la detección de duplicados' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Registros duplicados' })).toBeInTheDocument();
  });

  it('usa el singular con un solo duplicado', () => {
    render(<DuplicateReportView report={{ ...report, duplicateCount: 1, duplicates: [report.duplicates[0]] }} />);

    expect(screen.getByRole('alert')).toHaveTextContent('1 registro duplicado detectado en zoho.xlsx');
  });

  it('sin nombre de archivo no deja "en " colgando', () => {
    render(<DuplicateReportView report={{ ...report, fileName: '' }} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/^3 registros duplicados detectados\s*Se excluyen/);
  });

  it('sin duplicados avisa con éxito, muestra los totales y no dibuja la lista', () => {
    render(
      <DuplicateReportView
        report={{ ...report, duplicateCount: 0, alreadyRegisteredCount: 0, duplicatedInFileCount: 0, duplicates: [] }}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('No se detectaron duplicados en zoho.xlsx');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Totales de la detección de duplicados' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Registros duplicados' })).not.toBeInTheDocument();
  });
});

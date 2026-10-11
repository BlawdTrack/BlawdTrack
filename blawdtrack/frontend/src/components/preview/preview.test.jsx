import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusRow from '../StatusRow';
import ImportPreviewView from './ImportPreviewView';
import PreviewCounters from './PreviewCounters';
import PreviewFilters from './PreviewFilters';
import PreviewRecordList from './PreviewRecordList';
import PreviewRecordRow from './PreviewRecordRow';
import { buildImportPreview } from '../../utils/importPreview';

const base = { shipmentNumber: 'BG-1', orderNumber: 'ZI-1', customerName: 'Ana Mora', address: 'Moravia', phone: '8712-0094', schedule: 'De 9 a 4', deliveryRange: '9:00 a. m. – 4:00 p. m.', notes: [] };
const validRow = { ...base, key: 'v1', status: 'valid' };
const invalidRow = { ...base, key: 'i1', status: 'invalid', shipmentNumber: null, phone: null, deliveryRange: null, notes: ['El campo teléfono es obligatorio'] };
const duplicateRow = { key: 'd1', status: 'duplicate', shipmentNumber: 'BG-9', orderNumber: null, customerName: null, address: null, phone: null, schedule: null, deliveryRange: null, notes: ['Ya registrado en la base de datos'] };

const counts = { read: 6, valid: 3, invalid: 2, duplicate: 1 };

const previewOf = (overrides) =>
  buildImportPreview({
    fileName: 'zoho.xlsx',
    totalRecords: 6,
    validRecordsCount: 3,
    invalidRecordsCount: 2,
    duplicateRecordsCount: 1,
    validRecords: [{ shipmentNumber: 'BG-1', orderNumber: 'ZI-1', customerName: 'Ana', address: 'Moravia', phone: '1', schedule: 'x', deliveryWindow: { start: '09:00:00', end: '16:00:00' } }],
    invalidRecords: [{ packageData: { shipmentNumber: 'BG-3', orderNumber: 'ZI-3' }, issues: [{ field: 'phone', message: 'El campo teléfono es obligatorio' }] }],
    duplicates: [{ shipmentNumber: 'BG-5', occurrences: 1, reasons: ['ALREADY_REGISTERED'] }],
    ...overrides,
  });

afterEach(() => cleanup());

describe('StatusRow', () => {
  it('se dibuja como elemento de lista con su contenido', () => {
    render(
      <ul>
        <StatusRow tone="warning">contenido</StatusRow>
      </ul>
    );

    expect(within(screen.getByRole('listitem')).getByText('contenido')).toBeInTheDocument();
  });

  it('acepta los tonos y cae en la fila normal con un tono desconocido', () => {
    render(
      <ul>
        <StatusRow>uno</StatusRow>
        <StatusRow tone="error">dos</StatusRow>
        <StatusRow tone="inexistente">tres</StatusRow>
      </ul>
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});

describe('PreviewRecordRow', () => {
  const renderRow = (row) => render(<ul><PreviewRecordRow row={row} /></ul>);

  it('un válido muestra número, orden, cliente, dirección, teléfono, horario y el rango de entrega calculado', () => {
    renderRow(validRow);

    const row = screen.getByRole('listitem');
    ['BG-1', 'Orden ZI-1', 'Ana Mora', 'Moravia', '8712-0094', 'Horario: De 9 a 4', 'Entrega: 9:00 a. m. – 4:00 p. m.', 'Válido'].forEach((text) =>
      expect(within(row).getByText(text)).toBeInTheDocument()
    );
  });

  it('un válido sin rango del backend dice "Sin calcular" en vez de inventarlo', () => {
    renderRow({ ...validRow, deliveryRange: null });

    expect(screen.getByText('Entrega: Sin calcular')).toBeInTheDocument();
  });

  it('un registro con errores lleva la etiqueta "Error", el motivo y no muestra rango de entrega', () => {
    renderRow(invalidRow);

    const row = screen.getByRole('listitem');
    expect(within(row).getByText('Error')).toBeInTheDocument();
    expect(within(row).getByText('El campo teléfono es obligatorio')).toBeInTheDocument();
    expect(within(row).queryByText(/Entrega:/)).not.toBeInTheDocument();
  });

  it('sin número de envío lo dice en vez de dejar el espacio vacío', () => {
    renderRow(invalidRow);

    expect(screen.getByText('Sin número de envío')).toBeInTheDocument();
  });

  it('un duplicado lleva la etiqueta "Duplicado" y la causa, y no muestra columnas vacías', () => {
    renderRow(duplicateRow);

    const row = screen.getByRole('listitem');
    expect(within(row).getByText('BG-9')).toBeInTheDocument();
    expect(within(row).getByText('Duplicado')).toBeInTheDocument();
    expect(within(row).getByText('Ya registrado en la base de datos')).toBeInTheDocument();
    expect(within(row).queryByText(/Horario:|Entrega:|Orden/)).not.toBeInTheDocument();
  });

  it('un estado desconocido se trata como error', () => {
    renderRow({ ...invalidRow, status: 'otro' });

    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});

describe('PreviewCounters', () => {
  it('muestra los cuatro totales con su leyenda', () => {
    render(<PreviewCounters counts={counts} />);

    const list = within(screen.getByRole('list', { name: 'Totales de la previsualización' }));
    expect(list.getAllByRole('listitem')).toHaveLength(4);
    expect(list.getByText('6').parentElement).toHaveTextContent('registros leídos');
    expect(list.getByText('3').parentElement).toHaveTextContent('válidos');
    expect(list.getByText('2').parentElement).toHaveTextContent('con errores');
    expect(list.getByText('1').parentElement).toHaveTextContent('duplicados');
  });
});

describe('PreviewFilters', () => {
  it('muestra cada filtro con su cantidad y marca solo el activo', () => {
    render(<PreviewFilters counts={counts} active="invalid" onChange={() => {}} />);

    const group = within(screen.getByRole('group', { name: 'Filtrar registros' }));
    expect(group.getByRole('button', { name: 'Todos (6)' })).toHaveAttribute('aria-pressed', 'false');
    expect(group.getByRole('button', { name: 'Válidos (3)' })).toHaveAttribute('aria-pressed', 'false');
    expect(group.getByRole('button', { name: 'Con errores (2)' })).toHaveAttribute('aria-pressed', 'true');
    expect(group.getByRole('button', { name: 'Duplicados (1)' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('avisa el filtro elegido', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PreviewFilters counts={counts} active="all" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Duplicados (1)' }));

    expect(onChange).toHaveBeenCalledWith('duplicate');
  });
});

describe('PreviewRecordList', () => {
  it('cuenta los registros que muestra, en singular y en plural', () => {
    const { rerender } = render(<PreviewRecordList rows={[validRow]} />);
    expect(screen.getByText('1 registro')).toBeInTheDocument();

    rerender(<PreviewRecordList rows={[validRow, invalidRow, duplicateRow]} />);
    expect(screen.getByText('3 registros')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('si el filtro no deja registros lo dice', () => {
    render(<PreviewRecordList rows={[]} />);

    expect(screen.getByText('No hay registros en este grupo.')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});

describe('ImportPreviewView', () => {
  it('con errores y duplicados avisa en advertencia cuántos se excluyen y muestra totales y registros', () => {
    render(<ImportPreviewView preview={previewOf()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('2 registros con errores y 1 duplicado en zoho.xlsx');
    expect(alert).toHaveTextContent('Se excluyen de la importación');
    expect(screen.getByRole('list', { name: 'Totales de la previsualización' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(4);
  });

  it('filtra la lista al elegir un grupo y vuelve a mostrar todo con "Todos"', async () => {
    const user = userEvent.setup();
    render(<ImportPreviewView preview={previewOf()} />);
    const records = () => within(screen.getByRole('region', { name: 'Registros del archivo' })).getAllByRole('listitem');

    expect(records()).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: /Duplicados/ }));
    expect(records()).toHaveLength(1);
    expect(within(records()[0]).getByText('BG-5')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Todos/ }));
    expect(records()).toHaveLength(3);
  });

  it('usa el singular con un solo registro con errores', () => {
    render(<ImportPreviewView preview={previewOf({ invalidRecordsCount: 1, duplicates: [], duplicateRecordsCount: 0 })} />);

    expect(screen.getByRole('alert')).toHaveTextContent('1 registro con errores en zoho.xlsx');
  });

  it('si todo es válido avisa con éxito', () => {
    render(<ImportPreviewView preview={previewOf({ invalidRecords: [], invalidRecordsCount: 0, duplicates: [], duplicateRecordsCount: 0 })} />);

    expect(screen.getByRole('status')).toHaveTextContent('Todos los registros en zoho.xlsx son válidos y se pueden importar.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('si ningún registro es válido avisa con error', () => {
    render(<ImportPreviewView preview={previewOf({ validRecords: [], validRecordsCount: 0 })} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Ningún registro en zoho.xlsx se puede importar');
  });

  it('sin nombre de archivo no deja "en " colgando', () => {
    render(<ImportPreviewView preview={previewOf({ fileName: '' })} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/^2 registros con errores y 1 duplicadoSe excluyen/);
  });
});

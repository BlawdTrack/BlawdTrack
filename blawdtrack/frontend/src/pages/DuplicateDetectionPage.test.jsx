import { describe, it, expect, afterEach } from 'vitest';
import { screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DuplicateDetectionPage from './DuplicateDetectionPage';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

const preview = {
  fileName: 'ventas.csv',
  totalRecords: 4,
  validRecordsCount: 2,
  invalidRecordsCount: 0,
  duplicates: [
    { shipmentNumber: 'BG-9', occurrences: 1, reasons: ['ALREADY_REGISTERED'] },
    { shipmentNumber: 'BG-8', occurrences: 2, reasons: ['DUPLICATED_IN_FILE'] },
  ],
};

const renderPage = ({ state, allowSample = false } = {}) =>
  renderWithProviders(<DuplicateDetectionPage allowSample={allowSample} />, {
    route: { pathname: ROUTES.PACKAGE_DUPLICATES, state },
    user: superUser,
  });

afterEach(() => cleanup());

describe('DuplicateDetectionPage', () => {
  it('muestra el título y la descripción de la pantalla', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Detectar duplicados' })).toBeInTheDocument();
    expect(screen.getByText(/antes de confirmar la importación/)).toBeInTheDocument();
  });

  it('sin archivo en previsualización muestra el estado vacío, sin cifras ni lista', () => {
    renderPage();

    expect(screen.getByText('Sin archivo en previsualización')).toBeInTheDocument();
    expect(screen.getByText(/La detección de duplicados ocurre antes de confirmar una importación/)).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Totales de la detección de duplicados' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('en producción no ofrece cargar el ejemplo', () => {
    renderPage({ allowSample: false });

    expect(screen.queryByRole('button', { name: /Cargar ejemplo/ })).not.toBeInTheDocument();
  });

  it('en desarrollo carga el ejemplo y resalta los duplicados', async () => {
    const user = userEvent.setup();
    renderPage({ allowSample: true });

    await user.click(screen.getByRole('button', { name: /Cargar ejemplo/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('3 registros duplicados detectados en zoho_paquetes_octubre.xlsx');
    expect(screen.queryByText('Sin archivo en previsualización')).not.toBeInTheDocument();
    expect(screen.getAllByText('Duplicado')).toHaveLength(3);
  });

  it('muestra la previsualización que le entrega la pantalla de importación por el estado de navegación', () => {
    renderPage({ state: { preview } });

    expect(screen.getByRole('alert')).toHaveTextContent('2 registros duplicados detectados en ventas.csv');
    const totals = within(screen.getByRole('list', { name: 'Totales de la detección de duplicados' }));
    expect(totals.getByText('4').parentElement).toHaveTextContent('registros en el archivo');
    expect(totals.getByText('2', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('BG-9')).toBeInTheDocument();
    expect(screen.getByText('Repetido 2 veces en el archivo')).toBeInTheDocument();
  });

  it('una previsualización sin duplicados avisa que todo puede importarse', () => {
    renderPage({ state: { preview: { ...preview, validRecordsCount: 4, duplicates: [] } } });

    expect(screen.getByRole('status')).toHaveTextContent('No se detectaron duplicados en ventas.csv');
    expect(screen.queryByRole('heading', { name: 'Registros duplicados' })).not.toBeInTheDocument();
  });
});

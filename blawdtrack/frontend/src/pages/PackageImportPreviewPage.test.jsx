import { describe, it, expect, afterEach } from 'vitest';
import { screen, within, cleanup } from '@testing-library/react';
import PackageImportPreviewPage from './PackageImportPreviewPage';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

const preview = {
  fileName: 'paquetes.xlsx',
  totalRecords: 4,
  validRecordsCount: 2,
  invalidRecordsCount: 1,
  duplicateRecordsCount: 1,
  validRecords: [
    { shipmentNumber: 'BG-1', orderNumber: 'ZI-1', customerName: 'Ana Mora', address: 'Moravia', phone: '8712-0094', schedule: 'De 9 a 4', deliveryWindow: { start: '09:00:00', end: '16:00:00' } },
    { shipmentNumber: 'BG-2', orderNumber: 'ZI-2', customerName: 'Beto', address: 'Heredia', phone: '8390-7781', schedule: '' },
  ],
  invalidRecords: [{ packageData: { shipmentNumber: 'BG-3', orderNumber: 'ZI-3', customerName: 'Carla', address: 'Alajuela' }, issues: [{ field: 'phone', message: 'El campo teléfono es obligatorio' }] }],
  duplicates: [{ shipmentNumber: 'BG-5', occurrences: 1, reasons: ['ALREADY_REGISTERED'] }],
};

const renderPage = (state) =>
  renderWithProviders(
    <PackageImportPreviewPage />,
    { route: { pathname: ROUTES.PACKAGE_IMPORT_PREVIEW, state }, user: superUser }
  );

afterEach(() => cleanup());

describe('PackageImportPreviewPage (paso 2 de la importación)', () => {
  it('muestra el título, el paso 2 resaltado y la descripción', () => {
    renderPage({ preview });

    expect(screen.getByRole('heading', { level: 1, name: 'Previsualización de la importación' })).toBeInTheDocument();
    const steps = within(screen.getByRole('list', { name: 'Pasos de la importación' })).getAllByRole('listitem');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
  });

  it('sin archivo en previsualización muestra el estado vacío con el enlace a importar', () => {
    renderPage();

    expect(screen.getByText('Sin archivo en previsualización')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a importar paquetes' })).toHaveAttribute('href', ROUTES.PACKAGE_IMPORT);
    expect(screen.queryByRole('list', { name: 'Totales de la previsualización' })).not.toBeInTheDocument();
  });

  it('muestra el aviso, los totales y los registros de la previsualización recibida', () => {
    renderPage({ preview });

    expect(screen.getByRole('alert')).toHaveTextContent('1 registro con errores y 1 duplicado en paquetes.xlsx');
    expect(screen.getByRole('list', { name: 'Totales de la previsualización' })).toBeInTheDocument();
    const records = within(screen.getByRole('region', { name: 'Registros del archivo' }));
    expect(records.getAllByRole('listitem')).toHaveLength(4);
    expect(records.getByText('Entrega: 9:00 a. m. – 4:00 p. m.')).toBeInTheDocument();
    expect(records.getByText('Entrega: Sin calcular')).toBeInTheDocument();
    expect(records.getByText('El campo teléfono es obligatorio')).toBeInTheDocument();
    expect(records.getByText('Ya registrado en la base de datos')).toBeInTheDocument();
  });

  it('"Cargar otro archivo" lleva a la pantalla de carga', () => {
    renderPage({ preview });

    expect(screen.getByRole('link', { name: 'Cargar otro archivo' })).toHaveAttribute('href', ROUTES.PACKAGE_IMPORT);
  });

  it('los duplicados se revisan en la misma pantalla: avisa su causa y no hay otra pantalla de duplicados', () => {
    renderPage({ preview });

    expect(screen.getByRole('alert')).toHaveTextContent('Duplicados: 1 ya registrado en la base de datos.');
    expect(screen.queryByRole('link', { name: /duplicados/i })).not.toBeInTheDocument();
  });

  it('no ofrece confirmar la importación: eso es otra pantalla', () => {
    renderPage({ preview });

    expect(screen.queryByRole('button', { name: /Confirmar/ })).not.toBeInTheDocument();
  });
});

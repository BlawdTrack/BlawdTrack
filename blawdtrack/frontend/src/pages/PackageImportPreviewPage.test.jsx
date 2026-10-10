import { describe, it, expect, afterEach } from 'vitest';
import { screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
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

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <div data-testid="path">{location.pathname}</div>
      <div data-testid="state">{location.state?.preview?.fileName ?? ''}</div>
    </>
  );
}

const renderPage = (state) =>
  renderWithProviders(
    <>
      <PackageImportPreviewPage />
      <LocationProbe />
    </>,
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

  it('con duplicados ofrece el detalle y entrega la misma previsualización a la pantalla de duplicados', async () => {
    const user = userEvent.setup();
    renderPage({ preview });

    await user.click(screen.getByRole('link', { name: 'Ver detalle de duplicados' }));

    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.PACKAGE_DUPLICATES);
    expect(screen.getByTestId('state')).toHaveTextContent('paquetes.xlsx');
  });

  it('sin duplicados no ofrece el detalle de duplicados', () => {
    renderPage({ preview: { ...preview, duplicateRecordsCount: 0, duplicates: [] } });

    expect(screen.queryByRole('link', { name: 'Ver detalle de duplicados' })).not.toBeInTheDocument();
  });

  it('no ofrece confirmar la importación: eso es otra pantalla', () => {
    renderPage({ preview });

    expect(screen.queryByRole('button', { name: /Confirmar/ })).not.toBeInTheDocument();
  });
});

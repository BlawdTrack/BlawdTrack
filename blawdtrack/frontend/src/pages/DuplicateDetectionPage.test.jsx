import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import DuplicateDetectionPage from './DuplicateDetectionPage';
import { previewPackageImport } from '../services/PackageImportService';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

vi.mock('../services/PackageImportService', () => ({ previewPackageImport: vi.fn() }));

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

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <div data-testid="path">{location.pathname}</div>
      <div data-testid="state">{location.state?.preview?.fileName ?? ''}</div>
    </>
  );
}

const renderPage = ({ state } = {}) =>
  renderWithProviders(
    <>
      <DuplicateDetectionPage />
      <LocationProbe />
    </>,
    { route: { pathname: ROUTES.PACKAGE_DUPLICATES, state }, user: superUser }
  );

const setup = () => userEvent.setup({ applyAccept: false });
const input = () => screen.getByLabelText('Archivo de paquetes de Zoho Inventory');
const submitButton = () => screen.getByRole('button', { name: /Cargar y validar|Validando archivo/ });
const fileOf = (name) => new File(['contenido'], name);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('DuplicateDetectionPage', () => {
  it('muestra el título y la descripción de la pantalla', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Detectar duplicados' })).toBeInTheDocument();
    expect(screen.getByText(/antes de confirmar la importación/)).toBeInTheDocument();
  });

  it('sin archivo ofrece cargarlo ahí mismo, con el envío bloqueado y sin cifras ni lista', () => {
    renderPage();

    expect(screen.getByText('Arrastra aquí el archivo de Zoho Inventory')).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
    expect(screen.queryByRole('list', { name: 'Totales de la detección de duplicados' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('envía el archivo al backend y muestra los totales y los duplicados que devuelve', async () => {
    previewPackageImport.mockResolvedValue(preview);
    const user = setup();
    renderPage();

    const file = fileOf('ventas.csv');
    await user.upload(input(), file);
    await user.click(submitButton());

    expect(previewPackageImport).toHaveBeenCalledWith(file);
    expect(await screen.findByRole('alert')).toHaveTextContent('2 registros duplicados detectados en ventas.csv');
    expect(screen.getByRole('list', { name: 'Totales de la detección de duplicados' })).toBeInTheDocument();
    expect(screen.getByText('BG-9')).toBeInTheDocument();
    expect(screen.queryByText('Arrastra aquí el archivo de Zoho Inventory')).not.toBeInTheDocument();
  });

  it('mientras el backend responde bloquea el envío y lo avisa', async () => {
    previewPackageImport.mockReturnValue(new Promise(() => {}));
    const user = setup();
    renderPage();

    await user.upload(input(), fileOf('ventas.csv'));
    await user.click(submitButton());

    expect(await screen.findByRole('button', { name: /Validando archivo/ })).toBeDisabled();
  });

  it('si el backend falla muestra el error y deja volver a intentar', async () => {
    previewPackageImport.mockRejectedValue({ response: { status: 500, data: {} } });
    const user = setup();
    renderPage();

    await user.upload(input(), fileOf('ventas.csv'));
    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Totales de la detección de duplicados' })).not.toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
  });

  it('un archivo de otro formato se rechaza en el navegador y no se envía', async () => {
    const user = setup();
    renderPage();

    await user.upload(input(), fileOf('notas.pdf'));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(previewPackageImport).not.toHaveBeenCalled();
  });

  it('"Cargar otro archivo" descarta el reporte y vuelve al formulario', async () => {
    previewPackageImport.mockResolvedValue(preview);
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('ventas.csv'));
    await user.click(submitButton());
    await screen.findByRole('alert');

    await user.click(screen.getByRole('button', { name: 'Cargar otro archivo' }));

    expect(screen.getByText('Arrastra aquí el archivo de Zoho Inventory')).toBeInTheDocument();
    expect(screen.queryByText('BG-9')).not.toBeInTheDocument();
  });

  it('también puede descartar la previsualización que venía de la importación', async () => {
    const user = setup();
    renderPage({ state: { preview } });

    await user.click(screen.getByRole('button', { name: 'Cargar otro archivo' }));

    expect(screen.getByText('Arrastra aquí el archivo de Zoho Inventory')).toBeInTheDocument();
  });

  it('"Ver previsualización completa" lleva a la previsualización con el mismo archivo', async () => {
    const user = setup();
    renderPage({ state: { preview } });

    await user.click(screen.getByRole('link', { name: 'Ver previsualización completa' }));

    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.PACKAGE_IMPORT_PREVIEW);
    expect(screen.getByTestId('state')).toHaveTextContent('ventas.csv');
  });

  it('con una previsualización ya no pide cargar un archivo', () => {
    renderPage({ state: { preview } });

    expect(screen.queryByText('Arrastra aquí el archivo de Zoho Inventory')).not.toBeInTheDocument();
  });

  it('resalta cada duplicado de la previsualización recibida', () => {
    renderPage({ state: { preview } });

    expect(screen.getAllByText('Duplicado')).toHaveLength(2);
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

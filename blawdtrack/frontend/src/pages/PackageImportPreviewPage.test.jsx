import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import PackageImportPreviewPage from './PackageImportPreviewPage';
import { confirmPackageImport } from '../services/PackageImportService';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

vi.mock('../services/PackageImportService', () => ({ confirmPackageImport: vi.fn() }));

const file = new File(['contenido'], 'paquetes.xlsx');

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

const executionResponse = {
  fileName: 'paquetes.xlsx',
  totalRecords: 4,
  registeredRecordsCount: 2,
  invalidRecordsCount: 1,
  duplicateRecordsCount: 1,
  registeredShipmentNumbers: ['BG-1', 'BG-2'],
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

const confirmButton = () => screen.getByRole('button', { name: /Confirmar importación/ });

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('PackageImportPreviewPage (paso 2 de la importación)', () => {
  it('muestra el título, el paso 2 resaltado y la descripción', () => {
    renderPage({ preview, file });

    expect(screen.getByRole('heading', { level: 1, name: 'Previsualización de la importación' })).toBeInTheDocument();
    const steps = within(screen.getByRole('list', { name: 'Pasos de la importación' })).getAllByRole('listitem');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
  });

  it('sin archivo en previsualización muestra el estado vacío con el enlace a importar', () => {
    renderPage();

    expect(screen.getByText('Sin archivo en previsualización')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a importar paquetes' })).toHaveAttribute('href', ROUTES.PACKAGE_IMPORT);
    expect(screen.queryByRole('list', { name: 'Totales de la previsualización' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Confirmar/ })).not.toBeInTheDocument();
  });

  it('muestra el aviso, los totales y los registros de la previsualización recibida', () => {
    renderPage({ preview, file });

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
    renderPage({ preview, file });

    expect(screen.getByRole('link', { name: 'Cargar otro archivo' })).toHaveAttribute('href', ROUTES.PACKAGE_IMPORT);
  });

  it('con duplicados ofrece el detalle y entrega la misma previsualización a la pantalla de duplicados', async () => {
    const user = userEvent.setup();
    renderPage({ preview, file });

    await user.click(screen.getByRole('link', { name: 'Ver detalle de duplicados' }));

    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.PACKAGE_DUPLICATES);
    expect(screen.getByTestId('state')).toHaveTextContent('paquetes.xlsx');
  });

  it('sin duplicados no ofrece el detalle de duplicados', () => {
    renderPage({ preview: { ...preview, duplicateRecordsCount: 0, duplicates: [] }, file });

    expect(screen.queryByRole('link', { name: 'Ver detalle de duplicados' })).not.toBeInTheDocument();
  });
});

describe('PackageImportPreviewPage (confirmar la importación)', () => {
  it('ofrece confirmar con la cantidad de paquetes válidos', () => {
    renderPage({ preview, file });

    expect(screen.getByRole('button', { name: 'Confirmar importación de 2 paquetes válidos' })).toBeEnabled();
  });

  it('confirma enviando el archivo y muestra el resultado con la cantidad importada, en el paso 3', async () => {
    confirmPackageImport.mockResolvedValue(executionResponse);
    const user = userEvent.setup();
    renderPage({ preview, file });

    await user.click(confirmButton());

    expect(confirmPackageImport).toHaveBeenCalledWith(file);
    expect(await screen.findByRole('heading', { level: 1, name: 'Resultado de la importación' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('2 paquetes registrados de paquetes.xlsx');
    const steps = within(screen.getByRole('list', { name: 'Pasos de la importación' })).getAllByRole('listitem');
    expect(steps[2]).toHaveAttribute('aria-current', 'step');
    const imported = within(screen.getByRole('region', { name: 'Paquetes importados' }));
    expect(imported.getByText('BG-1')).toBeInTheDocument();
    expect(imported.getByText('BG-2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Confirmar/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Importar otro archivo' })).toHaveAttribute('href', ROUTES.PACKAGE_IMPORT);
  });

  it('con un solo paquete registrado usa el singular', async () => {
    confirmPackageImport.mockResolvedValue({ ...executionResponse, registeredRecordsCount: 1, registeredShipmentNumbers: ['BG-1'] });
    const user = userEvent.setup();
    renderPage({ preview, file });

    await user.click(confirmButton());

    expect(await screen.findByRole('status')).toHaveTextContent('1 paquete registrado de paquetes.xlsx');
  });

  it('si no se registró ninguno lo avisa en advertencia', async () => {
    confirmPackageImport.mockResolvedValue({ ...executionResponse, registeredRecordsCount: 0, registeredShipmentNumbers: [] });
    const user = userEvent.setup();
    renderPage({ preview, file });

    await user.click(confirmButton());

    expect(await screen.findByText('No se registró ningún paquete')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Paquetes importados' })).not.toBeInTheDocument();
  });

  it('mientras confirma bloquea los botones y lo avisa', async () => {
    confirmPackageImport.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderPage({ preview, file });

    await user.click(confirmButton());

    expect(await screen.findByRole('button', { name: /Importando/ })).toBeDisabled();
  });

  it('si el backend falla muestra el error y deja volver a intentar', async () => {
    confirmPackageImport.mockRejectedValue({ response: { status: 500, data: {} } });
    const user = userEvent.setup();
    renderPage({ preview, file });

    await user.click(confirmButton());

    expect(await screen.findByText(/error inesperado al importar los paquetes/)).toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();
  });

  it('sin permiso lo dice con el texto de la confirmación', async () => {
    confirmPackageImport.mockRejectedValue({ response: { status: 403, data: {} } });
    const user = userEvent.setup();
    renderPage({ preview, file });

    await user.click(confirmButton());

    expect(await screen.findByText('No tienes permiso para confirmar la importación de paquetes.')).toBeInTheDocument();
  });

  it('sin registros válidos no se puede confirmar', () => {
    renderPage({ preview: { ...preview, validRecordsCount: 0, validRecords: [] }, file });

    expect(screen.getByRole('button', { name: 'Confirmar importación' })).toBeDisabled();
  });

  it('si se perdió el archivo (por ejemplo al recargar) no se puede confirmar y pide cargarlo de nuevo', () => {
    renderPage({ preview });

    expect(confirmButton()).toBeDisabled();
    expect(screen.getAllByRole('alert').some((alert) => /vuelve a cargar el archivo/.test(alert.textContent))).toBe(true);
  });
});

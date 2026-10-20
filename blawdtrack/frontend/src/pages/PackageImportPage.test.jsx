import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import PackageImportPage from './PackageImportPage';
import { confirmPackageImport, previewPackageImport } from '../services/PackageImportService';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

vi.mock('../services/PackageImportService', () => ({ previewPackageImport: vi.fn(), confirmPackageImport: vi.fn() }));

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
  return <div data-testid="path">{location.pathname}</div>;
}

const renderPage = () =>
  renderWithProviders(
    <>
      <PackageImportPage />
      <LocationProbe />
    </>,
    { route: ROUTES.PACKAGE_IMPORT, user: superUser }
  );

// `applyAccept: false` deja subir un archivo de otro formato, como puede pasar al arrastrarlo.
const setup = () => userEvent.setup({ applyAccept: false });
const input = () => screen.getByLabelText('Archivo de paquetes de Zoho Inventory');
const submitButton = () => screen.getByRole('button', { name: /Revisar datos|Validando archivo/ });
const executionResponse = {
  fileName: 'paquetes.xlsx',
  totalRecords: 4,
  registeredRecordsCount: 2,
  invalidRecordsCount: 1,
  duplicateRecordsCount: 1,
  registeredShipmentNumbers: ['BG-1', 'BG-2'],
};
const confirmButton = () => screen.getByRole('button', { name: /Confirmar importación/ });
const reachStep2 = async (user) => {
  previewPackageImport.mockResolvedValue(preview);
  renderPage();
  const file = fileOf('paquetes.xlsx');
  await user.upload(input(), file);
  await user.click(submitButton());
  await records();
  return file;
};
const records = () => screen.findByRole('region', { name: 'Registros del archivo' });
const fileOf = (name, content = 'contenido') => new File([content], name);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('PackageImportPage (carga del archivo)', () => {
  it('muestra el título, los pasos y la zona de carga, con el envío bloqueado sin archivo', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Importar paquetes' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Pasos de la importación' })).toBeInTheDocument();
    expect(screen.getByText('Arrastra aquí el archivo de Zoho Inventory')).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
    expect(screen.getByText('Ningún archivo seleccionado')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Pasos de la importación' }).querySelector('[aria-current="step"]')).toHaveTextContent('Cargar archivos');
  });

  it('al elegir un archivo válido lo muestra con su nombre y habilita el envío', async () => {
    const user = setup();
    renderPage();

    await user.upload(input(), fileOf('paquetes_zoho.xlsx'));

    expect(screen.getByText('paquetes_zoho.xlsx')).toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
    expect(screen.getByText('1 archivo seleccionado')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rechaza un archivo de otro formato con un aviso y no lo deja seleccionado', async () => {
    const user = setup();
    renderPage();

    await user.upload(input(), fileOf('listado.pdf'));

    expect(screen.getByRole('alert')).toHaveTextContent('Formato no compatible. Solo se permiten archivos .xlsx y .csv.');
    expect(screen.queryByText('listado.pdf')).not.toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
    expect(previewPackageImport).not.toHaveBeenCalled();
  });

  it('rechaza un archivo vacío', async () => {
    const user = setup();
    renderPage();

    await user.upload(input(), new File([], 'vacio.csv'));

    expect(screen.getByRole('alert')).toHaveTextContent('El archivo está vacío');
    expect(submitButton()).toBeDisabled();
  });

  it('elegir un archivo válido después de uno inválido quita el aviso', async () => {
    const user = setup();
    renderPage();

    await user.upload(input(), fileOf('listado.pdf'));
    await user.upload(input(), fileOf('paquetes.csv'));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('paquetes.csv')).toBeInTheDocument();
  });

  it('mientras carga bloquea la zona y el envío y avisa que está validando', async () => {
    let resolveUpload;
    previewPackageImport.mockReturnValue(new Promise((resolve) => { resolveUpload = resolve; }));
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));

    await user.click(submitButton());

    expect(await screen.findByRole('button', { name: /Validando archivo/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Seleccionar archivo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Quitar archivo' })).toBeDisabled();
    expect(previewPackageImport).toHaveBeenCalledTimes(1);

    resolveUpload(preview);
    await records();
  });

  it('envía el archivo elegido al backend una sola vez', async () => {
    previewPackageImport.mockResolvedValue(preview);
    const user = setup();
    renderPage();
    const file = fileOf('paquetes.xlsx');
    await user.upload(input(), file);

    await user.click(submitButton());

    await records();
    expect(previewPackageImport).toHaveBeenCalledTimes(1);
    expect(previewPackageImport).toHaveBeenCalledWith(file);
  });

  it('con éxito pasa al paso 2 en la misma pantalla: muestra los registros leídos sin cambiar de ruta', async () => {
    previewPackageImport.mockResolvedValue(preview);
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));
    await user.click(submitButton());

    const list = within(await records());
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.PACKAGE_IMPORT);
    const steps = within(screen.getByRole('list', { name: 'Pasos de la importación' })).getAllByRole('listitem');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('alert')).toHaveTextContent('1 registro con errores y 1 duplicado en paquetes.xlsx');
    expect(screen.getByTestId('import-count-read')).toBeInTheDocument();
    expect(list.getAllByRole('listitem')).toHaveLength(4);
    expect(list.getByText('9:00 a. m. – 4:00 p. m.')).toBeInTheDocument();
    expect(list.getByText('El campo teléfono es obligatorio')).toBeInTheDocument();
    expect(list.getByText('Ya registrado en la base de datos')).toBeInTheDocument();
    expect(screen.queryByLabelText('Archivo de paquetes de Zoho Inventory')).not.toBeInTheDocument();
    // Desde el paso 2 se confirma (paso 3); los duplicados se revisan aquí mismo, no en otra pantalla.
    expect(screen.getByRole('button', { name: /Confirmar importación/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /duplicados/i })).not.toBeInTheDocument();
  });

  it('"Cambiar archivo" vuelve al paso 1, con la zona de carga vacía', async () => {
    previewPackageImport.mockResolvedValue(preview);
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));
    await user.click(submitButton());
    await records();

    await user.click(screen.getByRole('button', { name: 'Cambiar archivo' }));

    expect(screen.getByText('Arrastra aquí el archivo de Zoho Inventory')).toBeInTheDocument();
    expect(screen.queryByText('paquetes.xlsx')).not.toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('"Cancelar" descarta el archivo y vuelve al menú principal', async () => {
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.MAIN_MENU);
  });

  it('si el backend rechaza el archivo muestra su mensaje y deja el archivo para reintentar', async () => {
    previewPackageImport.mockRejectedValue({
      response: { status: 400, data: { code: 'INVALID_PACKAGE_FILE', message: 'Falta la columna "Número de envío"' } },
    });
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));

    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Falta la columna "Número de envío"');
    expect(screen.getByText('paquetes.xlsx')).toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
  });

  it('muestra el aviso de red cuando no hay conexión con el servidor', async () => {
    previewPackageImport.mockRejectedValue(new Error('Network Error'));
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));

    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectar con el servidor');
  });

  it('muestra que no tiene permiso cuando el backend responde 403', async () => {
    previewPackageImport.mockRejectedValue({ response: { status: 403, data: {} } });
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));

    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso para importar paquetes.');
  });

  it('elegir otro archivo después de un error del servidor quita el aviso', async () => {
    previewPackageImport.mockRejectedValue({ response: { status: 500, data: {} } });
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('uno.xlsx'));
    await user.click(submitButton());
    await screen.findByRole('alert');

    await user.upload(input(), fileOf('dos.xlsx'));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('dos.xlsx')).toBeInTheDocument();
  });

  it('"Quitar archivo" limpia la selección y los avisos', async () => {
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));

    await user.click(screen.getByRole('button', { name: 'Quitar archivo' }));
    expect(screen.queryByText('paquetes.xlsx')).not.toBeInTheDocument();
    expect(screen.getByText('Ningún archivo seleccionado')).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('el envío con el formulario sin archivo no llama al backend', async () => {
    renderPage();
    const form = within(document.body).getByRole('button', { name: 'Revisar datos' }).closest('form');

    form.requestSubmit?.();

    expect(previewPackageImport).not.toHaveBeenCalled();
  });
});

describe('PackageImportPage (confirmar la importación, pasos 2 y 3)', () => {
  it('en el paso 2 ofrece confirmar con la cantidad de paquetes válidos', async () => {
    await reachStep2(setup());

    expect(screen.getByRole('button', { name: 'Confirmar importación de 2 paquetes válidos' })).toBeEnabled();
  });

  it('confirma enviando el mismo archivo y muestra el resultado con la cantidad importada, en el paso 3', async () => {
    confirmPackageImport.mockResolvedValue(executionResponse);
    const user = setup();
    const file = await reachStep2(user);

    await user.click(confirmButton());

    expect(confirmPackageImport).toHaveBeenCalledWith(file);
    expect(await screen.findByText('Importación completada')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('2 paquetes registrados de paquetes.xlsx');
    expect(screen.getByRole('list', { name: 'Pasos de la importación' }).querySelector('[aria-current="step"]')).toHaveTextContent('Listo');
    const imported = within(screen.getByRole('region', { name: 'Paquetes importados' }));
    expect(imported.getByText('BG-1')).toBeInTheDocument();
    expect(imported.getByText('BG-2')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Totales de la importación' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Confirmar/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.PACKAGE_IMPORT);
  });

  it('con un solo paquete registrado usa el singular', async () => {
    confirmPackageImport.mockResolvedValue({ ...executionResponse, registeredRecordsCount: 1, registeredShipmentNumbers: ['BG-1'] });
    const user = setup();
    await reachStep2(user);

    await user.click(confirmButton());

    expect(await screen.findByRole('status')).toHaveTextContent('1 paquete registrado de paquetes.xlsx');
  });

  it('si no se registró ninguno lo avisa en advertencia', async () => {
    confirmPackageImport.mockResolvedValue({ ...executionResponse, registeredRecordsCount: 0, registeredShipmentNumbers: [] });
    const user = setup();
    await reachStep2(user);

    await user.click(confirmButton());

    expect(await screen.findByText('No se registró ningún paquete')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Paquetes importados' })).not.toBeInTheDocument();
  });

  it('mientras confirma bloquea los botones y lo avisa', async () => {
    confirmPackageImport.mockReturnValue(new Promise(() => {}));
    const user = setup();
    await reachStep2(user);

    await user.click(confirmButton());

    expect(await screen.findByRole('button', { name: /Importando/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cambiar archivo' })).toBeDisabled();
  });

  it('si el backend falla muestra el error de la confirmación y deja volver a intentar', async () => {
    confirmPackageImport.mockRejectedValue({ response: { status: 500, data: {} } });
    const user = setup();
    await reachStep2(user);

    await user.click(confirmButton());

    expect(await screen.findByText(/error inesperado al importar los paquetes/)).toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();
  });

  it('sin permiso lo dice con el texto de la confirmación', async () => {
    confirmPackageImport.mockRejectedValue({ response: { status: 403, data: {} } });
    const user = setup();
    await reachStep2(user);

    await user.click(confirmButton());

    expect(await screen.findByText('No tienes permiso para confirmar la importación de paquetes.')).toBeInTheDocument();
  });

  it('sin registros válidos no se puede confirmar', async () => {
    previewPackageImport.mockResolvedValue({ ...preview, validRecordsCount: 0, validRecords: [] });
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));
    await user.click(submitButton());
    await records();

    expect(screen.getByRole('button', { name: 'Confirmar importación' })).toBeDisabled();
  });

  it('"Importar otro archivo" vuelve al paso 1 con la zona de carga vacía', async () => {
    confirmPackageImport.mockResolvedValue(executionResponse);
    const user = setup();
    await reachStep2(user);
    await user.click(confirmButton());
    await user.click(await screen.findByRole('button', { name: 'Importar otro archivo' }));

    expect(screen.getByText('Arrastra aquí el archivo de Zoho Inventory')).toBeInTheDocument();
    expect(screen.queryByText('paquetes.xlsx')).not.toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Pasos de la importación' }).querySelector('[aria-current="step"]')).toHaveTextContent('Cargar archivos');
  });
});

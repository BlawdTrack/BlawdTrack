import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import PackageImportPage from './PackageImportPage';
import { previewPackageImport } from '../services/PackageImportService';
import { renderWithProviders, superUser } from '../test-utils';
import { ROUTES } from '../config/routes';

vi.mock('../services/PackageImportService', () => ({ previewPackageImport: vi.fn() }));

const preview = { fileName: 'paquetes.xlsx', totalRecords: 6, validRecordsCount: 4, duplicates: [] };

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <div data-testid="path">{location.pathname}</div>
      <div data-testid="state">{location.state?.preview?.fileName ?? ''}</div>
    </>
  );
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
const submitButton = () => screen.getByRole('button', { name: /Cargar y validar|Validando archivo/ });
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
  });

  it('al elegir un archivo válido lo muestra con su nombre y habilita el envío', async () => {
    const user = setup();
    renderPage();

    await user.upload(input(), fileOf('paquetes_zoho.xlsx'));

    expect(screen.getByText('paquetes_zoho.xlsx')).toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
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
    await screen.findByText('Archivo cargado');
  });

  it('envía el archivo elegido al backend una sola vez', async () => {
    previewPackageImport.mockResolvedValue(preview);
    const user = setup();
    renderPage();
    const file = fileOf('paquetes.xlsx');
    await user.upload(input(), file);

    await user.click(submitButton());

    await screen.findByText('Archivo cargado');
    expect(previewPackageImport).toHaveBeenCalledTimes(1);
    expect(previewPackageImport).toHaveBeenCalledWith(file);
  });

  it('con éxito informa los registros leídos y entrega la previsualización a la pantalla de previsualización', async () => {
    previewPackageImport.mockResolvedValue(preview);
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));
    await user.click(submitButton());

    const success = await screen.findByRole('status');
    expect(success).toHaveTextContent('paquetes.xlsx: 6 registros leídos');
    expect(screen.queryByLabelText('Archivo de paquetes de Zoho Inventory')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver previsualización' }));

    expect(screen.getByTestId('path')).toHaveTextContent(ROUTES.PACKAGE_IMPORT_PREVIEW);
    expect(screen.getByTestId('state')).toHaveTextContent('paquetes.xlsx');
  });

  it('"Cargar otro archivo" vuelve a la zona de carga, vacía', async () => {
    previewPackageImport.mockResolvedValue(preview);
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));
    await user.click(submitButton());
    await screen.findByText('Archivo cargado');

    await user.click(screen.getByRole('button', { name: 'Cargar otro archivo' }));

    expect(screen.getByText('Arrastra aquí el archivo de Zoho Inventory')).toBeInTheDocument();
    expect(screen.queryByText('paquetes.xlsx')).not.toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
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

  it('"Quitar archivo" y "Descartar" limpian la selección y los avisos', async () => {
    const user = setup();
    renderPage();
    await user.upload(input(), fileOf('paquetes.xlsx'));

    await user.click(screen.getByRole('button', { name: 'Quitar archivo' }));
    expect(screen.queryByText('paquetes.xlsx')).not.toBeInTheDocument();

    await user.upload(input(), fileOf('listado.pdf'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Descartar' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(submitButton()).toBeDisabled();
  });

  it('el envío con el formulario sin archivo no llama al backend', async () => {
    renderPage();
    const form = within(document.body).getByRole('button', { name: 'Cargar y validar' }).closest('form');

    form.requestSubmit?.();

    expect(previewPackageImport).not.toHaveBeenCalled();
  });
});

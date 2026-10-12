import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileDropzone from './FileDropzone';
import ImportSteps from './ImportSteps';
import SelectedFileCard from './SelectedFileCard';

const fileOf = (name, content = 'contenido') => new File([content], name);

afterEach(() => cleanup());

describe('FileDropzone', () => {
  it('invita a arrastrar el archivo y explica los formatos y los datos que se extraen', () => {
    render(<FileDropzone onFile={() => {}} />);

    expect(screen.getByText('Arrastra aquí el archivo de Zoho Inventory')).toBeInTheDocument();
    expect(screen.getByText(/Formatos admitidos: \.xlsx y \.csv/)).toBeInTheDocument();
    expect(screen.getByText(/número de orden/)).toBeInTheDocument();
  });

  it('el selector solo ofrece .xlsx y .csv', () => {
    render(<FileDropzone onFile={() => {}} />);

    expect(screen.getByLabelText('Archivo de paquetes de Zoho Inventory')).toHaveAttribute('accept', '.xlsx,.csv');
  });

  it('entrega el archivo que se elige con el botón "Seleccionar archivo"', async () => {
    const onFile = vi.fn();
    const user = userEvent.setup();
    render(<FileDropzone onFile={onFile} />);
    const file = fileOf('paquetes.xlsx');

    await user.upload(screen.getByLabelText('Archivo de paquetes de Zoho Inventory'), file);

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('permite volver a elegir el mismo archivo después de quitarlo', async () => {
    const onFile = vi.fn();
    const user = userEvent.setup();
    render(<FileDropzone onFile={onFile} />);
    const input = screen.getByLabelText('Archivo de paquetes de Zoho Inventory');
    const file = fileOf('paquetes.csv');

    await user.upload(input, file);
    await user.upload(input, file);

    expect(onFile).toHaveBeenCalledTimes(2);
  });

  it('entrega el archivo que se suelta sobre la zona', () => {
    const onFile = vi.fn();
    render(<FileDropzone onFile={onFile} />);
    const file = fileOf('paquetes.xlsx');

    fireEvent.drop(screen.getByText('Arrastra aquí el archivo de Zoho Inventory'), { dataTransfer: { files: [file] } });

    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('solo toma el primer archivo si sueltan varios', () => {
    const onFile = vi.fn();
    render(<FileDropzone onFile={onFile} />);
    const first = fileOf('uno.csv');

    fireEvent.drop(screen.getByText('Arrastra aquí el archivo de Zoho Inventory'), {
      dataTransfer: { files: [first, fileOf('dos.csv')] },
    });

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile).toHaveBeenCalledWith(first);
  });

  it('ignora un soltado sin archivos', () => {
    const onFile = vi.fn();
    render(<FileDropzone onFile={onFile} />);

    fireEvent.drop(screen.getByText('Arrastra aquí el archivo de Zoho Inventory'), { dataTransfer: { files: [] } });

    expect(onFile).not.toHaveBeenCalled();
  });

  it('bloqueada no deja elegir ni soltar archivos', () => {
    const onFile = vi.fn();
    render(<FileDropzone onFile={onFile} disabled />);

    expect(screen.getByRole('button', { name: 'Seleccionar archivo' })).toBeDisabled();
    expect(screen.getByLabelText('Archivo de paquetes de Zoho Inventory')).toBeDisabled();
    fireEvent.drop(screen.getByText('Arrastra aquí el archivo de Zoho Inventory'), { dataTransfer: { files: [fileOf('a.csv')] } });
    expect(onFile).not.toHaveBeenCalled();
  });
});

describe('SelectedFileCard', () => {
  it('muestra el nombre y el tamaño del archivo', () => {
    render(<SelectedFileCard file={fileOf('paquetes_zoho_17-09.xlsx', 'x'.repeat(2048))} onRemove={() => {}} />);

    expect(screen.getByText('paquetes_zoho_17-09.xlsx')).toBeInTheDocument();
    expect(screen.getByText('2 KB')).toBeInTheDocument();
  });

  it('quita el archivo con el botón "Quitar archivo"', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<SelectedFileCard file={fileOf('a.csv')} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'Quitar archivo' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('bloquea el botón mientras se carga', () => {
    render(<SelectedFileCard file={fileOf('a.csv')} onRemove={() => {}} disabled />);

    expect(screen.getByRole('button', { name: 'Quitar archivo' })).toBeDisabled();
  });
});

describe('ImportSteps', () => {
  it('lista los tres pasos en orden', () => {
    render(<ImportSteps current={1} />);

    const steps = within(screen.getByRole('list', { name: 'Pasos de la importación' })).getAllByRole('listitem');
    expect(steps.map((step) => step.textContent)).toEqual(['1Cargar archivo', '2Previsualizar y validar', '3Confirmar registro']);
  });

  it('marca solo el paso actual con aria-current', () => {
    render(<ImportSteps current={2} />);

    const steps = screen.getAllByRole('listitem');
    expect(steps[0]).not.toHaveAttribute('aria-current');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(steps[2]).not.toHaveAttribute('aria-current');
  });

  it('los pasos anteriores al actual muestran una marca en vez del número', () => {
    render(<ImportSteps current={3} />);

    const steps = screen.getAllByRole('listitem');
    expect(steps[0]).not.toHaveTextContent('1');
    expect(steps[1]).not.toHaveTextContent('2');
    expect(steps[2]).toHaveTextContent('3');
  });
});

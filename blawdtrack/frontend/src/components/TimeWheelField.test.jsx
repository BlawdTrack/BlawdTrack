import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TimeWheelField from './TimeWheelField';

describe('TimeWheelField', () => {
  it('muestra el valor guardado en formato de 12 horas', () => {
    render(<TimeWheelField label="Inicio" value="15:45" onChange={vi.fn()} />);

    expect(screen.getByLabelText('Inicio')).toHaveValue('3:45 pm');
  });

  it('sin valor deja el campo vacío', () => {
    render(<TimeWheelField label="Inicio" value="" onChange={vi.fn()} />);

    expect(screen.getByLabelText('Inicio')).toHaveValue('');
  });

  it('al abrir ofrece las tres ruedas con el valor actual y "Listo" confirma el valor', () => {
    const onChange = vi.fn();
    render(<TimeWheelField label="Inicio" value="15:45" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Inicio'));

    expect(screen.getByRole('listbox', { name: 'Inicio: hora' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Inicio: minutos' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Inicio: am o pm' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Listo' }));

    expect(onChange).toHaveBeenCalledWith('15:45');
  });

  it('sin valor previo confirma la hora que propone por defecto', () => {
    const onChange = vi.fn();
    render(<TimeWheelField label="Inicio" value="" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Inicio'));
    fireEvent.click(screen.getByRole('button', { name: 'Listo' }));

    expect(onChange).toHaveBeenCalledWith('08:00');
  });

  it('el teclado en una rueda mueve la selección una posición', () => {
    const onChange = vi.fn();
    render(<TimeWheelField label="Inicio" value="08:00" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Inicio'));
    fireEvent.keyDown(screen.getByRole('listbox', { name: 'Inicio: minutos' }), { key: 'ArrowDown' });
    fireEvent.click(screen.getByRole('button', { name: 'Listo' }));

    expect(onChange).toHaveBeenCalledWith('08:01');
  });
});

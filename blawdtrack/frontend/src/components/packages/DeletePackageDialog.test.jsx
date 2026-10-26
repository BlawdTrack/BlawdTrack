import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import DeletePackageDialog from './DeletePackageDialog';
import { theme } from '../../theme';

const PKG = { shipmentNumber: 'BG-2026-00125', customerName: 'Paola Herrera Sánchez', address: 'Atenas, Alajuela' };

function renderDialog(props = {}) {
  const handlers = { onCancel: vi.fn(), onConfirm: vi.fn() };
  render(
    <ThemeProvider theme={theme}>
      <DeletePackageDialog pkg={PKG} isDeleting={false} {...handlers} {...props} />
    </ThemeProvider>
  );
  return handlers;
}

describe('DeletePackageDialog (HU-012 / T06)', () => {
  it('es un alertdialog con título y descripción, y muestra el paquete', () => {
    renderDialog();

    const dialog = screen.getByRole('alertdialog', { name: 'Eliminar paquete' });
    expect(dialog).toHaveAccessibleDescription(/El paquete desaparece del sistema/);
    expect(screen.getByText('BG-2026-00125')).toBeInTheDocument();
    expect(screen.getByText('Paola Herrera Sánchez · Atenas, Alajuela')).toBeInTheDocument();
  });

  it('con un enlace de mapa pegado en la dirección muestra el texto y el botón Maps', () => {
    renderDialog({ pkg: { ...PKG, address: 'Desamparados\nhttps://maps.app.goo.gl/hkVWJQqKTxnoWTDh7' } });

    expect(screen.getByText('Paola Herrera Sánchez · Desamparados')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir ubicación en Maps' })).toHaveAttribute('href', 'https://maps.app.goo.gl/hkVWJQqKTxnoWTDh7');
  });

  it('sin paquete está cerrado', () => {
    renderDialog({ pkg: null });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('el foco empieza en Cancelar', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('Cancelar y Esc cancelan sin confirmar', async () => {
    const { onCancel, onConfirm } = renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await userEvent.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('"Sí, eliminar" confirma', async () => {
    const { onConfirm } = renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('mientras elimina, los dos botones quedan deshabilitados y Esc no cierra', async () => {
    const { onCancel } = renderDialog({ isDeleting: true });

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Sí, eliminar/ })).toBeDisabled();

    await userEvent.keyboard('{Escape}');

    expect(onCancel).not.toHaveBeenCalled();
  });
});

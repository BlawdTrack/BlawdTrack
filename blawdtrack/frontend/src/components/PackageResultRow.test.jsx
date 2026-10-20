import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PackageResultRow from './PackageResultRow';
import { renderWithProviders } from '../test-utils';
import { ROLES } from '../config/roles';

const PKG = {
  id: 12,
  shipmentNumber: 'BG-2026-001',
  orderNumber: 'ORD-100',
  customerName: 'Luis Madrigal',
  phone: '8888-9999',
  address: null,
  schedule: '08:00 AM - 12:00 PM',
  status: 'PENDING',
};

const salesAdmin = { id: 1, fullName: 'Celeste', email: 'celeste@blawdgourmet.com', role: ROLES.SALES_ADMIN };

const renderRow = (props = {}, user = salesAdmin) =>
  renderWithProviders(
    <ul>
      <PackageResultRow pkg={PKG} {...props} />
    </ul>,
    { user }
  );

describe('PackageResultRow', () => {
  it('renders package information with formatted metadata and status badge', () => {
    renderRow();

    expect(screen.getByRole('link', { name: 'BG-2026-001' })).toHaveAttribute('href', '/main-menu/paquetes/buscar/BG-2026-001');
    expect(screen.getByText('Orden ORD-100')).toBeInTheDocument();
    expect(screen.getByText('Luis Madrigal')).toBeInTheDocument();
    expect(screen.getByText('8888-9999')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(1);
    expect(screen.getByText('8:00 am - 12:00 pm')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('muestra el texto de la dirección y un botón Maps cuando trae un enlace pegado', () => {
    renderRow({ pkg: { ...PKG, address: 'Desamparados\nhttps://maps.app.goo.gl/hkVWJQqKTxnoWTDh7' } });

    expect(screen.getByText('Desamparados')).toBeInTheDocument();
    expect(screen.queryByText(/maps\.app\.goo\.gl/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir ubicación en Maps' })).toHaveAttribute('href', 'https://maps.app.goo.gl/hkVWJQqKTxnoWTDh7');
  });

  it('un clic en la fila abre la ficha, pero el enlace del número de envío y el botón Maps no la abren dos veces', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    renderRow({ onOpen, pkg: { ...PKG, address: 'https://waze.com/ul/hd1u0mmj97' } });

    await user.click(screen.getByText('Luis Madrigal'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ shipmentNumber: 'BG-2026-001' }));

    onOpen.mockClear();
    await user.click(screen.getByRole('link', { name: 'BG-2026-001' }));
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('una fila sin número de envío no se puede abrir', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    renderRow({ onOpen, pkg: { ...PKG, shipmentNumber: null } });

    await user.click(screen.getByText('Luis Madrigal'));

    expect(onOpen).not.toHaveBeenCalled();
  });

  it('Eliminar emite el paquete sin abrir la ficha cuando está Pendiente o Asignado', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onDelete = vi.fn();
    renderRow({ onOpen, onDelete });

    await user.click(screen.getByRole('button', { name: 'Eliminar paquete BG-2026-001' }));

    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ shipmentNumber: 'BG-2026-001' }));
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('en un estado que ya no se puede eliminar, Eliminar queda deshabilitado y solo avisa', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onBlocked = vi.fn();
    renderRow({ onDelete, onBlocked, pkg: { ...PKG, status: 'SHIPPED' } });

    const button = screen.getByRole('button', { name: 'Eliminar paquete BG-2026-001' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('title', 'No se puede eliminar un paquete en estado “Enviado”');
    await user.click(button);

    expect(onDelete).not.toHaveBeenCalled();
    expect(onBlocked).toHaveBeenCalledWith(expect.objectContaining({ status: 'SHIPPED' }));
  });

  it('el Mensajero no ve el botón Eliminar', () => {
    renderRow({}, { id: 2, fullName: 'Mensajero', email: 'm@blawdgourmet.com', role: ROLES.COURIER });

    expect(screen.queryByRole('button', { name: /Eliminar paquete/ })).not.toBeInTheDocument();
  });
});

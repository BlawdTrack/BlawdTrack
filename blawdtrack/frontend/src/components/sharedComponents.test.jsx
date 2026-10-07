import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentSearch from './DocumentSearch';
import HistoryList from './HistoryList';
import StatusChip from './StatusChip';
import EmptyState from './EmptyState';
import TabPanel from './TabPanel';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';

const searchFake = (overrides = {}) => ({
  documentType: 'CEDULA',
  documentNumber: '',
  setDocumentType: vi.fn(),
  setDocumentNumber: vi.fn(),
  isFiltering: false,
  search: vi.fn(),
  clear: vi.fn(),
  ...overrides,
});

describe('DocumentSearch', () => {
  it.each(['inline', 'stacked'])('searches from the button and with Enter (%s layout)', async (variant) => {
    const search = searchFake();
    const user = userEvent.setup();
    render(<DocumentSearch search={search} variant={variant} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.type(screen.getByRole('textbox', { name: 'Número de documento' }), '1{Enter}');

    expect(search.search).toHaveBeenCalledTimes(2);
    expect(search.setDocumentNumber).toHaveBeenCalledWith('1');
    expect(screen.getByPlaceholderText('Ej. 1-2345-6789')).toBeInTheDocument();
  });

  it('only offers "Limpiar" while a filter is applied', async () => {
    const search = searchFake({ isFiltering: true });
    const user = userEvent.setup();
    const { rerender } = render(<DocumentSearch search={search} />);

    await user.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(search.clear).toHaveBeenCalledTimes(1);

    rerender(<DocumentSearch search={searchFake()} />);
    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();
  });
});

describe('HistoryList', () => {
  const entries = [
    { id: 'a', when: '07/10/2026 · 01:10 a. m.', text: 'Mensajero registrado', by: 'Super Usuario', courierName: 'Ana Mora', courierDocument: '1-1111-1111' },
  ];

  it('shows the empty message when there are no entries', () => {
    render(<HistoryList entries={[]} emptyMessage="Nada todavía" />);
    expect(screen.getByText('Nada todavía')).toBeInTheDocument();
  });

  it('shows date, text and author of each entry for a single subject', () => {
    render(<HistoryList entries={entries} emptyMessage="-" />);
    expect(screen.getByText('Mensajero registrado')).toBeInTheDocument();
    expect(screen.getByText('Super Usuario')).toBeInTheDocument();
    expect(screen.queryByText('Ana Mora')).not.toBeInTheDocument();
  });

  it('also names the subject of each entry in the general history', () => {
    render(<HistoryList entries={entries} emptyMessage="-" showSubject />);
    expect(screen.getByText('Ana Mora')).toBeInTheDocument();
    expect(screen.getByText('1-1111-1111')).toBeInTheDocument();
    expect(screen.getByText('Por Super Usuario')).toBeInTheDocument();
  });
});

describe('StatusChip, EmptyState and TabPanel', () => {
  it('labels the access status', () => {
    const { rerender } = render(<StatusChip active />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
    rerender(<StatusChip active={false} />);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('explains what to do when nothing is selected', () => {
    render(<EmptyState icon={PersonSearchOutlinedIcon} title="Elige uno" description="Selecciona de la lista." />);
    expect(screen.getByText('Elige uno')).toBeInTheDocument();
    expect(screen.getByText('Selecciona de la lista.')).toBeInTheDocument();
  });

  it('keeps an inactive tab panel mounted but hidden', () => {
    render(
      <>
        <TabPanel id="uno" active>contenido uno</TabPanel>
        <TabPanel id="dos" active={false}>contenido dos</TabPanel>
      </>
    );
    expect(screen.getByText('contenido uno')).toBeVisible();
    expect(screen.getByText('contenido dos', { ignore: '' })).not.toBeVisible();
  });
});

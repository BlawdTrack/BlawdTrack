import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditFormActions from './EditFormActions';
import FormActions from './FormActions';
import PackageLoadMore from './PackageLoadMore';
import PackageSearchSummary from './PackageSearchSummary';
import PreviewFilters from './preview/PreviewFilters';
import StatCard from './StatCard';
import StatusRow from './StatusRow';

// Los `data-testid` son el contrato con las pruebas de extremo a extremo (carpeta katalon/): si un refactor los
// quita, estas pruebas fallan antes de que se rompan los casos de Katalon.
describe('selectores de las pruebas de extremo a extremo', () => {
  it('StatCard y StatusRow pasan su testId al elemento', () => {
    render(
      <ul>
        <StatCard value={3} label="válidos" testId="contador" />
        <StatusRow testId="fila" tone="warning">contenido</StatusRow>
        <StatusRow>sin testId</StatusRow>
      </ul>
    );

    expect(screen.getByTestId('contador')).toHaveTextContent('3');
    expect(screen.getByTestId('fila')).toHaveTextContent('contenido');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('los contadores de la previsualización de la importación', () => {
    render(<PreviewFilters counts={{ read: 10, valid: 6, invalid: 3, duplicate: 1 }} active="all" onChange={() => {}} />);

    expect(screen.getByTestId('import-count-read')).toHaveTextContent('10');
    expect(screen.getByTestId('import-count-valid')).toHaveTextContent('6');
    expect(screen.getByTestId('import-count-invalid')).toHaveTextContent('3');
    expect(screen.getByTestId('import-count-duplicate')).toHaveTextContent('1');
  });

  it('"Cargar más" y su contador', () => {
    render(<PackageLoadMore shownCount={100} totalCount={250} canLoadMore isLoadingMore={false} onLoadMore={vi.fn()} />);

    expect(screen.getByTestId('package-load-more')).toBeInTheDocument();
    expect(screen.getByTestId('package-load-more-count')).toHaveTextContent('Mostrando 100 de 250 paquetes');
  });

  it('el resumen de la búsqueda', () => {
    render(<PackageSearchSummary term="" matchCount={250} totalCount={250} />);

    expect(screen.getByTestId('package-search-summary')).toHaveTextContent('250 paquetes');
  });

  it('los botones de los formularios de creación y de edición', () => {
    render(
      <>
        <FormActions submitLabel="Registrar" submittingLabel="Registrando…" isSubmitting={false} onDiscard={vi.fn()} />
        <EditFormActions submitting={false} onDiscard={vi.fn()} />
      </>
    );

    ['form-submit', 'form-discard', 'edit-save', 'edit-discard'].forEach((id) => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });
});

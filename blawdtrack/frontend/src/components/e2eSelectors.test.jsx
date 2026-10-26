import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditFormActions from './EditFormActions';
import FormActions from './FormActions';
import ImportFileHelp from './import/ImportFileHelp';
import { NewPasswordForm } from './NewPasswordForm';
import { NewPasswordInvalidLink, NewPasswordSuccess } from './NewPasswordOutcomes';
import PackageProofCard from './PackageProofCard';
import PackageLoadMore from './PackageLoadMore';
import PackageSearchEmptyState from './PackageSearchEmptyState';
import PackageSearchSummary from './PackageSearchSummary';
import PreviewFilters from './preview/PreviewFilters';
import { RecoveryEmailSent } from './RecoveryEmailSent';
import { RecoveryRequestForm } from './RecoveryRequestForm';
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

  it('el mensaje de búsqueda sin coincidencias', () => {
    render(<PackageSearchEmptyState term="inexistente" onClear={() => {}} />);

    expect(screen.getByTestId('package-search-empty-title')).toHaveTextContent('Sin resultados para');
    expect(screen.getByTestId('package-search-empty-clear')).toBeInTheDocument();
  });

  it('el resumen de la búsqueda', () => {
    render(<PackageSearchSummary term="" matchCount={250} totalCount={250} />);

    expect(screen.getByTestId('package-search-summary')).toHaveTextContent('250 paquetes');
  });

  it('la ayuda del archivo de importación', () => {
    render(<ImportFileHelp />);

    expect(screen.getByTestId('import-help-toggle')).toBeInTheDocument();
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

  it('la recuperación de contraseña', () => {
    const request = {
      email: '', emailError: '', loading: false, sentEmail: 'a@b.test', resendWait: { running: false, remaining: 0 },
      onEmailChange: vi.fn(), onSubmit: vi.fn(), onResend: vi.fn(), onUseAnotherEmail: vi.fn(),
    };
    const reset = {
      newPassword: '', confirmPassword: '', loading: false, error: null, historyRejected: false,
      confirmMismatch: false, canSubmit: true, onNewPasswordChange: vi.fn(), onConfirmPasswordChange: vi.fn(),
      onSubmit: vi.fn(),
    };
    render(
      <>
        <RecoveryRequestForm request={request} />
        <RecoveryEmailSent request={request} />
        <NewPasswordForm reset={reset} />
        <NewPasswordSuccess />
        <NewPasswordInvalidLink rejected />
      </>
    );

    [
      'recovery-submit', 'recovery-email-sent', 'recovery-resend', 'recovery-use-another', 'new-password-submit',
      'new-password-success', 'new-password-go-login', 'new-password-invalid-link', 'new-password-request-link',
    ].forEach((id) => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });

  it('el comprobante de entrega', () => {
    const delivered = { status: 'DELIVERED', shipmentNumber: 'E2E-ENTR-01', deliveryPhotoUrl: 'https://cdn.test/foto.png' };
    const { rerender } = render(<PackageProofCard pkg={delivered} entries={[]} />);

    ['package-proof-card', 'package-proof-summary', 'delivery-photo', 'delivery-photo-image'].forEach((id) => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });

    rerender(<PackageProofCard pkg={{ status: 'PENDING' }} entries={[]} />);

    expect(screen.getByTestId('package-proof-empty')).toBeInTheDocument();
  });
});

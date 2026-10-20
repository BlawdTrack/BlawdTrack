import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import PackageLoadMore from '../components/PackageLoadMore';
import PackageResultsTable from '../components/PackageResultsTable';
import PackageSearchBar from '../components/PackageSearchBar';
import PackageSearchEmptyState from '../components/PackageSearchEmptyState';
import PackageSearchSummary from '../components/PackageSearchSummary';
import Toast from '../components/Toast';
import DeletePackageDialog from '../components/packages/DeletePackageDialog';
import PackageListEmptyState from '../components/packages/PackageListEmptyState';
import PackageStatusFilter from '../components/packages/PackageStatusFilter';
import { ALL_STATUSES, MAX_SEARCH_TERM_LENGTH, STATUS_FILTER_OPTIONS } from '../config/packageSearch';
import { packageDetailPath } from '../config/routes';
import usePackageSearch from '../hooks/usePackageSearch';
import { usePackageDeletion } from '../hooks/usePackageDeletion';
import { useToast } from '../hooks/useToast';
import { getBlockedPackageMessage, getDeletionResultMessage } from '../utils/packageDeletionMessages';
import { hasNoSearchMatches } from '../utils/packageSearchState';
import { rem } from '../theme';

const countOf = (page) => page?.totalElements ?? page?.content?.length ?? null;

const statusLabelOf = (status) =>
  (status === ALL_STATUSES ? null : STATUS_FILTER_OPTIONS.find((option) => option.value === status)?.label);

// No hay ningún paquete en la lista de distribución (y no se está filtrando ni cargando nada).
const isListEmpty = ({ isFiltering, isLoading, errorMessage, distributionResults }) =>
  !isFiltering && !isLoading && !errorMessage && distributionResults !== null && countOf(distributionResults) === 0;

// La tabla necesita más ancho que el resto de las pantallas para mostrar sus siete columnas completas.
const TABLE_PAGE_SX = { maxWidth: rem(1280) };

/**
 * Consultar paquetes (HU-012, HU-013 y HU-014): busca por número de envío, orden, cliente, dirección, teléfono u horario
 * con el mismo buscador que "Roles y permisos" (campo + Buscar), filtra por estado con pestañas, abre la ficha con un
 * clic en la fila y elimina un paquete desde su fila con confirmación. Solo compone: la búsqueda vive en
 * `usePackageSearch`, la eliminación en `usePackageDeletion`, y la barra, las pestañas, la tabla, el "Cargar más" y los
 * estados vacíos son componentes con el diseño del resto de las pantallas.
 */
export function PackageSearchPage() {
  const navigate = useNavigate();
  // Aviso que deja otra pantalla al llegar aquí (por ejemplo, la importación terminada).
  const { state: locationState } = useLocation();
  const {
    term, setTerm, field, setField, status, setStatus, appliedTerm, isFiltering, statusCounts, search,
    searchExample, clearSearch, refresh, results, distributionResults, isLoading, errorMessage,
    canLoadMore, isLoadingMore, loadMore,
  } = usePackageSearch();
  const { toast, notify, close: closeToast } = useToast(locationState?.notice);

  const showFeedback = (feedback) => {
    if (feedback) notify(feedback.message, feedback.severity);
  };
  const deletion = usePackageDeletion({
    // Tras eliminar (o saber que ya no existe o cambió de estado) se vuelve a pedir lo que se está viendo.
    onResult: (result) => {
      showFeedback(getDeletionResultMessage(result));
      refresh();
    },
  });

  const statusLabel = statusLabelOf(status);
  const listIsEmpty = isListEmpty({ isFiltering, isLoading, errorMessage, distributionResults });

  return (
    <>
      <PageHeaderBar title="Consultar paquetes" />

      <PageContainer sx={TABLE_PAGE_SX}>
        <PackageSearchBar
          value={term}
          onChange={setTerm}
          field={field}
          onFieldChange={setField}
          onSearch={search}
          onExample={searchExample}
          onClear={clearSearch}
          isLoading={isLoading}
          isFiltering={isFiltering}
          maxLength={MAX_SEARCH_TERM_LENGTH}
        >
          <PackageStatusFilter counts={statusCounts} active={status} onChange={setStatus} />
          <PackageSearchSummary
            term={appliedTerm}
            statusLabel={isFiltering ? statusLabel : null}
            matchCount={countOf(results)}
            totalCount={countOf(distributionResults)}
          />
        </PackageSearchBar>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {listIsEmpty && <PackageListEmptyState />}

        {hasNoSearchMatches({ isFiltering, results, isLoading, errorMessage }) && (
          <PackageSearchEmptyState term={appliedTerm} statusLabel={statusLabel} onClear={clearSearch} />
        )}

        <PackageResultsTable
          packages={results?.content}
          onOpen={(pkg) => navigate(packageDetailPath(pkg.shipmentNumber))}
          onDelete={deletion.open}
          onBlocked={(pkg) => showFeedback(getBlockedPackageMessage(pkg))}
        />

        <PackageLoadMore
          shownCount={results?.content?.length ?? 0}
          totalCount={countOf(results) ?? 0}
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
        />
      </PageContainer>

      <DeletePackageDialog
        pkg={deletion.selected}
        isDeleting={deletion.isDeleting}
        onCancel={deletion.close}
        onConfirm={deletion.confirm}
      />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </>
  );
}

export default PackageSearchPage;

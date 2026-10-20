import { Alert } from '@mui/material';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import PackageLoadMore from '../components/PackageLoadMore';
import PackageResultsTable from '../components/PackageResultsTable';
import PackageSearchBar from '../components/PackageSearchBar';
import PackageSearchEmptyState from '../components/PackageSearchEmptyState';
import PackageSearchSummary from '../components/PackageSearchSummary';
import { MAX_SEARCH_TERM_LENGTH } from '../config/packageSearch';
import usePackageSearch from '../hooks/usePackageSearch';
import { hasNoSearchMatches } from '../utils/packageSearchState';

const countOf = (page) => page?.totalElements ?? page?.content?.length ?? null;

/**
 * Buscar paquetes (HU-014): búsqueda por número de envío, orden, cliente, dirección, teléfono u horario, con el mismo
 * buscador que "Roles y permisos" (campo + Buscar).
 * Solo compone: la búsqueda vive en `usePackageSearch`, y el listado, el "Cargar más", el estado vacío y la barra son
 * componentes con el diseño del resto de las pantallas.
 */
export function PackageSearchPage() {
  const {
    term, setTerm, field, setField, appliedTerm, search, clearSearch, results, distributionResults, isLoading, errorMessage,
    canLoadMore, isLoadingMore, loadMore,
  } = usePackageSearch();

  return (
    <>
      <PageHeaderBar title="Buscar paquetes" />

      <PageContainer>
        <PackageSearchBar
          value={term}
          onChange={setTerm}
          field={field}
          onFieldChange={setField}
          onSearch={search}
          onClear={clearSearch}
          isLoading={isLoading}
          isFiltering={appliedTerm !== ''}
          maxLength={MAX_SEARCH_TERM_LENGTH}
        >
          <PackageSearchSummary
            term={appliedTerm}
            matchCount={countOf(results)}
            totalCount={countOf(distributionResults)}
          />
        </PackageSearchBar>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {hasNoSearchMatches({ term: appliedTerm, results, isLoading, errorMessage }) && (
          <PackageSearchEmptyState term={appliedTerm} onClear={clearSearch} />
        )}

        <PackageResultsTable packages={results?.content} />

        <PackageLoadMore
          shownCount={results?.content?.length ?? 0}
          totalCount={countOf(results) ?? 0}
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
        />
      </PageContainer>
    </>
  );
}

export default PackageSearchPage;

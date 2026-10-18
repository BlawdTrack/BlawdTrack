import { Alert } from '@mui/material';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import PackageResultsTable from '../components/PackageResultsTable';
import PackageSearchBar from '../components/PackageSearchBar';
import PackageSearchEmptyState from '../components/PackageSearchEmptyState';
import PackageSearchSummary from '../components/PackageSearchSummary';
import { MAX_SEARCH_TERM_LENGTH } from '../config/packageSearch';
import usePackageSearch from '../hooks/usePackageSearch';
import { hasNoSearchMatches } from '../utils/packageSearchState';
import { normalizeSearchTerm } from '../utils/packageSearchTerm';

const countOf = (page) => page?.totalElements ?? page?.content?.length ?? null;

/**
 * Buscar paquetes (HU-014): búsqueda en vivo por número de envío, orden, cliente, dirección, teléfono, horario o
 * estado. Solo compone: la búsqueda vive en `usePackageSearch`, y el listado, el estado vacío y la barra son
 * componentes con el diseño del resto de las pantallas.
 */
export function PackageSearchPage() {
  const { term, clearSearch, setTerm, results, distributionResults, isLoading, errorMessage } = usePackageSearch();

  return (
    <>
      <PageHeaderBar title="Buscar paquetes" />

      <PageContainer>
        <PackageSearchBar
          value={term}
          onChange={setTerm}
          onClear={clearSearch}
          isLoading={isLoading}
          maxLength={MAX_SEARCH_TERM_LENGTH}
        >
          <PackageSearchSummary
            term={normalizeSearchTerm(term)}
            matchCount={countOf(results)}
            totalCount={countOf(distributionResults)}
          />
        </PackageSearchBar>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {hasNoSearchMatches({ term, results, isLoading, errorMessage }) && (
          <PackageSearchEmptyState term={normalizeSearchTerm(term)} onClear={clearSearch} />
        )}

        <PackageResultsTable packages={results?.content} />
      </PageContainer>
    </>
  );
}

export default PackageSearchPage;

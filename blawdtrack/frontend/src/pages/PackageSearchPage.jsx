import { Alert, Box, Button, Container, Typography } from '@mui/material';
import PackageResultsTable from '../components/PackageResultsTable';
import PackageSearchBar from '../components/PackageSearchBar';
import { MAX_SEARCH_TERM_LENGTH } from '../config/packageSearch';
import usePackageSearch from '../hooks/usePackageSearch';

function titleCase(value) {
  return value
    ?.toLocaleLowerCase('es-CR')
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-CR'));
}

function formatSchedule(schedule) {
  return schedule?.replace(/\b0?(\d{1,2}:\d{2})\s*(AM|PM)\b/i, (_, time, period) => (
    `${time} ${period.toLowerCase()}`
  ));
}

/**
 * Pantalla de búsqueda de paquetes. T06 renderizará el estado vacío.
 */
export function PackageSearchPage() {
  const { term, setTerm, results, distributionResults, isLoading, errorMessage } = usePackageSearch();
  const packageCount = results?.totalElements ?? results?.content?.length ?? null;
  const distributionCount = distributionResults?.totalElements
    ?? distributionResults?.content?.length
    ?? null;
  const firstPackage = distributionResults?.content?.[0];
  const normalizedTerm = term.trim();
  const quickSearchButtonSx = {
    borderRadius: 18,
    height: 36,
    minWidth: 0,
    px: 1.5,
    backgroundColor: '#F2EEEA',
    color: 'text.secondary',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': { backgroundColor: '#EAE4DE' },
  };
  const quickSearchTerms = [
    firstPackage?.shipmentNumber,
    firstPackage?.address && titleCase(firstPackage.address.split(',')[0].trim()),
    firstPackage?.status && titleCase(firstPackage.status.replaceAll('_', ' ')),
    firstPackage?.schedule && formatSchedule(firstPackage.schedule),
  ].filter(Boolean);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        <Typography
          component="h1"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
            border: 0,
            padding: 0,
          }}
        >
          Buscar paquetes
        </Typography>

        <PackageSearchBar
          value={term}
          onChange={setTerm}
          onClear={() => setTerm('')}
          isLoading={isLoading}
          maxLength={MAX_SEARCH_TERM_LENGTH}
        >
          {firstPackage && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
              {quickSearchTerms.map((quickTerm) => (
                <Button
                  key={quickTerm}
                  type="button"
                  onClick={() => setTerm(quickTerm)}
                  sx={quickSearchButtonSx}
                >
                  {quickTerm}
                </Button>
              ))}
            </Box>
          )}

          {distributionCount !== null && packageCount !== null && (
            <Typography role="status" aria-live="polite" sx={{ mt: 1.5, color: 'text.secondary', textAlign: 'left' }}>
              {normalizedTerm ? (
                <>{packageCount} de {distributionCount} paquetes coinciden con &ldquo;{normalizedTerm}&rdquo;</>
              ) : (
                <>{distributionCount} {distributionCount === 1 ? 'paquete en' : 'paquetes en'} la lista de distribución</>
              )}
            </Typography>
          )}
        </PackageSearchBar>

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <PackageResultsTable packages={results?.content} />
        {/* T06 agregará aquí el estado "sin resultados" */}
      </Container>
    </Box>
  );
}

export default PackageSearchPage;

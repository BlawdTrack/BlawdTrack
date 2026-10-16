import {
  Alert,
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PackageSearchBar from '../components/PackageSearchBar';
import PackageSearchEmptyState from '../components/PackageSearchEmptyState';
import { MAX_SEARCH_TERM_LENGTH } from '../config/packageSearch';
import usePackageSearch from '../hooks/usePackageSearch';
import { hasNoSearchMatches } from '../utils/packageSearchState';
import { normalizeSearchTerm } from '../utils/packageSearchTerm';

function titleCase(value) {
  return value
    ?.toLocaleLowerCase('es-CR')
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-CR'));
}

/**
 * Pantalla de búsqueda de paquetes con estado vacío y restablecimiento inmediato del listado completo.
 */
export function PackageSearchPage() {
  const { term, setTerm, clearSearch, results, distributionResults, isLoading, errorMessage } = usePackageSearch();
  const packageCount = results?.totalElements ?? results?.content?.length ?? null;
  const distributionCount = distributionResults?.totalElements
    ?? distributionResults?.content?.length
    ?? null;
  const matchingPackages = results?.content ?? [];
  const normalizedTerm = normalizeSearchTerm(term);
  const activeErrorMessage = errorMessage;

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
          onClear={clearSearch}
          isLoading={isLoading}
          maxLength={MAX_SEARCH_TERM_LENGTH}
        >
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

        {activeErrorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {activeErrorMessage}
          </Alert>
        )}

        {hasNoSearchMatches({ term, results, isLoading, errorMessage: activeErrorMessage }) && (
          <PackageSearchEmptyState term={normalizedTerm} onClear={clearSearch} />
        )}

        {matchingPackages.length > 0 && (
          <TableContainer
            component={Box}
            sx={{
              mt: 2,
              overflowX: 'auto',
              border: '1px solid #E4DED7',
              borderRadius: '12px',
              backgroundColor: 'background.paper',
            }}
          >
            <Table aria-label="Paquetes encontrados" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'neutral.surface' }}>
                  <TableCell>N.º de envío</TableCell>
                  <TableCell>N.º de orden</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Dirección de entrega</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Horario</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matchingPackages.map((deliveryPackage) => (
                  <TableRow key={deliveryPackage.id ?? deliveryPackage.shipmentNumber} hover>
                    <TableCell>{deliveryPackage.shipmentNumber || '—'}</TableCell>
                    <TableCell>{deliveryPackage.orderNumber || '—'}</TableCell>
                    <TableCell>{deliveryPackage.customerName || '—'}</TableCell>
                    <TableCell>{deliveryPackage.address || '—'}</TableCell>
                    <TableCell>{deliveryPackage.phone || '—'}</TableCell>
                    <TableCell>{deliveryPackage.schedule || '—'}</TableCell>
                    <TableCell>{titleCase(deliveryPackage.status?.replaceAll('_', ' ')) || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      </Container>
    </Box>
  );
}

export default PackageSearchPage;

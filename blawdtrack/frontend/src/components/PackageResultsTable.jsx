import { Box, Paper } from '@mui/material';
import PackageResultRow from './PackageResultRow';
import { CARD_SX } from './formStyles';

/**
 * Listado de los paquetes encontrados por la búsqueda activa: una tarjeta con una fila por paquete. No dibuja
 * nada si no hay paquetes (el estado vacío lo decide la pantalla).
 * @param {{ packages: Array<object>|null|undefined }} props
 */
export function PackageResultsTable({ packages }) {
  if (!Array.isArray(packages) || packages.length === 0) return null;

  return (
    <Paper elevation={0} component="section" aria-label="Paquetes encontrados" sx={{ ...CARD_SX, overflow: 'hidden' }}>
      <Box component="ul" sx={{ m: 0, p: 0 }}>
        {packages.map((pkg) => (
          <PackageResultRow key={pkg.id ?? pkg.shipmentNumber} pkg={pkg} />
        ))}
      </Box>
    </Paper>
  );
}

export default PackageResultsTable;

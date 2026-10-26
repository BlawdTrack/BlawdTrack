import { Box, Paper } from '@mui/material';
import PackageResultRow from './PackageResultRow';
import { PACKAGE_LIST_GRID_SX } from './packages/packageListGrid';
import { CARD_SX } from './formStyles';
import { FONT, RADIUS } from '../theme';

const COLUMNS = ['Estado', 'N.º de envío', 'Cliente', 'Dirección', 'Teléfono', 'Horario', ''];

/**
 * Tabla de los paquetes encontrados por la búsqueda activa: un encabezado de columnas que se queda fijo al desplazar
 * y una fila por paquete. No dibuja nada si no hay paquetes (el estado vacío lo decide la pantalla).
 * @param {{ packages: Array<object>|null|undefined, onOpen?: (pkg: object) => void,
 *   onDelete?: (pkg: object) => void, onBlocked?: (pkg: object) => void }} props
 */
export function PackageResultsTable({ packages, onOpen, onDelete, onBlocked }) {
  if (!Array.isArray(packages) || packages.length === 0) return null;

  return (
    <Paper elevation={0} component="section" aria-label="Paquetes encontrados" sx={{ ...CARD_SX, borderRadius: RADIUS.md }}>
      <Box
        aria-hidden="true"
        sx={{
          ...PACKAGE_LIST_GRID_SX,
          display: { xs: 'none', md: 'grid' },
          position: 'sticky',
          top: 0,
          zIndex: 1,
          height: 40,
          borderTopLeftRadius: RADIUS.md,
          borderTopRightRadius: RADIUS.md,
          bgcolor: 'neutral.surface',
          borderBottom: '1px solid',
          borderColor: 'neutral.border',
          fontSize: FONT.xs,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {COLUMNS.map((column, index) => <span key={column || index}>{column}</span>)}
      </Box>
      <Box component="ul" sx={{ m: 0, p: 0 }}>
        {packages.map((pkg) => (
          <PackageResultRow
            key={pkg.id ?? pkg.shipmentNumber}
            pkg={pkg}
            onOpen={onOpen}
            onDelete={onDelete}
            onBlocked={onBlocked}
          />
        ))}
      </Box>
    </Paper>
  );
}

export default PackageResultsTable;

import { Box } from '@mui/material';
import StatCard from '../StatCard';
import { rem } from '../../theme';

/**
 * Los cuatro totales de la detección de duplicados: registros del archivo, válidos, ya existentes en la base de
 * datos y repetidos dentro del mismo archivo.
 * @param {{ report: { totalRecords: number, validCount: number, alreadyRegisteredCount: number,
 *   duplicatedInFileCount: number } }} props Reporte de `buildDuplicateReport`.
 */
export default function DuplicateCounters({ report }) {
  return (
    <Box
      component="ul"
      aria-label="Totales de la detección de duplicados"
      sx={{
        display: 'grid',
        gap: 1.75,
        m: 0,
        p: 0,
        // Cuatro tarjetas en escritorio y dos por fila en pantallas angostas.
        gridTemplateColumns: `repeat(auto-fit, minmax(${rem(150)}, 1fr))`,
      }}
    >
      <StatCard value={report.totalRecords} label="registros en el archivo" />
      <StatCard value={report.validCount} label="válidos para importar" tone="success" />
      <StatCard value={report.alreadyRegisteredCount} label="ya existen en la base de datos" tone="warning" />
      <StatCard value={report.duplicatedInFileCount} label="repetidos dentro del mismo archivo" tone="warning" />
    </Box>
  );
}

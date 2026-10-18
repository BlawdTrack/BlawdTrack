import { Typography } from '@mui/material';
import { FONT } from '../theme';

/**
 * Resumen bajo el campo de búsqueda: cuántos paquetes coinciden con el término, o cuántos hay en la lista de
 * distribución si no se busca nada. No dibuja nada hasta conocer los dos conteos.
 * @param {{ term: string, matchCount: number|null, totalCount: number|null }} props `term` ya viene normalizado.
 */
export default function PackageSearchSummary({ term, matchCount, totalCount }) {
  if (totalCount === null || matchCount === null) return null;

  return (
    <Typography role="status" aria-live="polite" sx={{ mt: 1.5, fontSize: FONT.sm, color: 'text.secondary' }}>
      {term ? (
        <>{matchCount} de {totalCount} paquetes coinciden con &ldquo;{term}&rdquo;</>
      ) : (
        <>{totalCount} {totalCount === 1 ? 'paquete en' : 'paquetes en'} la lista de distribución</>
      )}
    </Typography>
  );
}

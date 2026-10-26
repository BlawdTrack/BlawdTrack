import { Typography } from '@mui/material';
import { FONT } from '../theme';

/**
 * Resumen bajo el campo de búsqueda: cuántos paquetes coinciden con el término y el estado elegidos, o cuántos hay en
 * la lista de distribución si no se filtra nada. No dibuja nada hasta conocer los dos conteos.
 * @param {{ term: string, statusLabel?: string|null, matchCount: number|null, totalCount: number|null }} props
 *   `term` ya viene normalizado; `statusLabel` es el estado elegido (null si se ven todos).
 */
export default function PackageSearchSummary({ term, statusLabel = null, matchCount, totalCount }) {
  if (totalCount === null || matchCount === null) return null;

  const criteria = [term && `“${term}”`, statusLabel && `en estado “${statusLabel}”`].filter(Boolean).join(' ');
  const text = criteria
    ? `${matchCount} de ${totalCount} paquetes coinciden con ${criteria}`
    : `${totalCount} ${totalCount === 1 ? 'paquete en' : 'paquetes en'} la lista de distribución`;

  return (
    <Typography role="status" aria-live="polite" data-testid="package-search-summary" sx={{ mt: 1.5, fontSize: FONT.sm, color: 'text.secondary' }}>
      {text}
    </Typography>
  );
}

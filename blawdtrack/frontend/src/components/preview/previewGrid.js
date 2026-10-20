import { rem } from '../../theme';

/**
 * Columnas de la tabla de registros (estado, envío, cliente, dirección, teléfono, horario). El encabezado y las filas
 * las comparten para que queden alineados; por debajo de `md` las filas se apilan y el encabezado se oculta.
 */
export const PREVIEW_GRID_COLUMNS = [
  `minmax(${rem(140)}, 1.2fr)`, `minmax(${rem(100)}, 0.9fr)`, `minmax(${rem(130)}, 1.1fr)`,
  `minmax(${rem(170)}, 2fr)`, rem(135), rem(180),
].join(' ');

export const PREVIEW_GRID_SX = {
  display: { xs: 'block', md: 'grid' },
  gridTemplateColumns: { md: PREVIEW_GRID_COLUMNS },
  columnGap: 1.5,
  alignItems: 'center',
  px: 2,
};

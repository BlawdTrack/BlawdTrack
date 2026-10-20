import { rem } from '../../theme';

/**
 * Columnas de la tabla de paquetes de "Consultar paquetes" (estado, envío, cliente, dirección, teléfono, horario y
 * acciones). El encabezado y las filas las comparten para que queden alineados; por debajo de `md` las filas se apilan
 * y el encabezado se oculta.
 */
export const PACKAGE_LIST_COLUMNS = [
  rem(135), `minmax(${rem(115)}, 1fr)`, `minmax(${rem(125)}, 1.1fr)`, `minmax(${rem(160)}, 2fr)`,
  rem(145), rem(135), rem(150),
].join(' ');

export const PACKAGE_LIST_GRID_SX = {
  display: { xs: 'block', md: 'grid' },
  gridTemplateColumns: { md: PACKAGE_LIST_COLUMNS },
  columnGap: 1.5,
  alignItems: 'center',
  px: 2,
};

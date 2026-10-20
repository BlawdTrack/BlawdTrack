/**
 * Columnas de la tabla de registros (estado, envío, cliente, dirección, teléfono, horario). El encabezado y las filas
 * las comparten para que queden alineados; por debajo de `md` las filas se apilan y el encabezado se oculta.
 */
export const PREVIEW_GRID_COLUMNS = 'minmax(150px, 1.2fr) minmax(110px, 0.9fr) minmax(140px, 1.1fr) minmax(190px, 2fr) 110px 120px';

export const PREVIEW_GRID_SX = {
  display: { xs: 'block', md: 'grid' },
  gridTemplateColumns: { md: PREVIEW_GRID_COLUMNS },
  columnGap: 1.5,
  alignItems: 'center',
  px: 2,
};

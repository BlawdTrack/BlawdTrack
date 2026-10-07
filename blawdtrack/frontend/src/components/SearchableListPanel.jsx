import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material';
import DocumentSearch from './DocumentSearch';
import { CARD_SX } from './formStyles';

const HEADING_SX = { fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' };

/**
 * Panel de una lista que se busca por documento: arriba la búsqueda, luego el título de la lista (con un
 * extra opcional al lado y un dato a la derecha) y el cuerpo que se desplaza. Se encarga de los cuatro
 * estados de la lista —cargando, con error, vacía y sin coincidencias— para que cada pantalla solo diga
 * cómo se dibuja una fila.
 * @param {{ searchTitle: string, search: object, listTitle: string, titleExtra?: import('react').ReactNode,
 *   meta?: import('react').ReactNode, items: object[], totalCount: number, loading: boolean,
 *   errorMessage?: string|null, emptyMessage: string, noMatchMessage: string,
 *   renderItem: (item: object) => import('react').ReactNode, footer?: import('react').ReactNode, sx?: object }}
 *   props `items` ya viene filtrada; `totalCount` es el total sin filtrar; `footer` va fijo al pie del panel
 *   (por ejemplo, el botón que abre la auditoría).
 */
export default function SearchableListPanel({
  searchTitle,
  search,
  listTitle,
  titleExtra,
  meta,
  items,
  totalCount,
  loading,
  errorMessage,
  emptyMessage,
  noMatchMessage,
  renderItem,
  footer,
  sx,
}) {
  let body;
  if (loading) {
    body = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  } else if (errorMessage) {
    body = <Alert severity="error" sx={{ m: 2 }}>{errorMessage}</Alert>;
  } else if (totalCount === 0) {
    body = <Alert severity="info" sx={{ m: 2 }}>{emptyMessage}</Alert>;
  } else if (items.length === 0) {
    body = <Alert severity="info" sx={{ m: 2 }}>{noMatchMessage}</Alert>;
  } else {
    body = items.map(renderItem);
  }

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', flexDirection: 'column', minHeight: 0, ...sx }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid #E4DED7', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={HEADING_SX}>{searchTitle}</Typography>
        <DocumentSearch search={search} />
      </Box>

      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={HEADING_SX}>{listTitle}</Typography>
          {titleExtra}
        </Box>
        {meta}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{body}</Box>

      {footer}
    </Paper>
  );
}

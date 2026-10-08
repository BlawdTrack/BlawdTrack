import { Box, Button, MenuItem, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DOCUMENT_PLACEHOLDERS, DOCUMENT_TYPE_OPTIONS } from '../config/documentTypes';
import { INPUT_SX } from './formStyles';
import { RADIUS } from '../theme';

/**
 * Campos para buscar por tipo y número de documento, con los botones "Buscar" y "Limpiar". Es solo la
 * parte visual: el estado y el filtrado vienen de `useDocumentSearch`.
 * @param {{ search: ReturnType<typeof import('../hooks/useDocumentSearch').useDocumentSearch>,
 *   variant?: 'inline'|'stacked' }} props `inline` pone todo en una fila (pantallas anchas) y `stacked`
 *   apila los botones bajo los campos (paneles angostos).
 */
export default function DocumentSearch({ search, variant = 'inline' }) {
  const stacked = variant === 'stacked';

  const typeField = (
    <TextField
      select
      value={search.documentType}
      onChange={(event) => search.setDocumentType(event.target.value)}
      slotProps={{ htmlInput: { 'aria-label': 'Tipo de documento' } }}
      sx={{ flex: stacked ? '0 0 120px' : { xs: '1 1 100%', sm: '0 0 150px' }, minWidth: stacked ? 0 : { sm: 130 }, ...INPUT_SX }}
    >
      {DOCUMENT_TYPE_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );

  const numberField = (
    <TextField
      fullWidth
      value={search.documentNumber}
      onChange={(event) => search.setDocumentNumber(event.target.value)}
      onKeyDown={(event) => event.key === 'Enter' && search.search()}
      placeholder={DOCUMENT_PLACEHOLDERS[search.documentType]}
      slotProps={{ htmlInput: { 'aria-label': 'Número de documento' } }}
      sx={{ flex: stacked ? '1 1 auto' : { xs: '1 1 100%', sm: '1 1 auto' }, minWidth: 0, ...INPUT_SX }}
    />
  );

  const searchButton = (
    <Button
      variant="contained"
      disableElevation
      onClick={search.search}
      startIcon={stacked ? <SearchIcon /> : undefined}
      sx={{ flex: stacked ? 1 : { xs: '1 1 100%', sm: '0 0 auto' }, px: stacked ? undefined : 3.5, minHeight: stacked ? 44 : 52, fontWeight: 600, borderRadius: RADIUS.sm }}
    >
      Buscar
    </Button>
  );

  const clearButton = search.isFiltering && (
    <Button onClick={search.clear} sx={{ flex: '0 0 auto', color: 'text.secondary', fontWeight: 600, px: 1.5 }}>
      Limpiar
    </Button>
  );

  if (stacked) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {typeField}
          {numberField}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {searchButton}
          {clearButton}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'center' }}>
      {typeField}
      {numberField}
      {searchButton}
      {clearButton}
    </Box>
  );
}

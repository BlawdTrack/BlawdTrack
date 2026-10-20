import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { MAX_SEARCH_TERM_LENGTH, SEARCH_FIELD_OPTIONS } from '../config/packageSearch';
import HelpTip from './HelpTip';
import { CARD_SX, INPUT_SX } from './formStyles';
import { FONT, RADIUS, rem } from '../theme';

const SEARCH_LABEL_ID = 'package-search-label';

/**
 * Tarjeta de búsqueda de paquetes, con el mismo diseño que la de "Roles y permisos": título con ayuda (?), el
 * selector "Buscar por", el campo, "Buscar" (o Enter) y "Limpiar", y debajo "Buscando..." y el resumen que pasa la
 * pantalla.
 * @param {{ value: string, onChange: Function, field: string, onFieldChange: Function, onSearch: Function,
 *   onClear: Function, isLoading: boolean, isFiltering?: boolean, maxLength?: number,
 *   children?: import('react').ReactNode }} props
 */
export function PackageSearchBar({
  value, onChange, field, onFieldChange, onSearch, onClear, isLoading, isFiltering = false,
  maxLength = MAX_SEARCH_TERM_LENGTH, children,
}) {
  const placeholder = SEARCH_FIELD_OPTIONS.find((option) => option.value === field)?.placeholder;

  return (
    <Paper
      elevation={0}
      component="section"
      aria-labelledby={SEARCH_LABEL_ID}
      sx={{ ...CARD_SX, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}
    >
      <Typography
        id={SEARCH_LABEL_ID}
        component="h2"
        sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.md, color: 'primary.main', display: 'flex', alignItems: 'center' }}
      >
        Paquete a buscar
        <HelpTip label="¿Cómo puedo buscar paquetes?">
          Elige en qué campo buscar (o todos), escribe parte del dato y pulsa Buscar. Sin texto se muestra la lista
          de distribución completa.
        </HelpTip>
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'center' }}>
        <TextField
          select
          value={field}
          onChange={(event) => onFieldChange(event.target.value)}
          slotProps={{ htmlInput: { 'aria-label': 'Buscar por', 'data-testid': 'package-search-field' } }}
          sx={{ flex: { xs: '1 1 100%', sm: `0 0 ${rem(190)}` }, minWidth: { sm: 160 }, ...INPUT_SX }}
        >
          {SEARCH_FIELD_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          type="text"
          name="searchTerm"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSearch();
            }
          }}
          placeholder={placeholder}
          slotProps={{ htmlInput: { 'aria-label': 'Buscar paquetes', 'data-testid': 'package-search-input', maxLength } }}
          sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, minWidth: 0, ...INPUT_SX }}
        />

        <Button
          variant="contained"
          disableElevation
          onClick={onSearch}
          disabled={isLoading}
          data-testid="package-search-submit"
          startIcon={<SearchOutlinedIcon />}
          sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' }, px: 3.5, minHeight: 52, fontWeight: 600, borderRadius: RADIUS.sm }}
        >
          Buscar
        </Button>

        {isFiltering && (
          <Button
            onClick={onClear}
            data-testid="package-search-clear"
            sx={{ flex: '0 0 auto', color: 'text.secondary', fontWeight: 600, px: 1.5 }}
          >
            Limpiar
          </Button>
        )}
      </Box>

      {isLoading && (
        <Typography role="status" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>Buscando...</Typography>
      )}
      {children}
    </Paper>
  );
}

export default PackageSearchBar;

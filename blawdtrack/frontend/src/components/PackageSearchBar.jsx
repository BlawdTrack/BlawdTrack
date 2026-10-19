import { Box, Button, CircularProgress, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { MAX_SEARCH_TERM_LENGTH } from '../config/packageSearch';
import { CARD_SX, INPUT_SX, LABEL_SX } from './formStyles';

const SEARCH_LABEL_ID = 'package-search-label';

/**
 * Tarjeta de búsqueda en vivo de paquetes: el campo, el botón "Limpiar" y, debajo, el resumen que pasa la pantalla.
 * @param {{ value: string, onChange: Function, onClear: Function, isLoading: boolean, maxLength?: number,
 *   children?: import('react').ReactNode }} props
 */
export function PackageSearchBar({ value, onChange, onClear, isLoading, maxLength = MAX_SEARCH_TERM_LENGTH, children }) {
  return (
    <Paper elevation={0} component="section" aria-labelledby={SEARCH_LABEL_ID} sx={{ ...CARD_SX, p: { xs: 2.5, md: 3 } }}>
      <Typography id={SEARCH_LABEL_ID} component="h2" sx={LABEL_SX}>
        Búsqueda en vivo
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          type="text"
          name="searchTerm"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.preventDefault();
          }}
          placeholder="N.º de envío, orden, cliente, dirección, teléfono u horario"
          slotProps={{
            input: {
              endAdornment: isLoading ? (
                <InputAdornment position="end">
                  <CircularProgress size={18} color="secondary" />
                </InputAdornment>
              ) : null,
            },
            htmlInput: { 'aria-label': 'Buscar paquetes', maxLength },
          }}
          sx={{ ...INPUT_SX, flex: '1 1 300px' }}
        />
        <Button type="button" variant="outlined" onClick={onClear}>
          Limpiar
        </Button>
      </Box>
      {children}
    </Paper>
  );
}

export default PackageSearchBar;

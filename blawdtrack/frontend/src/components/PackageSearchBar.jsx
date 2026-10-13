import { Box, Button, CircularProgress, InputAdornment, TextField, Typography } from '@mui/material';
import { MAX_SEARCH_TERM_LENGTH } from '../config/packageSearch';

/**
 * Tarjeta de búsqueda presenteacional para el filtro en vivo de paquetes.
 * @param {{ value: string, onChange: Function, onClear: Function, isLoading: boolean, maxLength?: number, children?: React.ReactNode }} props
 */
export function PackageSearchBar({ value, onChange, onClear, isLoading, maxLength = MAX_SEARCH_TERM_LENGTH, children }) {
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        border: '1px solid #E4DED7',
        borderRadius: '18px',
        px: 3,
        py: 2.5,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          display: 'block',
          fontWeight: 700,
          textAlign: 'left',
          letterSpacing: '0.04em',
          color: 'text.secondary',
          mb: 1.5,
        }}
      >
        BÚSQUEDA EN VIVO
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          variant="outlined"
          type="text"
          name="searchTerm"
          autoComplete="off"
          value={value}
          onChange={handleInputChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
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
            htmlInput: {
              'aria-label': 'Buscar paquetes',
              maxLength,
              style: { fontSize: '16px' },
            },
          }}
          sx={{
            flex: '1 1 300px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'background.paper',
            },
            '& .MuiOutlinedInput-root:focus-within': {
              '& fieldset': {
                borderColor: 'secondary.main',
                borderWidth: '1.5px',
              },
            },
          }}
        />
        <Button
          type="button"
          variant="outlined"
          onClick={onClear}
          sx={{ minHeight: 56, borderRadius: '12px', whiteSpace: 'nowrap' }}
        >
          Limpiar
        </Button>
      </Box>
      {children}
    </Box>
  );
}

export default PackageSearchBar;

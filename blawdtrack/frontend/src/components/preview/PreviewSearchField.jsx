import { InputAdornment, TextField } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { INPUT_SX } from '../formStyles';
import { rem } from '../../theme';

/**
 * Campo "Buscar en el archivo": filtra la lista de registros mientras se escribe. Es solo la parte visual; el filtrado
 * lo hace `searchPreviewRows`.
 * @param {{ value: string, onChange: (value: string) => void }} props
 */
export default function PreviewSearchField({ value, onChange }) {
  return (
    <TextField
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Buscar en el archivo"
      autoComplete="off"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon fontSize="small" />
            </InputAdornment>
          ),
        },
        htmlInput: { 'aria-label': 'Buscar en el archivo', 'data-testid': 'import-search' },
      }}
      sx={{ ...INPUT_SX, width: { xs: '100%', md: rem(280) }, ml: { md: 'auto' } }}
    />
  );
}

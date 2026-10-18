import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { CARD_SX, INPUT_SX } from './formStyles';
import { FONT, RADIUS, TOUCH_TARGET } from '../theme';

/**
 * Tarjeta de consulta por número de envío: encabezado, campo de texto y botón
 * de solo ícono (lupa) en una fila (se apilan en móvil). El botón se anuncia
 * como "Consultar" vía `aria-label` para conservar la accesibilidad. El envío se
 * hace por formulario, así que el botón y la tecla Enter disparan la misma acción
 * (sin duplicar la consulta: el componente que la consume la bloquea mientras
 * está en curso).
 *
 * @param {{ value: string, onChange: (value: string) => void, onSubmit: Function,
 *   loading?: boolean, error?: string|null }} props
 */
export default function PackageSearchCard({ value, onChange, onSubmit, loading = false, error = null }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Paper elevation={0} component="section" aria-labelledby="package-search-title" sx={{ ...CARD_SX, p: { xs: 2.5, md: 3 } }}>
      <Typography
        id="package-search-title"
        component="h2"
        sx={{
          fontSize: FONT.xs,
          fontWeight: 700,
          letterSpacing: '0.5px',
          color: 'text.secondary',
          textTransform: 'uppercase',
          mb: 1.75,
        }}
      >
        Consultar por número de envío
      </Typography>

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: 1.5,
        }}
      >
        <TextField
          value={value}
          inputRef={inputRef}
          onChange={(event) => onChange(event.target.value)}
          placeholder="BG-2026-00123"
          autoComplete="off"
          disabled={loading}
          error={Boolean(error)}
          helperText={error}
          slotProps={{ htmlInput: { 'aria-label': 'Número de envío' } }}
          sx={{ ...INPUT_SX, flex: 1, minWidth: 0 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          aria-label="Consultar"
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: TOUCH_TARGET },
            minHeight: TOUCH_TARGET,
            minWidth: TOUCH_TARGET,
            p: 0,
            borderRadius: RADIUS.sm,
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          <SearchOutlinedIcon />
        </Button>
      </Box>

      <Typography sx={{ mt: -0.5, fontSize: FONT.xs, color: 'text.secondary' }}>
        Ficha de solo lectura: la consulta no permite modificar el paquete.
      </Typography>
    </Paper>
  );
}

import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Box, Button, Typography } from '@mui/material';
import { useId } from 'react';
import { RADIUS, FONT, rem, TOUCH_TARGET } from '../theme';

/**
 * Estado visual para una búsqueda sin coincidencias.
 * @param {{ term: string, onClear: Function }} props
 * @returns {JSX.Element}
 */
export function PackageSearchEmptyState({ term, onClear }) {
  const titleId = useId();
  const titleText = `Sin resultados para “${term}”`;

  return (
    <Box
      component="section"
      aria-labelledby={titleId}
      sx={{
        width: '100%',
        mt: 2,
        border: '1px dashed',
        borderColor: 'neutral.borderStrong',
        borderRadius: '18px',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        px: 3,
        py: 6,
        minHeight: '250px',
        textAlign: 'center',
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: rem(44),
          height: rem(44),
          borderRadius: '50%',
          backgroundColor: 'neutral.surface',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RadioButtonUncheckedIcon sx={{ fontSize: rem(22), color: 'neutral.main' }} />
      </Box>

      <Typography
        id={titleId}
        component="h2"
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: FONT.lg,
          color: 'primary.main',
          overflowWrap: 'anywhere',
        }}
      >
        {titleText}
      </Typography>

      <Typography
        sx={{
          fontSize: FONT.sm,
          color: 'text.secondary',
          maxWidth: rem(420),
          textAlign: 'center',
        }}
      >
        Revisa el número de envío o prueba con otro criterio: orden, cliente, dirección, teléfono u horario de preferencia.
      </Typography>

      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={onClear}
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: RADIUS.sm,
          minHeight: TOUCH_TARGET,
          px: 3,
        }}
      >
        Limpiar búsqueda
      </Button>
    </Box>
  );
}

export default PackageSearchEmptyState;

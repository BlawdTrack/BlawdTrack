import { useId } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useCanDeletePackages } from '../../hooks/useCanDeletePackages';
import { getPackageStateLabel, isPackageDeletable } from '../../config/packageStates';
import { RADIUS, FONT, TOUCH_TARGET } from '../../theme';

// Gris del botón cuando la acción no está disponible (mismo valor que la acción bloqueada de `AccountRow`).
const BLOCKED_TEXT_COLOR = '#7A736A';

/**
 * Botón "Eliminar" de un paquete (HU-012). Solo existe para el Administrador de Ventas; para cualquier otro rol no
 * se renderiza. En Pendiente o Asignado es un botón rojo de contorno; en los demás estados queda en gris con
 * `aria-disabled` (sigue siendo enfocable) y un texto de ayuda asociado. Al pulsarlo solo emite `onEliminar`: no
 * llama a la API ni abre el diálogo de confirmación.
 * @param {{ paquete: { shipmentNumber: string, status: string }, onEliminar: (paquete: object) => void }} props
 *   `paquete` llega con la forma del backend; `onEliminar` lo recibe tal cual.
 */
export default function DeletePackageButton({ paquete, onEliminar }) {
  const canDelete = useCanDeletePackages();
  const hintId = useId();

  if (!canDelete) {
    return null;
  }

  const isDeletable = isPackageDeletable(paquete.status);

  const handleClick = () => {
    if (isDeletable) {
      onEliminar(paquete);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
      <Button
        variant="outlined"
        onClick={handleClick}
        aria-disabled={isDeletable ? undefined : 'true'}
        aria-describedby={isDeletable ? undefined : hintId}
        sx={{
          borderRadius: RADIUS.sm,
          px: 2.5,
          minHeight: TOUCH_TARGET,
          fontWeight: 600,
          fontSize: FONT.sm,
          borderWidth: '1.5px',
          bgcolor: 'background.paper',
          color: isDeletable ? 'error.main' : BLOCKED_TEXT_COLOR,
          borderColor: isDeletable ? 'error.main' : 'neutral.border',
          cursor: isDeletable ? 'pointer' : 'not-allowed',
          '&:hover': {
            borderWidth: '1.5px',
            bgcolor: isDeletable ? 'error.light' : 'background.paper',
            borderColor: isDeletable ? 'error.main' : 'neutral.border',
          },
        }}
      >
        Eliminar
      </Button>
      {!isDeletable && (
        <Typography id={hintId} sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>
          No eliminable en “{getPackageStateLabel(paquete.status)}”
        </Typography>
      )}
    </Box>
  );
}

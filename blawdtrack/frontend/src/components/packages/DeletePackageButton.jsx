import { useId } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useCanDeletePackages } from '../../hooks/useCanDeletePackages';
import { isPackageDeletable } from '../../config/packageStates';
import { getPackageStatusMeta } from '../../config/packageStatus';
import { RADIUS, FONT, TOUCH_TARGET } from '../../theme';

/**
 * Botón "Eliminar" de un paquete (HU-012). Solo existe para el Administrador de Ventas; para cualquier otro rol no
 * se renderiza. En Pendiente o Asignado es un botón rojo de contorno; en los demás estados queda en gris con
 * `aria-disabled` (sigue siendo enfocable) y un texto de ayuda asociado. Al pulsarlo solo emite `onDelete` (o
 * `onBlocked` si no es eliminable): no llama a la API ni abre el diálogo de confirmación.
 * @param {{ pkg: { shipmentNumber: string, status: string }, onDelete: (pkg: object) => void,
 *   onBlocked?: (pkg: object) => void }} props `pkg` llega con la forma del backend; `onDelete` lo recibe tal cual.
 *   `onBlocked` se llama si se pulsa el botón de un paquete no eliminable (para avisar por qué).
 */
export default function DeletePackageButton({ pkg, onDelete, onBlocked }) {
  const canDelete = useCanDeletePackages();
  const hintId = useId();

  if (!canDelete) {
    return null;
  }

  const isDeletable = isPackageDeletable(pkg.status);

  const handleClick = () => {
    if (isDeletable) {
      onDelete(pkg);
    } else {
      onBlocked?.(pkg);
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
          color: isDeletable ? 'error.main' : 'text.secondary',
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
          No eliminable en “{getPackageStatusMeta(pkg.status).label}”
        </Typography>
      )}
    </Box>
  );
}

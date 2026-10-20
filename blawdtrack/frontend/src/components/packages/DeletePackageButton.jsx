import { useId } from 'react';
import { Box, Button, Typography } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useCanDeletePackages } from '../../hooks/useCanDeletePackages';
import { isPackageDeletable } from '../../config/packageStates';
import { getPackageStatusMeta } from '../../config/packageStatus';
import { RADIUS, FONT, rem } from '../../theme';

/**
 * Botón "Eliminar" de un paquete (HU-012). Solo existe para el Administrador de Ventas y el Súper Usuario; para
 * cualquier otro rol no se renderiza. En Pendiente o Asignado es un botón rojo lleno; en los demás estados queda en gris con
 * `aria-disabled` (sigue siendo enfocable) y un texto de ayuda asociado. Al pulsarlo solo emite `onDelete` (o
 * `onBlocked` si el paquete no es eliminable): no llama a la API ni abre el diálogo de confirmación.
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
        variant={isDeletable ? 'contained' : 'outlined'}
        disableElevation
        startIcon={<DeleteOutlineOutlinedIcon />}
        onClick={handleClick}
        data-testid="delete-package-button"
        aria-disabled={isDeletable ? undefined : 'true'}
        aria-describedby={isDeletable ? undefined : hintId}
        sx={{
          borderRadius: RADIUS.sm,
          px: 3,
          minHeight: rem(48),
          fontWeight: 600,
          fontSize: FONT.md,
          borderWidth: '1.5px',
          color: isDeletable ? 'error.contrastText' : 'text.secondary',
          bgcolor: isDeletable ? 'error.main' : 'background.paper',
          borderColor: isDeletable ? 'error.main' : 'neutral.border',
          cursor: isDeletable ? 'pointer' : 'not-allowed',
          '&:hover': {
            borderWidth: '1.5px',
            bgcolor: isDeletable ? 'error.dark' : 'background.paper',
            borderColor: isDeletable ? 'error.dark' : 'neutral.border',
          },
        }}
      >
        Eliminar paquete
      </Button>
      {!isDeletable && (
        <Typography id={hintId} sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>
          No eliminable en “{getPackageStatusMeta(pkg.status).label}”
        </Typography>
      )}
    </Box>
  );
}

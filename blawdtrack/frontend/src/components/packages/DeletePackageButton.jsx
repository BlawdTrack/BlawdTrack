import { useId } from 'react';
import { Button, Typography } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useCanDeletePackages } from '../../hooks/useCanDeletePackages';
import { isPackageDeletable } from '../../config/packageStates';
import { getPackageStatusMeta } from '../../config/packageStatus';
import { RADIUS, FONT, rem } from '../../theme';

/**
 * Botón "Eliminar paquete" (HU-012): ocupa todo el ancho de la ficha. Solo existe para el Administrador de Ventas y el Súper Usuario; para
 * cualquier otro rol no se renderiza. En Pendiente o Asignado es blanco con borde y letras rojos, y se llena de rojo al acercar el cursor; en los demás estados queda en gris con
 * `aria-disabled` (sigue siendo enfocable) y su texto de ayuda dentro, asociado con `aria-describedby`. Al pulsarlo solo emite `onDelete` (o
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
    <Button
      fullWidth
      variant="outlined"
      onClick={handleClick}
      aria-label="Eliminar paquete"
      data-testid="delete-package-button"
      aria-disabled={isDeletable ? undefined : 'true'}
      aria-describedby={isDeletable ? undefined : hintId}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: rem(52),
        gap: 0.25,
        py: 1.75,
        px: 3,
        textAlign: 'center',
        borderRadius: RADIUS.md,
        borderWidth: '1.5px',
        color: isDeletable ? 'error.main' : 'text.secondary',
        bgcolor: 'background.paper',
        borderColor: isDeletable ? 'error.main' : 'neutral.border',
        cursor: isDeletable ? 'pointer' : 'not-allowed',
        '&:hover': {
          borderWidth: '1.5px',
          color: isDeletable ? 'error.contrastText' : 'text.secondary',
          bgcolor: isDeletable ? 'error.main' : 'background.paper',
          borderColor: isDeletable ? 'error.main' : 'neutral.border',
        },
      }}
    >
      <Typography component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: FONT.lg, fontWeight: 700, color: 'inherit' }}>
        <DeleteOutlineOutlinedIcon fontSize="small" />
        Eliminar paquete
      </Typography>
      {!isDeletable && (
        <Typography id={hintId} component="span" sx={{ fontSize: FONT.sm, fontWeight: 500, color: 'inherit' }}>
          No eliminable en “{getPackageStatusMeta(pkg.status).label}”
        </Typography>
      )}
    </Button>
  );
}

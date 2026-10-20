import { Box, Button } from '@mui/material';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useCanDeletePackages } from '../../hooks/useCanDeletePackages';
import { isPackageDeletable } from '../../config/packageStates';
import { getPackageStatusMeta } from '../../config/packageStatus';
import { FONT, RADIUS, TOUCH_TARGET } from '../../theme';

/**
 * Acciones de una fila de la tabla de paquetes: "Eliminar" (HU-012, solo para los roles con permiso) y la flecha que
 * indica que la fila abre la ficha. En Pendiente o Asignado "Eliminar" es un botón rojo de contorno; en los demás
 * estados queda en gris con `aria-disabled` (sigue siendo enfocable) y su motivo en `title`. Pulsarlo solo emite
 * `onDelete` (o `onBlocked` si el paquete ya no es eliminable): no abre la ficha de la fila.
 * @param {{ pkg: { shipmentNumber: string, status: string }, onDelete: (pkg: object) => void,
 *   onBlocked?: (pkg: object) => void }} props
 */
export default function PackageRowActions({ pkg, onDelete, onBlocked }) {
  const canDelete = useCanDeletePackages();
  const deletable = isPackageDeletable(pkg?.status);

  const handleClick = (event) => {
    // La fila entera abre la ficha: eliminar no debe abrirla.
    event.stopPropagation();
    if (deletable) onDelete(pkg);
    else onBlocked?.(pkg);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 0.5, mt: { xs: 1, md: 0 } }}>
      {canDelete && (
        <Button
          variant="outlined"
          onClick={handleClick}
          startIcon={<DeleteOutlineOutlinedIcon />}
          data-testid="package-row-delete"
          aria-disabled={deletable ? undefined : 'true'}
          aria-label={`Eliminar paquete ${pkg?.shipmentNumber ?? ''}`.trim()}
          title={deletable ? 'Eliminar paquete' : `No se puede eliminar un paquete en estado “${getPackageStatusMeta(pkg?.status).label}”`}
          sx={{
            minHeight: TOUCH_TARGET,
            px: 1.75,
            borderRadius: RADIUS.sm,
            borderWidth: '1.5px',
            fontSize: FONT.sm,
            fontWeight: 600,
            bgcolor: 'background.paper',
            borderColor: deletable ? 'error.main' : 'neutral.borderStrong',
            color: deletable ? 'error.main' : 'text.disabled',
            cursor: deletable ? 'pointer' : 'not-allowed',
            '&:hover': {
              borderWidth: '1.5px',
              borderColor: deletable ? 'error.main' : 'neutral.borderStrong',
              bgcolor: deletable ? 'error.light' : 'background.paper',
            },
          }}
        >
          Eliminar
        </Button>
      )}
      <ChevronRightOutlinedIcon aria-hidden="true" sx={{ display: { xs: 'none', md: 'block' }, color: 'text.secondary' }} />
    </Box>
  );
}

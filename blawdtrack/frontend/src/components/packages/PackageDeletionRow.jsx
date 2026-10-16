import { Box, Typography } from '@mui/material';
import DeletePackageButton from './DeletePackageButton';
import PackageStateChip from './PackageStateChip';
import { FONT, rem } from '../../theme';

/**
 * Fila de un paquete en la lista de eliminación (HU-012): número de envío, cliente y dirección, estado y el botón
 * "Eliminar". Con `flex-wrap`, en pantallas angostas el botón baja debajo de los datos. Se dibuja como elemento de
 * lista: va dentro de un `ul`.
 * @param {{ paquete: { shipmentNumber: string, customerName: string, address: string, status: string },
 *   onEliminar: (paquete: object) => void }} props
 */
export default function PackageDeletionRow({ paquete, onEliminar }) {
  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        px: 3,
        py: 1.75,
        borderTop: '1px solid #EFEAE4',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      {/* El número de envío no se parte: con la escala fluida un ancho fijo en rem queda corto en pantallas chicas. */}
      <Typography sx={{ flex: '0 0 auto', minWidth: rem(120), whiteSpace: 'nowrap', fontSize: FONT.md, fontWeight: 700, color: 'text.primary' }}>
        {paquete.shipmentNumber}
      </Typography>
      <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
        <Typography sx={{ fontSize: FONT.md, color: 'text.primary', overflowWrap: 'anywhere' }}>
          {paquete.customerName}
        </Typography>
        <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary', overflowWrap: 'anywhere' }}>
          {paquete.address}
        </Typography>
      </Box>
      <PackageStateChip status={paquete.status} />
      {/* `ml: auto` deja el botón siempre a la derecha, también cuando la fila se parte en dos líneas en móvil. */}
      <Box sx={{ ml: 'auto' }}>
        <DeletePackageButton paquete={paquete} onEliminar={onEliminar} />
      </Box>
    </Box>
  );
}

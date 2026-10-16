import { Box, Paper, Typography } from '@mui/material';
import PackageDeletionRow from './PackageDeletionRow';
import { CARD_SX } from '../formStyles';
import { DELETABLE_PACKAGE_STATES, getPackageStateLabel } from '../../config/packageStates';
import { FONT } from '../../theme';

// Se arma desde la lista blanca, para que el texto no se desactualice si cambia.
const DELETABLE_STATES_TEXT = [...DELETABLE_PACKAGE_STATES].map(getPackageStateLabel).join(' o ');

/**
 * Tarjeta "Lista de distribución" de la pantalla Eliminar paquetes (HU-012): un encabezado con la regla de qué se
 * puede eliminar y una fila por paquete. Solo muestra; qué pasa al pulsar "Eliminar" lo decide `onEliminar`.
 * @param {{ paquetes: object[], onEliminar: (paquete: object) => void }} props
 */
export default function PackageDeletionList({ paquetes, onEliminar }) {
  return (
    <Paper elevation={0} component="section" aria-labelledby="package-deletion-list-title" sx={{ ...CARD_SX, overflow: 'hidden' }}>
      <Box
        sx={{
          px: 3,
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          id="package-deletion-list-title"
          component="h2"
          sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: FONT.lg, color: 'primary.main' }}
        >
          Lista de distribución
        </Typography>
        <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>
          Solo se eliminan paquetes en {DELETABLE_STATES_TEXT}
        </Typography>
      </Box>
      <Box component="ul" sx={{ m: 0, p: 0 }}>
        {paquetes.map((paquete) => (
          <PackageDeletionRow key={paquete.shipmentNumber} paquete={paquete} onEliminar={onEliminar} />
        ))}
      </Box>
    </Paper>
  );
}

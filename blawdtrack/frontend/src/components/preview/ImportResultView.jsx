import { Box, Button, Paper, Typography } from '@mui/material';
import StatCard from '../StatCard';
import StatusMessage from '../StatusMessage';
import { CARD_SX } from '../formStyles';
import { FONT, rem } from '../../theme';

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

/**
 * Resultado de la importación confirmada (paso 3): el aviso con la cantidad importada, los totales y los números de
 * envío registrados. Si no se registró ningún paquete lo avisa en advertencia.
 * @param {{ result: object, onImportAnother: () => void }} props Resultado de `buildImportResult`; `onImportAnother`
 * vuelve al paso 1 para cargar otro archivo.
 */
export default function ImportResultView({ result, onImportAnother }) {
  const { counts, fileName, registeredShipmentNumbers } = result;
  const inFile = fileName ? ` de ${fileName}` : '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {counts.registered > 0 ? (
        <StatusMessage
          severity="success"
          title="Importación completada"
          message={`${plural(counts.registered, 'paquete registrado', 'paquetes registrados')}${inFile}. Los registros con errores y los duplicados se excluyeron.`}
        />
      ) : (
        <StatusMessage severity="warning" title="No se registró ningún paquete" message={`El archivo${fileName ? ` ${fileName}` : ''} no tenía registros válidos para importar.`} />
      )}

      <Box
        component="ul"
        aria-label="Totales de la importación"
        sx={{ display: 'grid', gap: 1.75, m: 0, p: 0, gridTemplateColumns: `repeat(auto-fit, minmax(${rem(150)}, 1fr))` }}
      >
        <StatCard value={counts.read} label="registros leídos" />
        <StatCard value={counts.registered} label="importados" tone="success" />
        <StatCard value={counts.invalid} label="con errores" tone="error" />
        <StatCard value={counts.duplicate} label="duplicados" tone="warning" />
      </Box>

      {registeredShipmentNumbers.length > 0 && (
        <Paper component="section" aria-labelledby="import-result-title" elevation={0} sx={{ ...CARD_SX, p: 3 }}>
          <Typography id="import-result-title" component="h2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.lg, color: 'primary.main', mb: 1.5 }}>
            Paquetes importados
          </Typography>
          <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, m: 0, p: 0, listStyle: 'none' }}>
            {registeredShipmentNumbers.map((shipmentNumber) => (
              <Typography key={shipmentNumber} component="li" sx={{ fontSize: FONT.sm, fontWeight: 600, px: 1.25, py: 0.5, borderRadius: 1, bgcolor: 'neutral.surface' }}>
                {shipmentNumber}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}

      <Box sx={{ '& button': { width: { xs: '100%', sm: 'auto' } } }}>
        <Button variant="contained" onClick={onImportAnother}>
          Importar otro archivo
        </Button>
      </Box>
    </Box>
  );
}

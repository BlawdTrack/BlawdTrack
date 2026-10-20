import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { FONT, RADIUS } from '../../theme';

// Lo que el lector del archivo exige y acepta (ver `ZohoColumn`): el resto de las columnas son opcionales.
const HELP_ITEMS = [
  'Un archivo .xlsx o .csv exportado de Zoho Inventory.',
  'Columnas obligatorias: "SO Number" (número de orden) y "Customer Name" (cliente).',
  'Columnas opcionales: "Packing Number" (número de envío; si falta se usa el número de orden), "Shipping Address", "Shipping Phone" y "Schedule" (horario de entrega).',
  'Las filas con el mismo número de envío y los mismos datos se agrupan en un solo paquete. Si el número ya está registrado, o se repite con datos distintos, se marca como duplicado y no se importa.',
];

/**
 * Ayuda del paso 1 de la importación, desplegable y sin salir de la pantalla: cómo debe ser el archivo de Zoho (formato,
 * columnas y qué pasa con los duplicados). Cerrada, solo ocupa una línea.
 */
export default function ImportFileHelp() {
  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      sx={{ border: '1px solid', borderColor: 'neutral.border', borderRadius: RADIUS.sm, '&::before': { display: 'none' } }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreOutlinedIcon />}
        aria-controls="import-file-help-content"
        id="import-file-help-header"
        data-testid="import-help-toggle"
        sx={{ minHeight: 48 }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <HelpOutlineOutlinedIcon sx={{ color: 'text.secondary' }} />
          <Typography component="span" sx={{ fontSize: FONT.md, fontWeight: 700, color: 'text.primary' }}>
            ¿Cómo debe ser el archivo?
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails id="import-file-help-content" aria-labelledby="import-file-help-header">
        <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {HELP_ITEMS.map((item) => (
            <Typography key={item} component="li" sx={{ fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.5 }}>
              {item}
            </Typography>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

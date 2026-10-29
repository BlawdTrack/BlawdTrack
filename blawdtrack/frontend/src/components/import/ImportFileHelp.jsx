import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from '@mui/material';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { downloadCsv, SAMPLE_CSV_CONTENT, SAMPLE_CSV_FILE_NAME } from '../../utils/importSampleCsv';
import { FONT, RADIUS } from '../../theme';

// Las columnas que lee el archivo (ver `ZohoColumn`): solo las dos primeras son obligatorias.
const COLUMNS = [
  { name: 'SO Number', required: true, meaning: 'Número de orden de venta.' },
  { name: 'Customer Name', required: true, meaning: 'Nombre del cliente.' },
  { name: 'Packing Number', required: false, meaning: 'Número de envío. Si falta se usa el número de orden.' },
  { name: 'Shipping Address', required: false, meaning: 'Dirección de entrega.' },
  { name: 'Shipping Phone', required: false, meaning: 'Teléfono del cliente.' },
  { name: 'Schedule', required: false, meaning: 'Horario de entrega, por ejemplo "9:00 am - 4:00 pm".' },
];

const NOTES = [
  'Formato: un archivo .xlsx o .csv exportado de Zoho Inventory.',
  'Las filas con el mismo número de envío y los mismos datos se agrupan en un solo paquete (una fila por artículo).',
  'Si el número de envío ya está registrado, o se repite con datos distintos, se marca como duplicado y no se importa.',
];

const CELL_SX = { py: 0.75, pr: 2, fontSize: FONT.md, verticalAlign: 'top', textAlign: 'left' };

/**
 * Ayuda del paso 1 de la importación: el formato del archivo, una tabla con las columnas que se esperan (cuáles son
 * obligatorias) y un botón para descargar un CSV de ejemplo. Va abierta para que se vea sin buscarla, y se puede cerrar.
 */
export default function ImportFileHelp() {
  return (
    <Accordion
      defaultExpanded
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
      <AccordionDetails id="import-file-help-content" aria-labelledby="import-file-help-header" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" aria-label="Columnas del archivo" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
            <Box component="thead">
              <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: 'neutral.border' }}>
                {['Columna', 'Obligatoria', 'Qué debe traer'].map((title) => (
                  <Box key={title} component="th" scope="col" sx={{ ...CELL_SX, fontWeight: 700, color: 'text.primary' }}>
                    {title}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {COLUMNS.map(({ name, required, meaning }) => (
                <Box key={name} component="tr" sx={{ borderBottom: '1px solid', borderColor: 'neutral.border' }}>
                  <Box component="th" scope="row" sx={{ ...CELL_SX, fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}>{name}</Box>
                  <Box component="td" sx={{ ...CELL_SX, fontWeight: 700, color: required ? 'error.main' : 'text.secondary' }}>{required ? 'Sí' : 'No'}</Box>
                  <Box component="td" sx={{ ...CELL_SX, color: 'text.secondary' }}>{meaning}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {NOTES.map((item) => (
            <Typography key={item} component="li" sx={{ fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.5 }}>
              {item}
            </Typography>
          ))}
        </Box>

        <Button
          type="button"
          variant="outlined"
          data-testid="import-sample-download"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={() => downloadCsv(SAMPLE_CSV_FILE_NAME, SAMPLE_CSV_CONTENT)}
          sx={{ alignSelf: 'flex-start', fontWeight: 700, minHeight: 44, borderRadius: RADIUS.sm }}
        >
          Descargar CSV de ejemplo
        </Button>
      </AccordionDetails>
    </Accordion>
  );
}

import { Box, Link, Typography } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { PREVIEW_GRID_SX } from './previewGrid';
import { PREVIEW_STATUS } from '../../utils/importPreview';
import { describeAddressLink } from '../../utils/addressLink';
import { FONT, RADIUS } from '../../theme';

// Cómo se resalta y se etiqueta cada resultado: tono de la fila, etiqueta, color del punto y de las notas.
const BY_STATUS = {
  [PREVIEW_STATUS.VALID]: { label: 'Válido', bg: 'transparent', bar: 'transparent', color: 'success.main', noteColor: 'text.secondary' },
  [PREVIEW_STATUS.INVALID]: { label: 'Con error', bg: 'error.light', bar: 'error.main', color: 'error.main', noteColor: 'error.text' },
  [PREVIEW_STATUS.DUPLICATE]: { label: 'Duplicado', bg: 'warning.light', bar: 'warning.main', color: 'warning.text', noteColor: 'warning.text' },
};

const CELL_SX = { minWidth: 0, fontSize: FONT.md, color: 'text.primary', py: { xs: 0.25, md: 1.25 } };
const ELLIPSIS_SX = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { md: 'nowrap' } };

function StatusCell({ row, status }) {
  return (
    <Box sx={CELL_SX}>
      <Typography
        component="span"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.9, fontSize: FONT.md, fontWeight: 600, color: status.color }}
      >
        <Box aria-hidden="true" component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'currentColor', flex: 'none' }} />
        {status.label}
      </Typography>
      {row.notes.map((note) => (
        <Typography key={note} component="span" sx={{ display: 'block', fontSize: FONT.sm, color: status.noteColor, lineHeight: 1.4 }}>
          {note}
        </Typography>
      ))}
    </Box>
  );
}

function AddressCell({ address }) {
  const link = describeAddressLink(address);
  if (link) {
    return (
      <Link
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        underline="none"
        title={link.href}
        aria-label={`Abrir ubicación en ${link.label}`}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.6,
          minHeight: 32,
          px: 1.25,
          borderRadius: RADIUS.lg,
          bgcolor: 'neutral.surface',
          color: 'primary.main',
          fontSize: FONT.sm,
          fontWeight: 600,
          '&:hover': { bgcolor: 'neutral.border' },
        }}
      >
        <PlaceOutlinedIcon sx={{ fontSize: FONT.md }} />
        {link.label}
      </Link>
    );
  }
  return <Box component="span" title={address ?? undefined} sx={ELLIPSIS_SX}>{address ?? '—'}</Box>;
}

/**
 * Fila de un registro del archivo en la tabla de previsualización: estado (con las notas del error o del duplicado),
 * número de envío (y de orden), cliente, dirección (un botón Waze/Maps si es un enlace), teléfono y horario (el
 * rango de entrega calculado si lo hay, con el texto original al pasar el cursor). Los registros con errores y los
 * duplicados van resaltados, y el estado lleva siempre su etiqueta con texto.
 * @param {{ row: object }} props Fila de `buildImportPreview`.
 */
export default function PreviewRecordRow({ row }) {
  const status = BY_STATUS[row.status] ?? BY_STATUS[PREVIEW_STATUS.INVALID];

  return (
    <Box
      component="li"
      data-testid={`import-row-${row.status}`}
      sx={{
        ...PREVIEW_GRID_SX,
        listStyle: 'none',
        py: { xs: 1.25, md: 0 },
        minHeight: 48,
        bgcolor: status.bg,
        borderBottom: '1px solid',
        borderColor: 'neutral.border',
        borderLeft: '4px solid',
        borderLeftColor: status.bar,
        '&:hover': { bgcolor: row.status === PREVIEW_STATUS.VALID ? 'neutral.surface' : status.bg },
      }}
    >
      <StatusCell row={row} status={status} />

      <Box sx={CELL_SX}>
        <Typography component="span" sx={{ display: 'block', fontSize: FONT.md, fontWeight: 700, color: row.shipmentNumber ? 'text.primary' : 'text.secondary' }}>
          {row.shipmentNumber ?? 'Sin número de envío'}
        </Typography>
        {row.orderNumber && row.orderNumber !== row.shipmentNumber && (
          <Typography component="span" sx={{ display: 'block', fontSize: FONT.sm, color: 'text.secondary' }}>
            Orden {row.orderNumber}
          </Typography>
        )}
      </Box>

      <Box sx={{ ...CELL_SX, ...ELLIPSIS_SX }} title={row.customerName ?? undefined}>{row.customerName ?? '—'}</Box>
      <Box sx={CELL_SX}><AddressCell address={row.address} /></Box>
      <Box sx={CELL_SX}>{row.phone ?? '—'}</Box>
      <Box
        sx={{ ...CELL_SX, whiteSpace: { md: 'nowrap' } }}
        title={row.schedule ? `Original: ${row.schedule}` : undefined}
      >
        {row.deliveryRange ?? row.schedule ?? '—'}
      </Box>
    </Box>
  );
}

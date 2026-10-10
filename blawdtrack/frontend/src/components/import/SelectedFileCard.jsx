import { Box, IconButton, Paper, Typography } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { CARD_SX } from '../formStyles';
import { formatFileSize } from '../../utils/packageFile';
import { FONT, RADIUS, rem } from '../../theme';

/**
 * Tarjeta del archivo elegido: su nombre, su tamaño y el botón para quitarlo.
 * @param {{ file: File, onRemove: () => void, disabled?: boolean }} props `disabled` bloquea el botón mientras se carga.
 */
export default function SelectedFileCard({ file, onRemove, disabled = false }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          flex: '0 0 auto',
          width: rem(44),
          height: rem(44),
          borderRadius: RADIUS.sm,
          bgcolor: 'neutral.surface',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <InsertDriveFileOutlinedIcon />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: FONT.md, fontWeight: 700, color: 'text.primary', overflowWrap: 'anywhere' }}>
          {file.name}
        </Typography>
        <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>{formatFileSize(file.size)}</Typography>
      </Box>
      <IconButton aria-label="Quitar archivo" onClick={onRemove} disabled={disabled}>
        <CloseOutlinedIcon />
      </IconButton>
    </Paper>
  );
}

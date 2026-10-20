import { Box, Button, Popover } from '@mui/material';
import { WHEEL_ITEM_HEIGHT, WHEEL_VISIBLE_ITEMS } from './Wheel';
import { RADIUS } from '../theme';

/**
 * Popover de las ruedas: la banda que resalta la fila elegida, las ruedas (`children`) y el botón "Listo".
 * Lo comparten el selector de hora y el de peso.
 * @param {{ anchor: Element|null, onClose: Function, onConfirm: Function, rowSx?: object,
 *   children: import('react').ReactNode }} props `anchor` abre el popover; `rowSx` ajusta la fila de ruedas.
 */
export function WheelPopover({ anchor, onClose, onConfirm, rowSx, children }) {
  return (
    <Popover
      open={Boolean(anchor)}
      anchorEl={anchor}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: RADIUS.md, p: 1.5, mt: 0.5 } } }}
    >
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', ...rowSx }}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: WHEEL_ITEM_HEIGHT * ((WHEEL_VISIBLE_ITEMS - 1) / 2),
            height: WHEEL_ITEM_HEIGHT,
            borderRadius: RADIUS.sm,
            backgroundColor: 'neutral.surface',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
        {children}
      </Box>
      <Button
        fullWidth
        onClick={onConfirm}
        sx={{
          mt: 1,
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: RADIUS.sm,
          color: 'common.white',
          backgroundColor: '#1A3C34',
          '&:hover': { backgroundColor: '#12322B' }
        }}
      >
        Listo
      </Button>
    </Popover>
  );
}

export default WheelPopover;

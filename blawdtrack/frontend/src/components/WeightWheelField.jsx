import { useState } from 'react';
import { Box, Button, Popover, TextField } from '@mui/material';
import { Wheel, WHEEL_ITEM_HEIGHT, WHEEL_VISIBLE_ITEMS } from './TimeWheelField';

const WEIGHTS = Array.from({ length: 800 }, (_, i) => String(i + 1));

// Wheel picker for the courier's maximum load, 1 to 800 kg (whole numbers).
// Value is a string ("" when unset) so it plugs into the same form state as a text input.
export function WeightWheelField({ label, value, onChange, error, id }) {
  const [anchor, setAnchor] = useState(null);
  const [draft, setDraft] = useState('1');

  const open = (event) => {
    setDraft(value || '1');
    setAnchor(event.currentTarget);
  };
  const confirm = () => {
    onChange(draft);
    setAnchor(null);
  };

  return (
    <>
      <TextField
        id={id}
        value={value ? `${value} kg` : ''}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(e);
          }
        }}
        placeholder="Selecciona el peso"
        error={error}
        fullWidth
        required
        slotProps={{
          htmlInput: { readOnly: true, 'aria-label': label, style: { cursor: 'pointer' } }
        }}
        sx={{
          backgroundColor: '#fff',
          '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.9rem', '& fieldset': { borderColor: '#DCD4CA' } },
          '& .MuiOutlinedInput-input': { py: 1.4 }
        }}
      />
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: '14px', p: 1.5, mt: 0.5 } } }}
      >
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: WHEEL_ITEM_HEIGHT * ((WHEEL_VISIBLE_ITEMS - 1) / 2),
              height: WHEEL_ITEM_HEIGHT,
              borderRadius: '10px',
              backgroundColor: '#F1ECE7'
            }}
          />
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Wheel items={WEIGHTS} selected={draft} onSelect={setDraft} label={label} />
            <Box component="span" sx={{ color: '#6B6560', fontWeight: 600 }}>kg</Box>
          </Box>
        </Box>
        <Button
          fullWidth
          onClick={confirm}
          sx={{
            mt: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            color: '#fff',
            backgroundColor: '#1A3C34',
            '&:hover': { backgroundColor: '#12322B' }
          }}
        >
          Listo
        </Button>
      </Popover>
    </>
  );
}

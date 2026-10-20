import { useState } from 'react';
import { INPUT_SX } from './formStyles';
import { Box, TextField } from '@mui/material';
import Wheel from './Wheel';
import WheelPopover from './WheelPopover';

const WEIGHTS = Array.from({ length: 800 }, (_, i) => String(i + 1));

/**
 * Selector de rueda para la capacidad máxima de carga del mensajero: de 1 a 800 kg, en números enteros.
 * El valor es un texto (`''` si no hay selección) para encajar en el mismo estado que un campo de texto.
 * @param {{ label: string, value: string, onChange: (value: string) => void, error?: string,
 *   id?: string }} props
 */
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
        sx={INPUT_SX}
      />
      <WheelPopover anchor={anchor} onClose={() => setAnchor(null)} onConfirm={confirm} rowSx={{ alignItems: 'center' }}>
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Wheel items={WEIGHTS} selected={draft} onSelect={setDraft} label={label} />
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>kg</Box>
        </Box>
      </WheelPopover>
    </>
  );
}

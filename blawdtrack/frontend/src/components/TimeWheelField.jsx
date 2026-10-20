import { useState } from 'react';
import { Box, TextField } from '@mui/material';
import { INPUT_SX } from './formStyles';
import Wheel from './Wheel';
import WheelPopover from './WheelPopover';
import { display, HOURS, MINUTES, parse, PERIODS, toValue } from '../utils/timeWheelValue';

/**
 * Selector de hora estilo alarma de iOS con tres ruedas (hora, minuto y am/pm). El valor es un texto
 * "HH:MM" en formato de 24 horas; `''` significa sin selección.
 * @param {{ label: string, value: string, onChange: (value: string) => void, error?: string,
 *   id?: string }} props
 */
export function TimeWheelField({ label, value, onChange, error, id }) {
  const [anchor, setAnchor] = useState(null);
  const [draft, setDraft] = useState(parse(value));

  const open = (event) => {
    setDraft(parse(value));
    setAnchor(event.currentTarget);
  };
  const confirm = () => {
    onChange(toValue(draft));
    setAnchor(null);
  };
  const set = (key) => (item) => setDraft((d) => ({ ...d, [key]: item }));
  // 12 -> 01 (or 01 -> 12 backwards) flips am/pm.
  const setHour = (item, wraps) =>
    setDraft((d) => ({
      ...d,
      hour: item,
      period: Math.abs(wraps) % 2 === 1 ? (d.period === 'am' ? 'pm' : 'am') : d.period
    }));

  return (
    <>
      <TextField
        id={id}
        value={display(value)}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(e);
          }
        }}
        placeholder="--:--"
        error={error}
        fullWidth
        required
        slotProps={{
          htmlInput: { readOnly: true, 'aria-label': label, style: { cursor: 'pointer', textAlign: 'center' } }
        }}
        sx={INPUT_SX}
      />
      <WheelPopover anchor={anchor} onClose={() => setAnchor(null)} onConfirm={confirm} rowSx={{ gap: 0.5 }}>
        <Box sx={{ position: 'relative', display: 'flex', zIndex: 1 }}>
          <Wheel items={HOURS} selected={draft.hour} onSelect={setHour} label={`${label}: hora`} />
          <Wheel items={MINUTES} selected={draft.minute} onSelect={set('minute')} label={`${label}: minutos`} />
          <Wheel items={PERIODS} selected={draft.period} onSelect={set('period')} label={`${label}: am o pm`} cyclic={false} />
        </Box>
      </WheelPopover>
    </>
  );
}

export default TimeWheelField;

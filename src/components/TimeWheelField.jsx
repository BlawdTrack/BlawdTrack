import { useEffect, useRef, useState } from 'react';
import { Box, Button, Popover, TextField } from '@mui/material';

const ITEM_HEIGHT = 40;
export const WHEEL_ITEM_HEIGHT = ITEM_HEIGHT;
const VISIBLE_ITEMS = 5;
export const WHEEL_VISIBLE_ITEMS = VISIBLE_ITEMS;
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['am', 'pm'];

// "HH:MM" (24h) <-> wheel selection (12h + am/pm)
function parse(value) {
  if (!value) return { hour: '08', minute: '00', period: 'am' };
  const [h, m] = value.split(':').map(Number);
  return {
    hour: String(h % 12 || 12).padStart(2, '0'),
    minute: String(m).padStart(2, '0'),
    period: h >= 12 ? 'pm' : 'am'
  };
}

function toValue({ hour, minute, period }) {
  const h = (Number(hour) % 12) + (period === 'pm' ? 12 : 0);
  return `${String(h).padStart(2, '0')}:${minute}`;
}

function display(value) {
  if (!value) return '';
  const { hour, minute, period } = parse(value);
  return `${Number(hour)}:${minute} ${period}`;
}

const mod = (a, n) => ((a % n) + n) % n;
const ROWS_EACH_SIDE = 4;
const WHEEL_STEP = 100;

// Infinite wheel driven by pointer/wheel/keyboard instead of native scrolling,
// so it can never skip values: the position is a continuous number of items
// and it always settles on an exact integer. onSelect(item, wraps): wraps counts
// how many times the wheel crossed last -> first (e.g. 12 -> 01), letting the
// parent flip am/pm.
export function Wheel({ items, selected, onSelect, label, cyclic = true }) {
  const n = items.length;
  const initial = Math.max(items.indexOf(selected), 0);
  const [pos, setPos] = useState(initial);
  const posRef = useRef(initial);
  const committed = useRef(initial);
  const raf = useRef(null);
  const drag = useRef(null);
  const dragged = useRef(false);
  const wheelTimer = useRef(null);
  const wheelAcc = useRef(0);

  const setPosition = (p) => {
    posRef.current = p;
    setPos(p);
  };

  const animateTo = (target) => {
    cancelAnimationFrame(raf.current);
    const step = () => {
      const diff = target - posRef.current;
      if (Math.abs(diff) < 0.002) {
        setPosition(target);
        return;
      }
      setPosition(posRef.current + diff * 0.28);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const commit = (k) => {
    const target = cyclic ? k : Math.min(Math.max(k, 0), n - 1);
    animateTo(target);
    if (target === committed.current) return;
    const wraps = cyclic ? Math.floor(target / n) - Math.floor(committed.current / n) : 0;
    committed.current = target;
    onSelect(items[mod(target, n)], wraps);
  };

  // Follow external changes (dialog opened with another value, etc.).
  useEffect(() => {
    if (items[mod(committed.current, n)] === selected) return;
    if (cyclic) {
      const delta = mod(items.indexOf(selected) - committed.current, n);
      committed.current += delta > n / 2 ? delta - n : delta;
    } else {
      committed.current = Math.max(items.indexOf(selected), 0);
    }
    animateTo(committed.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(wheelTimer.current);
    },
    []
  );

  const onPointerDown = (e) => {
    cancelAnimationFrame(raf.current);
    dragged.current = false;
    drag.current = { y: e.clientY, start: posRef.current, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (!dragged.current && Math.abs(dy) > 4) {
      dragged.current = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if (!dragged.current) return;
    const dt = Math.max(e.timeStamp - d.lastT, 1);
    d.v = (-(e.clientY - d.lastY) / ITEM_HEIGHT / dt) * 0.6 + d.v * 0.4;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    setPosition(d.start - dy / ITEM_HEIGHT);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !dragged.current) return;
    commit(Math.round(posRef.current + d.v * 180));
  };
  // One mouse-wheel notch reports ~100px, which would jump several items;
  // accumulate the delta and move exactly one item per WHEEL_STEP pixels.
  const onWheel = (e) => {
    wheelAcc.current += e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
    clearTimeout(wheelTimer.current);
    wheelTimer.current = setTimeout(() => {
      wheelAcc.current = 0;
    }, 200);
    while (Math.abs(wheelAcc.current) >= WHEEL_STEP) {
      const dir = Math.sign(wheelAcc.current);
      wheelAcc.current -= dir * WHEEL_STEP;
      commit(committed.current + dir);
    }
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') commit(committed.current - 1);
    else if (e.key === 'ArrowDown') commit(committed.current + 1);
    else return;
    e.preventDefault();
  };

  const base = Math.round(pos);
  const rows = [];
  for (let k = base - ROWS_EACH_SIDE; k <= base + ROWS_EACH_SIDE; k += 1) rows.push(k);

  return (
    <Box
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      sx={{
        position: 'relative',
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        width: 64,
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        outline: 'none'
      }}
    >
      {rows.map((k) => {
        const inRange = cyclic || (k >= 0 && k <= n - 1);
        if (!inRange) return null;
        const isSelected = k === base;
        return (
          <Box
            key={k}
            role="option"
            aria-selected={isSelected}
            onClick={() => {
              if (!dragged.current) commit(k);
            }}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: ITEM_HEIGHT,
              top: (((VISIBLE_ITEMS - 1) / 2) + (k - pos)) * ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: isSelected ? '1.25rem' : '1rem',
              fontWeight: isSelected ? 700 : 400,
              color: isSelected ? '#1A3C34' : '#9E968D'
            }}
          >
            {items[mod(k, n)]}
          </Box>
        );
      })}
    </Box>
  );
}

// iOS-alarm style time picker: three scrolling wheels (hour, minute, am/pm).
// Value is a 24h "HH:MM" string; empty string means unset.
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
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2),
              height: ITEM_HEIGHT,
              borderRadius: '10px',
              backgroundColor: '#F1ECE7',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ position: 'relative', display: 'flex', zIndex: 1 }}>
            <Wheel items={HOURS} selected={draft.hour} onSelect={setHour} label={`${label}: hora`} />
            <Wheel items={MINUTES} selected={draft.minute} onSelect={set('minute')} label={`${label}: minutos`} />
            <Wheel items={PERIODS} selected={draft.period} onSelect={set('period')} label={`${label}: am o pm`} cyclic={false} />
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

import { Paper, Typography } from '@mui/material';
import { CARD_SX } from './formStyles';
import { FONT } from '../theme';

// Color del borde y de la cifra según el tono; el neutro usa el verde de marca.
const TONES = {
  neutral: { border: 'neutral.border', value: 'primary.main' },
  success: { border: 'neutral.border', value: 'success.text' },
  warning: { border: 'warning.border', value: 'warning.text' },
};

/**
 * Tarjeta con una cifra grande y su leyenda, para los totales de una pantalla.
 * @param {{ value: number|string, label: string, tone?: 'neutral'|'success'|'warning' }} props
 *   Se dibuja como elemento de lista: va dentro de un `ul`.
 */
export default function StatCard({ value, label, tone = 'neutral' }) {
  const { border, value: valueColor } = TONES[tone] ?? TONES.neutral;

  return (
    <Paper
      component="li"
      elevation={0}
      sx={{ ...CARD_SX, borderColor: border, p: 2.25, display: 'flex', flexDirection: 'column', gap: 0.5, listStyle: 'none' }}
    >
      <Typography component="span" sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: FONT.h2, color: valueColor, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
        {label}
      </Typography>
    </Paper>
  );
}

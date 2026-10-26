import { Link } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { FONT, RADIUS } from '../theme';

/**
 * Botón corto (Waze, Maps) que abre en otra pestaña el enlace de mapa que venía pegado en la dirección de un paquete.
 * @param {{ link: { href: string, label: string } }} props `link` de `splitAddressLink`.
 */
export default function MapLinkButton({ link }) {
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
        alignSelf: 'flex-start',
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

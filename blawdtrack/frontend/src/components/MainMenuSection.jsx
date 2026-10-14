import { Box, Typography } from '@mui/material';
import MenuCard from './MenuCard';
import { NAV_GROUP_ICONS } from './layout/navIcons';
import { FONT } from '../theme';

/**
 * Sección del menú principal: un rótulo en mayúsculas con una línea que se extiende a su derecha y, debajo, las
 * tarjetas de sus módulos. Los módulos sin ruta se muestran como "Próximamente".
 * @param {{ section: { id: string, title: string, modules: Array<{ id: string, title: string, description: string,
 *   path: string|null, muted: boolean }> } }} props
 */
export default function MainMenuSection({ section }) {
  const headingId = `main-menu-section-${section.id}`;

  return (
    <Box component="section" aria-labelledby={headingId} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography
        id={headingId}
        component="h2"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontSize: FONT.xs,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'text.secondary',
          '&::after': { content: '""', flex: 1, height: 1, bgcolor: 'neutral.border' },
        }}
      >
        {section.title}
      </Typography>
      {section.modules.map((module) => (
        <MenuCard
          key={module.id}
          to={module.path}
          icon={NAV_GROUP_ICONS[module.id]}
          title={module.title}
          description={module.description}
          muted={module.muted}
        />
      ))}
    </Box>
  );
}

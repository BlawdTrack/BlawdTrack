import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const firstEnabledPath = (group) => group.items.find((item) => item.path)?.path ?? null;
const isGroupActive = (group, pathname) => group.items.some((item) => item.path === pathname);

// Bottom tab bar for phones: one tab per navigation group.
export default function MobileBottomNav({ groups }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        borderTop: '1px solid #E4DED7',
      }}
    >
      {groups.map((group) => {
        const target = firstEnabledPath(group);
        const active = isGroupActive(group, pathname);
        return (
          <Box
            key={group.id}
            onClick={() => target && navigate(target)}
            sx={{
              flex: 1,
              pt: 1.5,
              pb: 1.75,
              textAlign: 'center',
              cursor: target ? 'pointer' : 'default',
              opacity: target ? 1 : 0.5,
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '6px',
                mx: 'auto',
                mb: 0.625,
                backgroundColor: active ? '#FF6C0E' : '#E4DED7',
              }}
            />
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: active ? '#FF6C0E' : '#9E968D' }}>
              {group.shortTitle}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

import { Box } from '@mui/material';
import PageContainer from './PageContainer';
import PageHeaderBar from './PageHeaderBar';

/**
 * Esqueleto de las pantallas de gestión: el encabezado grande y, debajo, uno o varios paneles a la altura de
 * la pantalla (cada uno se desplaza por dentro, la página no). En móvil los paneles se apilan.
 * @param {{ title: string, description?: string, columns: string, children: import('react').ReactNode }} props
 *   `columns` es el `grid-template-columns` de escritorio (por ejemplo `'420px minmax(0, 1fr)'` para dos
 *   paneles, o `'minmax(0, 1fr)'` para uno); `children` son los paneles.
 */
export default function SplitScreen({ title, description, columns, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: { md: '100vh' }, minHeight: 0 }}>
      <PageHeaderBar title={title} description={description} />

      <PageContainer wide sx={{ flex: 1, minHeight: 0 }}>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: columns },
            gridTemplateRows: { md: 'minmax(0, 1fr)' },
          }}
        >
          {children}
        </Box>
      </PageContainer>
    </Box>
  );
}

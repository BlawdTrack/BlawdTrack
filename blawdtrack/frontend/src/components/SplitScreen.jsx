import { Box, Tab, Tabs } from '@mui/material';
import PageContainer from './PageContainer';
import PageHeaderBar from './PageHeaderBar';

/**
 * Esqueleto de las pantallas de gestión de dos paneles: el encabezado grande y, debajo, los paneles lado a
 * lado a la altura de la pantalla (cada uno se desplaza por dentro, la página no). En móvil los paneles se
 * apilan o, si se pasan `tabs`, se alterna entre ellos con pestañas.
 * @param {{ title: string, description?: string, columns: string,
 *   tabs?: { value: string, onChange: (value: string) => void, items: Array<{ value: string, label: string }> },
 *   children: import('react').ReactNode }} props `columns` es el `grid-template-columns` de escritorio
 *   (por ejemplo `'minmax(0, 1fr) 420px'`); `children` son los paneles.
 */
export default function SplitScreen({ title, description, columns, tabs, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: { md: '100vh' }, minHeight: 0 }}>
      <PageHeaderBar title={title} description={description} />

      <PageContainer wide sx={{ flex: 1, minHeight: 0 }}>
        {tabs && (
          <Tabs
            value={tabs.value}
            onChange={(_, value) => tabs.onChange(value)}
            variant="fullWidth"
            sx={{ display: { md: 'none' }, borderBottom: '1px solid #E4DED7' }}
          >
            {tabs.items.map((item) => (
              <Tab key={item.value} value={item.value} label={item.label} />
            ))}
          </Tabs>
        )}

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

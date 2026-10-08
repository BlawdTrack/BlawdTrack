import { useState } from 'react';
import { Avatar, Box, Button, Chip, Paper, Tab, Tabs, Typography } from '@mui/material';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import BackButton from './BackButton';
import CourierEditForm from './CourierEditForm';
import HistoryList from './HistoryList';
import StatusChip from './StatusChip';
import TabPanel from './TabPanel';
import { CARD_SX } from './formStyles';
import { getInitials } from '../utils/getInitials';
import { getCourierDocument, getCourierName, recordsLabel } from '../utils/courierEdit';
import { RADIUS, FONT } from '../theme';

const OUTLINE_BUTTON_SX = { color: 'primary.main', fontWeight: 600, border: '1.5px solid', borderColor: 'neutral.borderStrong' };

/**
 * Panel de un mensajero: quién es, y dos pestañas, "Datos" (formulario) e "Historial" (solo los cambios
 * de ese mensajero). Hay que montarlo con `key` distinto por mensajero para que vuelva a la pestaña de
 * datos al cambiar de uno a otro.
 * @param {{ editor: ReturnType<typeof import('../hooks/useCourierEditor').useCourierEditor>,
 *   onBack: Function, onDiscard: Function, listOpen: boolean, onShowList: Function }} props
 */
export default function CourierDetailPanel({ editor, onBack, onDiscard, listOpen, onShowList }) {
  const [activeTab, setActiveTab] = useState('datos');
  const { courier, history } = editor;

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, flexWrap: 'wrap' }}>
        <BackButton onClick={onBack} sx={{ flex: { xs: '0 0 100%', md: '0 0 auto' }, justifyContent: 'flex-start' }}>
          Volver a la lista
        </BackButton>
        {!listOpen && (
          <Button
            onClick={onShowList}
            startIcon={<ViewSidebarOutlinedIcon />}
            sx={{ ...OUTLINE_BUTTON_SX, display: { xs: 'none', md: 'inline-flex' } }}
          >
            Mostrar flota
          </Button>
        )}
        <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', color: 'common.white', fontWeight: 700 }}>
          {getInitials(getCourierName(courier))}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.lg, color: 'primary.main' }}>
            Editar · {getCourierName(courier)}
          </Typography>
          <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
            Cédula {getCourierDocument(courier)} · no editable
          </Typography>
        </Box>
        <StatusChip active={editor.formData.status === 'ACTIVE'} />
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ px: 1.5, borderBottom: '1px solid', borderColor: 'neutral.border', minHeight: 48 }}
      >
        <Tab value="datos" label="Datos" id="tab-datos" aria-controls="panel-datos" />
        <Tab value="historial" label={`Historial (${history.length})`} id="tab-historial" aria-controls="panel-historial" />
      </Tabs>

      <TabPanel id="datos" active={activeTab === 'datos'}>
        <CourierEditForm editor={editor} onDiscard={onDiscard} />
      </TabPanel>

      <TabPanel id="historial" active={activeTab === 'historial'}>
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.md, color: 'primary.main' }}>
            Historial de modificaciones
          </Typography>
          <Chip
            label={recordsLabel(history.length)}
            size="small"
            sx={{ fontSize: FONT.xs, fontWeight: 600, bgcolor: 'neutral.surface', color: 'text.secondary', borderRadius: RADIUS.lg }}
          />
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <HistoryList entries={history} emptyMessage="Todavía no hay cambios registrados para esta pantalla." />
        </Box>
      </TabPanel>
    </Paper>
  );
}

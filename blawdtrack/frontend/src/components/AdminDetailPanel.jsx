import { Avatar, Box, Button, Paper, Typography } from '@mui/material';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import AdminEditForm from './AdminEditForm';
import BackButton from './BackButton';
import StatusChip from './StatusChip';
import { CARD_SX } from './formStyles';
import { getAdminDocument, getAdminName } from '../utils/adminEdit';
import { getInitials } from '../utils/getInitials';
import { FONT, rem } from '../theme';

const OUTLINE_BUTTON_SX = { color: 'primary.main', fontWeight: 600, border: '1.5px solid', borderColor: 'neutral.borderStrong' };

/**
 * Panel de un administrador (HU-007): quién es y su formulario de edición. Equivale a `CourierDetailPanel`, sin las
 * pestañas del historial. Hay que montarlo con `key` distinto por administrador.
 * @param {{ editor: ReturnType<typeof import('../hooks/useAdminEditor').useAdminEditor>, onBack: Function,
 *   onDiscard: Function, listOpen: boolean, onShowList: Function }} props
 */
export default function AdminDetailPanel({ editor, onBack, onDiscard, listOpen, onShowList }) {
  const { admin } = editor;

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'neutral.border' }}>
        <BackButton onClick={onBack} sx={{ flex: { xs: '0 0 100%', md: '0 0 auto' }, justifyContent: 'flex-start' }}>
          Volver a la lista
        </BackButton>
        {!listOpen && (
          <Button
            onClick={onShowList}
            startIcon={<ViewSidebarOutlinedIcon />}
            sx={{ ...OUTLINE_BUTTON_SX, display: { xs: 'none', md: 'inline-flex' } }}
          >
            Mostrar lista
          </Button>
        )}
        <Avatar sx={{ width: rem(38), height: rem(38), bgcolor: 'primary.main', color: 'common.white', fontWeight: 700 }}>
          {getInitials(getAdminName(admin))}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.lg, color: 'primary.main' }}>
            Editar · {getAdminName(admin)}
          </Typography>
          <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
            {admin.documentType} {getAdminDocument(admin)} · no editable
          </Typography>
        </Box>
        <StatusChip active={editor.formData.status === 'ACTIVE'} />
      </Box>

      <AdminEditForm editor={editor} onDiscard={onDiscard} />
    </Paper>
  );
}

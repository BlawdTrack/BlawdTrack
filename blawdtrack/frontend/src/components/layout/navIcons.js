import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

// Icono por item de navegación (sidebar de escritorio).
export const NAV_ITEM_ICONS = {
  'password-reset': LockResetOutlinedIcon,
  'courier-create': PersonAddAltOutlinedIcon,
  'courier-update': EditOutlinedIcon,
  'courier-deactivate': PersonOffOutlinedIcon,
  'admin-create': AdminPanelSettingsOutlinedIcon,
  'admin-delete': PersonRemoveOutlinedIcon,
  'roles-permissions': ManageAccountsOutlinedIcon,
};

// Icono por grupo (barra inferior móvil, un tab por grupo).
export const NAV_GROUP_ICONS = {
  security: LockResetOutlinedIcon,
  couriers: LocalShippingOutlinedIcon,
  admins: AdminPanelSettingsOutlinedIcon,
};

import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';

// Icono por item de navegación (sidebar de escritorio).
export const NAV_ITEM_ICONS = {
  'package-import': UploadFileOutlinedIcon,
  'password-reset': LockResetOutlinedIcon,
  'courier-create': PersonAddAltOutlinedIcon,
  'courier-update': EditOutlinedIcon,
  'courier-deactivate': PersonOffOutlinedIcon,
  'admin-create': PersonAddAltOutlinedIcon,
  'admin-delete': PersonRemoveOutlinedIcon,
  'roles-permissions': ManageAccountsOutlinedIcon,
};

// Icono por grupo (barra inferior móvil, un tab por grupo), por submenú (tarjetas del menú de un grupo) y por módulo
// futuro del menú principal (tarjetas "Próximamente").
export const NAV_GROUP_ICONS = {
  users: PeopleAltOutlinedIcon,
  settings: SettingsOutlinedIcon,
  couriers: LocalShippingOutlinedIcon,
  admins: AdminPanelSettingsOutlinedIcon,
  packages: UploadFileOutlinedIcon,
  'package-management': Inventory2OutlinedIcon,
  'assignment-tracking': PlaceOutlinedIcon,
  reports: BarChartOutlinedIcon,
  'courier-operation': LocalShippingOutlinedIcon,
  'my-packages': LocalShippingOutlinedIcon,
  'trip-costs': PaidOutlinedIcon,
};

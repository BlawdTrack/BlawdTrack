import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EmptyState from '../EmptyState';
import { ROUTES } from '../../config/routes';

/**
 * Estado de "todavía no hay paquetes en la lista de distribución": explica por qué no hay nada que buscar y lleva a
 * la importación para cargar los envíos del día.
 */
export default function PackageListEmptyState() {
  return (
    <EmptyState
      icon={Inventory2OutlinedIcon}
      title="Aún no hay paquetes en la lista"
      description="Importa los envíos del día desde Zoho Inventory para poder buscarlos."
    >
      <Button component={RouterLink} to={ROUTES.PACKAGE_IMPORT} variant="contained" data-testid="package-list-empty-import">
        Ir a Importación de paquetes
      </Button>
    </EmptyState>
  );
}

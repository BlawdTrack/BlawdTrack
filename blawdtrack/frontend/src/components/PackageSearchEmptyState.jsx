import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { Button } from '@mui/material';
import EmptyState from './EmptyState';

/**
 * Estado de una búsqueda sin coincidencias: dice qué se buscó y deja limpiar el término con un clic.
 * @param {{ term: string, onClear: Function }} props
 */
export function PackageSearchEmptyState({ term, onClear }) {
  return (
    <EmptyState
      icon={SearchOffOutlinedIcon}
      title={`Sin resultados para “${term}”`}
      description="Revisa el número de envío o prueba con otro criterio: orden, cliente, dirección, teléfono u horario de preferencia."
    >
      <Button type="button" variant="contained" onClick={onClear} data-testid="package-search-empty-clear">
        Limpiar búsqueda
      </Button>
    </EmptyState>
  );
}

export default PackageSearchEmptyState;

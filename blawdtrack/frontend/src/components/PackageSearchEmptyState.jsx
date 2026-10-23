import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { Button } from '@mui/material';
import EmptyState from './EmptyState';

function describeNoMatches(term, statusLabel) {
  if (!term) {
    return {
      title: `Sin paquetes en estado “${statusLabel}”`,
      description: 'Ningún paquete está en este estado por ahora. Prueba con otra pestaña de estado.',
    };
  }
  return {
    title: `Sin resultados para “${term}”`,
    description: 'Revisa la ortografía o prueba con menos letras, o con otro criterio: orden, cliente, dirección, teléfono u horario de preferencia.',
  };
}

/**
 * Estado de una búsqueda sin coincidencias: dice qué se buscó (o qué estado se filtró) y deja limpiar con un clic.
 * @param {{ term: string, statusLabel?: string|null, onClear: Function }} props
 */
export function PackageSearchEmptyState({ term, statusLabel = null, onClear }) {
  const { title, description } = describeNoMatches(term, statusLabel);

  return (
    <EmptyState
      icon={SearchOffOutlinedIcon}
      title={<span data-testid="package-search-empty-title">{title}</span>}
      description={description}
    >
      <Button type="button" variant="contained" onClick={onClear} data-testid="package-search-empty-clear">
        Limpiar búsqueda
      </Button>
    </EmptyState>
  );
}

export default PackageSearchEmptyState;

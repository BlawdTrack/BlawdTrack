import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { Button } from '@mui/material';
import EmptyState from './EmptyState';

// Un término con forma de número de envío (BG-2026-001): si no aparece, se dice que ese paquete no existe.
const SHIPMENT_NUMBER_LIKE = /^[a-z]{2,}-?\d/i;

function describeNoMatches(term, statusLabel) {
  if (!term) {
    return {
      title: `Sin paquetes en estado “${statusLabel}”`,
      description: 'Ningún paquete está en este estado por ahora. Prueba con otra pestaña de estado.',
    };
  }
  if (SHIPMENT_NUMBER_LIKE.test(term)) {
    return {
      title: 'Paquete no encontrado',
      description: `No existe el número de envío “${term}”. Revisa que esté bien escrito o prueba con la orden, el cliente o la dirección.`,
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
    <EmptyState icon={SearchOffOutlinedIcon} title={title} description={description}>
      <Button type="button" variant="contained" onClick={onClear} data-testid="package-search-empty-clear">
        Limpiar búsqueda
      </Button>
    </EmptyState>
  );
}

export default PackageSearchEmptyState;

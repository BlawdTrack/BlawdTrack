import { MenuItem } from '@mui/material';
import FormField from './FormField';
import { DOCUMENT_TYPE_OPTIONS, DOCUMENT_PLACEHOLDERS } from '../config/documentTypes';

/**
 * Par de campos "Tipo de documento" y "Número de documento" de los formularios de creación; el ejemplo
 * del número cambia según el tipo elegido.
 * @param {{ field: (name: string) => object, documentType: string, typeSx?: object, numberSx?: object }} props
 *   `field` es el `fieldProps` de `useRegistrationForm`.
 */
export default function DocumentFields({ field, documentType, typeSx, numberSx }) {
  return (
    <>
      <FormField {...field('documentType')} label="Tipo de documento" select required sx={typeSx}>
        {DOCUMENT_TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </FormField>
      <FormField
        {...field('documentNumber')}
        label="Número de documento"
        required
        placeholder={DOCUMENT_PLACEHOLDERS[documentType]}
        sx={numberSx}
      />
    </>
  );
}

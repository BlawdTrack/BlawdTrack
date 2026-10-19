import { useState } from 'react';
import { Box } from '@mui/material';
import StatusMessage from '../StatusMessage';
import PreviewCounters from './PreviewCounters';
import PreviewFilters from './PreviewFilters';
import PreviewRecordList from './PreviewRecordList';
import { filterPreviewRows } from '../../utils/importPreview';

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

// Qué tipo de duplicados hay, para que se sepa si ya existían o se repiten en el propio archivo.
function duplicateCausesText({ alreadyRegistered, duplicatedInFile }) {
  const parts = [];
  if (alreadyRegistered) parts.push(`${plural(alreadyRegistered, 'ya registrado', 'ya registrados')} en la base de datos`);
  if (duplicatedInFile) parts.push(`${plural(duplicatedInFile, 'repetido', 'repetidos')} en el archivo`);
  return parts.length ? ` Duplicados: ${parts.join(' y ')}.` : '';
}

// El aviso principal: éxito si todo se puede importar, error si nada, advertencia si una parte se excluye.
function summaryAlert({ counts, duplicateCauses, fileName }) {
  const excluded = counts.invalid + counts.duplicate;
  const inFile = fileName ? ` en ${fileName}` : '';

  if (counts.valid === 0) {
    return { severity: 'error', title: `Ningún registro${inFile} se puede importar`, message: 'Revisa los motivos de cada registro, corrige el archivo y vuelve a cargarlo.' };
  }
  if (excluded === 0) {
    return { severity: 'success', message: `Todos los registros${inFile} son válidos y se pueden importar.` };
  }
  const parts = [];
  if (counts.invalid) parts.push(plural(counts.invalid, 'registro con errores', 'registros con errores'));
  if (counts.duplicate) parts.push(plural(counts.duplicate, 'duplicado', 'duplicados'));
  return {
    severity: 'warning',
    title: `${parts.join(' y ')}${inFile}`,
    message: `Se excluyen de la importación.${duplicateCausesText(duplicateCauses)} Los demás registros se pueden importar sin cambios.`,
  };
}

/**
 * Resultado de la validación de un archivo antes de importarlo: el aviso, los totales, los filtros y la lista de
 * registros con su resultado. El filtro activo es el único estado propio.
 * @param {{ preview: object }} props Previsualización de `buildImportPreview`.
 */
export default function ImportPreviewView({ preview }) {
  const [filter, setFilter] = useState('all');
  const alert = summaryAlert(preview);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <StatusMessage severity={alert.severity} title={alert.title} message={alert.message} />
      <PreviewCounters counts={preview.counts} />
      <PreviewFilters counts={preview.counts} active={filter} onChange={setFilter} />
      <PreviewRecordList rows={filterPreviewRows(preview.rows, filter)} />
    </Box>
  );
}

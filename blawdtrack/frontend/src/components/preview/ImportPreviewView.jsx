import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import StatusMessage from '../StatusMessage';
import PreviewFilters from './PreviewFilters';
import PreviewRecordList from './PreviewRecordList';
import PreviewSearchField from './PreviewSearchField';
import { filterPreviewRows, searchPreviewRows } from '../../utils/importPreview';
import { FONT } from '../../theme';

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

// Qué tipo de duplicados hay, para que se sepa si ya existían o se repiten en el propio archivo.
function duplicateCausesText({ alreadyRegistered, duplicatedInFile }) {
  const parts = [];
  if (alreadyRegistered) parts.push(`${plural(alreadyRegistered, 'ya registrado', 'ya registrados')} en la base de datos`);
  if (duplicatedInFile) parts.push(`${plural(duplicatedInFile, 'repetido', 'repetidos')} en el archivo`);
  return parts.length ? ` Duplicados: ${parts.join(' y ')}.` : '';
}

// Qué hacer con los duplicados, según su causa: lo ya registrado existe en el sistema; lo repetido se corrige en el archivo.
function duplicateAdviceText({ alreadyRegistered, duplicatedInFile }) {
  if (alreadyRegistered && duplicatedInFile) {
    return ' Los ya registrados existen en el sistema; para importar los repetidos, deja una sola fila por número de envío y vuelve a cargar el archivo.';
  }
  if (alreadyRegistered) return ' Ya existen en el sistema, así que no hace falta importarlos de nuevo.';
  if (duplicatedInFile) return ' Para importarlos, deja una sola fila por número de envío y vuelve a cargar el archivo.';
  return '';
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
    message: `Se excluyen de la importación.${duplicateCausesText(duplicateCauses)}${duplicateAdviceText(duplicateCauses)} Los demás registros se pueden importar sin cambios.`,
  };
}

/**
 * Resultado de la validación de un archivo antes de importarlo: el aviso principal, el nombre del archivo, las pestañas con
 * los totales, el buscador y la tabla de registros. El filtro activo y el texto
 * buscado son el único estado propio.
 * @param {{ preview: object }} props Previsualización de `buildImportPreview`.
 */
export default function ImportPreviewView({ preview }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const alert = summaryAlert(preview);
  const rows = searchPreviewRows(filterPreviewRows(preview.rows, filter), query);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <StatusMessage severity={alert.severity} title={alert.title} message={alert.message} testId="import-summary" />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, flexWrap: 'wrap' }}>
        {preview.fileName && (
          <Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: FONT.md, fontWeight: 700, color: 'text.primary' }}>
            <InsertDriveFileOutlinedIcon sx={{ color: 'text.secondary' }} />
            {preview.fileName}
          </Typography>
        )}
        <PreviewFilters counts={preview.counts} active={filter} onChange={setFilter} />
        <PreviewSearchField value={query} onChange={setQuery} />
      </Box>

      <PreviewRecordList rows={rows} totalCount={preview.counts.read} />
    </Box>
  );
}

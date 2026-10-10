import { Box } from '@mui/material';
import StatusMessage from '../StatusMessage';
import DuplicateCounters from './DuplicateCounters';
import DuplicateRecordList from './DuplicateRecordList';

const alertTitle = (count, fileName) => {
  const detected = count === 1 ? '1 registro duplicado detectado' : `${count} registros duplicados detectados`;
  return fileName ? `${detected} en ${fileName}` : detected;
};

/**
 * Resultado de la detección de duplicados de un archivo: el aviso (con duplicados, en advertencia; sin ellos, en
 * éxito), los totales y la lista resaltada de los registros duplicados.
 * @param {{ report: object }} props Reporte de `buildDuplicateReport`.
 */
export default function DuplicateReportView({ report }) {
  const hasDuplicates = report.duplicateCount > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {hasDuplicates ? (
        <StatusMessage
          severity="warning"
          title={alertTitle(report.duplicateCount, report.fileName)}
          message="Se excluyen de la importación. El resto del archivo se puede confirmar sin cambios."
        />
      ) : (
        <StatusMessage
          severity="success"
          message={`No se detectaron duplicados${report.fileName ? ` en ${report.fileName}` : ''}. Todos los registros pueden importarse.`}
        />
      )}

      <DuplicateCounters report={report} />

      {hasDuplicates && <DuplicateRecordList duplicates={report.duplicates} />}
    </Box>
  );
}

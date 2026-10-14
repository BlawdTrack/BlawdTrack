import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { FONT } from '../theme';
import PackageResultRow from './PackageResultRow';

/**
 * Tabla con el listado de paquetes encontrados por la búsqueda activa.
 * @param {{ packages: Array<object>|null|undefined }} props
 */
export function PackageResultsTable({ packages }) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return null;
  }

  const headers = ['N.º ENVÍO', 'CLIENTE', 'DIRECCIÓN', 'HORARIO', 'ESTADO'];

  return (
    <TableContainer
      sx={{
        mt: 2,
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'neutral.border',
        backgroundColor: 'background.paper',
        boxShadow: 'none',
      }}
    >
      <Table aria-label="Listado de paquetes" sx={{ minWidth: 760, borderCollapse: 'separate', borderSpacing: 0 }}>
        <TableHead sx={{ backgroundColor: 'neutral.surface' }}>
          <TableRow>
            {headers.map((header) => (
              <TableCell
                key={header}
                component="th"
                scope="col"
                sx={{
                  py: 1.25,
                  px: 2,
                  fontSize: FONT.xs,
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid',
                  borderColor: 'neutral.border',
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {packages.map((pkg) => (
            <PackageResultRow key={pkg.id} pkg={pkg} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PackageResultsTable;

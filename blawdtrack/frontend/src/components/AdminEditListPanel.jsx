import { Typography } from '@mui/material';
import AccountRow from './AccountRow';
import SearchableListPanel from './SearchableListPanel';
import StatusChip from './StatusChip';
import { getAdminDocument, getAdminName, isAdminActive } from '../utils/adminEdit';
import { FONT } from '../theme';

/**
 * Panel de los administradores de ventas para elegir a quién editar (HU-007): búsqueda por tipo y número de documento
 * y la lista con el estado de acceso de cada uno y el botón "Editar". Solo muestra; qué pasa al elegir lo decide
 * `onSelect`.
 * @param {{ admins: object[], totalCount: number, loading: boolean, errorMessage?: string|null, search: object,
 *   onSelect: (admin: object) => void, selecting?: boolean, onRetry?: Function, sx?: object }} props `admins` ya viene
 *   filtrada; `totalCount` es el total sin filtrar; con `selecting` los botones se bloquean mientras se consulta.
 */
export default function AdminEditListPanel({ admins, totalCount, loading, errorMessage, search, onSelect, selecting = false, onRetry, sx }) {
  const noun = totalCount === 1 ? 'registrado' : 'registrados';
  const count = search.isFiltering ? `${admins.length} de ${totalCount}` : totalCount;

  return (
    <SearchableListPanel
      searchTitle="Buscar administrador por documento"
      search={search}
      listTitle="Administradores"
      meta={!loading && !errorMessage && totalCount > 0 && (
        <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
          {count} {noun}
        </Typography>
      )}
      items={admins}
      totalCount={totalCount}
      loading={loading}
      errorMessage={errorMessage}
      onRetry={onRetry}
      emptyMessage="No hay administradores registrados."
      noMatchMessage="Administrador no encontrado. Revisa el tipo y el número de documento, o pulsa Limpiar para ver la lista completa."
      sx={sx}
      renderItem={(admin) => (
        <AccountRow
          key={admin.id}
          name={getAdminName(admin)}
          lines={[{ text: `${getAdminDocument(admin) || admin.id} · ${admin.email}` }]}
          status={<StatusChip active={isAdminActive(admin)} />}
          actionLabel="Editar"
          actionTone="primary"
          actionDisabled={selecting}
          onAction={() => onSelect(admin)}
        />
      )}
    />
  );
}

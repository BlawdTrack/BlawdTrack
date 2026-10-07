import { Typography } from '@mui/material';
import AccountRow from './AccountRow';
import SearchableListPanel from './SearchableListPanel';
import SessionChip from './SessionChip';

/**
 * Panel de los administradores de ventas (HU-008): búsqueda por documento y lista con el botón "Eliminar"
 * de cada uno y si tiene la sesión abierta. Solo muestra; qué pasa al eliminar lo decide `onDelete`.
 * @param {{ admins: object[], totalCount: number, loading: boolean, errorMessage?: string|null,
 *   search: object, onDelete: (admin: object) => void, sx?: object }} props `admins` ya viene filtrada;
 *   `totalCount` es el total sin filtrar.
 */
export default function AdminListPanel({ admins, totalCount, loading, errorMessage, search, onDelete, sx }) {
  const noun = totalCount === 1 ? 'registrado' : 'registrados';
  const count = search.isFiltering ? `${admins.length} de ${totalCount}` : totalCount;

  return (
    <SearchableListPanel
      searchTitle="Buscar administrador por documento"
      search={search}
      listTitle="Administradores"
      meta={!loading && !errorMessage && totalCount > 0 && (
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          {count} {noun}
        </Typography>
      )}
      items={admins}
      totalCount={totalCount}
      loading={loading}
      errorMessage={errorMessage}
      emptyMessage="No hay administradores registrados."
      noMatchMessage="No se encontró ningún administrador con ese documento. Revisa el tipo y el número, o pulsa Limpiar para ver la lista completa."
      sx={sx}
      renderItem={(admin) => (
        <AccountRow
          key={admin.id}
          name={admin.name}
          lines={[{ text: `${admin.identification || admin.id} · ${admin.email}` }]}
          status={<SessionChip active={Boolean(admin.hasActiveSession)} />}
          actionLabel="Eliminar"
          onAction={() => onDelete(admin)}
        />
      )}
    />
  );
}

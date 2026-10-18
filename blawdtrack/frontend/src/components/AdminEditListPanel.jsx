import AccountPickerPanel from './AccountPickerPanel';
import { getAdminDocument, getAdminName, isAdminActive } from '../utils/adminEdit';

/**
 * Panel de los administradores de ventas para elegir a quién editar (HU-007): búsqueda por tipo y número de documento
 * y la lista con el estado de acceso de cada uno (Activo / Inactivo), más el botón del historial general. Es el panel
 * genérico `AccountPickerPanel` con los textos y la lectura de un administrador, igual que `CourierFleetPanel`.
 * @param {{ admins: object[], totalCount: number, loading: boolean, errorMessage?: string|null, onRetry?: Function,
 *   selectedKey: unknown, onSelect: (admin: object) => void, search: object, canHide: boolean, onHide: Function,
 *   onOpenGeneralHistory: Function, generalHistoryOpen: boolean, sx?: object }} props `admins` ya viene filtrada;
 *   `totalCount` es el total sin filtrar.
 */
export default function AdminEditListPanel({
  admins,
  totalCount,
  loading,
  errorMessage,
  onRetry,
  selectedKey,
  onSelect,
  search,
  canHide,
  onHide,
  onOpenGeneralHistory,
  generalHistoryOpen,
  sx,
}) {
  return (
    <AccountPickerPanel
      searchTitle="Buscar administrador por documento"
      listTitle="Administradores de ventas"
      columnTitle="Administrador"
      noun={['administrador', 'administradores']}
      items={admins}
      totalCount={totalCount}
      loading={loading}
      errorMessage={errorMessage}
      onRetry={onRetry}
      selectedKey={selectedKey}
      onSelect={onSelect}
      search={search}
      getKey={getAdminDocument}
      getName={getAdminName}
      getSubtitle={(admin) => `${getAdminDocument(admin)} · ${admin.email}`}
      isActive={isAdminActive}
      emptyMessage="No hay administradores registrados."
      noMatchMessage="Administrador no encontrado. Revisa el tipo y el número de documento, o pulsa Limpiar para ver la lista completa."
      canHide={canHide}
      onHide={onHide}
      hideLabel="Ocultar la lista de administradores"
      historyLabel="Ver historial general"
      onOpenHistory={onOpenGeneralHistory}
      historyOpen={generalHistoryOpen}
      sx={sx}
    />
  );
}

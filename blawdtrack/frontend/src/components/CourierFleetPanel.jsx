import AccountPickerPanel from './AccountPickerPanel';
import { getCourierDocument, getCourierName, getScheduleTimeRange, isCourierActive } from '../utils/courierEdit';

/**
 * Panel de la flota de mensajeros: búsqueda por documento, lista con el estado de cada uno y el botón del
 * historial general. Elegir una fila avisa con `onSelect`; no sabe nada de cómo se edita. Es el panel genérico
 * `AccountPickerPanel` con los textos y la lectura de un mensajero.
 * @param {{ couriers: object[], totalCount: number, loading: boolean, selectedKey: unknown,
 *   onSelect: (courier: object) => void, search: object, canHide: boolean, onHide: Function,
 *   onOpenGeneralHistory: Function, generalHistoryOpen: boolean, sx?: object }} props `couriers` ya viene
 *   filtrada; `totalCount` es el total sin filtrar (para distinguir "no hay ninguno" de "ninguno coincide").
 */
export default function CourierFleetPanel({
  couriers,
  totalCount,
  loading,
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
      searchTitle="Buscar mensajero por documento"
      listTitle="Flota de mensajeros"
      columnTitle="Mensajero"
      noun={['mensajero', 'mensajeros']}
      items={couriers}
      totalCount={totalCount}
      loading={loading}
      selectedKey={selectedKey}
      onSelect={onSelect}
      search={search}
      getKey={getCourierDocument}
      getName={getCourierName}
      getSubtitle={(courier) =>
        `${getCourierDocument(courier) ?? ''} · ${getScheduleTimeRange(courier.schedule || courier.horario)}`}
      isActive={isCourierActive}
      emptyMessage="No hay mensajeros disponibles"
      noMatchMessage="No se encontró ningún mensajero con ese documento."
      canHide={canHide}
      onHide={onHide}
      hideLabel="Ocultar la flota de mensajeros"
      historyLabel="Ver historial general"
      onOpenHistory={onOpenGeneralHistory}
      historyOpen={generalHistoryOpen}
      sx={sx}
    />
  );
}

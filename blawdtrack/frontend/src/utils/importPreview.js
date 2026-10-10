import { describeDuplicate } from './duplicateReport';

/** Resultado de un registro del archivo en la previsualización. */
export const PREVIEW_STATUS = Object.freeze({
  VALID: 'valid',
  INVALID: 'invalid',
  DUPLICATE: 'duplicate',
});

/** Filtros de la lista, en el orden en que se muestran. */
export const PREVIEW_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: PREVIEW_STATUS.VALID, label: 'Válidos' },
  { id: PREVIEW_STATUS.INVALID, label: 'Con errores' },
  { id: PREVIEW_STATUS.DUPLICATE, label: 'Duplicados' },
];

const asList = (value) => (Array.isArray(value) ? value : []);
const countOf = (value, fallback) => (Number.isFinite(value) ? value : fallback);

// El backend serializa `LocalTime` como "09:00:00" (o "09:00"); también se acepta el arreglo [9, 0].
function parseTime(value) {
  if (Array.isArray(value) && Number.isInteger(value[0]) && Number.isInteger(value[1])) {
    return { hour: value[0], minute: value[1] };
  }
  const match = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(String(value ?? ''));
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
}

const isValidTime = (time) => time && time.hour >= 0 && time.hour <= 23 && time.minute >= 0 && time.minute <= 59;

function formatTime({ hour, minute }) {
  const suffix = hour < 12 ? 'a. m.' : 'p. m.';
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

/**
 * Rango de entrega que calcula el backend, listo para mostrar ("9:00 a. m. – 4:00 p. m.").
 * @param {{ start: string|number[], end: string|number[] }|null|undefined} window `deliveryWindow` del paquete.
 * @returns {string|null} El texto, o `null` si el backend no lo envió o no se entiende.
 */
export function formatDeliveryWindow(window) {
  const start = parseTime(window?.start);
  const end = parseTime(window?.end);
  return isValidTime(start) && isValidTime(end) ? `${formatTime(start)} – ${formatTime(end)}` : null;
}

function packageRow(status, record, index, notes = []) {
  return {
    key: `${status}-${index}-${record?.shipmentNumber ?? ''}`,
    status,
    shipmentNumber: record?.shipmentNumber || null,
    orderNumber: record?.orderNumber || null,
    customerName: record?.customerName || null,
    address: record?.address || null,
    phone: record?.phone || null,
    schedule: record?.schedule || null,
    deliveryRange: formatDeliveryWindow(record?.deliveryWindow),
    notes,
  };
}

/**
 * Convierte la respuesta de la previsualización de una importación (`PackageImportPreviewResponse`) en lo que
 * muestra la pantalla: los totales y una lista agrupada por resultado (válidos, con errores y duplicados), porque
 * el backend no devuelve el orden original del archivo.
 *
 * - **Válidos:** traen todos sus datos y, si el backend lo envía, el rango de entrega (`deliveryWindow`).
 * - **Con errores:** el motivo de cada uno es el mensaje de cada campo obligatorio que falta.
 * - **Duplicados:** hoy solo traen número de envío, ocurrencias y causas; cliente y dirección son opcionales.
 * @param {object|null|undefined} preview Respuesta de previsualización.
 * @returns {{ fileName: string, counts: { read: number, valid: number, invalid: number, duplicate: number },
 *   rows: Array<object> }|null} `null` si no hay una previsualización utilizable.
 */
export function buildImportPreview(preview) {
  if (!preview || typeof preview !== 'object') return null;

  const valid = asList(preview.validRecords).map((record, index) => packageRow(PREVIEW_STATUS.VALID, record, index));
  const invalid = asList(preview.invalidRecords).map((item, index) =>
    packageRow(
      PREVIEW_STATUS.INVALID,
      item?.packageData,
      index,
      asList(item?.issues).map((issue) => issue?.message).filter(Boolean)
    )
  );
  const duplicate = asList(preview.duplicates).map((item, index) =>
    packageRow(PREVIEW_STATUS.DUPLICATE, item, index, [describeDuplicate(item ?? {})].filter(Boolean))
  );

  const counts = {
    valid: countOf(preview.validRecordsCount, valid.length),
    invalid: countOf(preview.invalidRecordsCount, invalid.length),
    duplicate: countOf(preview.duplicateRecordsCount, duplicate.length),
  };

  return {
    fileName: preview.fileName ?? '',
    counts: { read: countOf(preview.totalRecords, counts.valid + counts.invalid + counts.duplicate), ...counts },
    rows: [...valid, ...invalid, ...duplicate],
  };
}

/**
 * Filas que muestra un filtro de la lista.
 * @param {Array<{ status: string }>} rows
 * @param {string} filterId `'all'` o uno de los valores de `PREVIEW_STATUS`.
 */
export function filterPreviewRows(rows, filterId) {
  return filterId === 'all' ? rows : rows.filter((row) => row.status === filterId);
}

/** Textos de la tarjeta "Comprobante de entrega" (HU-013), construidos solo con datos reales del backend. */

/**
 * Fecha y hora de la entrega en formato local de 24 horas, el mismo que usa el
 * historial de estados. Devuelve `null` cuando no hay timestamp utilizable.
 */
export function formatProofTimestamp(timestamp) {
  if (!timestamp) return null;
  const when = new Date(timestamp);
  if (Number.isNaN(when.getTime())) return null;
  const date = when.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = when.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} a las ${time}`;
}

/**
 * Busca en el historial el registro real del paso a ENTREGADO. El historial
 * llega ordenado cronológicamente, así que se toma la última entrada con ese
 * estado (la entrega definitiva). Nunca se deduce por posición ni por la
 * fecha actual.
 */
export function findDeliveredTimestamp(entries) {
  if (!Array.isArray(entries)) return null;
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry?.newStatus === 'DELIVERED' && entry?.timestamp) return entry.timestamp;
  }
  return null;
}

/**
 * Texto complementario de la entrega, construido solo con datos reales del
 * backend: la fecha del historial y la existencia de una firma registrada (el
 * backend la expone como `deliverySignatureUrl`; sin ese campo no se afirma
 * nada). El backend todavía no expone el nombre de la persona que recibió el
 * paquete, por lo que no se muestra un "Recibido por" inventado.
 */
export function buildReceiptSummary(deliveredAt, hasSignature) {
  const parts = [];
  if (deliveredAt) parts.push(`Entrega registrada el ${deliveredAt}.`);
  parts.push(
    hasSignature
      ? 'Firma digital registrada al cierre de la entrega.'
      : 'Sin firma digital registrada.'
  );
  return parts.join(' ');
}

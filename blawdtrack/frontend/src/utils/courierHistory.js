// Turns the entries of GET /v1/couriers/{id}/history into the rows shown in
// the "Historial de modificaciones" panel. UI texts are in Spanish.

const FIELD_LABELS = {
  fullName: 'Nombre',
  email: 'Correo',
  phone: 'Teléfono',
  schedule: 'Horario',
  maxPackageWeightKg: 'Capacidad de carga',
  status: 'Estado de acceso',
};

const ACTION_TEXTS = {
  CREAR_MENSAJERO: 'Mensajero registrado',
  DESACTIVAR_MENSAJERO: 'Estado de acceso: Inactivo (sesión cerrada inmediatamente)',
  ACTIVAR_MENSAJERO: 'Estado de acceso: Activo (sesión cerrada inmediatamente)',
  CAMBIAR_CONTRASENA_MENSAJERO: 'Contraseña actualizada (sesión cerrada inmediatamente)',
};

function describeFields(details) {
  const labels = String(details ?? '')
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
    .map((field) => FIELD_LABELS[field] ?? field);
  return labels.length > 0 ? `Campos modificados: ${labels.join(', ')}` : 'Datos modificados';
}

export function formatHistoryEntry(entry, index) {
  const when = new Date(entry.timestamp);
  const date = when.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = when.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });

  return {
    id: `${entry.timestamp}-${index}`,
    when: `${date} · ${time}`,
    text: ACTION_TEXTS[entry.action] ?? describeFields(entry.details),
    by: entry.actorName,
    // Solo en el historial general: de qué mensajero es el cambio.
    courierName: entry.courierName,
    courierDocument: entry.documentNumber,
  };
}

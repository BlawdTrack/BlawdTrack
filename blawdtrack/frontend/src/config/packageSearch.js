/** Constantes compartidas para la búsqueda de paquetes. */
export const MAX_SEARCH_TERM_LENGTH = 100;
export const DEFAULT_PAGE = 0;
export const SEARCH_PAGE_SIZE = 100;

/** Valor del selector "Buscar por" que busca en todos los campos a la vez. */
export const ALL_FIELDS = 'all';

/** Campos por los que se puede buscar; `value` es el que entiende el parámetro `field` del backend. */
export const SEARCH_FIELD_OPTIONS = [
  { value: ALL_FIELDS, label: 'Todos los campos', placeholder: 'Ej. ENV-00123, Ana, Heredia o 8888-8888' },
  { value: 'shipmentNumber', label: 'N.º de envío', placeholder: 'Ej. ENV-00123' },
  { value: 'orderNumber', label: 'N.º de orden', placeholder: 'Ej. SO-01004' },
  { value: 'customerName', label: 'Cliente', placeholder: 'Ej. Ana Herrera' },
  { value: 'address', label: 'Dirección', placeholder: 'Ej. Heredia, San Rafael' },
  { value: 'phone', label: 'Teléfono', placeholder: 'Ej. 8888-8888' },
  { value: 'schedule', label: 'Horario', placeholder: 'Ej. 9 am a 12 pm' },
];

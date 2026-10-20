const LINK_PATTERN = /^https?:\/\/\S+$/i;

// Cada servicio de mapas que llega en los archivos de Zoho, por el servidor del enlace.
const MAP_SERVICES = [
  { label: 'Waze', matches: (host) => host === 'waze.com' || host.endsWith('.waze.com') },
  {
    label: 'Maps',
    matches: (host) => ['maps.app.goo.gl', 'goo.gl', 'maps.google.com', 'google.com', 'www.google.com'].includes(host),
  },
];

/**
 * Si la dirección de un paquete es un enlace a un mapa (Waze o Google Maps), devuelve el enlace y el nombre corto con
 * el que se muestra; así la tabla no se llena de URLs largas.
 * @param {string|null|undefined} address Dirección tal como viene en el archivo.
 * @returns {{ href: string, label: string }|null} `null` si no es un enlace http(s).
 */
export function describeAddressLink(address) {
  const text = (address ?? '').trim();
  if (!LINK_PATTERN.test(text)) return null;

  try {
    const { hostname } = new URL(text);
    const host = hostname.toLowerCase();
    const service = MAP_SERVICES.find(({ matches }) => matches(host));
    return { href: text, label: service ? service.label : 'Enlace' };
  } catch {
    return null;
  }
}

export default describeAddressLink;

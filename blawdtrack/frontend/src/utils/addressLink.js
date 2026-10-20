const URL_PATTERN = /https?:\/\/[^\s]+/i;
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;

// Cada servicio de mapas que llega en los archivos de Zoho, por el servidor del enlace.
const MAP_SERVICES = [
  { label: 'Waze', matches: (host) => host === 'waze.com' || host.endsWith('.waze.com') },
  {
    label: 'Maps',
    matches: (host) => ['maps.app.goo.gl', 'goo.gl', 'maps.google.com', 'google.com', 'www.google.com'].includes(host),
  },
];

function labelOf(href) {
  try {
    const host = new URL(href).hostname.toLowerCase();
    return MAP_SERVICES.find(({ matches }) => matches(host))?.label ?? 'Enlace';
  } catch {
    return null;
  }
}

/**
 * Separa la dirección de un paquete en su texto y el enlace a un mapa (Waze o Google Maps) que suele venir pegado
 * dentro de ella, para mostrar el texto y un botón corto en vez de la URL larga. Solo se reconocen enlaces http(s).
 * @param {string|null|undefined} address Dirección tal como viene en el archivo.
 * @returns {{ text: string, link: { href: string, label: string }|null }} `text` es la dirección sin el enlace
 *   (puede quedar vacío) y `link` es `null` si no hay un enlace válido.
 */
export function splitAddressLink(address) {
  const original = (address ?? '').trim();
  const found = URL_PATTERN.exec(original);
  if (!found) return { text: original, link: null };

  const href = found[0].replace(TRAILING_PUNCTUATION, '');
  const label = labelOf(href);
  if (!label) return { text: original, link: null };

  const text = original.replace(found[0], ' ').replace(/\s+/g, ' ').trim();
  return { text, link: { href, label } };
}

export default splitAddressLink;

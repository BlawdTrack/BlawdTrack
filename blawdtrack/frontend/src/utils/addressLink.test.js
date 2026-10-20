import { describe, it, expect } from 'vitest';
import { splitAddressLink } from './addressLink';

describe('splitAddressLink', () => {
  it('una dirección que es solo un enlace de Waze deja el texto vacío', () => {
    expect(splitAddressLink('https://waze.com/ul/hd1u0mmj97')).toEqual({
      text: '',
      link: { href: 'https://waze.com/ul/hd1u0mmj97', label: 'Waze' },
    });
  });

  it('separa el texto del enlace de Google Maps pegado al final, con saltos de línea', () => {
    const result = splitAddressLink('Desamparados\nBarrio del socorro \nhttps://maps.app.goo.gl/hkVWJQqKTxnoWTDh7');

    expect(result.text).toBe('Desamparados Barrio del socorro');
    expect(result.link).toEqual({ href: 'https://maps.app.goo.gl/hkVWJQqKTxnoWTDh7', label: 'Maps' });
  });

  it('reconoce los enlaces antiguos goo.gl/maps con parámetros y el enlace en medio del texto', () => {
    const result = splitAddressLink('Cariari Heredia https://goo.gl/maps/2HDF1FddmgxeoN9k8?g_st=ac casa 81');

    expect(result.text).toBe('Cariari Heredia casa 81');
    expect(result.link).toEqual({ href: 'https://goo.gl/maps/2HDF1FddmgxeoN9k8?g_st=ac', label: 'Maps' });
  });

  it('no incluye la puntuación que sigue al enlace', () => {
    expect(splitAddressLink('Ver https://www.google.com/maps/place/x.').link.href).toBe('https://www.google.com/maps/place/x');
  });

  it('otro enlace http(s) se muestra como "Enlace"', () => {
    expect(splitAddressLink('http://ejemplo.com/mapa').link.label).toBe('Enlace');
  });

  it('una dirección sin enlace, vacía o con otro protocolo no tiene enlace', () => {
    expect(splitAddressLink('Heredia, Barva, casa azul')).toEqual({ text: 'Heredia, Barva, casa azul', link: null });
    expect(splitAddressLink('javascript:alert(1)').link).toBeNull();
    expect(splitAddressLink('')).toEqual({ text: '', link: null });
    expect(splitAddressLink(null)).toEqual({ text: '', link: null });
  });
});

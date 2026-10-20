import { describe, it, expect } from 'vitest';
import { describeAddressLink } from './addressLink';

describe('describeAddressLink', () => {
  it('reconoce los enlaces de Waze y de Google Maps', () => {
    expect(describeAddressLink('https://waze.com/ul/hd1u0mmj97')).toEqual({ href: 'https://waze.com/ul/hd1u0mmj97', label: 'Waze' });
    expect(describeAddressLink('https://maps.app.goo.gl/bdSZdEfrGaySrbXU6')?.label).toBe('Maps');
    expect(describeAddressLink('https://www.google.com/maps/place/x')?.label).toBe('Maps');
  });

  it('otro enlace http(s) se muestra como "Enlace"', () => {
    expect(describeAddressLink('http://ejemplo.com/mapa')?.label).toBe('Enlace');
  });

  it('una dirección de texto, vacía o con un protocolo peligroso no es un enlace', () => {
    expect(describeAddressLink('Heredia, Barva, casa azul')).toBeNull();
    expect(describeAddressLink('Frente a https://waze.com/x')).toBeNull();
    expect(describeAddressLink('javascript:alert(1)')).toBeNull();
    expect(describeAddressLink('')).toBeNull();
    expect(describeAddressLink(null)).toBeNull();
  });
});

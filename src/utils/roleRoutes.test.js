import { describe, it, expect } from 'vitest';
import { ROLE_HOME_ROUTES, getHomeRoute } from './roleRoutes';

describe('getHomeRoute (T12)', () => {
  it('devuelve la ruta de inicio de cada rol del backend', () => {
    expect(getHomeRoute('SUPER_USUARIO')).toBe('/administradores');
    expect(getHomeRoute('ADMIN_VENTAS')).toBe('/ventas');
    expect(getHomeRoute('MENSAJERO')).toBe('/mensajero');
  });

  it('devuelve null para roles desconocidos o ausentes', () => {
    expect(getHomeRoute('ROL_QUE_NO_EXISTE')).toBeNull();
    expect(getHomeRoute(undefined)).toBeNull();
    expect(getHomeRoute(null)).toBeNull();
    expect(getHomeRoute('')).toBeNull();
  });

  it.each(['constructor', 'toString', 'hasOwnProperty', '__proto__', 'valueOf'])(
    'las claves heredadas del prototipo (%s) no cuentan como roles',
    (role) => {
      expect(getHomeRoute(role)).toBeNull();
    }
  );

  it('el mapa solo contiene los 3 roles del backend', () => {
    expect(Object.keys(ROLE_HOME_ROUTES).sort()).toEqual(['ADMIN_VENTAS', 'MENSAJERO', 'SUPER_USUARIO']);
  });
});

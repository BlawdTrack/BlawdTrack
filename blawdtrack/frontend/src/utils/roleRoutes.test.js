import { describe, it, expect } from 'vitest';
import { ROLE_HOME_ROUTES, getHomeRoute, getPasswordResetRoute } from './roleRoutes';

describe('getPasswordResetRoute (restablecer la propia contraseña)', () => {
  it('devuelve la pantalla de cada rol del backend', () => {
    expect(getPasswordResetRoute('SUPER_USUARIO')).toBe('/main-menu/restablecer-contrasena');
    // El Administrador de Ventas comparte con el Súper Usuario la pantalla dentro del menú principal.
    expect(getPasswordResetRoute('ADMIN_VENTAS')).toBe('/main-menu/restablecer-contrasena');
    expect(getPasswordResetRoute('MENSAJERO')).toBe('/mensajero/restablecer-contrasena');
  });

  it.each(['ROL_QUE_NO_EXISTE', undefined, null, '', 'constructor', 'toString'])(
    'devuelve null para el rol desconocido o heredado del prototipo (%s)',
    (role) => {
      expect(getPasswordResetRoute(role)).toBeNull();
    }
  );
});

describe('getHomeRoute (T12)', () => {
  it('devuelve la ruta de inicio de cada rol del backend', () => {
    expect(getHomeRoute('SUPER_USUARIO')).toBe('/main-menu');
    expect(getHomeRoute('ADMIN_VENTAS')).toBe('/main-menu');
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

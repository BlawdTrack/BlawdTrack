import { describe, expect, it } from 'vitest';
import { appendPage, hasMorePages } from './packageSearchPages';

describe('hasMorePages', () => {
  it('es verdadero mientras la página actual no sea la última', () => {
    expect(hasMorePages({ page: 0, totalPages: 3 })).toBe(true);
    expect(hasMorePages({ page: 1, totalPages: 3 })).toBe(true);
  });

  it('es falso en la última página, sin resultados o sin datos de paginación', () => {
    expect(hasMorePages({ page: 2, totalPages: 3 })).toBe(false);
    expect(hasMorePages({ page: 0, totalPages: 0 })).toBe(false);
    expect(hasMorePages({ content: [] })).toBe(false);
    expect(hasMorePages(null)).toBe(false);
    expect(hasMorePages(undefined)).toBe(false);
  });
});

describe('appendPage', () => {
  it('suma el contenido nuevo al ya cargado y toma el número de página y los totales de la página nueva', () => {
    const loaded = { content: [{ id: 3 }, { id: 2 }], page: 0, size: 2, totalElements: 4, totalPages: 2 };
    const next = { content: [{ id: 1 }, { id: 0 }], page: 1, size: 2, totalElements: 4, totalPages: 2 };

    expect(appendPage(loaded, next)).toEqual({
      content: [{ id: 3 }, { id: 2 }, { id: 1 }, { id: 0 }],
      page: 1,
      size: 2,
      totalElements: 4,
      totalPages: 2,
    });
  });

  it('descarta los paquetes que ya estaban, por ejemplo si se registró uno nuevo mientras se navegaba', () => {
    const loaded = { content: [{ id: 3 }, { id: 2 }], page: 0, totalPages: 2 };
    const next = { content: [{ id: 2 }, { id: 1 }], page: 1, totalPages: 2 };

    expect(appendPage(loaded, next).content).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
  });

  it('usa el número de envío cuando el paquete no trae id', () => {
    const loaded = { content: [{ shipmentNumber: 'ENV-1' }] };
    const next = { content: [{ shipmentNumber: 'ENV-1' }, { shipmentNumber: 'ENV-2' }] };

    expect(appendPage(loaded, next).content).toEqual([{ shipmentNumber: 'ENV-1' }, { shipmentNumber: 'ENV-2' }]);
  });

  it('sin nada cargado devuelve la página nueva', () => {
    expect(appendPage(null, { content: [{ id: 1 }], page: 0 })).toEqual({ content: [{ id: 1 }], page: 0 });
  });
});

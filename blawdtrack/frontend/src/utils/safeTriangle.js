/**
 * Indica si un punto cae dentro de un triángulo (bordes incluidos).
 * @param {{ x: number, y: number }} point
 * @param {{ x: number, y: number }} a Vértices del triángulo.
 * @param {{ x: number, y: number }} b
 * @param {{ x: number, y: number }} c
 * @returns {boolean}
 */
export function isPointInTriangle(point, a, b, c) {
  const sign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

  const d1 = sign(point, a, b);
  const d2 = sign(point, b, c);
  const d3 = sign(point, c, a);

  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNegative && hasPositive);
}

/**
 * Triángulo "seguro" de un menú flotante: el que forman el último punto donde estuvo el cursor sobre el
 * disparador (`apex`) y las dos esquinas del borde cercano del menú abierto. Mientras el cursor viaja
 * dentro de ese triángulo se dirige al menú, aunque pase por encima de otros disparadores.
 * @param {{ x: number, y: number }} pointer Posición actual del cursor.
 * @param {{ x: number, y: number }} apex Última posición del cursor sobre el disparador abierto.
 * @param {{ left: number, top: number, bottom: number }} panelRect Rectángulo del menú abierto.
 * @returns {boolean}
 */
export function isHeadingToPanel(pointer, apex, panelRect) {
  return isPointInTriangle(
    pointer,
    apex,
    { x: panelRect.left, y: panelRect.top },
    { x: panelRect.left, y: panelRect.bottom }
  );
}

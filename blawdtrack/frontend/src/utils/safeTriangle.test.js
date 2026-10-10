import { describe, it, expect } from 'vitest';
import { isPointInTriangle, isHeadingToPanel } from './safeTriangle';

const A = { x: 0, y: 0 };
const B = { x: 10, y: 0 };
const C = { x: 0, y: 10 };

describe('isPointInTriangle', () => {
  it('accepts points inside and on the edges', () => {
    expect(isPointInTriangle({ x: 2, y: 2 }, A, B, C)).toBe(true);
    expect(isPointInTriangle({ x: 5, y: 0 }, A, B, C)).toBe(true);
    expect(isPointInTriangle(A, A, B, C)).toBe(true);
  });

  it('rejects points outside, whatever the vertex order', () => {
    expect(isPointInTriangle({ x: 8, y: 8 }, A, B, C)).toBe(false);
    expect(isPointInTriangle({ x: -1, y: 2 }, A, B, C)).toBe(false);
    expect(isPointInTriangle({ x: 8, y: 8 }, C, B, A)).toBe(false);
    expect(isPointInTriangle({ x: 2, y: 2 }, C, B, A)).toBe(true);
  });
});

describe('isHeadingToPanel', () => {
  // Disparador en (40, 100); el menú abierto ocupa x >= 90 y de y=100 a y=260.
  const apex = { x: 40, y: 100 };
  const panel = { left: 90, top: 100, bottom: 260 };

  it('is true while the cursor travels diagonally towards the panel', () => {
    expect(isHeadingToPanel({ x: 70, y: 150 }, apex, panel)).toBe(true);
  });

  it('is false when the cursor drifts away from the panel', () => {
    expect(isHeadingToPanel({ x: 45, y: 150 }, apex, panel)).toBe(false);
    expect(isHeadingToPanel({ x: 70, y: 40 }, apex, panel)).toBe(false);
  });
});

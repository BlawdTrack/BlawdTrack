import { describe, it, expect } from 'vitest';
import { VISUALLY_HIDDEN_SX } from './a11yStyles';

describe('VISUALLY_HIDDEN_SX', () => {
  it('mide en píxeles: en sx, width: 1 es el 100 % del contenedor y ensanchaba la página', () => {
    expect(VISUALLY_HIDDEN_SX.width).toBe('1px');
    expect(VISUALLY_HIDDEN_SX.height).toBe('1px');
    expect(VISUALLY_HIDDEN_SX.overflow).toBe('hidden');
  });
});

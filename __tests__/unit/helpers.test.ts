import { describe, it, expect } from 'vitest';
import * as helpers from '../../lib/helpers';

describe('helpers', () => {
  it('should correctly capitalize a string', () => {
    expect(helpers.capitalize('aethermoor')).toBe('Aethermoor');
  });

  it('should clamp a number within range', () => {
    expect(helpers.clamp(5, 1, 10)).toBe(5);
    expect(helpers.clamp(-1, 0, 3)).toBe(0);
    expect(helpers.clamp(99, 0, 10)).toBe(10);
  });
});

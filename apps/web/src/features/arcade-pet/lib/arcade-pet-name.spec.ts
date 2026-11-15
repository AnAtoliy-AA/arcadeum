import { describe, expect, it } from 'vitest';
import { sanitizePetName } from './arcade-pet-name';

describe('sanitizePetName', () => {
  it('trims and collapses whitespace', () => {
    expect(sanitizePetName('  Neon   Phantom ')).toBe('Neon Phantom');
  });

  it('strips control characters', () => {
    expect(sanitizePetName('Bi\u0000t\n')).toBe('Bit');
  });

  it('rejects names that are too short or too long', () => {
    expect(sanitizePetName('a')).toBeNull();
    expect(sanitizePetName('   ')).toBeNull();
    expect(sanitizePetName('x'.repeat(25))).toBeNull();
    expect(sanitizePetName('x'.repeat(24))).not.toBeNull();
  });
});

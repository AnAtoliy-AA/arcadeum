import { describe, it, expect } from 'vitest';
import { formatMoveRef } from './move-ref';

describe('formatMoveRef', () => {
  it('formats white moves with a single dot', () => {
    expect(formatMoveRef(0, 'e4')).toBe('1. e4');
    expect(formatMoveRef(4, 'Nf3')).toBe('3. Nf3');
  });

  it('formats black moves with an ellipsis', () => {
    expect(formatMoveRef(1, 'e5')).toBe('1... e5');
  });
});

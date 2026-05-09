import { describe, it, expect } from 'vitest';
import { formatWindow } from './formatWindow';

const labels = { now: 'Now', forever: 'Forever', always: 'Always' };

describe('formatWindow', () => {
  it('returns Always when both null', () => {
    expect(formatWindow(null, null, 'en', labels)).toBe('Always');
  });

  it('formats start and end', () => {
    const out = formatWindow(
      '2026-05-09T00:00:00Z',
      '2026-05-16T00:00:00Z',
      'en-US',
      labels,
    );
    expect(out).toMatch(/May 9.*→.*May 1[56]/);
  });

  it('uses Now when start is null', () => {
    const out = formatWindow(null, '2026-05-16T00:00:00Z', 'en-US', labels);
    expect(out).toMatch(/^Now → /);
  });

  it('uses Forever when end is null', () => {
    const out = formatWindow('2026-05-09T00:00:00Z', null, 'en-US', labels);
    expect(out).toMatch(/→ Forever$/);
  });
});

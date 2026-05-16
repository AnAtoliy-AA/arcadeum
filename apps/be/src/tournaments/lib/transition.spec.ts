import { canTransition, canDelete, nextStatuses } from './transition';

describe('canTransition', () => {
  it.each([
    ['scheduled', 'registration_open', true],
    ['scheduled', 'cancelled', true],
    ['scheduled', 'live', false],
    ['scheduled', 'completed', false],
    ['registration_open', 'live', true],
    ['registration_open', 'cancelled', true],
    ['registration_open', 'scheduled', false],
    ['live', 'completed', true],
    ['live', 'cancelled', true],
    ['live', 'scheduled', false],
    ['completed', 'cancelled', false],
    ['cancelled', 'scheduled', false],
  ] as const)('%s → %s = %s', (from, to, expected) => {
    expect(canTransition(from, to)).toBe(expected);
  });
});

describe('canDelete', () => {
  it('allows deletion only for scheduled or cancelled', () => {
    expect(canDelete('scheduled')).toBe(true);
    expect(canDelete('cancelled')).toBe(true);
    expect(canDelete('registration_open')).toBe(false);
    expect(canDelete('live')).toBe(false);
    expect(canDelete('completed')).toBe(false);
  });
});

describe('nextStatuses', () => {
  it('returns valid next steps from each state', () => {
    expect(nextStatuses('scheduled')).toEqual([
      'registration_open',
      'cancelled',
    ]);
    expect(nextStatuses('completed')).toEqual([]);
  });
});

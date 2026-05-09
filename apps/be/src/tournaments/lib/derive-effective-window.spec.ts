import {
  deriveEffectiveWindow,
  deriveEffectiveStatus,
} from './derive-effective-window';

describe('deriveEffectiveWindow', () => {
  const scheduledAt = new Date('2026-06-01T18:00:00Z');

  it('derives both bounds when null', () => {
    const w = deriveEffectiveWindow(scheduledAt, null, null);
    expect(w.registrationOpensAt).toEqual(new Date('2026-05-25T18:00:00Z'));
    expect(w.registrationClosesAt).toEqual(new Date('2026-06-01T17:00:00Z'));
  });

  it('passes through explicit opens, derives closes', () => {
    const opens = new Date('2026-05-30T00:00:00Z');
    const w = deriveEffectiveWindow(scheduledAt, opens, null);
    expect(w.registrationOpensAt).toBe(opens);
    expect(w.registrationClosesAt).toEqual(new Date('2026-06-01T17:00:00Z'));
  });

  it('passes through explicit closes, derives opens', () => {
    const closes = new Date('2026-05-31T12:00:00Z');
    const w = deriveEffectiveWindow(scheduledAt, null, closes);
    expect(w.registrationOpensAt).toEqual(new Date('2026-05-25T18:00:00Z'));
    expect(w.registrationClosesAt).toBe(closes);
  });

  it('passes through both', () => {
    const opens = new Date('2026-05-30T00:00:00Z');
    const closes = new Date('2026-05-31T12:00:00Z');
    const w = deriveEffectiveWindow(scheduledAt, opens, closes);
    expect(w.registrationOpensAt).toBe(opens);
    expect(w.registrationClosesAt).toBe(closes);
  });
});

describe('deriveEffectiveStatus', () => {
  const scheduledAt = new Date('2026-06-01T18:00:00Z');

  it('returns scheduled before registration opens', () => {
    expect(
      deriveEffectiveStatus({
        status: 'scheduled',
        scheduledAt,
        registrationOpensAt: null,
        registrationClosesAt: null,
        now: new Date('2026-05-20T00:00:00Z'),
      }),
    ).toBe('scheduled');
  });

  it('returns registration_open between opens and closes', () => {
    expect(
      deriveEffectiveStatus({
        status: 'scheduled',
        scheduledAt,
        registrationOpensAt: null,
        registrationClosesAt: null,
        now: new Date('2026-05-30T00:00:00Z'),
      }),
    ).toBe('registration_open');
  });

  it('returns registration_closed between closes and scheduled', () => {
    expect(
      deriveEffectiveStatus({
        status: 'scheduled',
        scheduledAt,
        registrationOpensAt: null,
        registrationClosesAt: null,
        now: new Date('2026-06-01T17:30:00Z'),
      }),
    ).toBe('registration_closed');
  });

  it('returns awaiting_results after scheduled when no live transition yet', () => {
    expect(
      deriveEffectiveStatus({
        status: 'scheduled',
        scheduledAt,
        registrationOpensAt: null,
        registrationClosesAt: null,
        now: new Date('2026-06-02T00:00:00Z'),
      }),
    ).toBe('awaiting_results');
  });

  it('respects explicit live status', () => {
    expect(
      deriveEffectiveStatus({
        status: 'live',
        scheduledAt,
        registrationOpensAt: null,
        registrationClosesAt: null,
        now: new Date('2026-06-01T18:30:00Z'),
      }),
    ).toBe('live');
  });

  it('respects terminal completed/cancelled', () => {
    const args = {
      scheduledAt,
      registrationOpensAt: null,
      registrationClosesAt: null,
      now: new Date('2026-05-20T00:00:00Z'),
    } as const;
    expect(deriveEffectiveStatus({ ...args, status: 'completed' })).toBe(
      'completed',
    );
    expect(deriveEffectiveStatus({ ...args, status: 'cancelled' })).toBe(
      'cancelled',
    );
  });
});

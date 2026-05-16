import { deriveStatus, buildActiveFilter } from './announcement-status';

describe('deriveStatus', () => {
  const now = new Date('2026-05-09T12:00:00Z');

  it('returns active when both bounds null', () => {
    expect(deriveStatus(null, null, now)).toBe('active');
  });

  it('returns active when startsAt past and endsAt future', () => {
    expect(
      deriveStatus(
        new Date('2026-05-08T00:00:00Z'),
        new Date('2026-05-10T00:00:00Z'),
        now,
      ),
    ).toBe('active');
  });

  it('returns active when startsAt past and endsAt null', () => {
    expect(deriveStatus(new Date('2026-05-01T00:00:00Z'), null, now)).toBe(
      'active',
    );
  });

  it('returns active when startsAt null and endsAt future', () => {
    expect(deriveStatus(null, new Date('2026-05-10T00:00:00Z'), now)).toBe(
      'active',
    );
  });

  it('returns scheduled when startsAt is in the future', () => {
    expect(deriveStatus(new Date('2026-05-10T00:00:00Z'), null, now)).toBe(
      'scheduled',
    );
  });

  it('returns expired when endsAt is in the past', () => {
    expect(deriveStatus(null, new Date('2026-05-08T00:00:00Z'), now)).toBe(
      'expired',
    );
  });

  it('boundary: now === startsAt → active', () => {
    expect(deriveStatus(now, null, now)).toBe('active');
  });

  it('boundary: now === endsAt → expired (endsAt is exclusive)', () => {
    expect(deriveStatus(null, now, now)).toBe('expired');
  });
});

describe('buildActiveFilter', () => {
  const now = new Date('2026-05-09T12:00:00Z');

  it('matches the active-now predicate', () => {
    expect(buildActiveFilter(now)).toEqual({
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gt: now } }] },
      ],
    });
  });
});

import type { AnnouncementStatus } from '../interfaces/announcement.interface';

export function deriveStatus(
  startsAt: Date | null,
  endsAt: Date | null,
  now: Date,
): AnnouncementStatus {
  if (startsAt && startsAt > now) return 'scheduled';
  if (endsAt && endsAt <= now) return 'expired';
  return 'active';
}

export function buildActiveFilter(now: Date): Record<string, unknown> {
  return {
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gt: now } }] },
    ],
  };
}

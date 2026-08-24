import { TARGET_SCORES } from './spades.constants';

/**
 * Validate raw spades game options coming from the room config.
 * Unknown keys are ignored; invalid values fall back to defaults upstream.
 */
export function validateSpadesOptions(raw: unknown): boolean {
  if (raw === undefined || raw === null) return true;
  if (typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  if ('nilEnabled' in r && typeof r.nilEnabled !== 'boolean') {
    return false;
  }
  if (
    'targetScore' in r &&
    !(TARGET_SCORES as readonly unknown[]).includes(r.targetScore)
  ) {
    return false;
  }
  return true;
}

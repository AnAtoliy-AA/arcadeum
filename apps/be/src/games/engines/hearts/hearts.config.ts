import { TARGET_SCORES } from './hearts.constants';

/**
 * Validate raw hearts game options coming from the room config.
 * Unknown keys are ignored; invalid values fall back to defaults upstream.
 */
export function validateHeartsOptions(raw: unknown): boolean {
  if (raw === undefined || raw === null) return true;
  if (typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  if ('passingEnabled' in r && typeof r.passingEnabled !== 'boolean') {
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

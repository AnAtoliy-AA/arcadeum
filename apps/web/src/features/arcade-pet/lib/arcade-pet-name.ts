export const PET_NAME_MIN_LENGTH = 2;
export const PET_NAME_MAX_LENGTH = 24;

/** Trims, collapses whitespace and strips control characters; null when invalid. */
export function sanitizePetName(raw: string): string | null {
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (
    cleaned.length < PET_NAME_MIN_LENGTH ||
    cleaned.length > PET_NAME_MAX_LENGTH
  ) {
    return null;
  }
  return cleaned;
}

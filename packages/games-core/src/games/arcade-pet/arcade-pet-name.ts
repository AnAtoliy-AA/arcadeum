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

export const GIFT_MESSAGE_MAX_LENGTH = 300;

/** Strips control characters and markup brackets from user-written text shown to others. */
export function sanitizeGiftMessage(raw: string): string | undefined {
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, GIFT_MESSAGE_MAX_LENGTH);
  return cleaned || undefined;
}

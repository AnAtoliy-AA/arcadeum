/**
 * Formats a date string safely, returning a default value if the date is invalid.
 */
export function formatSafeDate(
  dateStr: string | undefined | null,
  options: Intl.DateTimeFormatOptions = {},
  defaultValue = '',
): string {
  if (!dateStr) return defaultValue;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return defaultValue;
  return date.toLocaleString(undefined, options);
}

/**
 * Formats a date string safely to a time string, returning a default value if the date is invalid.
 */
export function formatSafeTime(
  dateStr: string | undefined | null,
  defaultValue = '',
): string {
  if (!dateStr) return defaultValue;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return defaultValue;
  return date.toLocaleTimeString();
}

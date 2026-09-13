/**
 * Replaces {{key}} placeholders in a template string with values from params.
 * Unmatched placeholders are kept as-is.
 */
export function interpolate(
  template: string,
  params: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    return value === undefined || value === null ? match : String(value);
  });
}

/**
 * Join class-name parts into a single string, dropping falsy values.
 * Replaces the repeated `.filter(Boolean).join(' ')` idiom.
 */
export function cx(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Escape special regex characters in a string.
 * Use this to safely pass user input to RegExp constructors.
 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

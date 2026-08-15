/**
 * Shared border classes for form controls (Input, TextArea, Select).
 * Error state swaps the border color; otherwise the border highlights the
 * primary color on hover/focus.
 */
export function fieldBorderClasses(error: boolean): string {
  return error
    ? 'border-[var(--error)]'
    : 'border-[var(--borderColor)] hover:border-[var(--primary)] focus:border-[var(--primary)] focus:border-[2px]';
}

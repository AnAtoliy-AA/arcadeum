const DUPLICATE_KEY_ERROR = 11000;

/** True for a MongoDB duplicate-key (E11000) error, e.g. a unique-index race. */
export function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  // Mongo driver errors are plain objects with a numeric `code`; there is no
  // exported type to narrow to, so read the property through a minimal shape.
  return (error as { code?: unknown }).code === DUPLICATE_KEY_ERROR;
}

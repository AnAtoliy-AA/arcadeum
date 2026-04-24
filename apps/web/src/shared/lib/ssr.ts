/**
 * Utility to handle errors during SSR pre-fetching.
 * Suppresses noisy logs in development and E2E environments
 * while maintaining proper error reporting in production.
 */
export function handleSsrFetchError(id: string, error: unknown): void {
  const isDev = process.env.NODE_ENV === 'development';
  const isE2E = process.env.NEXT_PUBLIC_E2E === 'true';

  // Certain errors are expected in dev/E2E (e.g. mocked data not available on server)
  const isExpectedError =
    error instanceof Error &&
    (error.message === 'room_not_found_error' ||
      error.message === 'game_not_found_error' ||
      error.message === 'private_room_error' ||
      error.message === 'unauthorized_error');

  if (isExpectedError && (isDev || isE2E)) {
    return;
  }

  // Always log other errors or if in real production without E2E flag
  if (!isE2E) {
    console.error(`Failed to pre-fetch ${id} during SSR:`, error);
  }
}

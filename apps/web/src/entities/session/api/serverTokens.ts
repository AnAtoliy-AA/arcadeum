import { cookies } from 'next/headers';

/**
 * Server-only utility to retrieve the session access token from httpOnly cookies.
 * This can only be used in Server Components, Server Actions, or Route Handlers.
 */
export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value || null;
}

/**
 * Server-only utility to retrieve the session refresh token from httpOnly cookies.
 */
export async function getServerRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('refresh_token')?.value || null;
}

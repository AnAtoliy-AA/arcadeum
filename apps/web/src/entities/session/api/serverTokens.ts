import { cookies } from 'next/headers';

/**
 * Server-only utility to retrieve the session access token from cookies.
 * This can only be used in Server Components, Server Actions, or Route Handlers.
 */
export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('web_access_token')?.value || null;
}

/**
 * Server-only utility to retrieve the session refresh token from cookies.
 */
export async function getServerRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('web_refresh_token')?.value || null;
}

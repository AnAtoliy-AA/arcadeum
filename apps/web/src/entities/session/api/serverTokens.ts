import { cookies } from 'next/headers';
import {
  ANONYMOUS_ID_COOKIE_NAME,
  ANONYMOUS_ID_PATTERN,
} from '@/shared/lib/api-client';

/**
 * Server-only utility to retrieve the session access token from httpOnly cookies.
 * This can only be used in Server Components, Server Actions, or Route Handlers.
 */
export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get('access_token')?.value ||
    cookieStore.get('web_access_token')?.value ||
    null
  );
}

/**
 * Reads the anonymous player identity mirrored into a cookie by the browser
 * (`api-client.ts`). Lets server components personalize public read endpoints
 * (e.g. rooms participation filters) for players without a session — matching
 * what the backend accepts in `x-anonymous-id`.
 */
export async function getServerAnonymousId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ANONYMOUS_ID_COOKIE_NAME)?.value;
  if (!raw || !ANONYMOUS_ID_PATTERN.test(raw)) return null;
  return raw;
}

/**
 * Server-only utility to retrieve the session refresh token from httpOnly cookies.
 */
export async function getServerRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('refresh_token')?.value || null;
}

import 'server-only';
import { cookies } from 'next/headers';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type { AnnouncementPublicItem } from '../api';
import { DISMISSED_COOKIE, isDismissedInCookie } from '../lib/dismissedStorage';

/**
 * How long the layout is willing to wait for the announcement before
 * rendering the page without the banner. A slow backend must never block
 * first paint — the banner is optional chrome, not content.
 */
const FETCH_TIMEOUT_MS = 2_500;

/**
 * Server-side fetch of the active announcement, rendered into the initial
 * HTML so the banner never appears after first paint (which caused CLS).
 * Honors the dismissal cookie written by the client on dismiss.
 */
export async function getActiveAnnouncement(
  locale: string,
): Promise<AnnouncementPublicItem | null> {
  let announcement: AnnouncementPublicItem | null = null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await serverAuthFetch(
      `/announcements/active?locale=${encodeURIComponent(locale)}`,
      { signal: controller.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      announcement?: AnnouncementPublicItem | null;
    };
    announcement = data.announcement ?? null;
  } catch {
    return null;
  }

  if (!announcement) return null;
  if (announcement.severity === 'critical') return announcement;

  const cookieJar = await cookies();
  const dismissed = cookieJar.get(DISMISSED_COOKIE)?.value ?? null;
  return isDismissedInCookie(dismissed, announcement) ? null : announcement;
}

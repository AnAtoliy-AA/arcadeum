/* ARC-740: Arcadeum PWA notification service worker.
 *
 * Only handles the push + notificationclick events. We deliberately
 * do NOT precache or runtime-cache — Next.js handles its own asset
 * caching, and bolting a precaching SW on top has historically caused
 * stale-bundle bugs.
 *
 * ARC-926: in production builds @ducanh2912/next-pwa OVERWRITES this file
 * with its generated workbox service worker. The push + notificationclick
 * handlers now live in worker/index.ts, which is compiled to a custom
 * worker and importScripts'd into the generated bundle — so prod keeps
 * working notifications. This hand-written copy remains as the dev/E2E
 * fallback (the plugin is disabled there) and for reference.
 *
 * The push payload shape is set by apps/be/src/notifications/push-sender.ts:
 *   { title, body, url, notificationId, icon? }
 */

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (_err) {
    payload = { title: 'Arcadeum', body: event.data.text() };
  }

  const title = payload.title || 'Arcadeum';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: payload.url || '/',
      notificationId: payload.notificationId || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      for (const client of all) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === url && 'focus' in client) {
            return client.focus();
          }
        } catch (_err) {
          // ignore parse errors
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })(),
  );
});

self.addEventListener('install', () => {
  // Activate immediately so the user doesn't need to refresh after install.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

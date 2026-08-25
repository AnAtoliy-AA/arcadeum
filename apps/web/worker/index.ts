/* ARC-926: Custom PWA worker — push notifications.
 *
 * In production, @ducanh2912/next-pwa overwrites public/sw.js with a
 * workbox GenerateSW bundle. This custom worker is compiled to
 * worker-<hash>.js and prepended to that bundle via importScripts, so
 * these handlers survive prod builds (the hand-written public/sw.js
 * does not).
 *
 * The push payload shape is set by apps/be/src/notifications/push-sender.ts:
 *   { title, body, url, notificationId, icon? }
 *
 * NOTE: this file deliberately declares its own minimal service-worker
 * type surface instead of referencing the `webworker` lib — that would
 * leak worker globals into the whole app program.
 */

export {};

interface PushPayload {
  title?: string;
  body?: string;
  icon?: string;
  url?: string;
  notificationId?: string | number | null;
}

interface PushData {
  // Cast site for callers; platform returns `any` here.
  json<T = PushPayload>(): T;
  text(): string;
}

interface NotificationLike {
  close(): void;
  data: { url?: string } | null | undefined;
}

interface ServiceWorkerScope {
  addEventListener(
    type: 'push',
    listener: (event: {
      data: PushData | null;
      waitUntil(promise: Promise<unknown>): void;
    }) => void,
  ): void;
  addEventListener(
    type: 'notificationclick',
    listener: (event: {
      notification: NotificationLike;
      waitUntil(promise: Promise<unknown>): void;
    }) => void,
  ): void;
  registration: {
    showNotification(
      title: string,
      options?: {
        body?: string;
        icon?: string;
        badge?: string;
        data?: Record<string, string | number | null>;
      },
    ): Promise<void>;
  };
  clients: {
    matchAll(options?: {
      type?: 'window';
      includeUncontrolled?: boolean;
    }): Promise<Array<{ url: string; focus(): Promise<unknown> }>>;
    openWindow?(url: string): Promise<unknown>;
  };
}

// Cast needed: this module runs in the service-worker scope where the
// browser-provided `self` matches the structural contract above; the
// app's dom-only tsconfig has no ServiceWorkerGlobalScope type.
declare const self: ServiceWorkerScope;

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload: PushPayload;
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
          if (clientUrl.pathname === url) {
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

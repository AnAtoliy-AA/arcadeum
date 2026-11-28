import { test as base, expect } from '@playwright/test';
import {
  expect as scene,
  test as sceneTest,
  navigateTo,
} from './fixtures/test-utils';
import { mockSession } from './fixtures/utils/auth';
import {
  STREAM_FIXTURES,
  STREAM_ROOM_ID,
  mockStreamRoom,
} from './fixtures/stream-fixtures';

/**
 * Admin control of the 24/7 stream.
 *
 * Infrastructure note: /admin/stream is a Server Component gated by
 * `requireAdmin()`, which calls /auth/me from the Next.js Node process, so
 * `page.route()` cannot mock it (same limit as admin-economy.spec.ts). The
 * interactive admin UI (status, controls, form, validation, audit,
 * unsaved-changes guard) is covered by the Vitest component tests in
 * src/features/admin-stream. Here we cover what a browser/HTTP client can see:
 *  - the admin and director endpoints are never public (live BE),
 *  - the admin page is hidden from anonymous users,
 *  - the settings reach the broadcast scene through its query params (mocked
 *    room API and socket).
 */

const BE = `http://127.0.0.1:${process.env.BE_PORT ?? '4000'}`;
const DENIED = [401, 403];

base.describe('stream admin API is never public (live backend)', () => {
  const adminRoutes: [string, string][] = [
    ['GET', '/admin/stream/settings'],
    ['PUT', '/admin/stream/settings'],
    ['GET', '/admin/stream/status'],
    ['GET', '/admin/stream/audit'],
    ['POST', '/admin/stream/command'],
  ];
  for (const [method, path] of adminRoutes) {
    base(`${method} ${path} rejects anonymous callers`, async ({ request }) => {
      const res = await request.fetch(`${BE}${path}`, {
        method,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        data: method === 'GET' ? undefined : {},
      });
      expect(DENIED).toContain(res.status());
    });
  }

  const directorRoutes: [string, string][] = [
    ['GET', '/stream/config'],
    ['GET', '/stream/commands'],
    ['POST', '/stream/status'],
    ['POST', '/stream/commands/abc/ack'],
  ];
  for (const [method, path] of directorRoutes) {
    base(
      `${method} ${path} needs the service token or stream user`,
      async ({ request }) => {
        const none = await request.fetch(`${BE}${path}`, {
          method,
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          data: method === 'GET' ? undefined : {},
        });
        expect(DENIED).toContain(none.status());
        const wrong = await request.fetch(`${BE}${path}`, {
          method,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: 'Bearer not-a-real-token',
          },
          data: method === 'GET' ? undefined : {},
        });
        expect(DENIED).toContain(wrong.status());
      },
    );
  }

  base(
    'the config response never mentions a stream key or RTMP URL',
    async ({ request }) => {
      const res = await request.get(`${BE}/stream/config`, {
        headers: { Authorization: 'Bearer not-a-real-token' },
      });
      const body = (await res.text()).toLowerCase();
      expect(body).not.toMatch(/rtmp|stream_key|streamkey/);
    },
  );
});

base.describe('/admin/stream page access', () => {
  base('is not found for an anonymous request', async ({ request }) => {
    const res = await request.get('/en/admin/stream');
    expect(res.status()).toBe(404);
  });

  base('is not listed in robots or the sitemap', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(await robots.text()).toMatch(/Disallow:\s*\/admin\//);
    const sitemap = await request.get('/sitemap.xml');
    expect(await sitemap.text()).not.toMatch(/\/admin\/stream/);
  });
});

sceneTest.describe(
  'admin overlay options reach the broadcast scene (mocked API)',
  () => {
    sceneTest.beforeEach(async ({ page }) => {
      await mockSession(page);
      await mockStreamRoom(page, STREAM_FIXTURES.tic_tac_toe_v1);
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    sceneTest(
      'shows the banner and hides the chosen overlay parts',
      async ({ page }) => {
        await navigateTo(
          page,
          `/en/stream/${STREAM_ROOM_ID}?banner=Weekend%20tournament&hide=players,cta,arc&qr=0`,
        );
        await scene(page.getByTestId('overlay-banner')).toHaveText(
          'Weekend tournament',
        );
        await scene(page.getByTestId('broadcast-overlay')).toBeVisible();
        await scene(page.getByTestId('overlay-player')).toHaveCount(0);
        await scene(page.getByTestId('overlay-cta')).toHaveCount(0);
        await scene(page.getByTestId('overlay-arc')).toHaveCount(0);
        await scene(page.getByTestId('overlay-status')).toBeVisible();
      },
    );

    sceneTest(
      'ignores hostile values and keeps the default join target',
      async ({ page }) => {
        await navigateTo(
          page,
          `/en/stream/${STREAM_ROOM_ID}?join=javascript:alert(1)&banner=${'x'.repeat(300)}`,
        );
        await scene(page.getByTestId('overlay-cta')).toContainText(
          'arcadeum.games',
        );
        const banner = await page.getByTestId('overlay-banner').textContent();
        expect(banner?.length ?? 0).toBeLessThanOrEqual(80);
      },
    );

    sceneTest(
      'the idle scene shows the banner and a custom join host',
      async ({ page }) => {
        await navigateTo(
          page,
          '/en/stream/idle?next=chess_v1&seconds=30&banner=Join%20us&join=https://play.example.com',
        );
        await scene(page.getByTestId('idle-banner')).toHaveText('Join us');
        await scene(page.getByTestId('idle-cta')).toContainText(
          'play.example.com',
        );
      },
    );

    sceneTest(
      'the idle scene can hide the join call to action',
      async ({ page }) => {
        await navigateTo(
          page,
          '/en/stream/idle?next=chess_v1&seconds=30&hide=cta',
        );
        await scene(page.getByTestId('idle-scene')).toBeVisible();
        await scene(page.getByTestId('idle-qr')).toHaveCount(0);
      },
    );
  },
);

import { expect, test, navigateTo } from './fixtures/test-utils';
import { mockSession } from './fixtures/utils/auth';
import { handleRoute } from './fixtures/utils/network';
import {
  STREAM_FIXTURES,
  STREAM_ROOM_ID,
  mockStreamRoom,
  streamSession,
} from './fixtures/stream-fixtures';

/**
 * Broadcast scenes (/{locale}/stream/**) rendered with mocked room data.
 * These are the pages the 24/7 stream captures, so the checks are about being
 * chrome-less, stable and never showing an error to viewers.
 */

const GAME_URL = `/en/stream/${STREAM_ROOM_ID}`;

test.describe('stream: game scene', () => {
  test.beforeEach(async ({ page }) => {
    // Even a logged-in capture browser must watch as an anonymous spectator.
    await mockSession(page);
    await mockStreamRoom(page, STREAM_FIXTURES.tic_tac_toe_v1);
  });

  test('renders the board with the overlay and no site chrome', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await navigateTo(page, GAME_URL);

    await expect(page.getByTestId('broadcast-overlay')).toBeVisible();
    await expect(page.getByTestId('overlay-title')).toHaveText('Tic-Tac-Toe');
    await expect(page.getByTestId('overlay-bot-badge')).toHaveText(
      /bot vs bot/i,
    );
    await expect(page.getByTestId('overlay-live')).toBeVisible();
    await expect(page.getByTestId('overlay-arc')).toHaveText('ARC');
    await expect(page.getByTestId('overlay-cta')).toContainText(
      'Play at arcadeum.games',
    );
    await expect(page.getByTestId('stream-qr')).toBeVisible();

    const players = page.getByTestId('overlay-player');
    await expect(players).toHaveCount(2);
    await expect(
      players.first().getByTestId('overlay-player-label'),
    ).toHaveText('Expert bot');
    await expect(page.getByTestId('overlay-turn')).toContainText('Bot 1');
    await expect(page.getByTestId('overlay-thinking')).toBeVisible();
    await expect(
      page.getByTestId('board-stage').getByTestId('game-widget-container'),
    ).toBeVisible();

    // No header, footer, menus, pets widget, banners or modals.
    await expect(page.getByTestId('header-inner')).toHaveCount(0);
    await expect(
      page.locator('footer:not([data-stream-root] footer)'),
    ).toHaveCount(0);
    await expect(page.getByTestId('mobile-menu-button')).toHaveCount(0);
    await expect(page.locator('#main-content')).toHaveCount(0);
    await expect(page.getByTestId('arcade-pet-companion-trigger')).toHaveCount(
      0,
    );
    await expect(page.locator('.skip-link')).toHaveCount(0);
    await expect(page.locator('[role="dialog"]:visible')).toHaveCount(0);
    // No error screens and no diagnostics without ?debug=1.
    await expect(page.getByTestId('stream-debug')).toHaveCount(0);
    await expect(page.getByText(/reconnecting/i)).toHaveCount(0);
  });

  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 },
  ]) {
    test(`keeps a 16:9 frame that fills ${viewport.width}x${viewport.height} with no scroll`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await navigateTo(page, GAME_URL);
      const frame = page.getByTestId('stream-frame');
      await expect(frame).toBeVisible();

      const box = await frame.boundingBox();
      expect(box).not.toBeNull();
      expect(Math.abs(box!.width - viewport.width)).toBeLessThan(2);
      expect(Math.abs(box!.height - viewport.height)).toBeLessThan(2);
      expect(Math.abs(box!.width / box!.height - 16 / 9)).toBeLessThan(0.01);

      const scroll = await page.evaluate(() => ({
        x: document.documentElement.scrollWidth - window.innerWidth,
        y: document.documentElement.scrollHeight - window.innerHeight,
      }));
      expect(scroll.x).toBeLessThanOrEqual(0);
      expect(scroll.y).toBeLessThanOrEqual(0);
    });
  }

  test('letterboxes inside a non-16:9 window', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 900 });
    await navigateTo(page, GAME_URL);
    const box = await page.getByTestId('stream-frame').boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.width / box!.height - 16 / 9)).toBeLessThan(0.01);
    expect(box!.width).toBeLessThanOrEqual(1000);
  });

  test('has no layout shift between moves and uses no backdrop-filter', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await navigateTo(page, GAME_URL);
    await expect(page.getByTestId('overlay-turn')).toBeVisible();

    const before = await page.getByTestId('overlay-board').boundingBox();
    const timer = page.getByTestId('overlay-move-timer');
    const first = await timer.innerText();
    await expect
      .poll(() => timer.innerText(), { timeout: 5000 })
      .not.toBe(first);
    const after = await page.getByTestId('overlay-board').boundingBox();
    expect(after).toEqual(before);

    const filtered = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('*')).filter((el) => {
          const s = getComputedStyle(el);
          return (
            (s.backdropFilter && s.backdropFilter !== 'none') ||
            (s.getPropertyValue('-webkit-backdrop-filter') !== '' &&
              s.getPropertyValue('-webkit-backdrop-filter') !== 'none')
          );
        }).length,
    );
    expect(filtered).toBe(0);
  });

  test('is not indexable', async ({ request }) => {
    const res = await request.get(GAME_URL);
    expect(res.headers()['x-robots-tag']).toContain('noindex');
  });

  test('accepts ?lang= and ?debug=1', async ({ page }) => {
    await navigateTo(page, `${GAME_URL}?lang=en&debug=1`);
    await expect(page.getByTestId('stream-debug')).toContainText(
      `room=${STREAM_ROOM_ID}`,
    );
  });
});

test.describe('stream: reconnect behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockStreamRoom(page, STREAM_FIXTURES.tic_tac_toe_v1);
  });

  test('keeps the last state when the socket drops and shows no badge without ?debug=1', async ({
    page,
  }) => {
    await navigateTo(page, GAME_URL);
    await expect(page.getByTestId('overlay-turn')).toBeVisible();

    await page.evaluate(() => window.gameSocket?.trigger('disconnect'));
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect(page.getByTestId('overlay-turn')).toBeVisible();
    await expect(page.getByTestId('board-stage')).toBeVisible();
    await expect(
      page.getByText(/reconnecting|disconnected|error/i),
    ).toHaveCount(0);
  });

  test('shows a subtle reconnecting badge only in debug mode and clears it on reconnect', async ({
    page,
  }) => {
    await navigateTo(page, `${GAME_URL}?debug=1`);
    await expect(page.getByTestId('overlay-turn')).toBeVisible();

    await page.evaluate(() => window.gameSocket?.trigger('connect'));
    await expect(page.getByTestId('stream-reconnecting')).toHaveCount(0);

    await page.evaluate(() => window.gameSocket?.trigger('disconnect'));
    await expect(page.getByTestId('stream-reconnecting')).toBeVisible();
    // The picture stays up while reconnecting.
    await expect(page.getByTestId('overlay-turn')).toBeVisible();
    await expect(page.getByTestId('board-stage')).toBeVisible();

    await page.evaluate(() => window.gameSocket?.trigger('connect'));
    await expect(page.getByTestId('stream-reconnecting')).toHaveCount(0);
  });
});

test.describe('stream: unavailable backend', () => {
  test('shows a clean empty frame, never an error, when room info fails, then recovers', async ({
    page,
  }) => {
    let healthy = false;
    const room = {
      id: STREAM_ROOM_ID,
      gameId: 'tic_tac_toe_v1',
      name: 'AI vs AI',
      status: 'in_progress',
      visibility: 'public',
      hostId: 'bot-a',
      maxPlayers: 2,
      playerCount: 2,
      members: [
        { id: 'bot-a', displayName: 'Bot 1', isHost: true },
        { id: 'bot-b', displayName: 'Bot 2', isHost: false },
      ],
    };
    await page.route('**/games/room-info', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await handleRoute(route, null);
        return;
      }
      if (!healthy) {
        await route.fulfill({
          status: 503,
          headers: { 'access-control-allow-origin': '*' },
          body: 'unavailable',
        });
        return;
      }
      await handleRoute(route, {
        room,
        session: streamSession(STREAM_FIXTURES.tic_tac_toe_v1),
      });
    });

    await navigateTo(page, GAME_URL);
    await expect(page.getByTestId('stream-frame')).toBeVisible();
    await expect(page.getByTestId('overlay-status')).toContainText(
      'Starting soon',
    );
    await expect(
      page.getByText(/error|not found|failed|try again/i),
    ).toHaveCount(0);

    healthy = true;
    await expect(page.getByTestId('overlay-turn')).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe('stream: card games', () => {
  test('hearts shows all four bots with scores and card counts only', async ({
    page,
  }) => {
    await mockSession(page);
    await mockStreamRoom(page, STREAM_FIXTURES.hearts_v1);
    await navigateTo(page, GAME_URL);

    const players = page.getByTestId('overlay-player');
    await expect(players).toHaveCount(4);
    await expect(players.first()).toContainText('Cards 13');
    await expect(players.first()).toContainText('Score 0');

    // Private hands never reach the overlay.
    const hands = STREAM_FIXTURES.hearts_v1.state.hands as Record<
      string,
      string[]
    >;
    const someCard = hands['bot-a'][0];
    await expect(page.getByTestId('broadcast-overlay')).not.toContainText(
      `"${someCard}"`,
    );
    await expect(page.getByTestId('board-stage')).toBeVisible();
  });
});

test.describe('stream: between-games scene', () => {
  const IDLE =
    '/en/stream/idle?next=chess_v1&seconds=30&last=checkers_v1&result=Bot%202%20wins';

  test('shows last result, countdown, next game preview and QR', async ({
    page,
  }) => {
    await mockSession(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await navigateTo(page, IDLE);

    await expect(page.getByTestId('idle-scene')).toBeVisible();
    await expect(page.getByTestId('idle-last')).toContainText('Checkers');
    await expect(page.getByTestId('idle-result')).toHaveText('Bot 2 wins');
    await expect(page.getByTestId('idle-next-title')).toHaveText('Chess');
    await expect(page.getByTestId('idle-qr')).toBeVisible();
    await expect(page.getByTestId('idle-bot-badge')).toBeVisible();
    await expect(page.getByTestId('idle-cta')).toContainText(
      'Play at arcadeum.games',
    );

    // The countdown ticks down.
    const first = await page.getByTestId('idle-countdown').innerText();
    await expect
      .poll(async () => page.getByTestId('idle-countdown').innerText(), {
        timeout: 5000,
      })
      .not.toBe(first);

    await expect(page.getByTestId('header-inner')).toHaveCount(0);
    await expect(
      page.locator('footer:not([data-stream-root] footer)'),
    ).toHaveCount(0);
    await expect(page.getByTestId('arcade-pet-companion-trigger')).toHaveCount(
      0,
    );
  });

  test('never renders untrusted query text as markup or unknown games', async ({
    page,
  }) => {
    await navigateTo(
      page,
      '/en/stream/idle?next=evil&seconds=abc&last=nope&result=%3Cimg%20src%3Dx%20onerror%3Dwindow.__pwned%3D1%3E',
    );
    await expect(page.getByTestId('idle-scene')).toBeVisible();
    await expect(page.getByTestId('idle-next-title')).toHaveText('Coming up');
    await expect(page.getByTestId('idle-result')).toContainText('<img');
    expect(
      await page.evaluate(() => (window as { __pwned?: number }).__pwned),
    ).toBeUndefined();
  });

  test('accepts ?lang= and ?debug=1', async ({ page }) => {
    await navigateTo(page, `${IDLE}&lang=en&debug=1`);
    await expect(page.getByTestId('stream-debug')).toContainText(
      'next=chess_v1',
    );
  });

  test('fills 1920x1080 as a 16:9 frame', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateTo(page, IDLE);
    const box = await page.getByTestId('idle-frame').boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.width - 1920)).toBeLessThan(2);
    expect(Math.abs(box!.height - 1080)).toBeLessThan(2);
  });
});

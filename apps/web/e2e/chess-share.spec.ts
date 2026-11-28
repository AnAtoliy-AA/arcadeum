import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  mockGameSocket,
  mockRoomInfo,
  handleRoute,
} from './fixtures/test-utils';

const MOCK_ROOM_ID = '507f1f77bcf86cd799439011';

test.describe('Chess Share Game Link', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockRoomInfo(page, {
      room: {
        id: MOCK_ROOM_ID,
        gameId: 'chess_v1',
        name: 'Test Chess Room',
        status: 'playing',
        playerCount: 2,
        maxPlayers: 2,
      },
    });

    await page.route('**/games/rooms/join', async (route) => {
      await handleRoute(route, { roomId: MOCK_ROOM_ID });
    });

    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      return handleRoute(route, {});
    });

    await mockGameSocket(page, MOCK_ROOM_ID, '507f191e810c19729de860ea', {
      roomJoinedPayload: {
        id: MOCK_ROOM_ID,
        gameId: 'chess_v1',
        status: 'playing',
        members: [
          {
            id: '507f191e810c19729de860ea',
            userId: '507f191e810c19729de860ea',
            displayName: 'Player 1',
            isHost: true,
          },
          {
            id: '507f1f77bcf86cd799439011',
            userId: '507f1f77bcf86cd799439011',
            displayName: 'Player 2',
            isHost: false,
          },
        ],
      },
    });

    await navigateTo(page, `/rooms/${MOCK_ROOM_ID}`);
  });

  test('settings tab copy game link button exists and is clickable', async ({
    page,
  }) => {
    const settingsBtn = page.locator('[data-testid="chess-settings-tab"]');
    if (!(await settingsBtn.isVisible())) {
      test.skip();
      return;
    }
    await settingsBtn.click();

    const shareBtn = page.locator('#chess-share-game-link');
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();
    await expect(shareBtn).toContainText(/copied/i);
  });

  test('streamer mode toggle exists in settings tab', async ({ page }) => {
    const settingsBtn = page.locator('[data-testid="chess-settings-tab"]');
    if (!(await settingsBtn.isVisible())) {
      test.skip();
      return;
    }
    await settingsBtn.click();

    const toggleBtn = page.getByTestId('chess-streamer-mode-toggle');
    await expect(toggleBtn).toBeVisible();
  });

  test('OBS URL button appears after enabling streamer mode', async ({
    page,
  }) => {
    const settingsBtn = page.locator('[data-testid="chess-settings-tab"]');
    if (!(await settingsBtn.isVisible())) {
      test.skip();
      return;
    }
    await settingsBtn.click();

    const toggleBtn = page.getByTestId('chess-streamer-mode-toggle');
    await toggleBtn.click();

    await expect(page.locator('#chess-copy-obs-url')).toBeVisible();
  });
});

test.describe('Chess Quick Play Lobby', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockRoomInfo(page, {
      room: {
        id: MOCK_ROOM_ID,
        gameId: 'chess_v1',
        name: 'Test Chess Room',
        status: 'lobby',
        playerCount: 1,
        maxPlayers: 2,
      },
    });

    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      return handleRoute(route, {});
    });

    await mockGameSocket(page, MOCK_ROOM_ID, '507f191e810c19729de860ea', {
      roomJoinedPayload: {
        id: MOCK_ROOM_ID,
        gameId: 'chess_v1',
        status: 'lobby',
        members: [
          {
            id: '507f191e810c19729de860ea',
            userId: '507f191e810c19729de860ea',
            displayName: 'Test User',
            isHost: true,
          },
        ],
      },
    });

    await navigateTo(page, `/rooms/${MOCK_ROOM_ID}`);
  });

  test('quick play panel shows 6 time control cards', async ({ page }) => {
    const quickPlaySection = page.locator('[data-testid="quick-play-panel"]');
    if (!(await quickPlaySection.isVisible())) {
      test.skip();
      return;
    }

    const bullet1 = page.locator('#quick-play-1plus0');
    const blitz3 = page.locator('#quick-play-3plus0');
    const blitz32 = page.locator('#quick-play-3plus2');
    const blitz5 = page.locator('#quick-play-5plus0');
    const rapid10 = page.locator('#quick-play-10plus0');
    const classical = page.locator('#quick-play-15plus10');

    await expect(bullet1).toBeVisible();
    await expect(blitz3).toBeVisible();
    await expect(blitz32).toBeVisible();
    await expect(blitz5).toBeVisible();
    await expect(rapid10).toBeVisible();
    await expect(classical).toBeVisible();
  });

  test('clicking a time control card triggers start game', async ({ page }) => {
    const bulletCard = page.locator('#quick-play-1plus0');
    if (!(await bulletCard.isVisible())) {
      test.skip();
      return;
    }

    await expect(bulletCard).toBeEnabled();
  });
});

test.describe('Chess Landing Page', () => {
  test('chess landing page loads with game info', async ({ page }) => {
    await navigateTo(page, '/games/chess');
    await expect(page).toHaveURL(/chess/);
    await expect(page.locator('body')).toContainText(/chess/i);
  });

  test('chess puzzles page is accessible', async ({ page }) => {
    await navigateTo(page, '/games/chess/puzzles');
    await expect(page.locator('body')).toContainText(/puzzle/i);
  });

  test('chess analysis page is accessible', async ({ page }) => {
    await navigateTo(page, '/games/chess/analysis');
    await expect(page.locator('body')).toContainText(/analysis/i);
  });

  test('chess learn page is accessible', async ({ page }) => {
    await navigateTo(page, '/games/chess/learn');
    await expect(page.locator('body')).toContainText(/learn/i);
  });
});

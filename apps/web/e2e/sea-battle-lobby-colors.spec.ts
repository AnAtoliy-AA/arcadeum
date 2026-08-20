import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  waitForRoomReady,
  mockGameSocket,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';
import { getTheme } from '../src/widgets/StrategyGames/SeaBattleGame/lib/theme';

/** Convert a hex color (e.g. `#FF4D4D`) to the computed-style `rgb(r, g, b)` format. */
function toRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const value =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = Number.parseInt(value, 16);
  return `rgb(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255})`;
}

test.describe('Sea Battle Lobby Color Preview', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should show color preview in the lobby and update when theme changes', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const adventureTheme = getTheme('adventure');
    const cyberpunkTheme = getTheme('cyberpunk');

    // Start with the adventure (default) theme
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Lobby Color Test Room',
        gameId: 'sea_battle_v1',
        gameOptions: { theme: 'adventure' },
        status: 'lobby',
        playerCount: 1,
      },
    });

    await mockGameSocket(page, roomId, MOCK_OBJECT_ID, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'lobby',
        gameOptions: { theme: 'adventure' },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    // Check if color preview container is visible
    const colorPreview = page.getByTestId('color-preview-container');
    await expect(colorPreview).toBeVisible({});

    // Verify adventure colors from the theme constants
    const shipSwatch = page.getByTestId('color-swatch-ship');
    await expect(shipSwatch).toHaveCSS(
      'background-color',
      toRgb(adventureTheme.shipColor),
      {},
    );

    const hitSwatch = page.getByTestId('color-swatch-hit');
    await expect(hitSwatch).toHaveCSS(
      'background-color',
      toRgb(adventureTheme.hitColor),
      {},
    );

    // Change theme to cyberpunk
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Lobby Color Test Room',
        gameId: 'sea_battle_v1',
        gameOptions: { theme: 'cyberpunk' },
        status: 'lobby',
        playerCount: 1,
      },
    });

    // In a real scenario, the room update event would trigger a re-render
    // For this test, we can just re-navigate or wait if we mock the socket
    // But since we are testing the UI response to room prop change,
    // and ReusableGameLobby takes room as prop, updating mockRoomInfo and re-navigating/waiting is fine.

    // Actually, let's just trigger a re-navigation to be sure the UI updates with the new mock
    await mockGameSocket(page, roomId, MOCK_OBJECT_ID, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'lobby',
        gameOptions: { theme: 'cyberpunk' },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    // Verify cyberpunk colors from the theme constants
    await expect(shipSwatch).toHaveCSS(
      'background-color',
      toRgb(cyberpunkTheme.shipColor),
      {},
    );
    await expect(hitSwatch).toHaveCSS(
      'background-color',
      toRgb(cyberpunkTheme.hitColor),
      {},
    );
  });
});

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

test.describe('Sea Battle Lobby Color Preview', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should show color preview in the lobby and update when variant changes', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;

    // Start with classic variant
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Lobby Color Test Room',
        gameId: 'sea_battle_v1',
        gameOptions: { variant: 'classic' },
        status: 'lobby',
        playerCount: 1,
      },
    });

    await mockGameSocket(page, roomId, MOCK_OBJECT_ID, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: {
        status: 'lobby',
        gameOptions: { variant: 'classic' },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Check if color preview container is visible
    const colorPreview = page.getByTestId('color-preview-container');
    await expect(colorPreview).toBeVisible();

    // Verify classic colors (approximate check of background-color)
    const shipSwatch = page.getByTestId('color-swatch-ship');
    await expect(shipSwatch).toHaveCSS(
      'background-color',
      'rgb(148, 163, 184)',
    ); // #94a3b8

    const hitSwatch = page.getByTestId('color-swatch-hit');
    await expect(hitSwatch).toHaveCSS('background-color', 'rgb(239, 68, 68)'); // #ef4444

    // Change variant to modern
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Lobby Color Test Room',
        gameId: 'sea_battle_v1',
        gameOptions: { variant: 'modern' },
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
        gameOptions: { variant: 'modern' },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // Verify modern colors
    await expect(shipSwatch).toHaveCSS('background-color', 'rgb(87, 195, 255)'); // #57c3ff
    await expect(hitSwatch).toHaveCSS('background-color', 'rgb(255, 75, 75)'); // #ff4b4b
  });
});

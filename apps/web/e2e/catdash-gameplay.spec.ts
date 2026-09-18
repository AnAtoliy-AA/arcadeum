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

test.describe('Cat Dash Flagship Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('renders board, realistic cats, flagship dashboard, and dice rolling station', async ({
    page,
  }) => {
    const roomId = MOCK_OBJECT_ID;
    const userId = MOCK_OBJECT_ID;
    const oppId = '507f191e810c19729de860eb';

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Cat Dash Flagship Test',
        gameId: 'cat_dash_v1',
        gameOptions: {
          theme: 'cyberpunk',
          trackType: 'linear',
          columns: 10,
          trackLength: 60,
        },
        status: 'active',
        playerCount: 2,
      },
    });

    await mockGameSocket(page, roomId, userId, {
      gameId: 'cat_dash_v1',
      roomJoinedPayload: {
        status: 'active',
        gameOptions: {
          theme: 'cyberpunk',
          trackType: 'linear',
          columns: 10,
          trackLength: 60,
        },
        session: {
          id: 'sess-catdash-1',
          status: 'active',
          state: {
            trackType: 'linear',
            theme: 'cyberpunk',
            columns: 10,
            trackLength: 60,
            currentPlayerIndex: 0,
            turnNumber: 1,
            track: Array.from({ length: 60 }, (_, i) => ({
              id: i,
              type:
                i === 0 || i === 59
                  ? 'normal'
                  : i % 5 === 0
                    ? 'obstacle'
                    : 'normal',
            })),
            gameOver: false,
            players: [
              {
                playerId: userId,
                catId: 'neon',
                position: 8,
                powerTokens: 3,
                abilitiesUsed: [],
                isReady: true,
                hasBonus: false,
              },
              {
                playerId: oppId,
                catId: 'whiskers',
                position: 4,
                powerTokens: 3,
                abilitiesUsed: [],
                isReady: true,
                hasBonus: false,
              },
            ],
            logs: [
              {
                id: 'log-1',
                type: 'system',
                message: 'Race started!',
                createdAt: new Date().toISOString(),
              },
            ],
          },
        },
      },
    });

    await navigateTo(page, routes.gameRoom(roomId));
    await waitForRoomReady(page);

    const dashboard = page.getByTestId('catdash-dashboard');
    await expect(dashboard).toBeVisible();

    const neonCat = page.getByTestId('progress-cat-neon');
    await expect(neonCat).toBeVisible();

    const userCard = page.getByTestId(`player-card-${userId}`);
    await expect(userCard).toBeVisible();

    const inspectBtn = page.getByTestId('inspect-racers-btn');
    await expect(inspectBtn).toBeVisible();
    await inspectBtn.click();

    const dossierTitle = page.getByText('Racer Dossier');
    await expect(dossierTitle).toBeVisible();

    const modalClose = page.getByTestId('modal-close-button');
    await modalClose.click();
    await expect(dossierTitle).not.toBeVisible();

    const abilityBar = page.getByTestId('tactical-ability-bar');
    await expect(abilityBar).toBeVisible();

    const boostAbilityBtn = page.getByTestId('ability-btn-neon_boost');
    await expect(boostAbilityBtn).toBeVisible();
    await boostAbilityBtn.click();

    const rollBtn = page.getByTestId('dice-overlay-roll-button');
    await expect(rollBtn).toBeVisible();

    await rollBtn.click();

    const rollingState = page.getByTestId('dice-overlay-rolling-state');
    await expect(rollingState).toBeVisible();
  });
});

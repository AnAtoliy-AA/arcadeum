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

    const baseTrack = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      type:
        i === 0 || i === 59 ? 'normal' : i % 5 === 0 ? 'obstacle' : 'normal',
    }));

    const initialSessionState = {
      trackType: 'linear',
      theme: 'cyberpunk',
      columns: 10,
      trackLength: 60,
      currentPlayerIndex: 0,
      turnNumber: 1,
      track: baseTrack,
      gameOver: false,
      players: [
        {
          playerId: userId,
          catId: 'neon',
          position: 8,
          powerTokens: 3,
          shielded: false,
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
    };

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
          state: initialSessionState,
        },
      },
      handlers: {
        'catDash.session.catnap': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: 'sess-catdash-1',
              status: 'active',
              state: {
                ...initialSessionState,
                players: [
                  {
                    ...initialSessionState.players[0],
                    powerTokens: 4,
                    shielded: true,
                  },
                  initialSessionState.players[1],
                ],
              },
            },
          },
        },
        'catDash.session.pounce': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: 'sess-catdash-1',
              status: 'active',
              state: {
                ...initialSessionState,
                players: [
                  {
                    ...initialSessionState.players[0],
                    position: 10,
                    powerTokens: 3,
                    shielded: true,
                  },
                  initialSessionState.players[1],
                ],
              },
            },
          },
        },
        'catDash.session.deployTrap': {
          responseEvent: 'games.session.snapshot',
          responseData: {
            roomId,
            session: {
              id: 'sess-catdash-1',
              status: 'active',
              state: {
                ...initialSessionState,
                traps: [
                  {
                    spaceId: 10,
                    placedBy: userId,
                    createdAt: Date.now(),
                  },
                ],
                players: [
                  {
                    ...initialSessionState.players[0],
                    position: 10,
                    powerTokens: 2,
                    shielded: true,
                  },
                  initialSessionState.players[1],
                ],
              },
            },
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

    const centerConsole = page.getByTestId('center-action-console');
    await expect(centerConsole).toBeVisible();

    const catnapBtn = page.getByTestId('action-btn-catnap');
    await expect(catnapBtn).toBeVisible();
    await catnapBtn.click();

    const shieldBuff = page.getByTestId('buff-shield');
    await expect(shieldBuff).toBeVisible();

    const pounceBtn = page.getByTestId('action-btn-pounce');
    await expect(pounceBtn).toBeVisible();
    await pounceBtn.click();

    const trapBtn = page.getByTestId('action-btn-deploy-trap');
    await expect(trapBtn).toBeVisible();
    await trapBtn.click();

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
    await expect(rollingState).not.toBeVisible();
    await expect(rollBtn).toBeVisible();

    await page.keyboard.press('Space');
    await expect(rollingState).toBeVisible();
    await expect(rollingState).not.toBeVisible();
    await expect(rollBtn).toBeVisible();
  });
});

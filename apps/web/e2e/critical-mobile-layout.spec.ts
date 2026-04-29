import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  mockRoomInfo,
  mockGameSocket,
  navigateTo,
  waitForRoomReady,
  closeGameRulesModal,
} from './fixtures/test-utils';

const ROOM_ID = '507f1f77bcf86cd799439020';
// Match the userId baked into mockSession (`MOCK_OBJECT_ID` in fixtures/utils/auth.ts)
const USER_ID = '507f191e810c19729de860ea';
const SESSION_ID = '507f191e810c19729de860fb';

function makePlayers(viewerHand: string[], opponentCount: number) {
  const opponents = Array.from({ length: opponentCount }, (_, i) => ({
    playerId: `bot-${i.toString().padStart(2, '0')}`,
    alive: true,
    hand: ['strike', 'evade', 'reorder', 'insight', 'trade'],
    defuseCount: 1,
    stash: [],
  }));
  return [
    {
      playerId: USER_ID,
      alive: true,
      hand: viewerHand,
      defuseCount: 1,
      stash: [],
    },
    ...opponents,
  ];
}

function makeMockState(viewerHand: string[], opponentCount: number) {
  const players = makePlayers(viewerHand, opponentCount);
  return {
    players,
    deck: Array(31).fill('strike'),
    discardPile: ['evade', 'reorder'],
    currentTurnIndex: 0,
    playerOrder: players.map((p) => p.playerId),
    pendingAction: null,
  };
}

async function setupRoom(
  page: import('@playwright/test').Page,
  viewerHand: string[],
  opponentCount: number,
) {
  const state = makeMockState(viewerHand, opponentCount);
  await mockRoomInfo(page, {
    room: {
      id: ROOM_ID,
      status: 'active',
      hostId: USER_ID,
      members: state.players.map((p) => ({
        id: p.playerId,
        userId: p.playerId,
        displayName: p.playerId === USER_ID ? 'You' : `Bot ${p.playerId}`,
        isHost: p.playerId === USER_ID,
      })),
    },
    session: { id: SESSION_ID, status: 'active', state },
  });
  await mockGameSocket(page, ROOM_ID, USER_ID, {
    roomJoinedPayload: {
      status: 'active',
      session: { id: SESSION_ID, status: 'active', state },
    },
  });
  await navigateTo(page, `/games/rooms/${ROOM_ID}`);
  await waitForRoomReady(page);
  await closeGameRulesModal(page);
}

test.describe('Critical mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('opponent strip is rendered and excludes the viewer', async ({
    page,
  }) => {
    await setupRoom(page, ['strike', 'evade', 'reorder', 'insight'], 5);
    const strip = page.locator('[data-testid="opponent-strip"]');
    await expect(strip).toBeVisible();
    // Viewer chip is excluded; only the 5 opponents are rendered.
    const chips = strip.locator(`[data-testid^="player-card-"]`);
    await expect(chips).toHaveCount(5);
  });

  test('center table row shows deck, last played, and discard inline', async ({
    page,
  }) => {
    await setupRoom(page, ['strike'], 3);
    await expect(
      page.locator('[data-testid="center-table-row"]'),
    ).toBeVisible();
  });

  test('opponent strip becomes horizontally scrollable for 7+ opponents', async ({
    page,
  }) => {
    await setupRoom(page, ['strike'], 7);
    const overflow = await page
      .locator('[data-testid="opponent-strip"]')
      .evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeGreaterThan(0);
  });

  test('tapping a hand card opens the card actions popover', async ({
    page,
  }) => {
    await setupRoom(page, ['strike', 'evade'], 2);
    await page
      .locator('[data-testid="hand-grid"] [data-cardtype]')
      .first()
      .click();
    await expect(
      page.locator('[data-testid="card-actions-popover"]'),
    ).toBeVisible();
    await page.locator('[data-testid="card-actions-close"]').click();
    await expect(
      page.locator('[data-testid="card-actions-popover"]'),
    ).not.toBeVisible();
  });

  test('sticky action bar is rendered on the viewer turn', async ({ page }) => {
    await setupRoom(page, ['strike'], 2);
    const bar = page.locator('[data-testid="action-bar"]');
    await expect(bar).toBeVisible();
    await expect(page.locator('[data-testid="action-bar-draw"]')).toBeVisible();
  });
});

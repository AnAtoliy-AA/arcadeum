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

test.describe('Critical Game Table Mobile Layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('player cards should not overlap on mobile with 5 players', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = '507f191e810c19729de860ea';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['strike', 'skip', 'attack', 'favor', 'shuffle'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-75w8',
          alive: true,
          hand: ['strike', 'skip', 'attack', 'favor', 'shuffle', 'nope'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-coca',
          alive: true,
          hand: ['strike', 'skip', 'attack', 'favor'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-vghe',
          alive: true,
          hand: ['strike', 'skip', 'attack', 'favor'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-j6zc',
          alive: true,
          hand: ['strike', 'skip', 'attack', 'favor'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(25).fill('strike'),
      discardPile: ['skip'],
      currentTurnIndex: 0,
      playerOrder: [userId, 'bot-75w8', 'bot-coca', 'bot-vghe', 'bot-j6zc'],
      pendingAction: null,
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'active',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'You', isHost: true },
          {
            id: 'bot-75w8',
            userId: 'bot-75w8',
            displayName: 'Player bot-75w8',
            isHost: false,
          },
          {
            id: 'bot-coca',
            userId: 'bot-coca',
            displayName: 'Player bot-coca',
            isHost: false,
          },
          {
            id: 'bot-vghe',
            userId: 'bot-vghe',
            displayName: 'Player bot-vghe',
            isHost: false,
          },
          {
            id: 'bot-j6zc',
            userId: 'bot-j6zc',
            displayName: 'Player bot-j6zc',
            isHost: false,
          },
        ],
      },
      session: { id: 'session-1', status: 'active', state: mockState },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        status: 'active',
        session: { id: 'session-1', status: 'active', state: mockState },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    const playerCards = page.locator('[data-testid^="player-card-"]');
    await expect(playerCards.first()).toBeVisible({ timeout: 15000 });

    const count = await playerCards.count();
    expect(count).toBe(5);

    const boxes: { id: string; x: number; y: number; w: number; h: number }[] =
      [];
    for (let i = 0; i < count; i++) {
      const card = playerCards.nth(i);
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        const testId = (await card.getAttribute('data-testid')) ?? `card-${i}`;
        boxes.push({
          id: testId,
          x: box.x,
          y: box.y,
          w: box.width,
          h: box.height,
        });
      }
    }

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const overlapX = a.x < b.x + b.w && a.x + a.w > b.x;
        const overlapY = a.y < b.y + b.h && a.y + a.h > b.y;
        const overlaps = overlapX && overlapY;
        expect(overlaps, `Cards ${a.id} and ${b.id} should not overlap`).toBe(
          false,
        );
      }
    }
  });

  test('all player names should be fully visible on mobile', async ({
    page,
  }) => {
    const roomId = '507f1f77bcf86cd799439011';
    const userId = '507f191e810c19729de860ea';

    const mockState = {
      players: [
        {
          playerId: userId,
          alive: true,
          hand: ['strike', 'skip', 'attack', 'favor', 'shuffle'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-aaaa',
          alive: true,
          hand: ['strike', 'skip'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-bbbb',
          alive: true,
          hand: ['strike', 'skip'],
          defuseCount: 1,
          stash: [],
        },
        {
          playerId: 'bot-cccc',
          alive: true,
          hand: ['strike'],
          defuseCount: 1,
          stash: [],
        },
      ],
      deck: Array(30).fill('strike'),
      discardPile: [],
      currentTurnIndex: 0,
      playerOrder: [userId, 'bot-aaaa', 'bot-bbbb', 'bot-cccc'],
      pendingAction: null,
    };

    await mockRoomInfo(page, {
      room: {
        id: roomId,
        status: 'active',
        hostId: userId,
        members: [
          { id: userId, userId, displayName: 'You', isHost: true },
          {
            id: 'bot-aaaa',
            userId: 'bot-aaaa',
            displayName: 'Player bot-aaaa',
            isHost: false,
          },
          {
            id: 'bot-bbbb',
            userId: 'bot-bbbb',
            displayName: 'Player bot-bbbb',
            isHost: false,
          },
          {
            id: 'bot-cccc',
            userId: 'bot-cccc',
            displayName: 'Player bot-cccc',
            isHost: false,
          },
        ],
      },
      session: { id: 'session-1', status: 'active', state: mockState },
    });

    await mockGameSocket(page, roomId, userId, {
      roomJoinedPayload: {
        status: 'active',
        session: { id: 'session-1', status: 'active', state: mockState },
      },
    });

    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);
    await closeGameRulesModal(page);

    const playerNames = page.locator('[data-testid^="player-name-"]');
    await expect(playerNames.first()).toBeVisible({ timeout: 15000 });

    const nameCount = await playerNames.count();
    expect(nameCount).toBe(4);

    for (let i = 0; i < nameCount; i++) {
      await expect(playerNames.nth(i)).toBeVisible();
    }
  });
});

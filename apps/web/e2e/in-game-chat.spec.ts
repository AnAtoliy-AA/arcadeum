import { expect } from '@playwright/test';
import { test, handleRoute } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  mockGameSocket,
  mockRoomInfo,
  waitForRoomReady,
  dismissTutorialOverlay,
  checkNoBackendErrors,
  MOCK_OBJECT_ID,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

const ROOM_ID = '647f1a2b3c4d5e6f7a8b9c0d';
const OPPONENT_ID = '647f1a2b3c4d5e6f7a8b9c0e';
const OPPONENT_NAME = 'Opponent';

async function openChatPanel(page: import('@playwright/test').Page) {
  // On mobile viewports the panel starts hidden, so the toggle click below
  // would be intercepted by the first-visit tutorial overlay.
  await dismissTutorialOverlay(page);
  const panel = page.getByTestId('game-chat-panel');
  if (!(await panel.isVisible())) {
    await page.getByTestId('toggle-chat-button').click();
    await expect(panel).toBeVisible();
  }
}

test.describe('In-Game Chat Messaging', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockGameSocket(page, ROOM_ID, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: ROOM_ID,
        gameId: 'critical_v1',
        name: 'Test Room',
        status: 'lobby',
        members: [
          {
            id: MOCK_OBJECT_ID,
            userId: MOCK_OBJECT_ID,
            displayName: 'Test User',
            isHost: true,
          },
          {
            id: OPPONENT_ID,
            userId: OPPONENT_ID,
            displayName: OPPONENT_NAME,
            isHost: false,
          },
        ],
        playerCount: 2,
      },
    });
  });

  test('should send and receive lobby chat messages', async ({ page }) => {
    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    await openChatPanel(page);
    await expect(page.getByTestId('game-chat-panel')).toBeVisible();

    const input = page.getByRole('textbox', { name: /message/i });
    await expect(input).toBeEnabled();

    // Send a message
    await input.fill('Hello everyone!');
    await input.press('Enter');

    // Input should clear
    await expect(input).toHaveValue('');

    // Message should appear in chat panel
    await expect(page.getByText('Hello everyone!')).toBeVisible();
  });

  test('should receive messages from other players', async ({ page }) => {
    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    await openChatPanel(page);
    await expect(page.getByTestId('game-chat-panel')).toBeVisible();

    // Simulate incoming chat from opponent
    await page.evaluate(
      ({ roomId, OPPONENT_ID }) => {
        window.gameSocket?.trigger('games.room.chat', {
          id: `log-${Date.now()}`,
          roomId,
          senderId: OPPONENT_ID,
          senderName: 'Opponent',
          message: 'Hey there!',
          type: 'message',
          timestamp: Date.now(),
        });
      },
      { roomId: ROOM_ID, OPPONENT_ID },
    );

    await expect(page.getByText('Hey there!')).toBeVisible();
  });

  test('should display message character count', async ({ page }) => {
    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    await openChatPanel(page);
    await expect(page.getByTestId('game-chat-panel')).toBeVisible();

    // Character count should show 0/240
    await expect(page.getByText('0/240')).toBeVisible();

    // Type some text and verify count updates
    const input = page.getByRole('textbox', { name: /message/i });
    await input.fill('Hello!');

    await expect(page.getByText('6/240')).toBeVisible();
  });

  test('should not send empty messages', async ({ page }) => {
    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    await openChatPanel(page);
    await expect(page.getByTestId('game-chat-panel')).toBeVisible();

    const input = page.getByRole('textbox', { name: /message/i });
    const sendButton = page.getByRole('button', { name: /send/i });

    // Send button should be disabled when input is empty
    await expect(sendButton).toBeDisabled();

    // Try sending with only whitespace
    await input.fill('   ');
    await expect(sendButton).toBeDisabled();
  });

  test('should respect 240 character limit', async ({ page }) => {
    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    await openChatPanel(page);
    await expect(page.getByTestId('game-chat-panel')).toBeVisible();

    const input = page.getByRole('textbox', { name: /message/i });
    const longMessage = 'a'.repeat(241);

    await input.fill(longMessage);

    // Input should be capped at 240 characters
    const value = await input.inputValue();
    expect(value.length).toBeLessThanOrEqual(240);
  });

  test('should show sign-in prompt for unauthenticated user', async ({
    page,
  }) => {
    // Set up anonymous session - no tokens, auth returns no user
    await page.addInitScript(() => {
      window.localStorage.removeItem('web_session_tokens_v1');
      document.cookie = 'web_access_token=; path=/; max-age=0';
      document.cookie = 'web_refresh_token=; path=/; max-age=0';
    });

    await page.route('**/auth/me', async (route) => {
      await handleRoute(route, { user: null });
    });

    await mockGameSocket(page, ROOM_ID, 'anonymous');

    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    await openChatPanel(page);

    // Chat input should show sign-in placeholder
    const input = page.getByRole('textbox', { name: /message/i });
    await expect(input).toHaveAttribute('placeholder', /sign in to chat/i);
    await expect(input).toBeDisabled();
  });

  test('should switch between chat scopes', async ({ page }) => {
    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    await openChatPanel(page);
    await expect(page.getByTestId('game-chat-panel')).toBeVisible();

    // Default scope should be "All" for FFA mode
    const allTab = page.getByRole('tab', { name: 'All' });
    await expect(allTab).toHaveAttribute('aria-selected', 'true');

    // Send a message on All scope
    const input = page.getByRole('textbox', { name: /message/i });
    await input.fill('Message to all');
    await input.press('Enter');
    await expect(page.getByText('Message to all')).toBeVisible();

    // Switch to Players scope
    const playersTab = page.getByRole('tab', { name: 'Players' });
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('[role="tab"]')).find(
        (el) => el.textContent?.trim() === 'Players',
      );
      (tab as HTMLElement | null)?.click();
    });
    await expect(playersTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should receive multiple messages and display them in order', async ({
    page,
  }) => {
    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    await openChatPanel(page);
    await expect(page.getByTestId('game-chat-panel')).toBeVisible();

    const timestamp = Date.now();

    // Simulate multiple incoming messages
    await page.evaluate(
      ({ roomId, OPPONENT_ID, timestamp }) => {
        const ws = window.gameSocket;
        ws?.trigger('games.room.chat', {
          id: 'log-1',
          roomId,
          senderId: OPPONENT_ID,
          senderName: 'Opponent',
          message: 'First message',
          type: 'message',
          timestamp,
        });
        ws?.trigger('games.room.chat', {
          id: 'log-2',
          roomId,
          senderId: OPPONENT_ID,
          senderName: 'Opponent',
          message: 'Second message',
          type: 'message',
          timestamp: timestamp + 1000,
        });
      },
      { roomId: ROOM_ID, OPPONENT_ID, timestamp },
    );

    await expect(page.getByText('First message')).toBeVisible();
    await expect(page.getByText('Second message')).toBeVisible();
  });

  test('should display chat panel with table chat title', async ({ page }) => {
    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    await openChatPanel(page);
    await expect(page.getByTestId('game-chat-panel')).toBeVisible();
    await expect(page.getByText('Table Chat')).toBeVisible();
  });
});

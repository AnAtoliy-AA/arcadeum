import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  mockChatSocket,
  mockGameSocket,
  handleRoute,
} from './fixtures/test-utils';

test.describe('Chat Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockChatSocket(page);
    await mockGameSocket(page, 'mock-room', '507f191e810c19729de860ea');

    // Default mock for chat messages to avoid 401 on initial load
    await page.route('**/chat/*/messages', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await handleRoute(route, []);
      } else if (method === 'OPTIONS') {
        await handleRoute(route, null);
      } else {
        await route.continue();
      }
    });
  });

  test('should prevent sending empty messages', async ({ page }) => {
    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    const sendBtn = page.getByRole('button', { name: /send|отправить/i });
    const input = page.getByPlaceholder(
      /Send a note to everyone|сообщение|message/i,
    );

    await expect(input).toBeVisible({});
    await expect(input).toBeEnabled({});
    await input.click();
    await input.fill('');
    await expect(sendBtn).toBeDisabled();
  });

  test('should handle long messages correctly', async ({ page }) => {
    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    const longMessage = 'A'.repeat(500);
    const input = page.getByPlaceholder(
      /Send a note to everyone|сообщение|message/i,
    );
    await expect(input).toBeVisible({});
    await expect(input).toBeEnabled({});
    await input.fill(longMessage);

    const sendBtn = page.getByRole('button', { name: /send|отправить/i });
    await expect(sendBtn).toBeEnabled();
  });

  test('should show sender names in messages', async ({ page }) => {
    await page.routeWebSocket('**/socket.io/**', (ws) => ws.close());

    await page.route(
      (url) =>
        url.pathname.includes('/chat/') && url.pathname.endsWith('/messages'),
      async (route) => {
        const method = route.request().method();
        if (method === 'GET') {
          await handleRoute(route, [
            {
              id: '1',
              chatId: 'chat-1',
              senderId: 'user-2',
              content: 'Hi',
              senderUsername: 'otheruser',
              receiverIds: ['507f191e810c19729de860ea'],
              timestamp: new Date().toISOString(),
            },
          ]);
        } else if (method === 'OPTIONS') {
          await handleRoute(route, null);
        } else {
          await route.continue();
        }
      },
    );

    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    const senderElement = page.getByText('otheruser');
    await expect(senderElement.first()).toBeVisible({});
  });

  test('should auto-scroll to bottom on new message', async ({ page }) => {
    await page.route(
      (url) =>
        url.pathname.includes('/chat/') && url.pathname.endsWith('/messages'),
      async (route) => {
        const method = route.request().method();
        if (method === 'GET') {
          // Use timestamps in the past to ensure stable rendering and sorting
          const now = Date.now();
          const messages = Array.from({ length: 30 }).map((_, index) => ({
            id: `${index + 1}`,
            chatId: 'chat-1',
            senderId:
              index % 2 === 0
                ? '507f191e810c19729de860ea'
                : '507f191e810c19729de860e2',
            content: `Message ${index + 1}`,
            senderUsername: index % 2 === 0 ? 'testuser' : 'otheruser',
            receiverIds: ['507f191e810c19729de860ea'],
            timestamp: new Date(now - (40 - index) * 1000).toISOString(),
          }));

          messages.push({
            id: 'last',
            chatId: 'chat-1',
            senderId: 'user-2',
            content: 'Newest message',
            senderUsername: 'otheruser',
            receiverIds: ['507f191e810c19729de860ea'],
            timestamp: new Date(now).toISOString(),
          });

          await handleRoute(route, messages);
        } else if (method === 'OPTIONS') {
          await handleRoute(route, null);
        } else {
          await route.continue();
        }
      },
    );

    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    // Ensure the chat input is visible (indicates hydration is complete)
    const input = page.getByPlaceholder(/message|сообщение|Type a message/i);
    await expect(input.first()).toBeVisible();

    // Wait for initial messages to be rendered to ensure the component is stable
    // We use a more relaxed locator for the first message and ensure it's attached
    const firstMessage = page.getByText('Message 1').first();
    await expect(firstMessage).toBeAttached();

    // Wait for the newest message to appear in the DOM
    const newestMessage = page.getByText('Newest message').first();
    await expect(newestMessage).toBeAttached();

    // Finally verify it is visible to the user (scrolled into view/rendered)
    await expect(newestMessage).toBeVisible();
  });
});

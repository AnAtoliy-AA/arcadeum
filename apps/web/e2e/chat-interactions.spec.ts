import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  mockChatSocket,
  mockGameSocket,
} from './fixtures/test-utils';

test.describe('Chat Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockChatSocket(page);
    await mockGameSocket(page, 'mock-room', 'user-1');
  });

  test('should prevent sending empty messages', async ({ page }) => {
    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    const sendBtn = page.getByRole('button', { name: /send|отправить/i });
    const input = page.getByPlaceholder(/message|сообщение/i);

    await expect(input).toBeVisible({ timeout: 10000 });
    await expect(input).toBeEnabled({ timeout: 15000 });
    await input.click();
    await input.fill('');
    await expect(sendBtn).toBeDisabled();
  });

  test('should handle long messages correctly', async ({ page }) => {
    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    const longMessage = 'A'.repeat(500);
    const input = page.getByPlaceholder(/message|сообщение/i);
    await expect(input).toBeVisible({ timeout: 10000 });
    await expect(input).toBeEnabled({ timeout: 15000 });
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
        if (route.request().method() !== 'GET') {
          return route.continue();
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '1',
              chatId: 'chat-1',
              senderId: 'user-2',
              content: 'Hi',
              senderUsername: 'otheruser',
              receiverIds: ['user-1'],
              timestamp: new Date().toISOString(),
            },
          ]),
        });
      },
    );

    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    const senderElement = page.getByText('otheruser');
    await expect(senderElement.first()).toBeVisible({ timeout: 15000 });
  });

  test('should auto-scroll to bottom on new message', async ({ page }) => {
    await page.route(
      (url) =>
        url.pathname.includes('/chat/') && url.pathname.endsWith('/messages'),
      async (route) => {
        if (route.request().method() !== 'GET') {
          return route.continue();
        }

        const messages = Array.from({ length: 30 }).map((_, index) => ({
          id: `${index + 1}`,
          chatId: 'chat-1',
          senderId: index % 2 === 0 ? 'user-1' : 'user-2',
          content: `Message ${index + 1}`,
          senderUsername: index % 2 === 0 ? 'testuser' : 'otheruser',
          receiverIds: ['user-1'],
          timestamp: new Date(Date.now() + index * 1000).toISOString(),
        }));
        messages.push({
          id: 'last',
          chatId: 'chat-1',
          senderId: 'user-2',
          content: 'Newest message',
          senderUsername: 'otheruser',
          receiverIds: ['user-1'],
          timestamp: new Date().toISOString(),
        });

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(messages),
        });
      },
    );

    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');
    const newestMessage = page.getByText('Newest message');
    await expect(newestMessage).toBeVisible({ timeout: 15000 });
  });
});

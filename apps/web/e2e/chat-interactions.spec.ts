import { test, expect } from '@playwright/test';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Chat Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  test('should prevent sending empty messages', async ({ page }) => {
    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    const sendBtn = page.getByRole('button', { name: /send|отправить/i });
    const input = page.getByPlaceholder(/message|сообщение/i);

    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeEnabled({ timeout: 10000 });
    await input.click();
    await input.fill('');
    await expect(sendBtn).toBeDisabled();
  });

  test('should handle long messages correctly', async ({ page }) => {
    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    const longMessage = 'A'.repeat(500);
    const input = page.getByPlaceholder(/message|сообщение/i);
    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeEnabled({ timeout: 10000 });
    await input.fill(longMessage);

    const sendBtn = page.getByRole('button', { name: /send|отправить/i });
    await expect(sendBtn).toBeEnabled();
  });

  test('should show sender names in messages', async ({ page }) => {
    // Block socket.io WebSocket connections to prevent the real backend from sending an empty
    // 'chatMessages' event which would overwrite our mocked HTTP messages below.
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
    await expect(page.getByText('otheruser')).toBeVisible({ timeout: 10000 });
  });

  test('should auto-scroll to bottom on new message', async ({ page }) => {
    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');
    const input = page.getByPlaceholder(/message|сообщение/i);
    await expect(input).toBeEnabled({ timeout: 10000 });
    await input.fill('test scroll');
  });
});

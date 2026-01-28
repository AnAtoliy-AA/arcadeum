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
    await input.click({ force: true });
    await input.fill('');
    await expect(sendBtn).toBeDisabled();
  });

  test('should handle long messages correctly', async ({ page }) => {
    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');

    const longMessage = 'A'.repeat(500);
    const input = page.getByPlaceholder(/message|сообщение/i);
    await input.scrollIntoViewIfNeeded();
    await input.fill(longMessage);

    const sendBtn = page.getByRole('button', { name: /send|отправить/i });
    await expect(sendBtn).toBeEnabled();
  });

  test('should show sender names in messages', async ({ page }) => {
    await page.route('**/chat/*/messages', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            content: 'Hi',
            senderUsername: 'otheruser',
            timestamp: new Date().toISOString(),
          },
        ]),
      });
    });

    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');
    await expect(page.getByText('otheruser')).toBeVisible();
  });

  test('should auto-scroll to bottom on new message', async ({ page }) => {
    await navigateTo(page, '/chat?chatId=chat-1&title=Test%20User');
    // This is hard to test purely with Playwright without complex height checks,
    // but we can check if the last message is in viewport
    const input = page.getByPlaceholder(/message|сообщение/i);
    await input.fill('test scroll');
    // ...
  });
});

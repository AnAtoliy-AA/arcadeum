import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Contact Form', () => {
  test('should validate required fields', async ({ page }) => {
    await navigateTo(page, '/contact');

    // Try to submit empty form
    await page.getByRole('button', { name: /send|submit|отправить/i }).click();

    // Check for browser validation or HTML5 validation
    await expect(page.locator('form')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await navigateTo(page, '/contact');

    // Use labels which are more stable as they come from translation but are usually matched by text
    await page.getByLabel(/name|имя/i).fill('Test User');
    await page.getByLabel(/email|почта/i).fill('invalid-email');
    await page.getByLabel(/subject|тема/i).fill('Test Subject');
    await page
      .getByLabel(/message|сообщение/i)
      .fill('Hello, this is a test message.');

    await page.getByRole('button', { name: /send|submit|отправить/i }).click();

    // Form should not be submitted
    await expect(page.locator('form')).toBeVisible();
  });

  test('should show success message on valid submission', async ({ page }) => {
    await navigateTo(page, '/contact');

    await page.getByLabel(/name|имя/i).fill('John Doe');
    await page.getByLabel(/email|почта/i).fill('john@example.com');
    await page.getByLabel(/subject|тема/i).fill('Hello');
    await page.getByLabel(/message|сообщение/i).fill('This is a great app!');

    const submitBtn = page.getByRole('button', {
      name: /send|message|отправить/i,
    });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // Verify success message with a slightly longer timeout
    await expect(
      page.getByText(/thank you|message has been sent|спасибо/i),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator('form')).not.toBeVisible({ timeout: 10000 });
  });

  test('should have working external links', async ({ page }) => {
    await navigateTo(page, '/contact');

    const emailLink = page.locator('a[href^="mailto:"]');
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute(
      'href',
      /arcadeum\.care@gmail\.com/,
    );
  });
});

import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Contact Form', () => {
  test('should validate required fields', async ({ page }) => {
    await navigateTo(page, '/contact');

    // Try to submit empty form
    const submitBtn = page.getByTestId('contact-submit-button');
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });

    // Check for browser validation or HTML5 validation
    await expect(page.locator('form')).toBeVisible({});
  });

  test('should validate email format', async ({ page }) => {
    await navigateTo(page, '/contact');

    await page.getByTestId('contact-name-input').fill('Test User');
    await page.getByTestId('contact-email-input').fill('invalid-email');
    await page.getByTestId('contact-subject-input').fill('Test Subject');
    await page
      .getByTestId('contact-message-textarea')
      .fill('Hello, this is a test message.');

    const submitBtn = page.getByTestId('contact-submit-button');
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });

    // Form should not be submitted
    await expect(page.locator('form')).toBeVisible({});
  });

  test('should show success message on valid submission', async ({ page }) => {
    await navigateTo(page, '/contact');

    await page.getByTestId('contact-name-input').fill('John Doe');
    await page.getByTestId('contact-email-input').fill('john@example.com');
    await page.getByTestId('contact-subject-input').fill('Hello');
    await page
      .getByTestId('contact-message-textarea')
      .fill('This is a great app!');

    const submitBtn = page.getByTestId('contact-submit-button');
    await submitBtn.scrollIntoViewIfNeeded();

    // Verify success message with polling and robust click
    await expect(async () => {
      await submitBtn
        .click({ force: true })
        .catch(() => submitBtn.dispatchEvent('click'));
      await expect(page.getByTestId('contact-success-message')).toBeVisible({});
    }).toPass({});

    await expect(page.locator('form')).not.toBeVisible({});
  });

  test('should have working external links', async ({ page }) => {
    await navigateTo(page, '/contact');

    const emailLink = page
      .locator('a[href^="mailto:arcadeum.care@gmail.com"]')
      .first();
    await expect(emailLink).toBeVisible({});
    await expect(emailLink).toHaveAttribute(
      'href',
      /arcadeum\.care@gmail\.com/,
    );
  });
});

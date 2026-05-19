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

  test('should show success message on valid submission', async ({
    page,
  }, testInfo) => {
    await navigateTo(page, '/contact');

    // BE dedupes identical submissions (ip + email + subject + message) for
    // an hour. Project name + retry index keep messages unique across
    // chromium/firefox/webkit and across retry runs in the same window.
    // Project names contain spaces ("Mobile Chrome"), which would make
    // an invalid email local-part — collapse to dashes.
    const projectSlug = testInfo.project.name.replace(/\s+/g, '-');
    const nonce = `${projectSlug}-${testInfo.retry}-${Date.now()}`;
    await page.getByTestId('contact-name-input').fill('John Doe');
    await page
      .getByTestId('contact-email-input')
      .fill(`john+${nonce}@example.com`);
    await page.getByTestId('contact-subject-input').fill('Hello');
    await page
      .getByTestId('contact-message-textarea')
      .fill(`This is a great app! Run ${nonce}`);

    // BE rejects submissions arriving < 2s after the form mount as bot
    // pace. Wait past that bar before submitting.
    await page.waitForTimeout(2200);

    const submitBtn = page.getByTestId('contact-submit-button');
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });

    await expect(page.getByTestId('contact-success-message')).toBeVisible({
      timeout: 15000,
    });
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

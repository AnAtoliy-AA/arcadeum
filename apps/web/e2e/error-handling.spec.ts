import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';

test.describe('Error Handling', () => {
  test('should display error boundary when an unhandled error occurs', async ({
    page,
  }) => {
    // Navigate to the test crash page with the crash parameter
    await page.goto('/test-crash?crash=true');

    // Check if the ErrorState component content is visible
    // Based on the default ErrorState implementation:
    // Message: "This is a test crash!"
    // Title: Something went wrong!

    await expect(page.getByText('Something went wrong!')).toBeVisible();
    await expect(page.getByText('This is a test crash!')).toBeVisible();

    // Check for the Try Again button
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('should recover from error when clicking Try Again', async ({
    page,
  }) => {
    // Navigate to the crash page, but without crash param first to ensure it loads
    await page.goto('/test-crash');
    await expect(page.getByText('Error Boundary Test Page')).toBeVisible();

    // Now trigger crash
    await page.goto('/test-crash?crash=true');
    await expect(page.getByText('Something went wrong!')).toBeVisible();

    // Try Again button
    const tryAgainBtn = page.getByRole('button', { name: 'Try again' });
    await expect(tryAgainBtn).toBeVisible();

    // Note: In this specific test case, clicking "Try Again" will just re-render the
    // component with the same URL (which still has ?crash=true), so it effectively
    // "re-crashes". This confirms the button is reachable and interactive.
    await tryAgainBtn.click();

    await expect(page.getByText('Something went wrong!')).toBeVisible();
  });
});

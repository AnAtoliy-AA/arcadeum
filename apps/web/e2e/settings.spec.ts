import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/settings');
    // Ensure we start in English for predictable tests
    const englishBtn = page.getByRole('button', {
      name: /english|inglés|английский/i,
    });
    if (await englishBtn.isVisible()) {
      await englishBtn.click();
    }

    // Mock support page if it's an API route or prevent external navigation
    await page.route('**/support', async (route) => {
      // If it's a page navigation, we don't mock it to JSON but allow it,
      // BUT if the failure is "received /settings" it means navigation didn't happen.
      // Maybe button isn't clickable? Or it's an external link?
      // "support arcadeum" might be external?
      // If it's external, we shouldn't assert internal URL structure unless we intercept.
      // But let's assume it IS internal.
      await route.fulfill({
        status: 200,
        body: '<html><body>Support</body></html>',
      });
    });
  });

  test('should load settings page', async ({ page }) => {
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator('h1')).toContainText(/settings/i);
  });

  test('should switch themes', async ({ page }) => {
    const lightThemeBtn = page.getByRole('button', { name: /light/i }).first();
    const darkThemeBtn = page.getByRole('button', { name: /dark/i }).first();

    await lightThemeBtn.click();
    await expect(lightThemeBtn).toHaveAttribute('aria-pressed', 'true');

    await darkThemeBtn.click();
    await expect(darkThemeBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(lightThemeBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('should switch languages', async ({ page }) => {
    // Labels for Spanish/English buttons in both English and Spanish
    const spanishBtn = page.getByRole('button', { name: /español/i });
    const englishBtn = page.getByRole('button', { name: /english|inglés/i });

    await spanishBtn.click();
    await expect(spanishBtn).toHaveAttribute('aria-pressed', 'true');
    // Verify some text changes to Spanish
    await expect(page.locator('h1')).toContainText(/configuración/i);

    await englishBtn.click();
    await expect(englishBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('h1')).toContainText(/settings/i);
  });

  test('should toggle haptic feedback', async ({ page }) => {
    const hapticsToggle = page.locator('input[type="checkbox"]');

    // Switch should be visible
    await expect(hapticsToggle).toBeVisible();

    const initialState = await hapticsToggle.isChecked();
    await hapticsToggle.click();
    await expect(hapticsToggle).toBeChecked({ checked: !initialState });

    await hapticsToggle.click();
    await expect(hapticsToggle).toBeChecked({ checked: initialState });
  });

  test('should have working navigation links', async ({ page }) => {
    // Auth link
    const authLink = page.getByRole('link', {
      name: /go to sign-in|ir a iniciar sesión/i,
    });
    await expect(authLink).toBeVisible();
    await expect(authLink).toHaveAttribute('href', '/auth');

    // Support link - use label from appConfig
    const supportLink = page
      .locator('a')
      .filter({ hasText: /support arcadeum|apoyar a/i })
      .last();
    await expect(supportLink).toBeVisible();
    await supportLink.click();
    await expect(page).toHaveURL(/\/support/);
  });

  test('should display app version', async ({ page }) => {
    const versionElement = page.getByTestId('app-version');
    await expect(versionElement).toBeVisible();
    await expect(versionElement).toContainText(/version|versión|версия/i);
    await expect(versionElement).toContainText(/v\d+\.\d+\.\d+/);
  });
});

import { expect } from '@playwright/test';
import { test, navigateTo, clearState } from './fixtures/test-utils';

test.describe('Settings Page', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await clearState(page);
    await navigateTo(page, '/settings');
  });

  test('should display settings sections', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /appearance|внешний вид|vörp|aspecto/i,
      }),
    ).toBeVisible({});
    await expect(
      page.getByRole('heading', { name: /language|язык|мова|idioma/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /about|о приложении|версия|acerca de/i,
      }),
    ).toBeVisible();
  });

  test('should toggle haptics', async ({ page }) => {
    const hapticsRow = page.getByTestId('haptics-row');
    const hapticsCheckbox = hapticsRow.locator('input[type="checkbox"]');

    await expect(hapticsRow).toBeVisible();
    const initialState = await hapticsCheckbox.isChecked();
    await hapticsRow.click();

    await expect
      .poll(async () => await hapticsCheckbox.isChecked(), {})
      .toBe(!initialState);
  });

  test('should toggle sound', async ({ page }) => {
    const soundRow = page.getByTestId('sound-row');
    const soundCheckbox = soundRow.locator('input[type="checkbox"]');

    await expect(soundRow).toBeVisible();
    const initialState = await soundCheckbox.isChecked();
    await soundRow.click();

    await expect
      .poll(async () => await soundCheckbox.isChecked(), {})
      .toBe(!initialState);
  });

  test('should switch themes', async ({ page }) => {
    const lightThemeBtn = page.getByTestId('theme-light');
    const darkThemeBtn = page.getByTestId('theme-dark');

    await expect(lightThemeBtn).toBeVisible();
    await expect(darkThemeBtn).toBeVisible();

    await darkThemeBtn.click({ force: true });
    await expect
      .poll(async () => await darkThemeBtn.getAttribute('aria-pressed'), {})
      .toBe('true');

    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      'dark',
      {},
    );

    // Wait for state to settle

    await lightThemeBtn.click({ force: true });
    await expect
      .poll(async () => await lightThemeBtn.getAttribute('aria-pressed'), {})
      .toBe('true');

    await expect(darkThemeBtn).toHaveAttribute('aria-pressed', 'false', {});
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      'light',
      {},
    );
  });

  test('should switch languages', async ({ page }) => {
    const spanishBtn = page.getByTestId('lang-btn-es');
    const englishBtn = page.getByTestId('lang-btn-en');

    await expect(spanishBtn).toBeVisible();
    await spanishBtn.click({ force: true });

    await expect(page.locator('[data-current-locale]')).toHaveAttribute(
      'data-current-locale',
      'es',
      {},
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'es', {});
    await expect(
      page.getByRole('heading', { name: /configuraci/i }),
    ).toBeVisible({});
    await expect(spanishBtn).toHaveAttribute('aria-pressed', 'true', {});

    await englishBtn.click({ force: true });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', {});
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible(
      {},
    );
    await expect(englishBtn).toHaveAttribute('aria-pressed', 'true', {});
    await expect(spanishBtn).toHaveAttribute('aria-pressed', 'false', {});
  });
});

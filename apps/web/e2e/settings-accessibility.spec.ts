import { expect } from '@playwright/test';
import { test, navigateTo, clearState } from './fixtures/test-utils';

test.describe('Settings Accessibility and UX', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await clearState(page);
    await navigateTo(page, '/settings');
  });

  test('theme buttons should have correct active states', async ({ page }) => {
    const darkBtn = page.getByTestId('theme-dark');
    const lightBtn = page.getByTestId('theme-light');

    // Switch to dark
    await darkBtn.click({ force: true });
    await expect
      .poll(async () => await darkBtn.getAttribute('aria-pressed'), {})
      .toBe('true');
    await expect(lightBtn).toHaveAttribute('aria-pressed', 'false', {});

    // Switch to light
    await lightBtn.click({ force: true });
    await expect
      .poll(async () => await lightBtn.getAttribute('aria-pressed'), {})
      .toBe('true');
    await expect(darkBtn).toHaveAttribute('aria-pressed', 'false', {});
  });

  test('vision mode buttons should update html data-vision-mode and active state', async ({
    page,
  }) => {
    const deutBtn = page.getByTestId('vision-deuteranopia');
    const protBtn = page.getByTestId('vision-protanopia');
    const tritBtn = page.getByTestId('vision-tritanopia');
    const hcBtn = page.getByTestId('vision-highContrast');
    const noneBtn = page.getByTestId('vision-none');

    await deutBtn.click({ force: true });
    await expect(page.locator('html')).toHaveAttribute(
      'data-vision-mode',
      'deuteranopia',
    );
    await expect(deutBtn).toHaveAttribute('aria-pressed', 'true');

    await protBtn.click({ force: true });
    await expect(page.locator('html')).toHaveAttribute(
      'data-vision-mode',
      'protanopia',
    );
    await expect(protBtn).toHaveAttribute('aria-pressed', 'true');

    await tritBtn.click({ force: true });
    await expect(page.locator('html')).toHaveAttribute(
      'data-vision-mode',
      'tritanopia',
    );
    await expect(tritBtn).toHaveAttribute('aria-pressed', 'true');

    await hcBtn.click({ force: true });
    await expect(page.locator('html')).toHaveAttribute(
      'data-vision-mode',
      'highContrast',
    );
    await expect(hcBtn).toHaveAttribute('aria-pressed', 'true');

    await noneBtn.click({ force: true });
    await expect(page.locator('html')).toHaveAttribute(
      'data-vision-mode',
      'none',
    );
    await expect(noneBtn).toHaveAttribute('aria-pressed', 'true');
  });
});

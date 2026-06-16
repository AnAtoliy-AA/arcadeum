import { expect, type Locator } from '@playwright/test';
import { test, navigateTo, getIsMobile } from './fixtures/test-utils';

/**
 * Tamagui's Select trigger opens the dropdown on `mousedown`, but on
 * webkit-desktop the first synthetic click occasionally fails to register
 * — the dropdown stays closed and the option locator times out. Wait for
 * `aria-expanded="true"` to confirm the dropdown actually opened, and
 * retry once if it didn't. Other browsers see the same code path; the
 * retry is a no-op there because the first click already succeeded.
 */
async function openLanguageSwitcher(switcher: Locator): Promise<void> {
  await switcher.click();
  try {
    await expect(switcher).toHaveAttribute('aria-expanded', 'true', {
      timeout: 2000,
    });
  } catch {
    await switcher.click();
    await expect(switcher).toHaveAttribute('aria-expanded', 'true', {
      timeout: 5000,
    });
  }
}

test.describe('Header Language Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should expose a language switcher on every device and change language', async ({
    page,
  }) => {
    if (getIsMobile(page)) {
      // Mobile: the header trigger is hidden, the drawer carries inline pills.
      await page.getByTestId('mobile-menu-button').click();
      const mobileNav = page.getByTestId('mobile-nav');
      await expect(mobileNav).toBeVisible();

      const enPill = mobileNav.getByTestId('mobile-language-en');
      await expect(enPill).toBeVisible();
      await expect(enPill).toHaveAttribute('aria-pressed', 'true');

      await mobileNav.getByTestId('mobile-language-es').click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    } else {
      const languageSwitcher = page
        .locator('header')
        .getByTestId('header-language-switcher');
      await expect(languageSwitcher).toBeVisible();
      await expect(languageSwitcher).toContainText('EN');

      await openLanguageSwitcher(languageSwitcher);
      await page.getByRole('option', { name: 'ES' }).click();
      await expect(languageSwitcher).toContainText('ES', {});
    }
  });

  test('should hide language switcher in header and surface inline pills inside the mobile menu', async ({
    page,
  }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // 1. Header switcher is NOT visible on mobile — moved into the drawer.
    const headerLanguageSwitcher = page
      .locator('header')
      .getByTestId('header-language-switcher');
    await expect(headerLanguageSwitcher).toBeHidden();

    // 2. Open mobile menu
    const menuButton = page.getByTestId('mobile-menu-button');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const mobileNav = page.getByTestId('mobile-nav');
    await expect(mobileNav).toBeVisible();

    // 3. Verify the inline language pill row lives inside the drawer.
    const mobileSwitcher = mobileNav.getByTestId('mobile-language-switcher');
    await expect(mobileSwitcher).toBeVisible();

    // 4. Pick FR via the pill and verify the document language updates.
    //    The pills sit at the bottom of the scrollable MobileNav — scroll
    //    the container to the bottom so the button is inside the viewport.
    await mobileNav.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await mobileNav.getByTestId('mobile-language-fr').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });
});

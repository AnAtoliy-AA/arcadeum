import { expect, type Page } from '@playwright/test';

export function getIsMobile(page: Page): boolean {
  return (page.viewportSize()?.width || 0) <= 900;
}

export async function ensureNavigationVisible(page: Page): Promise<void> {
  if (getIsMobile(page)) {
    const mobileNav = page.getByTestId('mobile-nav');
    if (!(await mobileNav.isVisible())) {
      const menuButton = page.getByTestId('mobile-menu-button');
      await expect(menuButton).toBeVisible();
      await menuButton.click({ force: true });
      await expect(mobileNav).toBeVisible();
      // Wait for menu animation to finish
      await page.waitForTimeout(500);
    }
  }
}

export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

  // Wait for hydration - theme provider sets these attributes in useEffect
  // This is a reliable way to ensure React has finished mounting and effects have run.
  await expect(page.locator('html'))
    .toHaveAttribute('data-theme-preference', /.*/, { timeout: 15000 })
    .catch(() => {
      // Fallback if the attribute is not set, just wait a bit more
      return page.waitForTimeout(2000);
    });
}

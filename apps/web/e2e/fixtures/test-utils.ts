import { expect, type Page } from '@playwright/test';

/**
 * Shared test utilities for e2e tests
 */

/**
 * Wait for page to be fully loaded (no network activity)
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Check if an element is visible on the page
 */
export async function isElementVisible(
  page: Page,
  selector: string,
): Promise<boolean> {
  const element = page.locator(selector);
  return element.isVisible();
}

/**
 * Navigate and wait for load
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForPageLoad(page);
}

/**
 * Assert page title contains text
 */
export async function assertTitleContains(
  page: Page,
  text: string,
): Promise<void> {
  await expect(page).toHaveTitle(new RegExp(text, 'i'));
}

/**
 * Assert element with text is visible
 */
export async function assertTextVisible(
  page: Page,
  text: string,
): Promise<void> {
  await expect(page.getByText(text, { exact: false })).toBeVisible();
}

/**
 * Get all links from the page
 */
export async function getPageLinks(
  page: Page,
): Promise<{ href: string; text: string }[]> {
  const links = await page.locator('a[href]').all();
  const results: { href: string; text: string }[] = [];

  for (const link of links) {
    const href = await link.getAttribute('href');
    const text = await link.textContent();
    if (href) {
      results.push({ href, text: text?.trim() || '' });
    }
  }

  return results;
}

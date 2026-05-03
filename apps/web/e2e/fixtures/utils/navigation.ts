import { expect, type Page, type Response } from '@playwright/test';

export function getIsMobile(page: Page): boolean {
  return (page.viewportSize()?.width || 0) <= 900;
}

export async function ensureNavigationVisible(page: Page): Promise<void> {
  if (getIsMobile(page)) {
    const mobileNav = page.getByTestId('mobile-nav');

    // Check if it's already visible
    const isVisible = await mobileNav.isVisible();
    if (isVisible) return;

    const menuButton = page.getByTestId('mobile-menu-button');
    await expect(menuButton).toBeVisible();

    // Use dispatchEvent for more reliable clicking on mobile safari
    await menuButton.dispatchEvent('click');

    // Wait for the navigation to become visible
    await expect(mobileNav).toBeVisible();
  }
}

export async function navigateTo(
  page: Page,
  path: string,
  options?: { maxRetries?: number },
): Promise<void> {
  const maxRetries = options?.maxRetries ?? 2;
  let attempt = 0;
  let success = false;

  while (attempt <= maxRetries && !success) {
    let shouldReload = false;
    let hydrationError = false;

    const onPageError = (err: Error) => {
      const msg = err.message;
      if (
        msg.includes('ChunkLoadError') ||
        msg.includes('Failed to load chunk') ||
        msg.includes('Hydration failed') ||
        msg.includes('initial UI does not match') ||
        msg.includes('Minified React error #418') ||
        msg.includes('Minified React error #423') ||
        msg.includes('Module factory not available')
      ) {
        shouldReload = true;
        if (msg.includes('Hydration') || msg.includes('UI does not match')) {
          hydrationError = true;
        }
      }
    };

    page.on('pageerror', onPageError);

    const onResponse = (response: Response) => {
      const status = response.status();
      const url = response.url();
      if (
        (status === 404 && url.includes('.js')) ||
        (status === 500 && url === page.url())
      ) {
        shouldReload = true;
      }
    };

    page.on('response', onResponse);

    try {
      // Use 'commit' to avoid waiting for full DOM parsing/scripts during slow dev compilation.
      // Ready state is instead verified via robust hydration markers below.
      await page.goto(path, { waitUntil: 'commit' });

      if (shouldReload) {
        console.warn(
          `Detected issue (Hydration: ${hydrationError}) on ${path}, reloading... (Attempt ${attempt + 1})`,
        );
        await page.reload({ waitUntil: 'load' });
      }

      // Robust hydration check: wait for either data-hydrated or data-app-ready
      await expect(async () => {
        const html = page.locator('html');
        const hydrated = await html.getAttribute('data-hydrated');
        const appReady = await html.getAttribute('data-app-ready');

        if (hydrated !== 'true' && appReady !== 'true') {
          throw new Error('Hydration markers not found');
        }
      }).toPass({
        intervals: [1000, 2000, 5000],
      });

      success = true;
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        console.error(
          `Navigation to ${path} failed after ${maxRetries} retries: ${err}`,
        );
        throw err;
      }
      console.warn(
        `Navigation attempt ${attempt} for ${path} failed, retrying... Error: ${err}`,
      );
      // Removed hardcoded timeout to follow project rules
    } finally {
      page.off('pageerror', onPageError);
      page.off('response', onResponse);
    }
  }
}

export async function clearState(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

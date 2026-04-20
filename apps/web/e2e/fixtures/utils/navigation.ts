import { expect, type Page, type Response } from '@playwright/test';

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
      await page.goto(path, { timeout: 60000, waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});

      if (shouldReload) {
        console.log(
          `Detected issue (Hydration: ${hydrationError}), reloading... (Attempt ${attempt + 1})`,
        );
        await page.reload({ waitUntil: 'load', timeout: 60000 });
      }

      // Wait for hydration attribute
      await expect(page.locator('html'))
        .toHaveAttribute('data-hydrated', 'true', { timeout: 15000 })
        .catch(async () => {
          // If hydration attribute missing, check if app-ready is there
          const isReady = await page
            .locator('html')
            .getAttribute('data-app-ready');
          if (isReady !== 'true') {
            throw new Error('Hydration timed out');
          }
        });

      success = true;
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) throw err;
      console.warn(`Navigation attempt ${attempt} failed, retrying: ${err}`);
      await page.waitForTimeout(1000 * attempt);
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

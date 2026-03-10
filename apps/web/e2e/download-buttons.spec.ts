import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

test.describe('Download Buttons', () => {
  test.beforeEach(async ({ page }) => {

    await page.addInitScript(() => {
      interface BeforeInstallPromptEvent extends Event {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
      }

      const originalAddEventListener = window.addEventListener;
      window.addEventListener = function (
        ...args: Parameters<typeof window.addEventListener>
      ) {
        const [type, listener] = args;
        if (type === 'beforeinstallprompt') {
          const event = new Event(
            'beforeinstallprompt',
          ) as BeforeInstallPromptEvent;
          event.prompt = () => Promise.resolve();
          event.userChoice = Promise.resolve({ outcome: 'accepted' });
          Object.defineProperty(event, 'preventDefault', {
            value: () => { },
            writable: true,
          });

          setTimeout(() => {
            if (typeof listener === 'function') {
              listener(event);
            } else if (listener && 'handleEvent' in listener) {
              listener.handleEvent(event);
            }
          }, 500);
        }
        return originalAddEventListener.apply(this, args);
      };
    });
  });

  test('should be visible on the Home page', async ({ page }) => {
    await navigateTo(page, '/');

    // Wait for the section to be visible
    const downloadSection = page.locator(
      '[data-testid="download-cta-section"]',
    );
    await expect(downloadSection).toBeVisible({ timeout: 15000 });

    // Check if PWA install button is visible
    const pwaButton = page.locator('[data-testid="install-pwa-button"]');
    await expect(pwaButton).toBeVisible({ timeout: 15000 });
  });

  test('should be visible in Settings', async ({ page }) => {
    await navigateTo(page, '/settings');

    // The Downloads section should be visible with PWA button
    const pwaButton = page.locator('[data-testid="install-pwa-button"]');
    await expect(pwaButton).toBeVisible({ timeout: 15000 });
  });
});

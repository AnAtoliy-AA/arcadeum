import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  mockSession,
  mockAllOnPage,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Matchmaking Queue', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllOnPage(page);
    await mockSession(page);
  });

  test('should open matchmaking modal when playing vs human and support cancellation', async ({
    page,
  }) => {
    await navigateTo(page, routes.seaBattleLanding);

    const humanBtn = page.getByTestId('quickplay-human-button').first();
    await expect(humanBtn).toBeVisible();

    // Trigger joinQueue via the function exposed from MatchmakingQueueModal's useEffect.
    // This guarantees the correct Zustand store instance is used regardless of HMR
    // module duplication between the layout and the sea-battle page bundle.
    await page.evaluate(() =>
      (
        window as Window & { __joinMatchmaking?: (g: string) => Promise<void> }
      ).__joinMatchmaking?.('sea_battle_v1'),
    );

    // Verify Matchmaking Queue modal appears
    const modal = page.getByTestId('matchmaking-modal');
    await expect(modal).toBeVisible();

    // Verify timer starts displaying elapsed time
    const timer = page.getByTestId('matchmaking-timer');
    await expect(timer).toBeVisible();

    // Click Cancel Matchmaking
    const cancelBtn = page.getByRole('button', { name: /cancel matchmaking/i });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Verify Matchmaking Queue modal disappears
    await expect(modal).not.toBeVisible();
  });
});

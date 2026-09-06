import {
  test,
  navigateTo,
  mockSession,
  mockAllOnPage,
} from './fixtures/test-utils';

test('trace joinMatchmaking effect', async ({ page }) => {
  await mockAllOnPage(page);
  await mockSession(page);
  await navigateTo(page, '/en/games/sea-battle');

  // Wait for the MatchmakingQueue component to mount and expose the hook
  await page.waitForFunction(
    () =>
      typeof (window as Window & { __joinMatchmaking?: unknown })
        .__joinMatchmaking === 'function',
  );

  // Patch joinMatchmaking to add tracing
  await page.evaluate(() => {
    const original = (
      window as typeof window & {
        __joinMatchmaking?: (g: string) => Promise<void>;
      }
    ).__joinMatchmaking;
    (
      window as typeof window & {
        __joinMatchmaking?: (g: string) => Promise<void>;
      }
    ).__joinMatchmaking = async (gameId: string) => {
      console.log('__joinMatchmaking called with:', gameId);
      await original?.(gameId);
      console.log('__joinMatchmaking completed');
    };
  });

  page.on('console', (msg) => {
    if (
      msg.text().startsWith('__joinMatchmaking') ||
      msg.text().startsWith('startQueue') ||
      msg.text().startsWith('leaveQueue')
    ) {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  await page.evaluate(() =>
    (
      window as typeof window & {
        __joinMatchmaking?: (g: string) => Promise<void>;
      }
    ).__joinMatchmaking?.('sea_battle_v1'),
  );

  // Poll isQueued after a short time
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(200);
    const state = await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="matchmaking-modal"]');
      return { modalExists: !!modal };
    });
    console.log(`After ${(i + 1) * 200}ms:`, JSON.stringify(state));
    if (state.modalExists) break;
  }
});

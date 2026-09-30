import {
  expect,
  test,
  navigateTo,
  mockSession,
  mockAllOnPage,
} from './fixtures/test-utils';

test.describe('Sea Battle Weekly Blitz Cup', () => {
  test('displays blitz cup banner on Sea Battle landing page with countdown and registration info', async ({
    page,
  }) => {
    await mockAllOnPage(page);
    await mockSession(page);

    await page.route('**/tournaments/sea-battle/blitz-cup*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tournament: {
            id: 'mock-sea-battle-blitz-1',
            gameType: 'sea_battle_v1',
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            registrationOpensAt: new Date(Date.now() - 3600000).toISOString(),
            registrationClosesAt: new Date(Date.now() + 86000000).toISOString(),
            maxPlayers: 16,
            prizeDescription: '500 Coins + Admiral Trophy',
            resultText: null,
            entryFeeCoins: 0,
            prizePoolCoins: 500,
            status: 'registration_open',
            effectiveStatus: 'registration_open',
            registeredCount: 6,
            waitlistCount: 0,
            isRegistered: false,
            isWaitlisted: false,
            name: 'Sea Battle Weekend Blitz Cup',
            description:
              'Weekly 16-player single-elimination naval blitz tournament! Command your fleet and sink enemy ships.',
          },
          bracket: null,
          countdownSeconds: 86400,
          enabled: true,
        }),
      });
    });

    await navigateTo(page, '/en/games/sea-battle');

    const banner = page.getByTestId('sea-battle-blitz-banner');
    await expect(banner).toBeVisible();

    const title = page.getByTestId('blitz-cup-title');
    await expect(title).toHaveText('Sea Battle Weekend Blitz Cup');

    const statusBadge = page.getByTestId('blitz-status-registration-open');
    await expect(statusBadge).toBeVisible();

    const captainsCount = page.getByTestId('blitz-cup-captains-count');
    await expect(captainsCount).toContainText('6 / 16');

    const registerBtn = page.getByTestId('blitz-cup-register-button');
    await expect(registerBtn).toBeVisible();

    const viewBracketBtn = page.getByTestId('blitz-cup-view-bracket');
    await expect(viewBracketBtn).toBeVisible();
  });

  test('hides blitz cup banner on Sea Battle landing page when cup is disabled', async ({
    page,
  }) => {
    await mockAllOnPage(page);
    await mockSession(page);

    await page.route('**/tournaments/sea-battle/blitz-cup*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tournament: {
            id: 'mock-sea-battle-blitz-1',
            gameType: 'sea_battle_v1',
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            registrationOpensAt: new Date(Date.now() - 3600000).toISOString(),
            registrationClosesAt: new Date(Date.now() + 86000000).toISOString(),
            maxPlayers: 16,
            prizeDescription: '500 Coins',
            resultText: null,
            entryFeeCoins: 0,
            prizePoolCoins: 500,
            status: 'registration_open',
            effectiveStatus: 'registration_open',
            registeredCount: 2,
            waitlistCount: 0,
            isRegistered: false,
            isWaitlisted: false,
            name: 'Sea Battle Weekend Blitz Cup',
            description: 'Weekly tournament',
          },
          bracket: null,
          countdownSeconds: 86400,
          enabled: false,
        }),
      });
    });

    await navigateTo(page, '/en/games/sea-battle');

    const banner = page.getByTestId('sea-battle-blitz-banner');
    await expect(banner).toHaveCount(0);
  });

  test('displays registered badge and unregister button when user is enrolled', async ({
    page,
  }) => {
    await mockAllOnPage(page);
    await mockSession(page);

    await page.route('**/tournaments/sea-battle/blitz-cup*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tournament: {
            id: 'mock-sea-battle-blitz-1',
            gameType: 'sea_battle_v1',
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            registrationOpensAt: new Date(Date.now() - 3600000).toISOString(),
            registrationClosesAt: new Date(Date.now() + 86000000).toISOString(),
            maxPlayers: 16,
            prizeDescription: '500 Coins',
            resultText: null,
            entryFeeCoins: 0,
            prizePoolCoins: 500,
            status: 'registration_open',
            effectiveStatus: 'registration_open',
            registeredCount: 5,
            waitlistCount: 0,
            isRegistered: true,
            isWaitlisted: false,
            name: 'Sea Battle Weekend Blitz Cup',
            description: 'Weekly tournament',
          },
          bracket: null,
          countdownSeconds: 86400,
          enabled: true,
        }),
      });
    });

    await navigateTo(page, '/en/games/sea-battle');

    const banner = page.getByTestId('sea-battle-blitz-banner');
    await expect(banner).toBeVisible();

    const registeredBadge = page.getByTestId('blitz-cup-registered-badge');
    await expect(registeredBadge).toBeVisible();

    const unregisterBtn = page.getByTestId('blitz-cup-unregister-button');
    await expect(unregisterBtn).toBeVisible();
  });
});

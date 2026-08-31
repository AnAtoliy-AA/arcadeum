import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  ensureNavigationVisible,
} from './fixtures/test-utils';

test.describe('Live Platform Info & Online Users', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should render live pulse badge in navigation header', async ({
    page,
  }) => {
    await ensureNavigationVisible(page);
    const badge = page.getByTestId('header-live-pulse-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/\d+/);
  });

  test('should open and close live activity popover from header badge', async ({
    page,
  }) => {
    await ensureNavigationVisible(page);
    const badge = page.getByTestId('header-live-pulse-badge');
    await expect(badge).toBeVisible();

    await badge.click();
    const popover = page.getByTestId('live-activity-popover');
    await expect(popover).toBeVisible();

    const closeButton = popover.getByRole('button', { name: 'Close' });
    await closeButton.click();
    await expect(popover).toBeHidden();
  });

  test('should render home live pulse section with real-time stat counters', async ({
    page,
  }) => {
    const liveSection = page.getByTestId('home-live-pulse-section');
    await expect(liveSection).toBeVisible();

    const onlineCounter = page.getByTestId('live-online-counter');
    await expect(onlineCounter).toBeVisible();
    await expect(onlineCounter).toContainText(/\d+/);

    const activeGamesCounter = page.getByTestId('live-active-games-counter');
    await expect(activeGamesCounter).toBeVisible();
    await expect(activeGamesCounter).toContainText(/\d+/);

    const matchesTodayCounter = page.getByTestId('live-matches-today-counter');
    await expect(matchesTodayCounter).toBeVisible();
    await expect(matchesTodayCounter).toContainText(/\d+/);

    const waitingRoomsCounter = page.getByTestId('live-waiting-rooms-counter');
    await expect(waitingRoomsCounter).toBeVisible();
    await expect(waitingRoomsCounter).toContainText(/\d+/);

    const waitingPlayersCounter = page.getByTestId(
      'live-waiting-players-counter',
    );
    await expect(waitingPlayersCounter).toBeVisible();
    await expect(waitingPlayersCounter).toContainText(/\d+/);
  });

  test('should navigate to rooms page filtered by lobby status when clicking open lobbies', async ({
    page,
  }) => {
    const waitingRoomsCard = page
      .getByTestId('home-live-pulse-section')
      .getByTestId('live-waiting-rooms-counter')
      .locator('..');
    await expect(waitingRoomsCard).toBeVisible();
    await waitingRoomsCard.click();
    await expect(page).toHaveURL(/.*\/rooms\?status=lobby/);
  });

  test('should render live stats on game landing page', async ({ page }) => {
    await navigateTo(page, '/games/sea-battle');
    const liveStats = page.getByTestId('game-landing-live-stats');
    await expect(liveStats).toBeVisible();

    const openLobbies = page.getByTestId('landing-live-open-lobbies');
    await expect(openLobbies).toBeVisible();

    const waitingPlayers = page.getByTestId('landing-live-waiting-players');
    await expect(waitingPlayers).toBeVisible();

    const activeMatches = page.getByTestId('landing-live-active-matches');
    await expect(activeMatches).toBeVisible();
  });

  test('should allow filtering by in_progress status and clearing filters', async ({
    page,
  }) => {
    await navigateTo(page, '/rooms');
    const filtersContainer = page.getByTestId('games-filters-container');
    await expect(filtersContainer).toBeVisible();

    const inProgressBtn = filtersContainer.getByRole('checkbox', {
      name: /In Progress|Идут матчи|En curso|En cours|Ідуць матчы/i,
    });
    await expect(inProgressBtn).toBeVisible();
    await inProgressBtn.click();
    await expect(page).toHaveURL(/.*status=in_progress.*/);

    const clearAllBtn = page.getByTestId('rooms-filter-clear-all');
    await expect(clearAllBtn).toBeVisible();
    await clearAllBtn.click();
    await expect(page).toHaveURL(/^((?!status=).)*$/);
  });
});

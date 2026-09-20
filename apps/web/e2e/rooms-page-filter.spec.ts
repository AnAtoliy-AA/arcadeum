import { expect } from '@playwright/test';
import { test, navigateTo, handleRoute } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Rooms Page Filter UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/games/rooms*', async (route) => {
      await handleRoute(route, { rooms: [], total: 0 });
    });

    await page.route('**/socket.io/*', async (route) => {
      await handleRoute(route, { status: 'ok' });
    });
  });

  test('should render redesigned filters container with search input and category dropdown', async ({
    page,
  }) => {
    await navigateTo(page, routes.rooms);

    const container = page.getByTestId('games-filters-container');
    await expect(container).toBeVisible();

    const searchInput = page.getByRole('searchbox', {
      name: /Search games/i,
    });
    await expect(searchInput).toBeVisible();

    const categoryDropdown = page.getByTestId('rooms-filter-category-dropdown');
    await expect(categoryDropdown).toBeVisible();
  });

  test('should allow typing in search and clearing via clear button', async ({
    page,
  }) => {
    await navigateTo(page, routes.rooms);

    const searchInput = page.getByRole('searchbox', {
      name: /Search games/i,
    });
    await searchInput.fill('Chess');
    await expect(searchInput).toHaveValue('Chess');

    const clearBtn = page.getByRole('button', {
      name: /Clear search input/i,
    });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue('');
  });

  test('should toggle AI vs AI mode and reflect in URL', async ({ page }) => {
    await navigateTo(page, routes.rooms);

    const aiBtn = page.getByRole('button', {
      name: /Toggle AI vs AI mode/i,
    });
    await expect(aiBtn).toBeVisible();
    await aiBtn.click();
    await expect(page).toHaveURL(/.*aiVsAi=ai_vs_ai.*/);

    await aiBtn.click();
    await expect(page).toHaveURL(/^((?!aiVsAi=).)*$/);
  });

  test('should toggle status filter and clear via Clear All button', async ({
    page,
  }) => {
    await navigateTo(page, routes.rooms);

    const statusDropdown = page.getByTestId('rooms-filter-status-dropdown');
    await expect(statusDropdown).toBeVisible();
    await statusDropdown.click();

    const lobbyBtn = page.getByRole('checkbox', {
      name: /^Lobby$|^Лобби$/i,
    });
    await expect(lobbyBtn).toBeVisible();
    await lobbyBtn.click();
    await expect(page).toHaveURL(/.*status=lobby.*/);

    const clearAllBtn = page.getByTestId('rooms-filter-clear-all');
    await expect(clearAllBtn).toBeVisible();
    await clearAllBtn.click();
    await expect(page).toHaveURL(/^((?!status=).)*$/);
  });

  test('should open participation menu and allow selection', async ({
    page,
  }) => {
    await navigateTo(page, routes.rooms);

    const participationTrigger = page.getByTestId(
      'rooms-filter-toggle-advanced',
    );
    await expect(participationTrigger).toBeVisible();
    await participationTrigger.click();

    const hostingOption = page.getByRole('button', {
      name: /Filter by participation: Hosting|Filter by participation: Создатель/i,
    });
    await expect(hostingOption).toBeVisible();
  });

  test('should open multiple select category dropdown and toggle options', async ({
    page,
  }) => {
    await navigateTo(page, routes.rooms);

    const categoryDropdownTrigger = page.getByTestId(
      'rooms-filter-category-dropdown',
    );
    await expect(categoryDropdownTrigger).toBeVisible();
    await categoryDropdownTrigger.click();

    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    const cardOption = listbox.getByRole('checkbox', {
      name: /Card/i,
    });
    await expect(cardOption).toBeVisible();
    await cardOption.click();

    await expect(page).toHaveURL(/.*category=Card.*/);
  });
});

import { test, expect, navigateTo } from './fixtures/test-utils';

test.describe('ArcadePet Virtual Pet Simulation', () => {
  test('should render arcade-pet landing page with hero and interactive widget', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/arcade-pet');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText('ArcadePet');
    await expect(page.getByTestId('arcade-pet-btn-a')).toBeVisible();
    await expect(page.getByTestId('arcade-pet-btn-b')).toBeVisible();
    await expect(page.getByTestId('arcade-pet-btn-c')).toBeVisible();
  });

  test('should cycle menu items when pressing Button A', async ({ page }) => {
    await navigateTo(page, '/en/games/arcade-pet');
    await page.waitForLoadState('domcontentloaded');

    const btnA = page.getByTestId('arcade-pet-btn-a');
    await btnA.click();
    await expect(page.getByText('Snack')).toBeVisible();

    await btnA.click();
    await expect(page.getByText('Play')).toBeVisible();
  });

  test('should hatch egg when pressing Hatch button B', async ({ page }) => {
    await navigateTo(page, '/en/games/arcade-pet');
    await page.waitForLoadState('domcontentloaded');

    const btnB = page.getByTestId('arcade-pet-btn-b');
    await btnB.click();

    await expect(page.getByText('HATCHED')).toBeVisible();
    await expect(page.getByText('baby')).toBeVisible();
  });

  test('should toggle theme when clicking theme option', async ({ page }) => {
    await navigateTo(page, '/en/games/arcade-pet');
    await page.waitForLoadState('domcontentloaded');

    const cyberpunkButton = page.getByRole('button', { name: /Cyberpunk/i });
    await cyberpunkButton.click();
    await expect(cyberpunkButton).toHaveClass(/bg-indigo-600/);
  });

  test('should open companion widget, mounts nursery, and presents modal', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games');
    await page.waitForLoadState('domcontentloaded');

    const trigger = page.getByTestId('arcade-pet-companion-trigger');
    await expect(trigger).toBeVisible();
    await trigger.click();

    await expect(page.getByTestId('arcade-pet-companion-modal')).toBeVisible();

    const openAdoptionBtn = page.getByTestId('open-adoption-modal-btn');
    await openAdoptionBtn.click();
    await expect(page.getByTestId('arcade-pet-adoption-modal')).toBeVisible();
    await expect(page.getByTestId('adopt-random-btn')).toBeVisible();

    const closeBtn = page.getByRole('button', { name: 'Close' });
    await closeBtn.click();
    await expect(page.getByTestId('arcade-pet-adoption-modal')).toBeHidden();

    const openGiftsBtn = page.getByTestId('open-gifts-modal-btn');
    await openGiftsBtn.click();
    await expect(page.getByTestId('arcade-pet-gifts-modal')).toBeVisible();
    await expect(page.getByTestId('tab-received-presents')).toBeVisible();
  });
});

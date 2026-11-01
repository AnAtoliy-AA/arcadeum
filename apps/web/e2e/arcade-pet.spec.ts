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
});

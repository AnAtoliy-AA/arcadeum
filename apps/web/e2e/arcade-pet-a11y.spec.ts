import AxeBuilder from '@axe-core/playwright';
import { test, expect, navigateTo, mockSession } from './fixtures/test-utils';
import { seedPetCollection } from './fixtures/arcade-pet-seed';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('ArcadePet accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await seedPetCollection(page, {
      pets: [
        {
          id: 'a11y-pet-1',
          name: 'PixelBuddy',
          species: 'cyber_cat',
          stage: 'adult',
          theme: 'cyberpunk',
          hunger: 80,
          happiness: 90,
          level: 3,
        },
      ],
      activePetId: 'a11y-pet-1',
      gemBalance: 300,
      adoptionCount: 1,
    });
    await navigateTo(page, '/en/games');
    await page.waitForLoadState('domcontentloaded');
    await page.getByTestId('arcade-pet-companion-trigger').click();
  });

  test('companion panel has no serious axe violations', async ({ page }) => {
    const panel = page.getByTestId('arcade-pet-companion-modal');
    await expect(panel).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('[data-testid="arcade-pet-companion-modal"]')
      .withTags(WCAG_TAGS)
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(serious.map((v) => v.id)).toEqual([]);
  });

  test('adoption modal is a labelled dialog that traps focus and closes on Escape', async ({
    page,
  }) => {
    await page.getByTestId('open-adoption-modal-btn').click();
    const dialog = page.getByRole('dialog', { name: /adopt/i });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const inside = await dialog.evaluate((el) =>
        el.contains(document.activeElement),
      );
      expect(inside).toBe(true);
    }

    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(WCAG_TAGS)
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(serious.map((v) => v.id)).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('gifts modal tabs expose tab semantics and arrow key navigation', async ({
    page,
  }) => {
    await page.getByTestId('open-gifts-modal-btn').click();
    const received = page.getByTestId('tab-received-presents');
    await expect(received).toHaveAttribute('aria-selected', 'true');
    await received.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('tab-send-gift')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});

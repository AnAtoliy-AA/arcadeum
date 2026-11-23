import { test, expect, navigateTo, mockSession } from './fixtures/test-utils';
import { seedPetCollection } from './fixtures/arcade-pet-seed';

const LOCALES = ['en', 'ru', 'es', 'fr', 'by'];
const WIDTHS = [1280, 360];

test.describe('ArcadePet companion header layout', () => {
  for (const locale of LOCALES) {
    for (const width of WIDTHS) {
      test(`header wraps without horizontal overflow (${locale}, ${width}px)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await mockSession(page);
        await seedPetCollection(page, {
          pets: [
            {
              id: 'wrap-pet-1',
              name: 'Bioluminescent Slime',
              species: 'blob',
              stage: 'child',
              theme: 'underwater',
              hunger: 80,
              happiness: 90,
              level: 4,
            },
            {
              id: 'wrap-pet-2',
              name: 'Second Friend',
              species: 'dino',
              stage: 'baby',
              theme: 'cyberpunk',
              hunger: 80,
              happiness: 90,
              level: 1,
            },
          ],
          activePetId: 'wrap-pet-1',
          gemBalance: 300,
          adoptionCount: 2,
        });
        await navigateTo(page, `/${locale}/games`);
        await page.waitForLoadState('domcontentloaded');
        await page.getByTestId('arcade-pet-companion-trigger').click();

        const panel = page.getByTestId('arcade-pet-companion-modal');
        await expect(panel).toBeVisible();
        await expect(page.getByTestId('companion-coin-balance')).toBeVisible();

        const overflow = await panel.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const clipped = Array.from(el.querySelectorAll('*')).filter((c) => {
            const r = c.getBoundingClientRect();
            return (
              r.width > 0 && (r.right > box.right + 1 || r.left < box.left - 1)
            );
          });
          return {
            scrolls: el.scrollWidth > el.clientWidth,
            clipped: clipped.length,
          };
        });
        expect(overflow).toEqual({ scrolls: false, clipped: 0 });

        const nameBox = await page.getByTestId('pet-rename-btn').boundingBox();
        const coinBox = await page
          .getByTestId('companion-coin-balance')
          .boundingBox();
        expect(nameBox && coinBox && coinBox.y > nameBox.y).toBe(true);
      });
    }
  }
});

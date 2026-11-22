import { test, expect, type Page } from '@playwright/test';
import {
  createRealUser,
  fetchServerCollection,
  useRealSession,
} from './fixtures/arcade-pet-real';

const LOCALES = ['en', 'ru', 'es', 'fr', 'by'] as const;

/** Fresh real accounts get a level-up reward modal that covers the page. */
async function dismissLevelUp(page: Page): Promise<void> {
  const modal = page.getByTestId('level-up-modal');
  try {
    await modal.waitFor({ state: 'visible', timeout: 6000 });
  } catch {
    return; // Modal did not appear for this account.
  }
  await page.getByTestId('level-up-close-btn').click();
  await expect(modal).toBeHidden();
}

async function adoptFirstPet(page: Page): Promise<void> {
  await dismissLevelUp(page);
  await page.getByTestId('arcade-pet-companion-trigger').click();
  await page.getByTestId('care-commitment-checkbox').check();
  await page.getByTestId('confirm-adopt-pet-btn').click();
  await expect(page.getByTestId('arcade-pet-commitment-modal')).toBeHidden();
}

function waitForAdoptAction(page: Page) {
  return page.waitForResponse(
    (r) =>
      r.url().endsWith('/arcade-pet/collection/action') &&
      r.request().method() === 'POST',
  );
}

test.describe('ArcadePet QA (real backend)', () => {
  test('adopt persists to the server and survives reload', async ({
    page,
    request,
  }) => {
    const user = await createRealUser(request, 'qa');
    await useRealSession(page, user);
    await page.goto('/en/games');
    const adopted = waitForAdoptAction(page);
    await adoptFirstPet(page);
    await expect
      .poll(
        async () => (await fetchServerCollection(request, user)).pets.length,
      )
      .toBe(1);
    // The optimistic pet must not be wiped by the first sync round-trips.
    await adopted;
    await expect(
      page.getByTestId('arcade-pet-companion-trigger'),
    ).not.toContainText('Adopt Free Pet');
    await page.reload();
    await expect(
      page.getByTestId('arcade-pet-companion-trigger'),
    ).toContainText('Mystery Egg');
  });

  test('adopting while the first sync is in flight keeps the pet', async ({
    page,
    request,
  }) => {
    const user = await createRealUser(request, 'qa');
    await useRealSession(page, user);
    // Hold the very first collection pull so the user can act before it lands.
    let held = false;
    await page.route('**/arcade-pet/collection', async (route) => {
      if (route.request().method() === 'GET' && !held) {
        held = true;
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      await route.continue();
    });
    await page.goto('/en/games');
    await dismissLevelUp(page);
    const adopted = waitForAdoptAction(page);
    await adoptFirstPet(page);
    await adopted;
    await expect(
      page.getByTestId('arcade-pet-companion-trigger'),
    ).toContainText('Mystery Egg');
    await expect
      .poll(
        async () => (await fetchServerCollection(request, user)).pets.length,
      )
      .toBe(1);
  });

  for (const locale of LOCALES) {
    test(`companion widget has no untranslated text in ${locale}`, async ({
      page,
      request,
    }) => {
      const user = await createRealUser(request, 'qa');
      await useRealSession(page, user);
      await page.goto(`/${locale}/games`);
      await adoptFirstPet(page);
      await page.getByTestId('arcade-pet-companion-trigger').click();
      const modal = page.getByTestId('arcade-pet-companion-modal');
      await expect(modal).toBeVisible();
      const text = (await modal.innerText()) ?? '';
      await page.screenshot({ path: `test-results/qa-widget-${locale}.png` });
      expect(text).not.toMatch(/arcadePetCompanion\./);
      if (locale !== 'en') expect(text).not.toContain('Open Game Room');
    });
  }
});

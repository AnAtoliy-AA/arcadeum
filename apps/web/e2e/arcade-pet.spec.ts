import { test, expect, navigateTo, mockSession } from './fixtures/test-utils';

test.describe('ArcadePet Virtual Pet Simulation', () => {
  test('should render arcade-pet landing page with hero and interactive widget', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games/arcade-pet');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText('ArcadePet');
    await expect(page.getByTestId('arcade-pet-btn-a').first()).toBeVisible();
    await expect(page.getByTestId('arcade-pet-btn-b').first()).toBeVisible();
    await expect(page.getByTestId('arcade-pet-btn-c').first()).toBeVisible();
  });

  test('should cycle menu items when pressing Button A', async ({ page }) => {
    await navigateTo(page, '/en/games/arcade-pet');
    await page.waitForLoadState('domcontentloaded');

    const btnA = page.getByTestId('arcade-pet-btn-a').first();
    await btnA.click();
    await expect(page.getByText('🍰')).toBeVisible();

    await btnA.click();
    await expect(page.getByText('🎮')).toBeVisible();
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

  test('should show disabled pet button with register prompt for guest player', async ({
    page,
  }) => {
    await navigateTo(page, '/en/games');
    await page.waitForLoadState('domcontentloaded');

    const trigger = page.getByTestId('arcade-pet-companion-trigger');
    await expect(trigger).toBeVisible();
    await expect(trigger).toBeDisabled();
    await expect(trigger).toContainText('Register for Pet');

    await trigger.dispatchEvent('click');
    await expect(page.getByTestId('arcade-pet-register-prompt')).toBeVisible();
    await expect(page.getByText('Registration Required')).toBeVisible();
  });

  test('should allow registered player to adopt first pet after confirming care commitment', async ({
    page,
  }) => {
    await mockSession(page);
    await navigateTo(page, '/en/games');
    await page.waitForLoadState('domcontentloaded');

    const trigger = page.getByTestId('arcade-pet-companion-trigger');
    await expect(trigger).toBeVisible();
    await expect(trigger).not.toBeDisabled();
    await expect(trigger).toContainText('Adopt Free Pet');

    await trigger.click();
    await expect(page.getByTestId('arcade-pet-commitment-modal')).toBeVisible();

    const confirmBtn = page.getByTestId('confirm-adopt-pet-btn');
    await expect(confirmBtn).toBeDisabled();

    await page.getByTestId('care-commitment-checkbox').check();
    await expect(confirmBtn).not.toBeDisabled();

    await confirmBtn.click();
    await expect(page.getByTestId('arcade-pet-commitment-modal')).toBeHidden();
    await expect(
      page.getByTestId('arcade-pet-companion-trigger'),
    ).toBeVisible();
  });

  test('should open companion widget, mounts nursery, and presents modal for owner', async ({
    page,
  }) => {
    await mockSession(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'arcadeum_pet_collection_v2',
        JSON.stringify({
          pets: [
            {
              id: 'owner-pet-1',
              name: 'PixelBuddy',
              species: 'cyber_cat',
              stage: 'adult',
              theme: 'cyberpunk',
              stats: { hunger: 80, happiness: 90, level: 3 },
              timestamps: { bornAt: Date.now() },
              inventory: {},
            },
          ],
          activePetId: 'owner-pet-1',
          gemBalance: 300,
          adoptionCount: 1,
          queuedThemeForNextPet: null,
          presents: [],
          hasConfirmedCare: true,
        }),
      );
    });

    await navigateTo(page, '/en/games');
    await page.waitForLoadState('domcontentloaded');

    const trigger = page.getByTestId('arcade-pet-companion-trigger');
    await expect(trigger).toBeVisible();
    await trigger.click();

    await expect(page.getByTestId('arcade-pet-companion-modal')).toBeVisible();

    const coinBadge = page.getByTestId('companion-coin-balance');
    await expect(coinBadge).toBeVisible();
    const initialCoins = await coinBadge.textContent();

    const feedBtn = page.getByTestId('companion-feed-btn');
    await feedBtn.click();
    await expect(coinBadge).toHaveText(String(Number(initialCoins) - 1));

    const openAdoptionBtn = page.getByTestId('open-adoption-modal-btn');
    await openAdoptionBtn.click();
    await expect(page.getByTestId('arcade-pet-adoption-modal')).toBeVisible();
    await expect(page.getByTestId('adopt-random-btn')).toBeVisible();

    const closeBtn = page
      .getByTestId('arcade-pet-adoption-modal')
      .getByRole('button', { name: 'Close', exact: true });
    await closeBtn.click();
    await expect(page.getByTestId('arcade-pet-adoption-modal')).toBeHidden();

    const openGiftsBtn = page.getByTestId('open-gifts-modal-btn');
    await openGiftsBtn.click();
    await expect(page.getByTestId('arcade-pet-gifts-modal')).toBeVisible();
    await expect(page.getByTestId('tab-received-presents')).toBeVisible();
  });

  test('should send pet to home when pressing home button and allow calling back outside', async ({
    page,
  }) => {
    await mockSession(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'arcadeum_pet_collection_v2',
        JSON.stringify({
          pets: [
            {
              id: 'owner-pet-1',
              name: 'PixelBuddy',
              species: 'cyber_cat',
              stage: 'adult',
              theme: 'cyberpunk',
              stats: { hunger: 80, happiness: 90, level: 3 },
              timestamps: { bornAt: Date.now() },
              inventory: {},
            },
          ],
          activePetId: 'owner-pet-1',
          gemBalance: 300,
          adoptionCount: 1,
          queuedThemeForNextPet: null,
          presents: [],
          hasConfirmedCare: true,
        }),
      );
    });

    await navigateTo(page, '/en/games');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('arcade-pet-home-booth')).toBeHidden();

    const trigger = page.getByTestId('arcade-pet-companion-trigger');
    await expect(trigger).toBeVisible();
    await trigger.click();

    const homeBtn = page.getByTestId('arcade-pet-home-toggle-btn');
    await expect(homeBtn).toBeVisible();

    await homeBtn.click();
    await expect(page.getByTestId('arcade-pet-inside-house')).toBeVisible();
    await expect(page.getByTestId('arcade-pet-sleeping-bubble')).toBeVisible();

    await homeBtn.click();
    await expect(page.getByTestId('arcade-pet-inside-house')).toBeHidden();
    await expect(page.getByTestId('arcade-pet-home-booth')).toBeHidden();
    await expect(page.getByTestId('arcade-pet-local-screen-pet')).toBeVisible();
  });

  test('should allow admin to grant pet gift for 0 gems with admin authority', async ({
    page,
  }) => {
    await mockSession(page, { role: 'admin' });
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'arcadeum_pet_collection_v2',
        JSON.stringify({
          pets: [
            {
              id: 'admin-pet-1',
              name: 'AdminBot',
              species: 'cyber_cat',
              stage: 'adult',
              theme: 'cyberpunk',
              stats: { hunger: 100, happiness: 100, level: 10 },
              timestamps: { bornAt: Date.now() },
              inventory: {},
            },
          ],
          activePetId: 'admin-pet-1',
          gemBalance: 0,
          adoptionCount: 1,
          queuedThemeForNextPet: null,
          presents: [],
          hasConfirmedCare: true,
        }),
      );
    });

    await navigateTo(page, '/en/games');
    await page.waitForLoadState('domcontentloaded');

    const trigger = page.getByTestId('arcade-pet-companion-trigger');
    await trigger.click();

    const openGiftsBtn = page.getByTestId('open-gifts-modal-btn');
    await openGiftsBtn.click();

    const sendTab = page.getByTestId('tab-send-gift');
    await expect(sendTab).toContainText('Admin Gift Pet 👑');
    await sendTab.click();

    await expect(page.getByTestId('admin-gift-callout')).toBeVisible();
    const sendBtn = page.getByTestId('send-pet-gift-btn');
    await expect(sendBtn).toContainText(
      'Grant Pet Gift (0 💎 Admin Authority) 👑',
    );

    const recipientInput = page.getByTestId('gift-recipient-input');
    await recipientInput.fill('GrandChampion');
    await sendBtn.click();

    await expect(
      page.getByText(/Pet gift sent to GrandChampion/i),
    ).toBeVisible();
  });

  test('should show escalating food costs for multiple pets and resting banner when at home', async ({
    page,
  }) => {
    await mockSession(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'arcadeum_pet_collection_v2',
        JSON.stringify({
          pets: [
            {
              id: 'multi-pet-1',
              name: 'Cyber Alpha',
              species: 'cyber_cat',
              stage: 'adult',
              theme: 'cyberpunk',
              stats: { hunger: 50, happiness: 50, level: 2 },
              timestamps: { bornAt: Date.now() },
              inventory: {},
            },
            {
              id: 'multi-pet-2',
              name: 'Drake Beta',
              species: 'dragon',
              stage: 'adult',
              theme: 'fantasy',
              stats: { hunger: 50, happiness: 50, level: 2 },
              timestamps: { bornAt: Date.now() },
              inventory: {},
            },
          ],
          activePetId: 'multi-pet-1',
          coinBalance: 50,
          gemBalance: 300,
          adoptionCount: 2,
          queuedThemeForNextPet: null,
          presents: [],
          hasConfirmedCare: true,
          isAtHome: false,
        }),
      );
    });

    await navigateTo(page, '/en/games');
    await page.waitForLoadState('domcontentloaded');

    const trigger = page.getByTestId('arcade-pet-companion-trigger');
    await trigger.click();

    await expect(page.getByTestId('companion-pet-selector')).toBeVisible();
    await expect(page.getByTestId('companion-feed-btn')).toContainText(
      'Snack (🪙 1)',
    );

    const pet2Btn = page.getByTestId('select-pet-multi-pet-2');
    await expect(pet2Btn).toBeVisible();
    await expect(pet2Btn).toContainText('5');
    await pet2Btn.click();

    await expect(page.getByTestId('companion-feed-btn')).toContainText(
      'Snack (🪙 5)',
    );

    const homeBtn = page.getByTestId('arcade-pet-home-toggle-btn');
    await homeBtn.click();

    await expect(page.getByTestId('pet-home-resting-banner')).toBeVisible();
    await expect(page.getByTestId('pet-home-resting-banner')).toContainText(
      'Resting at Home',
    );
  });

  test('should show places for all pets in home, block adoption when full, and allow home upgrade for coins or gems', async ({
    page,
  }) => {
    await mockSession(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'arcadeum_pet_collection_v2',
        JSON.stringify({
          pets: [
            {
              id: 'home-pet-1',
              name: 'Cyber Fox',
              species: 'cyber_cat',
              stage: 'adult',
              theme: 'cyberpunk',
              stats: { hunger: 80, happiness: 80, level: 1 },
              timestamps: { bornAt: Date.now() },
              inventory: {},
            },
          ],
          activePetId: 'home-pet-1',
          homeCapacity: 1,
          coinBalance: 100,
          gemBalance: 200,
          adoptionCount: 1,
          queuedThemeForNextPet: null,
          presents: [],
          hasConfirmedCare: true,
          isAtHome: true,
        }),
      );
    });

    await navigateTo(page, '/en/games');
    await page.waitForLoadState('domcontentloaded');

    const trigger = page.getByTestId('arcade-pet-companion-trigger');
    await trigger.click();

    await expect(page.getByTestId('open-adoption-modal-btn')).toContainText(
      'Mounts (1/1)',
    );

    await page.getByTestId('open-adoption-modal-btn').click();
    await expect(page.getByTestId('arcade-pet-adoption-modal')).toBeVisible();
    await expect(page.getByTestId('home-places-badge')).toContainText(
      '1/1 Places',
    );
    await expect(page.getByTestId('home-full-banner')).toBeVisible();
    await expect(page.getByTestId('adopt-random-btn')).toBeDisabled();

    const upgradeCoinsBtn = page.getByTestId('upgrade-home-coins-btn');
    await expect(upgradeCoinsBtn).toBeVisible();
    await upgradeCoinsBtn.click();

    await expect(page.getByTestId('home-places-badge')).toContainText(
      '1/2 Places',
    );
    await expect(page.getByTestId('home-full-banner')).not.toBeVisible();
    await expect(page.getByTestId('adopt-random-btn')).not.toBeDisabled();

    await page.getByTestId('close-adoption-modal-btn').click();

    const stage = page.getByTestId('arcade-pet-social-stage');
    await expect(stage).toBeVisible();
    await expect(page.getByTestId('home-places-container')).toBeVisible();
    await expect(page.getByTestId('home-place-slot-0')).toBeVisible();
    await expect(page.getByTestId('home-empty-slot-1')).toBeVisible();
    await expect(page.getByTestId('booth-capacity-tag')).toContainText('1/2');
  });
});

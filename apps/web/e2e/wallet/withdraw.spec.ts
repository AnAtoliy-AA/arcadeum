import { expect } from '@playwright/test';
import { test, handleRoute, navigateTo, mockSession } from '../fixtures/test-utils';

const MOCK_BALANCE = { coins: 100, gems: 50, arcadeum: 500 };

const MOCK_WITHDRAW_SUCCESS = {
  success: true,
  signature: '5VERv8NMhJQV9wF94ufViqCaYMz2rHbPDnZxKmBqEj1n3kJ',
  amount: 100,
  fee: 2,
  totalDeduted: 102,
};

async function mockPhantomConnected(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    (window as Record<string, unknown>).solana = {
      isPhantom: true,
      isConnected: true,
      publicKey: { toString: () => 'FakePublicKey1234567890abcdef' },
      connect: async () => ({
        publicKey: { toString: () => 'FakePublicKey1234567890abcdef' },
      }),
      disconnect: async () => {},
    };
  });
}

async function mockPhantomNotInstalled(
  page: import('@playwright/test').Page,
) {
  await page.addInitScript(() => {
    delete (window as Record<string, unknown>).solana;
  });
}

test.describe('/wallet withdraw flow (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    await page.route('**/wallet/balance', async (route) => {
      await handleRoute(route, MOCK_BALANCE);
    });
  });

  test('/wallet page renders withdraw section', async ({ page }) => {
    await navigateTo(page, '/wallet');
    await expect(page.getByTestId('withdraw-section')).toBeVisible();
  });

  test('withdraw section shows connect button when Phantom not available', async ({
    page,
  }) => {
    await mockPhantomNotInstalled(page);
    await navigateTo(page, '/wallet');
    await expect(page.getByTestId('withdraw-section')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Connect Phantom Wallet' }),
    ).toBeVisible();
  });

  test('withdraw section shows amount input after Phantom connection', async ({
    page,
  }) => {
    await mockPhantomConnected(page);
    await navigateTo(page, '/wallet');
    await expect(page.getByTestId('withdraw-section')).toBeVisible();
    await expect(page.getByPlaceholder('Enter amount')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Withdraw' }),
    ).toBeVisible();
  });

  test('withdraw shows fee breakdown for valid amount', async ({ page }) => {
    await mockPhantomConnected(page);
    await navigateTo(page, '/wallet');

    const amountInput = page.getByPlaceholder('Enter amount');
    await amountInput.fill('100');

    await expect(page.getByText('Amount: 100 ARCADEUM')).toBeVisible();
    await expect(page.getByText('Fee (2%): 2 ARCADEUM')).toBeVisible();
    await expect(page.getByText('You receive: 100 ARCADEUM')).toBeVisible();
  });

  test('withdraw calls server action on submit', async ({ page }) => {
    await mockPhantomConnected(page);
    await page.route('**/solana/withdraw', async (route) => {
      if (route.request().method() === 'POST') {
        await handleRoute(route, MOCK_WITHDRAW_SUCCESS);
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, '/wallet');

    const amountInput = page.getByPlaceholder('Enter amount');
    await amountInput.fill('100');

    const withdrawButton = page.getByRole('button', { name: 'Withdraw' });
    await expect(withdrawButton).toBeEnabled();
    await withdrawButton.click();

    await expect(
      page.getByText('Withdrawal successful! TX: 5VERv8NMhJQV9wF'),
    ).toBeVisible();
  });

  test('withdraw shows error on API failure', async ({ page }) => {
    await mockPhantomConnected(page);
    await page.route('**/solana/withdraw', async (route) => {
      if (route.request().method() === 'POST') {
        await handleRoute(route, { message: 'Insufficient balance' }, 500);
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, '/wallet');

    const amountInput = page.getByPlaceholder('Enter amount');
    await amountInput.fill('100');

    const withdrawButton = page.getByRole('button', { name: 'Withdraw' });
    await expect(withdrawButton).toBeEnabled();
    await withdrawButton.click();

    await expect(page.getByText(/Withdrawal failed/)).toBeVisible();
  });

  test('withdraw button disabled when amount exceeds balance', async ({
    page,
  }) => {
    await mockPhantomConnected(page);
    await navigateTo(page, '/wallet');

    const amountInput = page.getByPlaceholder('Enter amount');
    await amountInput.fill('600');

    const withdrawButton = page.getByRole('button', { name: 'Withdraw' });
    await expect(withdrawButton).toBeDisabled();
  });
});

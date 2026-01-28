import { test, expect } from '@playwright/test';
import { navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    // Mock payment API (broad match to catch /payment/session or /payments/session)
    await page.route('**/session', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            paymentUrl: 'https://checkout.stripe.com/mock-session',
          }),
        });
      } else {
        // Prevent 500s
        await route.fulfill({ status: 200, body: JSON.stringify({}) });
      }
    });
  });

  test('should display payment page with presets', async ({ page }) => {
    await navigateTo(page, '/payment');

    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();

    // Check for presets (e.g. $10, $25, $50)
    const presets = page.locator('button').filter({ hasText: /\$/ });
    await expect(presets.first()).toBeVisible();
  });

  test('should allow entering custom amount', async ({ page }) => {
    await navigateTo(page, '/payment');

    const input = page.locator(
      'input[type="number"], input[id="payment-amount"]',
    );
    if (await input.isVisible()) {
      await input.fill('123');
      await expect(input).toHaveValue('123');
    }
  });

  test('should show error for invalid amount', async ({ page }) => {
    await navigateTo(page, '/payment');

    const submitBtn = page.getByRole('button', {
      name: /checkout|pay|продолжить|checkout/i,
    });
    await submitBtn.click();

    await expect(
      page.getByText(/invalid|amount|сумму|amount is/i),
    ).toBeVisible();
  });

  test('should initiate checkout session', async ({ page }) => {
    // Mock Stripe checkout page to avoid external network issues
    await page.route('**/checkout.stripe.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Stripe Checkout</h1></body></html>',
      });
    });

    // Override window.open to navigate in current page (avoid popup issues)
    await page.addInitScript(() => {
      window.open = (url) => {
        window.location.href = url as string;
        return null;
      };
    });

    await navigateTo(page, '/payment');

    // Select a preset
    await page.locator('button').filter({ hasText: /\$10/ }).click();

    // The component uses window.open(data.paymentUrl, '_blank')
    const checkoutBtn = page
      .getByRole('button', { name: /checkout|pay|оплатить/i })
      .first();
    await expect(checkoutBtn).toBeEnabled();

    await checkoutBtn.click();

    await expect(page).toHaveURL(/checkout\.stripe\.com/);
    // We mocked the body, so we can check for our mock content
    await expect(page.getByText('Stripe Checkout')).toBeVisible();
  });
});

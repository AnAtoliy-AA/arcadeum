import { expect } from '@playwright/test';
import { test, navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Profile Menu Modernization', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page, { role: 'admin' });
    await navigateTo(page, '/');
  });

  test('profile menu should open and display bold items', async ({
    page,
    viewport,
    browserName,
  }) => {
    test.skip(
      !!viewport && viewport.width < 768,
      'Profile menu is hidden on small screens',
    );
    const trigger = page.locator('[data-profile-menu] button').first();
    if (browserName === 'webkit') {
      await trigger.dispatchEvent('click');
    } else {
      await trigger.click();
    }

    const dropdown = page.locator('[data-profile-menu] > div').last();
    await dropdown.waitFor({ state: 'visible' });
    await expect(dropdown).toBeVisible();

    // Verify glassmorphism / dark background
    const backgroundColor = await dropdown.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // rgba(12, 14, 15, 0.98)
    expect(backgroundColor).toMatch(/rgba?\(12,\s*14,\s*15/);

    // Verify border radius
    const borderRadius = await dropdown.evaluate(
      (el) => window.getComputedStyle(el).borderRadius,
    );
    expect(borderRadius).toBe('20px'); // $5 radius is 20px

    // Verify links are visible
    const firstLink = page.getByTestId('header-admin-link');
    await expect(firstLink).toBeVisible();
  });

  test('admin link should be visible only for admins', async ({
    page,
    viewport,
    browserName,
  }) => {
    test.skip(
      !!viewport && viewport.width < 768,
      'Profile menu is hidden on small screens',
    );
    // Already logged in as admin in beforeEach
    const trigger = page.locator('[data-profile-menu] button').first();
    await expect(trigger).toBeVisible();
    if (browserName === 'webkit') {
      await trigger.dispatchEvent('click');
    } else {
      await trigger.click();
    }
    const dropdown = page.locator('[data-profile-menu] > div').last();
    await dropdown.waitFor({ state: 'visible' });
    const adminLink = page.getByTestId('header-admin-link');
    await adminLink.waitFor({ state: 'visible' });
    await expect(adminLink).toBeVisible();

    // Now mock as a regular user
    await mockSession(page, { role: 'free' });
    // navigateTo waits on the hydration markers — page.reload() does not,
    // so the profile-menu trigger (gated on displayName from the rehydrated
    // session) wasn't guaranteed to be in the DOM by the time we clicked.
    await navigateTo(page, '/');
    const triggerAfter = page.locator('[data-profile-menu] button').first();
    await expect(triggerAfter).toBeVisible();
    await triggerAfter.click();
    await expect(page.getByTestId('header-admin-link')).not.toBeVisible();
  });
});

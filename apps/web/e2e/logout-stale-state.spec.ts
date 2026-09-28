import { expect } from '@playwright/test';
import { test, navigateTo, mockSession } from './fixtures/test-utils';

test.describe('Logout stale state', () => {
  test('header shows guest identity after logout, not previous user', async ({
    page,
    viewport,
  }) => {
    test.skip(!!viewport && viewport.width < 768, 'Desktop-only test');

    await mockSession(page, {
      displayName: 'PrevUser',
      role: 'free',
      persistent: false,
    });
    await page.addInitScript(() => {
      window.isPlaywright = true;
    });
    await page.route('**/auth/logout', async (route) => {
      await route.fulfill({ status: 200, body: '{}' });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({ status: 401, body: '{}' });
    });

    await navigateTo(page, '/');

    const usernameChip = page.getByTestId('header-username');
    await expect(usernameChip).toBeVisible();
    await expect(usernameChip).toContainText('PrevUser');

    await page.evaluate(() => {
      window.localStorage.removeItem('web_session_tokens_v1');
      window.localStorage.removeItem('arcadeum_anon_id');
      document.cookie = 'access_token=; path=/; max-age=0';
      document.cookie = 'web_access_token=; path=/; max-age=0';
      document.cookie = 'refresh_token=; path=/; max-age=0';
      document.cookie = 'web_refresh_token=; path=/; max-age=0';
    });
    await page.context().clearCookies();

    await navigateTo(page, '/');

    await expect(usernameChip).not.toContainText('PrevUser');
    await expect(usernameChip).toContainText(/Guest/);

    const trigger = page.locator('[data-profile-menu] button').first();
    await trigger.click();

    const logoutButton = page.getByTestId('desktop-logout-button');
    await expect(logoutButton).not.toBeVisible();

    const loginLink = page.getByTestId('profile-login-link');
    await expect(loginLink).toBeVisible();
  });

  test('header avatar uses default fallback after logout', async ({
    page,
    viewport,
  }) => {
    test.skip(!!viewport && viewport.width < 768, 'Desktop-only test');

    await mockSession(page, {
      displayName: 'AvatarUser',
      role: 'free',
      persistent: false,
    });
    await page.addInitScript(() => {
      window.isPlaywright = true;
    });
    await page.route('**/auth/logout', async (route) => {
      await route.fulfill({ status: 200, body: '{}' });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({ status: 401, body: '{}' });
    });

    await navigateTo(page, '/');
    await expect(page.getByTestId('header-equipped-avatar')).toBeVisible();

    await page.evaluate(() => {
      window.localStorage.removeItem('web_session_tokens_v1');
      document.cookie = 'access_token=; path=/; max-age=0';
      document.cookie = 'web_access_token=; path=/; max-age=0';
      document.cookie = 'refresh_token=; path=/; max-age=0';
      document.cookie = 'web_refresh_token=; path=/; max-age=0';
    });
    await page.context().clearCookies();
    await navigateTo(page, '/');

    const avatar = page.getByTestId('header-equipped-avatar');
    await expect(avatar).toBeVisible();
    const src = await avatar.evaluate((el) => {
      const img = el.querySelector('img');
      if (img?.src) return img.src;
      const sprite = el.querySelector('[data-avatar-url]');
      if (sprite) return sprite.getAttribute('data-avatar-url') ?? '';
      const disc = el.querySelector('[data-testid$="-disc"]');
      if (disc) return disc.getAttribute('data-avatar-url') ?? '';
      return el.getAttribute('data-avatar-url') ?? '';
    });
    expect(src).toMatch(/default/);
  });

  test('socket auth token is null after logout so anonymous room join carries no previous identity', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.isPlaywright = true;
    });

    await page.addInitScript(() => {
      if (window.sessionStorage.getItem('__test_session_seeded')) return;
      window.sessionStorage.setItem('__test_session_seeded', 'true');
      const snap = {
        provider: 'local',
        accessToken: 'prev-token',
        refreshToken: 'prev-refresh',
        tokenType: 'Bearer',
        accessTokenExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        refreshTokenExpiresAt: new Date(Date.now() + 86_400_000).toISOString(),
        updatedAt: new Date().toISOString(),
        userId: '507f191e810c19729de860ea',
        email: 'prev@example.com',
        username: 'prevuser',
        displayName: 'PrevUser',
        role: null,
        xp: 0,
        level: 1,
        prestige: 0,
        equippedAvatarId: null,
        equippedBadgeId: null,
        equippedNameColorId: null,
        equippedFrameId: null,
        equippedAuraId: null,
        equippedBannerId: null,
        equippedGameSkinId: null,
      };
      window.localStorage.setItem(
        'web_session_tokens_v1',
        JSON.stringify({ state: { snapshot: snap }, version: 0 }),
      );
    });

    await page.route('**/auth/logout', async (route) => {
      await route.fulfill({ status: 200, body: '{}' });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({ status: 401, body: '{}' });
    });

    await navigateTo(page, '/');

    await page.evaluate(() => {
      window.localStorage.removeItem('web_session_tokens_v1');
    });

    await navigateTo(page, '/');

    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const gs = window.gameSocket as
            { auth?: Record<string, unknown> } | undefined;
          return (gs?.auth as Record<string, unknown> | null)?.token ?? null;
        });
      })
      .toBeNull();
  });
});

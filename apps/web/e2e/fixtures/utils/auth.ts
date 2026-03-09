import { type Page } from '@playwright/test';

export const MOCK_OBJECT_ID = '507f191e810c19729de860ea';

export interface MockSessionOptions {
  persistent?: boolean;
}

export async function mockSession(
  page: Page,
  options: MockSessionOptions = {},
): Promise<void> {
  const { persistent = true } = options;
  const snapshot = {
    provider: 'local',
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    tokenType: 'Bearer',
    accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    refreshTokenExpiresAt: new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString(),
    updatedAt: new Date().toISOString(),
    userId: MOCK_OBJECT_ID,
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    role: null,
  };

  const setSession = (s: typeof snapshot) => {
    window.localStorage.setItem(
      'web_session_tokens_v1',
      JSON.stringify({ state: { snapshot: s }, version: 0 }),
    );
  };

  if (persistent) {
    await page.addInitScript(setSession, snapshot);
  } else {
    // For non-persistent session (e.g. testing logout), we set it once
    // and use a secure cookie to track that it was already initialized
    // across reloads within the same session.
    await page.addInitScript((s) => {
      // Use a cookie to survive the logout redirect reload more reliably than sessionStorage in some CI environments
      if (!document.cookie.includes('__arcadeum_session_mocked=true')) {
        window.localStorage.setItem(
          'web_session_tokens_v1',
          JSON.stringify({ state: { snapshot: s }, version: 0 }),
        );
        document.cookie =
          '__arcadeum_session_mocked=true; path=/; max-age=3600';
      }
    }, snapshot);
  }

  // Mock auth check
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: MOCK_OBJECT_ID,
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
        },
      }),
    });
  });

  // Mock profile
  await page.route('**/profile/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        profile: {
          userId: MOCK_OBJECT_ID,
          email: snapshot.email,
          username: snapshot.username,
          displayName: snapshot.displayName,
          stats: { wins: 10, totalGames: 20 },
        },
      }),
    });
  });
}

/**
 * Mocks additional data required for the settings page to prevent 401 noise
 * and provide necessary context (referrals, blocked users).
 */
export async function mockSettingsExtraData(page: Page): Promise<void> {
  await page.route('**/referrals/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        referralCode: 'TESTCODE',
        totalReferrals: 0,
        rewards: [],
        tiers: [],
        nextTier: { requiredInvites: 5, remaining: 5 },
      }),
    });
  });

  await page.route('**/referrals/code', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ referralCode: 'TESTCODE' }),
    });
  });

  await page.route('**/auth/blocked', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

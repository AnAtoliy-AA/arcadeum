import { type Page } from '@playwright/test';
import { handleRoute } from './network';

export interface MockSessionOptions {
  persistent?: boolean;
  role?:
    | 'free'
    | 'admin'
    | 'developer'
    | 'moderator'
    | 'tester'
    | 'premium'
    | 'vip'
    | 'supporter'
    | null;
}

export const MOCK_OBJECT_ID = '507f191e810c19729de860ea';

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
    role: options.role ?? null,
  };

  const setSession = (s: typeof snapshot) => {
    window.localStorage.setItem(
      'web_session_tokens_v1',
      JSON.stringify({ state: { snapshot: s }, version: 0 }),
    );
    // Also set cookie for server-side detection during hydration/SSR
    document.cookie = `web_access_token=${s.accessToken}; path=/; max-age=3600; SameSite=Lax`;
    document.cookie = `web_refresh_token=${s.refreshToken}; path=/; max-age=3600; SameSite=Lax`;
  };

  if (persistent) {
    await page.addInitScript(setSession, snapshot);
  } else {
    await page.addInitScript((s) => {
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
    await handleRoute(route, {
      user: {
        id: MOCK_OBJECT_ID,
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        role: options.role ?? 'free',
      },
    });
  });

  // Mock profile
  await page.route('**/profile/**', async (route) => {
    await handleRoute(route, {
      profile: {
        userId: MOCK_OBJECT_ID,
        email: snapshot.email,
        username: snapshot.username,
        displayName: snapshot.displayName,
        stats: { wins: 10, totalGames: 20 },
      },
    });
  });
}

/**
 * Mocks additional data required for the settings page to prevent 401 noise
 * and provide necessary context (referrals, blocked users).
 */
export async function mockSettingsExtraData(page: Page): Promise<void> {
  await page.route('**/referrals/stats', async (route) => {
    await handleRoute(route, {
      referralCode: 'TESTCODE',
      totalReferrals: 0,
      rewards: [],
      tiers: [],
      nextTier: { requiredInvites: 5, remaining: 5 },
    });
  });

  await page.route('**/referrals/code', async (route) => {
    await handleRoute(route, { referralCode: 'TESTCODE' });
  });

  await page.route('**/auth/blocked', async (route) => {
    await handleRoute(route, []);
  });
}

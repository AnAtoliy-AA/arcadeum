import type { APIRequestContext, Page } from '@playwright/test';

const PASSWORD = 'Passw0rd!Test1';
const API_HEADERS = {
  'content-type': 'application/json',
  'x-requested-with': 'XMLHttpRequest',
};

export interface RealUser {
  id: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  id: string;
}

export function beUrl(): string {
  return `http://127.0.0.1:${process.env.BE_PORT ?? '4000'}`;
}

/** Registers and logs in a real user against the e2e backend. */
export async function createRealUser(
  request: APIRequestContext,
  prefix: string,
): Promise<RealUser> {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const username = `${prefix}${suffix}`.slice(0, 24);
  const email = `${username}@example.com`;
  const registered = await request.post(`${beUrl()}/auth/register`, {
    headers: API_HEADERS,
    data: { email, username, password: PASSWORD },
  });
  if (!registered.ok()) {
    throw new Error(`register failed: ${registered.status()}`);
  }
  const { id } = (await registered.json()) as RegisterResponse;
  const login = await request.post(`${beUrl()}/auth/login`, {
    headers: API_HEADERS,
    data: { email, password: PASSWORD },
  });
  if (!login.ok()) throw new Error(`login failed: ${login.status()}`);
  const tokens = (await login.json()) as LoginResponse;
  return {
    id,
    username,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/** Installs a real session (tokens issued by the backend) before page load. */
export async function useRealSession(
  page: Page,
  user: RealUser,
): Promise<void> {
  const snapshot = {
    provider: 'local',
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    tokenType: 'Bearer',
    accessTokenExpiresAt: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
    refreshTokenExpiresAt: new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString(),
    updatedAt: new Date().toISOString(),
    userId: user.id,
    email: `${user.username}@example.com`,
    username: user.username,
    displayName: user.username,
    role: 'free',
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
  await page.addInitScript((s) => {
    // Only seed once so an in-test sign-out is not undone by a reload.
    if (window.sessionStorage.getItem('qa_session_seeded')) return;
    window.sessionStorage.setItem('qa_session_seeded', '1');
    window.localStorage.setItem(
      'web_session_tokens_v1',
      JSON.stringify({ state: { snapshot: s }, version: 0 }),
    );
    document.cookie = `access_token=${s.accessToken}; path=/; max-age=900; SameSite=Lax`;
    document.cookie = `web_access_token=${s.accessToken}; path=/; max-age=900; SameSite=Lax`;
    document.cookie = `refresh_token=${s.refreshToken}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `web_refresh_token=${s.refreshToken}; path=/; max-age=86400; SameSite=Lax`;
  }, snapshot);
}

export interface ServerCollection {
  revision: number;
  pets: { id: string; name: string; species: string; stage: string }[];
  gemBalance: number;
  coinBalance: number;
  homeCapacity: number;
  isAtHome: boolean;
  dailyStreak: number;
  presents: { id: string; isOpened: boolean; senderName: string }[];
  claimedMilestones: string[];
}

export async function fetchServerCollection(
  request: APIRequestContext,
  user: RealUser,
): Promise<ServerCollection> {
  const res = await request.get(`${beUrl()}/arcade-pet/collection`, {
    headers: { authorization: `Bearer ${user.accessToken}` },
  });
  return (await res.json()) as ServerCollection;
}

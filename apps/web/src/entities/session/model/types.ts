/** Available user roles */
export const USER_ROLES = [
  'free',
  'premium',
  'vip',
  'supporter',
  'moderator',
  'tester',
  'developer',
  'admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type SessionProviderId = 'oauth' | 'local' | null;

export type SessionTokensSnapshot = {
  provider: SessionProviderId;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  updatedAt: string | null;
  userId: string | null;
  email: string | null;
  username: string | null;
  displayName: string | null;
  role: UserRole | null;
};

export type SetSessionTokensInput = {
  provider?: SessionProviderId;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  accessTokenExpiresAt?: string | Date | null;
  refreshTokenExpiresAt?: string | Date | null;
  userId?: string | null;
  email?: string | null;
  username?: string | null;
  displayName?: string | null;
  role?: UserRole | null;
};

export type LocalAuthMode = 'login' | 'register';

export type LocalAuthState = {
  mode: LocalAuthMode;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  email: string | null;
  username: string | null;
  displayName: string | null;
};

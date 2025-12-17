/**
 * Shared types and interfaces for the auth module.
 */

/**
 * OIDC discovery document shape.
 */
export interface OidcDiscoveryDoc {
  token_endpoint?: string;
}

/**
 * OAuth token exchange response.
 */
export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
  scope?: string;
  expiresIn?: number;
}

/**
 * Public user profile returned from auth operations.
 */
export interface AuthUserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  createdAt?: Date;
}

/**
 * Google-specific user profile from OAuth.
 */
export interface GoogleUserProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  audience?: string;
}

/**
 * Full auth response with tokens and user profile.
 */
export interface AuthTokensResponse {
  accessToken: string;
  accessTokenExpiresAt: Date | null;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: AuthUserProfile;
}

/**
 * OAuth web client configuration.
 */
export interface WebClientConfig {
  id: string;
  secret: string;
  redirectUris: string[];
  allowedOrigins: string[];
}

/**
 * Parsed redirect URI entry.
 */
export interface ParsedRedirectEntry {
  exact?: string;
  origin?: string;
}

/**
 * Issued refresh token result.
 */
export interface IssuedRefreshToken {
  token: string;
  expiresAt: Date;
  id: string;
}

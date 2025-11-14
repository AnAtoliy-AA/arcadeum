const DEFAULT_ISSUER = "https://accounts.google.com";
const DEFAULT_SCOPES = ["openid", "profile", "email"] as const;

function sanitize(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export type WebAuthConfig = {
  issuer: string;
  clientId?: string;
  redirectUri?: string;
  scopes: readonly string[];
};

const issuerFromEnv = sanitize(process.env.NEXT_PUBLIC_AUTH_ISSUER);
const clientIdFromEnv = sanitize(process.env.NEXT_PUBLIC_AUTH_WEB_CLIENT_ID);
const redirectUriFromEnv = sanitize(process.env.NEXT_PUBLIC_AUTH_WEB_REDIRECT_URL);
const scopesFromEnv = sanitize(process.env.NEXT_PUBLIC_AUTH_SCOPES);

export const authConfig: WebAuthConfig = {
  issuer: issuerFromEnv ?? DEFAULT_ISSUER,
  clientId: clientIdFromEnv,
  redirectUri: redirectUriFromEnv,
  scopes: scopesFromEnv ? scopesFromEnv.split(/[,\s]+/).filter(Boolean) : DEFAULT_SCOPES,
};

export function resolveAuthRedirectUri(): string | undefined {
  if (authConfig.redirectUri) {
    return authConfig.redirectUri;
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  const url = new URL(window.location.href);
  url.pathname = "/auth/callback";
  url.search = "";
  url.hash = "";
  return url.toString();
}

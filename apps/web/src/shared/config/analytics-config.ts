// Analytics provider configuration (roadmap 6C). Everything is env-gated so a
// deployment without analytics env vars ships zero third-party scripts.
// Follows the read-once pattern from app-config.ts; NEXT_PUBLIC_ vars are
// inlined at build time, which also drives the CSP additions in next.config.ts.

export type AnalyticsProviderName = 'plausible' | 'posthog' | 'none';

type AnalyticsConfig = {
  provider: AnalyticsProviderName;
  plausibleDomain?: string;
  plausibleApiHost: string;
  posthogKey?: string;
  posthogHost: string;
  enabled: boolean;
};

function trim(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readProvider(raw: string | undefined): AnalyticsProviderName {
  const normalized = trim(raw)?.toLowerCase();
  if (normalized === 'plausible') return 'plausible';
  if (normalized === 'posthog') return 'posthog';
  return 'none';
}

function readAnalyticsConfig(): AnalyticsConfig {
  const provider = readProvider(process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER);

  const plausibleDomain = trim(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN);
  const plausibleApiHost =
    trim(process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST) ?? 'https://plausible.io';

  const posthogKey = trim(process.env.NEXT_PUBLIC_POSTHOG_KEY);
  const posthogHost =
    trim(process.env.NEXT_PUBLIC_POSTHOG_HOST) ?? 'https://us.i.posthog.com';

  const enabled =
    (provider === 'plausible' && !!plausibleDomain) ||
    (provider === 'posthog' && !!posthogKey);

  return {
    provider,
    plausibleDomain,
    plausibleApiHost,
    posthogKey,
    posthogHost,
    enabled,
  };
}

export const analyticsConfig = readAnalyticsConfig();

import { useEffect, useMemo } from 'react';
import { type Href, usePathname, useRouter } from 'expo-router';
import { platform } from '@/constants/platform';
import { useSessionTokens } from '@/stores/sessionTokens';

export interface SessionRedirectOptions {
  whenAuthenticated?: Href;
  whenUnauthenticated?: Href;
  enableOn?: ('ios' | 'android' | 'web')[];
}

export function useSessionRedirect(options: SessionRedirectOptions) {
  const { tokens, hydrated } = useSessionTokens();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = Boolean(tokens.accessToken);
  const redirectEnabled = useMemo(() => {
    const enabledPlatforms = options.enableOn ?? DEFAULT_ENABLED_PLATFORMS;
    return enabledPlatforms.includes(resolveRedirectPlatform());
  }, [options.enableOn]);
  const redirectAuthenticatedHref = options.whenAuthenticated;
  const redirectAuthenticatedPath = useMemo(
    () => normalizeHref(options.whenAuthenticated),
    [options.whenAuthenticated],
  );
  const redirectUnauthenticatedHref = options.whenUnauthenticated;
  const redirectUnauthenticatedPath = useMemo(
    () => normalizeHref(options.whenUnauthenticated),
    [options.whenUnauthenticated],
  );

  useEffect(() => {
    if (!hydrated || !redirectEnabled) return;

    if (
      redirectAuthenticatedHref &&
      redirectAuthenticatedPath &&
      isAuthenticated
    ) {
      if (!pathname.startsWith(redirectAuthenticatedPath)) {
        router.replace(redirectAuthenticatedHref);
      }
      return;
    }

    if (
      redirectUnauthenticatedHref &&
      redirectUnauthenticatedPath &&
      !isAuthenticated
    ) {
      if (!pathname.startsWith(redirectUnauthenticatedPath)) {
        router.replace(redirectUnauthenticatedHref);
      }
    }
  }, [
    hydrated,
    isAuthenticated,
    redirectEnabled,
    redirectAuthenticatedHref,
    redirectAuthenticatedPath,
    redirectUnauthenticatedHref,
    redirectUnauthenticatedPath,
    pathname,
    router,
  ]);

  return { tokens, hydrated, isAuthenticated, redirectEnabled };
}

function normalizeHref(href?: Href): string | undefined {
  if (!href) return undefined;
  if (typeof href === 'string') return href;
  if (typeof href === 'object' && 'pathname' in href) {
    const maybe = href.pathname;
    if (typeof maybe === 'string') return maybe;
  }
  return undefined;
}

const DEFAULT_ENABLED_PLATFORMS: ('ios' | 'android' | 'web')[] = [
  'ios',
  'android',
  'web',
];

function resolveRedirectPlatform(): 'ios' | 'android' | 'web' {
  if (platform.isIos) return 'ios';
  if (platform.isAndroid) return 'android';
  return 'web';
}

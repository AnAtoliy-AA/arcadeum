import { useMemo } from 'react';
import {
  useSessionRedirect,
  SessionRedirectOptions,
} from '@/hooks/useSessionRedirect';

export interface SessionScreenGateOptions extends SessionRedirectOptions {
  blockWhenAuthenticated?: boolean;
  blockWhenUnauthenticated?: boolean;
}

export function useSessionScreenGate(options: SessionScreenGateOptions) {
  const redirect = useSessionRedirect(options);
  const { hydrated, redirectEnabled, isAuthenticated } = redirect;
  const { blockWhenAuthenticated, blockWhenUnauthenticated } = options;

  const shouldBlock = useMemo(() => {
    if (!hydrated) {
      return true;
    }

    if (!redirectEnabled) {
      return false;
    }

    const shouldBlockAuthenticated = Boolean(
      blockWhenAuthenticated && isAuthenticated,
    );
    const shouldBlockUnauthenticated = Boolean(
      blockWhenUnauthenticated && !isAuthenticated,
    );

    return shouldBlockAuthenticated || shouldBlockUnauthenticated;
  }, [
    hydrated,
    redirectEnabled,
    isAuthenticated,
    blockWhenAuthenticated,
    blockWhenUnauthenticated,
  ]);

  return {
    ...redirect,
    shouldBlock,
  };
}

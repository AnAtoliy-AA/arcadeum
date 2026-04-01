import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

export function useHeaderAuth(): {
  isAuthenticated: boolean;
  displayName: string | undefined;
} {
  const { snapshot } = useSessionTokens();
  const isAuthenticated = !!snapshot.accessToken;
  // `|| undefined` normalises null (when all three fields are null) to undefined,
  // matching the return type. Both null and undefined are falsy; no behavior change
  // for consumers that use `displayName && ...`.
  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email || undefined;
  return { isAuthenticated, displayName };
}

import { fetchProfile } from '@/entities/session/api/authApi';
import { useSessionStore } from '@/entities/session/store/sessionStore';

/**
 * Re-reads the current user's profile and updates the session snapshot's
 * xp/level. Call after XP-changing events (game end, reward claim); the
 * snapshot is otherwise only refreshed on app mount. Never throws.
 */
export async function refreshSessionXp(): Promise<void> {
  const { snapshot, setTokens } = useSessionStore.getState();
  if (!snapshot.accessToken) return;
  try {
    const profile = await fetchProfile(snapshot.accessToken);
    if (typeof profile.xp !== 'number') return;
    if (profile.xp === snapshot.xp) return;
    await setTokens({ xp: profile.xp });
  } catch {
    // Best effort: a failed refresh must never break the game/result UI.
  }
}

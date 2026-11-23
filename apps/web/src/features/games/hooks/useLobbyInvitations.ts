import { useCallback, useState } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';

export interface UseLobbyInvitationsResult {
  /** User ids with an invite action in flight. */
  busyIds: ReadonlySet<string>;
  /** True when the last cancel/resend request failed. */
  failed: boolean;
  resend: (userIds: string[]) => Promise<void>;
  cancel: (userIds: string[]) => Promise<void>;
}

/** Host actions on pending lobby invitations: resend (re-notify) and cancel. */
export function useLobbyInvitations(roomId: string): UseLobbyInvitationsResult {
  const { snapshot } = useSessionTokens();
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  const [failed, setFailed] = useState(false);

  const run = useCallback(
    async (
      userIds: string[],
      call: (ids: string[], token: string) => Promise<void>,
    ) => {
      if (!snapshot.accessToken) return;
      setFailed(false);
      setBusyIds((prev) => new Set([...prev, ...userIds]));
      try {
        await call(userIds, snapshot.accessToken);
      } catch {
        setFailed(true);
      } finally {
        setBusyIds((prev) => {
          const next = new Set(prev);
          userIds.forEach((id) => next.delete(id));
          return next;
        });
      }
    },
    [snapshot.accessToken],
  );

  const resend = useCallback(
    (userIds: string[]) =>
      run(userIds, (ids, token) =>
        gamesApi.invitePlayers(roomId, ids, { token }),
      ),
    [run, roomId],
  );
  const cancel = useCallback(
    (userIds: string[]) =>
      run(userIds, (ids, token) =>
        gamesApi.revokeInvitations(roomId, ids, { token }),
      ),
    [run, roomId],
  );

  return { busyIds, failed, resend, cancel };
}

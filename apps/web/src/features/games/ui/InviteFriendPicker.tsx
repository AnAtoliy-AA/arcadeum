'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getFriends, type Friend } from '@/shared/api/friends';
import { gamesApi } from '@/features/games/api';
import { Button, Spinner } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';

interface InviteFriendPickerProps {
  roomId: string;
  onInvited?: () => void;
}

export function InviteFriendPicker({
  roomId,
  onInvited,
}: InviteFriendPickerProps) {
  const { snapshot } = useSessionTokens();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!snapshot.accessToken) return;
    let cancelled = false;
    getFriends(snapshot.accessToken)
      .then((data) => {
        if (!cancelled) setFriends(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [snapshot.accessToken]);

  const handleInvite = useCallback(
    async (friend: Friend) => {
      if (!snapshot.accessToken) return;
      setInvitingId(friend.userId);
      try {
        await gamesApi.invitePlayers(roomId, [friend.userId], {
          token: snapshot.accessToken,
        });
        setInvited((prev) => new Set(prev).add(friend.userId));
        onInvited?.();
      } catch {
        // Non-critical
      } finally {
        setInvitingId(null);
      }
    },
    [snapshot.accessToken, roomId, onInvited],
  );

  if (!open) {
    return (
      <Button
        variant="glass"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full mt-2"
        data-testid="invite-friend-button"
      >
        👥 Invite Friend
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex flex-row items-center justify-between">
        <span className="text-[12px] font-semibold text-[var(--textSecondary)]">
          Invite Friend
        </span>
        <button
          type="button"
          className="text-[12px] text-[var(--textSecondary)] hover:text-[var(--color)]"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center p-2">
          <Spinner size="sm" />
        </div>
      ) : friends.length === 0 ? (
        <span className="text-[12px] text-[var(--textSecondary)] p-2">
          No friends to invite
        </span>
      ) : (
        <div className="flex flex-col gap-1 max-h-[200px] overflow-auto">
          {friends.map((friend) => (
            <button
              key={friend.userId}
              type="button"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--glassBg)] transition-colors text-left disabled:opacity-50"
              onClick={() => handleInvite(friend)}
              disabled={
                invitingId === friend.userId || invited.has(friend.userId)
              }
              data-testid={`invite-friend-${friend.userId}`}
            >
              <EquippedPlayerAvatar
                name={friend.displayName || friend.username}
                equippedAvatarId={friend.equippedAvatarId}
                equippedBadgeId={null}
                size="sm"
              />
              <span className="text-[13px] flex-1 truncate">
                {friend.displayName || friend.username}
              </span>
              {invited.has(friend.userId) ? (
                <span className="text-[11px] text-[var(--success)]">
                  ✓ Sent
                </span>
              ) : invitingId === friend.userId ? (
                <Spinner size="sm" />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

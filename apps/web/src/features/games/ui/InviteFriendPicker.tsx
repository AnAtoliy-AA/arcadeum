'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getFriends, type Friend } from '@/shared/api/friends';
import { gamesApi } from '@/features/games/api';
import { Button, Spinner, Input } from '@arcadeum/ui';
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
  const [inviting, setInviting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const q = searchQuery.toLowerCase();
    return friends.filter(
      (f) =>
        f.displayName?.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q),
    );
  }, [friends, searchQuery]);

  const toggleSelect = useCallback((userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const available = filteredFriends.filter((f) => !invited.has(f.userId));
      if (prev.size === available.length) {
        return new Set();
      }
      return new Set(available.map((f) => f.userId));
    });
  }, [filteredFriends, invited]);

  const handleInvite = useCallback(async () => {
    if (!snapshot.accessToken || selected.size === 0) return;
    setInviting(true);
    try {
      await gamesApi.invitePlayers(roomId, Array.from(selected), {
        token: snapshot.accessToken,
      });
      setInvited((prev) => {
        const next = new Set(prev);
        for (const id of selected) next.add(id);
        return next;
      });
      setSelected(new Set());
      onInvited?.();
    } catch {
      // Non-critical
    } finally {
      setInviting(false);
    }
  }, [snapshot.accessToken, roomId, selected, onInvited]);

  const availableCount = filteredFriends.filter(
    (f) => !invited.has(f.userId),
  ).length;
  const allSelected = availableCount > 0 && selected.size === availableCount;

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
          onClick={() => {
            setOpen(false);
            setSearchQuery('');
            setSelected(new Set());
          }}
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
        <>
          <Input
            size="sm"
            type="search"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            aria-label="Search friends"
            data-testid="invite-friend-search"
          />

          {filteredFriends.length > 0 && (
            <button
              type="button"
              className="flex items-center gap-2 px-2 py-1 text-[12px] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors"
              onClick={toggleAll}
              data-testid="invite-select-all"
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                  allSelected
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                    : 'border-[var(--borderColor)]'
                }`}
              >
                {allSelected ? '✓' : ''}
              </span>
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
          )}

          <div className="flex flex-col gap-1 max-h-[200px] overflow-auto">
            {filteredFriends.length === 0 ? (
              <span className="text-[12px] text-[var(--textSecondary)] p-2 text-center">
                No friends found
              </span>
            ) : (
              filteredFriends.map((friend) => {
                const isInvited = invited.has(friend.userId);
                const isSelected = selected.has(friend.userId);
                return (
                  <button
                    key={friend.userId}
                    type="button"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--glassBg)] transition-colors text-left disabled:opacity-50"
                    onClick={() => !isInvited && toggleSelect(friend.userId)}
                    disabled={isInvited}
                    data-testid={`invite-friend-${friend.userId}`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                        isSelected
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'border-[var(--borderColor)]'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <EquippedPlayerAvatar
                      name={friend.displayName || friend.username}
                      equippedAvatarId={friend.equippedAvatarId}
                      equippedBadgeId={null}
                      size="sm"
                    />
                    <span className="text-[13px] flex-1 truncate">
                      {friend.displayName || friend.username}
                    </span>
                    {isInvited && (
                      <span className="text-[11px] text-[var(--success)]">
                        ✓ Sent
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {selected.size > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleInvite}
              disabled={inviting}
              className="w-full"
              data-testid="invite-selected-button"
            >
              {inviting ? (
                <Spinner size="sm" />
              ) : (
                `Invite ${selected.size} friend${selected.size > 1 ? 's' : ''}`
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

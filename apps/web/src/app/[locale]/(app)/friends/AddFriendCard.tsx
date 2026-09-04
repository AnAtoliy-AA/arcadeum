'use client';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Button, Card, Input } from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  sendFriendRequest,
  searchUsers,
  type UserSearchResult,
} from '@/shared/api/friends';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import { UserIcon } from '@arcadeum/ui/components/Icons/index';

interface AddFriendCardTranslations {
  label?: string;
  placeholder?: string;
  button?: string;
  sending?: string;
  noResults?: string;
}

interface AddFriendCardProps {
  tt?: AddFriendCardTranslations;
  onSent?: () => void;
}

export function AddFriendCard({ tt, onSent }: AddFriendCardProps) {
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken;
  const [username, setUsername] = useState('');
  const [sending, setSending] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(username, 300);

  useEffect(() => {
    if (!token || !debouncedQuery.trim()) return;
    let cancelled = false;
    searchUsers(token, debouncedQuery)
      .then((results) => {
        if (!cancelled)
          setSearchResults(results.filter((u) => u.id !== snapshot.userId));
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token, debouncedQuery, snapshot.userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendRequest = useCallback(
    async (targetUsername?: string) => {
      const value = targetUsername ?? username.trim();
      if (!token || !value) return;
      setSending(true);
      try {
        await sendFriendRequest(token, value);
        setUsername('');
        setShowDropdown(false);
        setSearchResults([]);
        onSent?.();
      } catch {
        // handled by parent
      } finally {
        setSending(false);
      }
    },
    [token, username, onSent],
  );

  const handleSelectUser = useCallback(
    (user: UserSearchResult) => {
      setUsername(user.username);
      setShowDropdown(false);
      void handleSendRequest(user.username);
    },
    [handleSendRequest],
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <Card variant="elevated">
        <div className="flex flex-col items-stretch gap-3">
          <span className="text-[16px] font-semibold text-[#94a3b8]">
            {tt?.label ?? 'Add Friend'}
          </span>
          <div className="flex flex-row gap-2 items-center">
            <Input
              className="flex-1"
              size="md"
              placeholder={tt?.placeholder ?? 'Enter username'}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (username.trim()) setShowDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSendRequest();
              }}
              data-testid="add-friend-input"
            />
            <Button
              variant="primary"
              onClick={() => void handleSendRequest()}
              disabled={sending || !username.trim()}
              icon={<UserIcon size={16} />}
              data-testid="add-friend-button"
            >
              {sending
                ? (tt?.sending ?? 'Sending…')
                : (tt?.button ?? 'Add Friend')}
            </Button>
          </div>
        </div>
      </Card>

      {showDropdown && username.trim() && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-[240px] overflow-auto rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] shadow-lg backdrop-blur-md">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-[14px] text-[var(--textSecondary)]">
              {tt?.noResults ?? 'No users found'}
            </div>
          ) : (
            searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--glassBg)] hover:opacity-80 border-b border-b-[var(--glassBorder)] last:border-b-0"
                onClick={() => handleSelectUser(user)}
                data-testid={`search-result-${user.id}`}
              >
                <EquippedPlayerAvatar
                  name={user.displayName || user.username}
                  equippedAvatarId={null}
                  equippedBadgeId={null}
                  size="sm"
                />
                <div className="flex flex-col items-stretch min-w-0">
                  <span className="text-[14px] font-semibold text-[var(--color)] truncate">
                    {user.displayName || user.username}
                  </span>
                  {user.displayName && (
                    <span className="text-[12px] text-[var(--textSecondary)] truncate">
                      @{user.username}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

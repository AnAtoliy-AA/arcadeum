'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@arcadeum/ui/components/Button/Button';

export interface PlayerShareActionsProps {
  playerId: string;
  playerName: string;
  isSelf?: boolean;
}

export function PlayerShareActions({
  playerId,
  playerName,
  isSelf = false,
}: PlayerShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        const url =
          window.location.href || `/players/${encodeURIComponent(playerId)}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      data-testid="player-share-actions"
      className="flex flex-wrap items-center gap-2 pt-2"
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopyLink}
        data-testid="share-profile-button"
        className="flex items-center gap-1.5"
      >
        <span>{copied ? '✓' : '🔗'}</span>
        <span>{copied ? 'Profile Link Copied!' : 'Share Profile'}</span>
      </Button>

      {isSelf ? (
        <>
          <Link href="/shop" data-testid="edit-cosmetics-link">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <span>🎨</span>
              <span>Customize Avatar</span>
            </Button>
          </Link>
          <Link href="/settings" data-testid="account-settings-link">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <span>⚙️</span>
              <span>Account Settings</span>
            </Button>
          </Link>
        </>
      ) : (
        <Link href="/games/create" data-testid="challenge-player-link">
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white hover:from-amber-400 hover:to-orange-500"
          >
            <span>⚔️</span>
            <span>Challenge {playerName}</span>
          </Button>
        </Link>
      )}
    </div>
  );
}

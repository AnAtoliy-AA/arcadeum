'use client';

import Image from 'next/image';
import type { Clan } from '../model/types';
import { Button } from '@arcadeum/ui';

interface ClanCardProps {
  clan: Clan;
  onJoin?: (clanId: string) => void;
  onClick?: (clanId: string) => void;
  showJoin?: boolean;
}

export function ClanCard({
  clan,
  onJoin,
  onClick,
  showJoin = true,
}: ClanCardProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] p-4 transition-colors hover:border-[var(--primary)]/30"
      onClick={() => onClick?.(clan.id)}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-lg font-bold text-[var(--primary)]">
        {clan.avatarUrl ? (
          <Image
            src={clan.avatarUrl}
            alt={clan.name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          clan.tag.slice(0, 2).toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold">{clan.name}</h3>
          <span className="rounded bg-[var(--primary)]/10 px-1.5 py-0.5 text-xs font-medium text-[var(--primary)]">
            [{clan.tag}]
          </span>
          {clan.visibility === 'private' && (
            <span className="text-xs text-[var(--foreground)]/50">Private</span>
          )}
        </div>
        <p className="text-sm text-[var(--foreground)]/60">
          {clan.memberCount} members · {clan.totalWins} wins
        </p>
      </div>

      {showJoin && onJoin && (
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onJoin(clan.id);
          }}
        >
          Join
        </Button>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import type { ActivityFeedItem as ActivityFeedItemType } from '@/shared/api/activity';

const GAME_ICONS: Record<string, string> = {
  chess_v1: '♟️',
  checkers_v1: '🔴',
  backgammon_v1: '🎲',
  go_v1: '⚫',
  hearts_v1: '♥️',
  spades_v1: '♠️',
  sea_battle_v1: '🚢',
  critical_v1: '🃏',
  tic_tac_toe_v1: '❌',
  minesweeper_v1: '💣',
  game_2048_v1: '🔢',
  solitaire_v1: '🂡',
  sudoku_v1: '🔢',
  cascade_v1: '🌊',
  glimworm_v1: '✨',
  cat_dash_v1: '🐱',
  pachisi_v1: '🎲',
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

interface ActivityItemProps {
  item: ActivityFeedItemType;
}

export function ActivityItem({ item }: ActivityItemProps) {
  const icon = GAME_ICONS[item.gameId] ?? '🎮';
  const gameSlug = item.gameId.replace(/_v\d+$/, '');

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
      <span className="text-lg">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px]">
          <span className="font-semibold">{item.displayName || 'Player'}</span>{' '}
          <span className="text-[var(--textSecondary)]">{item.detail}</span>{' '}
          {item.gameName && (
            <Link
              href={`/games/${gameSlug}`}
              className="font-medium text-[var(--color)] hover:underline"
            >
              {item.gameName}
            </Link>
          )}
        </p>
      </div>
      <span className="shrink-0 text-[11px] text-[var(--textSecondary)]">
        {formatRelativeTime(item.timestamp)}
      </span>
    </div>
  );
}

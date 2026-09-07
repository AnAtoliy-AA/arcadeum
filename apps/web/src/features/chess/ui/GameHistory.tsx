'use client';

import { useState, useEffect } from 'react';
import { GlassCard, Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface GameRecord {
  sessionId: string;
  result: 'won' | 'lost' | 'draw';
  opponent: string;
  timeControl: string;
  moves: number;
  timestamp: string;
}

interface GameHistoryProps {
  userId: string;
}

export function GameHistory({ userId }: GameHistoryProps) {
  const { t } = useTranslation();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/chess/profiles/${userId}/games?limit=20`);
        if (res.ok) {
          setGames(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="animate-pulse flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded bg-[var(--glassBg)]" />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (games.length === 0) {
    return (
      <GlassCard className="p-4">
        <Typography variant="body" uiSize="sm">
          {t('games.chess_v1.profile.noGames')}
        </Typography>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <Typography variant="label" uiSize="sm" className="mb-3">
        {t('games.chess_v1.profile.recentGames')}
      </Typography>
      <div className="flex flex-col gap-1">
        {games.map((game) => (
          <div
            key={game.sessionId}
            className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[var(--glassBgHover)]"
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold ${
                  game.result === 'won'
                    ? 'text-green-500'
                    : game.result === 'lost'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                }`}
              >
                {game.result === 'won' ? 'W' : game.result === 'lost' ? 'L' : 'D'}
              </span>
              <Typography variant="body" uiSize="sm">
                {game.opponent}
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              <Typography variant="caption" uiSize="xs">
                {game.timeControl}
              </Typography>
              <Typography variant="caption" uiSize="xs">
                {game.moves} moves
              </Typography>
              <Typography variant="caption" uiSize="xs" className="text-[var(--textMuted)]">
                {new Date(game.timestamp).toLocaleDateString()}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

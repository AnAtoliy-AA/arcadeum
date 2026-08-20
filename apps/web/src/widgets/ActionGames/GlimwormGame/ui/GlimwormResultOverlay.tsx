'use client';

import { useMemo, useState } from 'react';
import { useGlimwormStore } from '../store/glimwormStore';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import { useTranslation, type TranslationKey } from '@/shared/lib/useTranslation';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';

interface GlimwormResultOverlayProps {
  isHost: boolean;
  onRematch: () => void;
  onLobby?: () => void;
  theme?: string;
}

export function GlimwormResultOverlay({
  isHost,
  onRematch,
  onLobby,
  theme,
}: GlimwormResultOverlayProps): React.JSX.Element | null {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const snapshot = useGlimwormStore((s) => s.latestSnapshot);

  const self = snapshot?.worms.find((w) => w.self);
  const winnerWorm = snapshot?.winner
    ? snapshot.worms.find((w) => w.id === snapshot.winner)
    : null;

  const resultKind = useMemo(() => {
    if (!snapshot || snapshot.status !== 'ended') return null;
    if (snapshot.winner === null) return 'draw';
    return self && self.id === snapshot.winner ? 'victory' : 'defeat';
  }, [snapshot, self]);

  if (!snapshot || snapshot.status !== 'ended' || !resultKind) return null;

  const sortedWorms = [...snapshot.worms].sort((a, b) => b.score - a.score);

  const stats: GameResultStats = {
    score: self?.score ?? 0,
    customStats: [
      {
        id: 'worms-alive',
        label: 'Worms',
        value: snapshot.worms.length,
      },
      ...(winnerWorm
        ? [
            {
              id: 'winner',
              label: 'Winner',
              value: winnerWorm.self ? 'You' : winnerWorm.color,
            },
          ]
        : []),
    ],
  };

  const scoreboardContent = (
    <div className="flex w-full flex-col gap-1.5 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 p-2">
      {sortedWorms.map((w, i) => {
        const isSelf = !!w.self;
        return (
          <div
            key={w.id}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
              isSelf
                ? 'bg-emerald-500/15 font-semibold text-emerald-300'
                : 'text-slate-300'
            }`}
          >
            <span className="w-5 text-xs text-slate-400 tabular-nums">
              {i + 1}.
            </span>
            <span className="h-3 w-3 rounded-full border border-white/30 bg-cyan-400 shadow-sm" />
            <span className="flex-1 truncate">{isSelf ? 'You' : w.color}</span>
            <span className="font-bold tabular-nums text-cyan-300">
              {w.score}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <GameResultModal
      isOpen={isOpen}
      result={resultKind}
      gameName={(() => {
        const raw = t('games.names.glimworm' as TranslationKey);
        return raw && raw !== 'games.names.glimworm' ? raw : 'Glimworm';
      })()}
      onClose={() => {
        setIsOpen(false);
        onLobby?.();
      }}
      onRematch={isHost ? onRematch : undefined}
      t={t}
      theme={theme}
      stats={stats}
      messages={{
        title:
          resultKind === 'victory'
            ? 'Victory!'
            : resultKind === 'draw'
              ? 'Tie Game!'
              : 'Defeated!',
        message:
          resultKind === 'victory'
            ? 'You outlasted the field in Glimworm.'
            : winnerWorm
              ? `${winnerWorm.color} worm took the victory.`
              : 'Round completed.',
      }}
      analysis={{
        content: scoreboardContent,
        viewLabel: 'View Match Standings',
        backLabel: 'Hide Standings',
      }}
    />
  );
}

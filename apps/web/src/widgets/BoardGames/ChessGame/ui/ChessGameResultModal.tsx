'use client';

import { useEffect, useRef } from 'react';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import { PostGameAnalysis } from '@/features/analysis/ui/PostGameAnalysis';
import type { GameResultStats } from '@/features/games/ui/GameResultStatsGrid';
import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { ChessClientState } from '../types';
import type { SharedResult } from '@/features/games/hooks/useGameResultModal';

interface ChessGameResultModalProps {
  isOpen: boolean;
  result: SharedResult;
  onClose?: () => void;
  onRematch?: () => void;
  rematchLoading?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  messages?: { title: string; message: string };
  snapshot: ChessClientState | null;
  theme?: GameTheme | string;
  stats?: GameResultStats;
}

export function ChessGameResultModal({
  isOpen,
  result,
  onClose,
  onRematch,
  rematchLoading,
  t,
  messages,
  snapshot,
  theme,
  stats,
}: ChessGameResultModalProps) {
  const computedStats: GameResultStats | undefined =
    stats ??
    (snapshot
      ? {
          turns: snapshot.moveHistory.length,
        }
      : undefined);

  const rawName = t('games.names.chess' as TranslationKey);
  const resolvedGameName =
    rawName && rawName !== 'games.names.chess' ? rawName : 'Chess';

  // Post-game achievement sweep — fires once per open, enqueues any
  // newly unlocked achievements into the global popup store.
  const achievementsCheckedRef = useRef(false);
  useEffect(() => {
    if (!isOpen || achievementsCheckedRef.current) return;
    achievementsCheckedRef.current = true;
    import('@/features/achievements/actions')
      .then((m) => m.checkNewlyUnlockedAchievements())
      .then(async (items) => {
        if (items.length === 0) return;
        const { useAchievementsPopupStore } =
          await import('@/features/achievements/store/achievementsPopupStore');
        useAchievementsPopupStore.getState().enqueueMany(items);
      })
      .catch(() => {});
  }, [isOpen]);

  return (
    <GameResultModal
      isOpen={isOpen}
      result={result}
      gameName={resolvedGameName}
      onClose={onClose}
      onRematch={onRematch}
      rematchLoading={rematchLoading}
      t={t}
      messages={messages}
      theme={theme}
      stats={computedStats}
      analysis={
        snapshot
          ? {
              content: (
                <PostGameAnalysis
                  positionHistory={snapshot.positionHistory}
                  notations={snapshot.moveHistory.map((m) => m.notation)}
                  t={t}
                />
              ),
              viewLabel: t('games.chess_v1.analysis.view'),
              backLabel: t('games.chess_v1.analysis.back'),
            }
          : null
      }
    />
  );
}

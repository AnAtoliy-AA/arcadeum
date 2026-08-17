'use client';

import { GameResultModal } from '@/features/games/ui/GameResultModal';
import { PostGameAnalysis } from '@/features/analysis/ui/PostGameAnalysis';
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
}: ChessGameResultModalProps) {
  return (
    <GameResultModal
      isOpen={isOpen}
      result={result}
      onClose={onClose}
      onRematch={onRematch}
      rematchLoading={rematchLoading}
      t={t}
      messages={messages}
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

'use client';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { RulesModal } from './RulesModal';
import { GameEndModals } from '@/features/games/ui';
import { usePostGameAnalytics } from '@/features/games/hooks/usePostGameAnalytics';
import { PostGameAnalytics } from '@/features/games/ui/PostGameAnalytics';
import type { SeaBattleSnapshot } from '../types';
import type { UseGameEndStateResult } from '@/features/games/hooks/useGameEndState';

interface SeaBattleModalsProps {
  showRules: boolean;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
  setShowRules: (val: boolean) => void;
  gameEnd: UseGameEndStateResult;
  snapshot: SeaBattleSnapshot | null;
  resolveDisplayNameBound: (
    id?: string | null,
    fallback?: string | null,
  ) => string;
  currentUserId: string | null;
  cardVariant?: string;
  onRematch?: () => void;
}

export function SeaBattleModals({
  showRules,
  showRulesOpen,
  onShowRulesClose,
  setShowRules,
  gameEnd,
  snapshot,
  resolveDisplayNameBound,
  currentUserId,
  cardVariant,
  onRematch,
}: SeaBattleModalsProps) {
  const { t } = useTranslation();

  const players =
    snapshot?.players
      .filter((p) => !p.playerId.startsWith('bot-'))
      .map((p) => ({
        playerId: p.playerId,
        displayName: resolveDisplayNameBound(
          p.playerId,
          `Player ${p.playerId.slice(0, 4)} `,
        ),
        alive: p.alive,
      })) || [];

  const opponentId =
    snapshot?.players && currentUserId
      ? (snapshot.players.find(
          (p) => p.playerId !== currentUserId && !p.playerId.startsWith('bot-'),
        )?.playerId ?? null)
      : null;

  const analytics = usePostGameAnalytics({
    gameId: 'sea_battle_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
  });

  return (
    <>
      <RulesModal
        isOpen={showRules || !!showRulesOpen}
        onClose={() => {
          setShowRules(false);
          onShowRulesClose?.();
        }}
        t={t}
      />
      <GameEndModals
        gameEnd={gameEnd}
        players={players}
        currentUserId={currentUserId}
        gameName={(() => {
          const raw = t('games.names.seaBattle' as TranslationKey);
          return raw && raw !== 'games.names.seaBattle' ? raw : 'Sea Battle';
        })()}
        cardVariant={cardVariant}
        theme={cardVariant}
        t={t}
        onRematch={onRematch}
        stats={analytics.stats}
        analysis={{
          content: (
            <PostGameAnalytics
              stats={analytics.stats}
              moveTimeline={analytics.moveTimeline}
              headToHead={analytics.headToHead}
              headToHeadLoading={analytics.headToHeadLoading}
              trends={analytics.trends}
              trendsLoading={analytics.trendsLoading}
              onLoadHeadToHead={analytics.loadHeadToHead}
              onLoadTrends={analytics.loadTrends}
              currentUserId={currentUserId}
              opponentId={opponentId}
              t={t}
            />
          ),
          viewLabel: t('games.table.analytics.view'),
          backLabel: t('games.table.analytics.back'),
        }}
      />
    </>
  );
}

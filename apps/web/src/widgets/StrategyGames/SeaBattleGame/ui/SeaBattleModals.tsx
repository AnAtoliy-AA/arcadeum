'use client';

import { useTranslation, type TranslationKey } from '@/shared/lib/useTranslation';
import { RulesModal } from './RulesModal';
import { GameEndModals } from '@/features/games/ui';
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
        gameName={t('games.names.seaBattle' as TranslationKey) || 'Sea Battle'}
        cardVariant={cardVariant}
        theme={cardVariant}
        t={t}
        onRematch={onRematch}
      />
    </>
  );
}

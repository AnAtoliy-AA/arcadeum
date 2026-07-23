'use client';

import { GameResultModal } from './GameResultModal';
import { RematchModal } from './RematchModal';
import { RematchInvitationModal } from './RematchInvitationModal';
import type { UseGameEndStateResult } from '../hooks/useGameEndState';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface GameEndModalsProps {
  gameEnd: UseGameEndStateResult;
  players: Array<{ playerId: string; displayName: string; alive: boolean }>;
  currentUserId: string | null;
  cardVariant?: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  onRematch?: () => void;
}

export function GameEndModals({
  gameEnd,
  players,
  currentUserId,
  cardVariant,
  t,
  onRematch,
}: GameEndModalsProps) {
  return (
    <>
      <GameResultModal
        isOpen={gameEnd.showResultModal}
        result={gameEnd.sharedResult}
        onClose={gameEnd.dismissResult}
        onRematch={onRematch ?? gameEnd.handleResultRematchClick}
        rematchLoading={gameEnd.rematchLoading}
        t={t}
        messages={gameEnd.resultMessages}
      />

      {players.length > 1 && (
        <RematchModal
          isOpen={gameEnd.showRematchModal}
          players={players}
          currentUserId={currentUserId}
          rematchLoading={gameEnd.rematchLoading}
          onClose={gameEnd.closeRematchModal}
          onConfirm={gameEnd.handleRematch}
          t={t}
          cardVariant={cardVariant}
        />
      )}

      <RematchInvitationModal
        isOpen={!!gameEnd.invitation}
        senderName={gameEnd.invitation?.hostName || ''}
        message={gameEnd.invitation?.message}
        onAccept={gameEnd.handleAcceptInvitation}
        onDecline={gameEnd.handleDeclineInvitation}
        t={t}
      />
    </>
  );
}

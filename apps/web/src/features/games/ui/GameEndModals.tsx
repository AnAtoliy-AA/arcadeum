'use client';

import { GameResultModal, type GameResultModalProps } from './GameResultModal';
import { RematchModal } from './RematchModal';
import { RematchInvitationModal } from './RematchInvitationModal';
import type { GameResultStats } from './GameResultStatsGrid';
import type { UseGameEndStateResult } from '../hooks/useGameEndState';
import type { GameTheme } from '../lib/shared-themes';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface GameEndModalsProps {
  gameEnd: UseGameEndStateResult;
  players: Array<{ playerId: string; displayName: string; alive: boolean }>;
  currentUserId: string | null;
  gameName?: string;
  cardVariant?: string;
  theme?: GameTheme | string;
  stats?: GameResultStats;
  analysis?: GameResultModalProps['analysis'];
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  onRematch?: () => void;
}

export function GameEndModals({
  gameEnd,
  players,
  currentUserId,
  gameName,
  cardVariant,
  theme,
  stats,
  analysis,
  t,
  onRematch,
}: GameEndModalsProps) {
  const activeTheme = theme ?? cardVariant;

  return (
    <>
      <GameResultModal
        isOpen={gameEnd.showResultModal}
        result={gameEnd.sharedResult}
        gameName={gameName}
        onClose={gameEnd.dismissResult}
        onRematch={onRematch ?? gameEnd.handleResultRematchClick}
        rematchLoading={gameEnd.rematchLoading}
        t={t}
        messages={gameEnd.resultMessages}
        ratingDelta={gameEnd.ratingDelta}
        theme={activeTheme}
        stats={stats}
        analysis={analysis}
      />

      {players.length > 1 && (
        <RematchModal
          isOpen={gameEnd.showRematchModal}
          players={players}
          currentUserId={currentUserId}
          rematchLoading={gameEnd.rematchLoading}
          rematchError={gameEnd.rematchError}
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
        hostId={gameEnd.invitation?.hostId}
        roomId={gameEnd.invitation?.newRoomId}
        timeLeft={gameEnd.invitationTimeLeft}
        onAccept={gameEnd.handleAcceptInvitation}
        onDecline={gameEnd.handleDeclineInvitation}
        onBlockRematch={gameEnd.handleBlockRematch}
        onBlockUser={gameEnd.handleBlockUser}
        accepting={gameEnd.isAcceptingInvitation}
        cardVariant={cardVariant}
        t={t}
      />
    </>
  );
}

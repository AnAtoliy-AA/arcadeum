'use client';

import { GameResultModal } from './GameResultModal';
import { RematchModal } from './RematchModal';
import { RematchInvitationModal } from './RematchInvitationModal';
import type { SharedResult, ResultMessages } from '../hooks/useGameResultModal';
import type { RematchInvitation } from '../hooks/useRematch';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface GameEndModalsProps {
  showResultModal: boolean;
  result: SharedResult;
  dismissResult: () => void;
  onRematch?: () => void;
  rematchLoading: boolean;
  resultMessages?: ResultMessages;

  showRematchModal: boolean;
  closeRematchModal: () => void;
  players: Array<{ playerId: string; displayName: string; alive: boolean }>;
  currentUserId: string | null;
  onConfirmRematch: (participantIds: string[], message?: string) => void;
  cardVariant?: string;

  invitation: RematchInvitation | null;
  handleAcceptInvitation: () => void;
  handleDeclineInvitation: () => void;

  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function GameEndModals({
  showResultModal,
  result,
  dismissResult,
  onRematch,
  rematchLoading,
  resultMessages,
  showRematchModal,
  closeRematchModal,
  players,
  currentUserId,
  onConfirmRematch,
  cardVariant,
  invitation,
  handleAcceptInvitation,
  handleDeclineInvitation,
  t,
}: GameEndModalsProps) {
  return (
    <>
      <GameResultModal
        isOpen={showResultModal}
        result={result}
        onClose={dismissResult}
        onRematch={onRematch}
        rematchLoading={rematchLoading}
        t={t}
        messages={resultMessages}
      />

      {players.length > 1 && (
        <RematchModal
          isOpen={showRematchModal}
          players={players}
          currentUserId={currentUserId}
          rematchLoading={rematchLoading}
          onClose={closeRematchModal}
          onConfirm={onConfirmRematch}
          t={t}
          cardVariant={cardVariant}
        />
      )}

      <RematchInvitationModal
        isOpen={!!invitation}
        senderName={invitation?.hostName || ''}
        message={invitation?.message}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
        t={t}
      />
    </>
  );
}

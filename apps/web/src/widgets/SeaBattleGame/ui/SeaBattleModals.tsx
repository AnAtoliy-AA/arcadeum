'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { RulesModal } from './RulesModal';
import {
  GameResultModal,
  RematchModal,
  RematchInvitationModal,
} from '@/features/games/ui';
import type { SeaBattleSnapshot } from '../types';
import type { GameSessionSummary } from '@/shared/types/games';

interface SeaBattleModalsProps {
  showRules: boolean;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
  setShowRules: (val: boolean) => void;
  isGameOver: boolean;
  resultModalDismissed: boolean;
  gameResult: 'victory' | 'defeat' | null;
  handleRematchClick: () => void;
  session: GameSessionSummary | null;
  setDismissedForSessionId: (id: string | null) => void;
  rematchLoading: boolean;
  showRematchModal: boolean;
  snapshot: SeaBattleSnapshot | null;
  resolveDisplayNameBound: (
    id?: string | null,
    fallback?: string | null,
  ) => string;
  currentUserId: string | null;
  closeRematchModal: () => void;
  handleRematch: (participantIds: string[], message?: string) => Promise<void>;
  cardVariant?: string;
  invitation: { hostName: string; message?: string } | null;
  handleAcceptInvitation: () => void;
  handleDeclineInvitation: () => void;
}

export function SeaBattleModals({
  showRules,
  showRulesOpen,
  onShowRulesClose,
  setShowRules,
  isGameOver,
  resultModalDismissed,
  gameResult,
  handleRematchClick,
  session,
  setDismissedForSessionId,
  rematchLoading,
  showRematchModal,
  snapshot,
  resolveDisplayNameBound,
  currentUserId,
  closeRematchModal,
  handleRematch,
  cardVariant,
  invitation,
  handleAcceptInvitation,
  handleDeclineInvitation,
}: SeaBattleModalsProps) {
  const { t } = useTranslation();

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
      <GameResultModal
        isOpen={isGameOver && !resultModalDismissed}
        result={gameResult}
        onRematch={handleRematchClick}
        onClose={() => {
          if (session?.id) setDismissedForSessionId(session.id);
        }}
        rematchLoading={rematchLoading}
        t={t}
      />

      <RematchModal
        isOpen={showRematchModal}
        players={
          snapshot?.players
            .filter((p) => !p.playerId.startsWith('bot-'))
            .map((p) => ({
              playerId: p.playerId,
              displayName: resolveDisplayNameBound(
                p.playerId,
                `Player ${p.playerId.slice(0, 4)} `,
              ),
              alive: p.alive,
            })) || []
        }
        currentUserId={currentUserId}
        rematchLoading={rematchLoading}
        onClose={closeRematchModal}
        onConfirm={handleRematch}
        t={t}
        cardVariant={cardVariant}
      />

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

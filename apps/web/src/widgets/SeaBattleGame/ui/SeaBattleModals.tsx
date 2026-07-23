'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { RulesModal } from './RulesModal';
import { GameEndModals } from '@/features/games/ui';
import type { SeaBattleSnapshot } from '../types';
import type { RematchInvitation } from '@/features/games/hooks/useRematch';
import type {
  SharedResult,
  ResultMessages,
} from '@/features/games/hooks/useGameResultModal';

interface SeaBattleModalsProps {
  showRules: boolean;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
  setShowRules: (val: boolean) => void;
  showResultModal: boolean;
  result: SharedResult;
  dismissResult: () => void;
  handleRematchClick: () => void;
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
  invitation: RematchInvitation | null;
  handleAcceptInvitation: () => void;
  handleDeclineInvitation: () => void;
  resultMessages?: ResultMessages;
}

export function SeaBattleModals({
  showRules,
  showRulesOpen,
  onShowRulesClose,
  setShowRules,
  showResultModal,
  result,
  dismissResult,
  handleRematchClick,
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
  resultMessages,
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
        showResultModal={showResultModal}
        result={result}
        dismissResult={dismissResult}
        onRematch={handleRematchClick}
        rematchLoading={rematchLoading}
        resultMessages={resultMessages}
        showRematchModal={showRematchModal}
        closeRematchModal={closeRematchModal}
        players={players}
        currentUserId={currentUserId}
        onConfirmRematch={handleRematch}
        cardVariant={cardVariant}
        invitation={invitation}
        handleAcceptInvitation={handleAcceptInvitation}
        handleDeclineInvitation={handleDeclineInvitation}
        t={t}
      />
    </>
  );
}

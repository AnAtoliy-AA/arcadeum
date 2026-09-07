'use client';

import { RematchInvitationModal } from '@/features/games/ui/RematchInvitationModal';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { ChessClientState, PieceType, BoardPosition } from '../types';
import type {
  SharedResult,
  ResultMessages,
} from '@/features/games/hooks/useGameResultModal';
import { ChessGameResultModal } from './ChessGameResultModal';
import { PromotionModal } from './PromotionModal';
import { RulesModal } from './RulesModal';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

interface ChessGameModalsProps {
  showResultModal: boolean;
  sharedResult: SharedResult;
  dismiss: () => void;
  onRematchClick: (() => void) | undefined;
  rematchLoading: boolean;
  t: TranslateFn;
  resultMessages: ResultMessages | undefined;
  displaySnapshot: ChessClientState | null;
  myColor: 'white' | 'black' | null;
  isSpectator: boolean;
  themeVariant: string;
  invitation: { hostName: string; message?: string } | null;
  handleAcceptInvitation: () => void;
  handleDeclineInvitation: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
  pendingPromotion: { from: BoardPosition; to: BoardPosition } | null;
  handlePromotionSelect: (pieceType: PieceType) => void;
  setPendingPromotion: (val: null) => void;
  myColorForPromo: 'white' | 'black';
}

export function ChessGameModals({
  showResultModal,
  sharedResult,
  dismiss,
  onRematchClick,
  rematchLoading,
  t,
  resultMessages,
  displaySnapshot,
  myColor,
  isSpectator,
  themeVariant,
  invitation,
  handleAcceptInvitation,
  handleDeclineInvitation,
  showRulesOpen,
  onShowRulesClose,
  pendingPromotion,
  handlePromotionSelect,
  setPendingPromotion,
  myColorForPromo,
}: ChessGameModalsProps) {
  return (
    <>
      <ChessGameResultModal
        isOpen={showResultModal}
        result={sharedResult}
        onClose={dismiss}
        onRematch={onRematchClick}
        rematchLoading={rematchLoading}
        t={t}
        messages={resultMessages}
        snapshot={displaySnapshot}
        myColor={myColor}
        isSpectator={isSpectator}
        theme={themeVariant}
      />
      <RematchInvitationModal
        isOpen={!!invitation}
        senderName={invitation?.hostName || ''}
        message={invitation?.message}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
        t={t}
      />
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
      <PromotionModal
        isOpen={!!pendingPromotion}
        color={myColorForPromo}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />
    </>
  );
}

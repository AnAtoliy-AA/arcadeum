'use client';

import type { UseGameActionsReturn } from '@/features/games/hooks/useGameActions';
import type {
  CriticalSnapshot,
  CriticalPlayerState,
  CriticalCard,
  EventComboModalState,
  OmniscienceModalState,
  CriticalComboCard,
} from '../types';
import { GameModals } from './GameModals';
import { MobileActionSheet } from './MobileActionSheet';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { RematchInvitation } from '@/features/games/hooks/useRematch';

interface ActiveGameModalsProps {
  currentUserId: string | null;
  snapshot: CriticalSnapshot;
  isMobile: boolean;
  cardVariant?: string;
  aliveOpponents: CriticalPlayerState[];
  currentPlayer: CriticalPlayerState | null;
  actions: UseGameActionsReturn;
  rematch: {
    rematchLoading: boolean;
    showRematchModal: boolean;
    openRematchModal: () => void;
    closeRematchModal: () => void;
    handleRematch: (
      participantIds: string[],
      message?: string,
    ) => Promise<void>;
    invitation: RematchInvitation | null;
    invitationTimeLeft: number;
    handleAcceptInvitation: () => void;
    handleDeclineInvitation: () => void;
    isAcceptingInvitation: boolean;
    handleBlockRematch: (roomId: string) => void;
    handleBlockUser: (userId: string) => void;
  };
  modals: {
    eventComboModal: EventComboModalState | null;
    selectedMode: 'pair' | 'trio' | 'fiver' | null;
    selectedTarget: string | null;
    selectedCard: CriticalCard | null;
    selectedIndex: number | null;
    selectedDiscardCard: CriticalCard | null;
    selectedFiverCards: CriticalCard[];
    seeTheFutureModal: { cards: CriticalCard[] } | null;
    stashModal: boolean;
    markModal: boolean;
    stealDrawModal: boolean;
    smiteModal: boolean;
    omniscienceModal: OmniscienceModalState | null;
    targetedAttackModal: boolean;
  };
  handlers: {
    handleCloseEventComboModal: () => void;
    handleSelectComboCard: (card: CriticalComboCard) => void;
    setSelectedMode: (mode: 'pair' | 'trio' | 'fiver' | null) => void;
    setSelectedTarget: (id: string | null) => void;
    setSelectedCard: (card: CriticalCard | null) => void;
    setSelectedIndex: (idx: number | null) => void;
    setSelectedDiscardCard: (card: CriticalCard | null) => void;
    handleToggleFiverCard: (card: CriticalCard) => void;
    handleConfirmEventCombo: () => void;
    handleCloseSeeTheFutureModal: () => void;
    handleConfirmAlterFuture: (cards: CriticalCard[]) => void;
    handleCloseTargetedAttackModal: () => void;
    handleConfirmTargetedAttack: (targetId?: string) => void;
    handleCloseFavorModal: () => void;
    handleConfirmFavor: (card: CriticalCard) => void;
    handleCloseStashModal: () => void;
    handleConfirmStash: (cards: CriticalCard[]) => void;
    handleCloseMarkModal: () => void;
    handleConfirmMark: (targetId: string, cardIndex: number) => void;
    handleCloseStealDrawModal: () => void;
    handleConfirmStealDraw: (targetId: string) => void;
    handleCloseSmiteModal: () => void;
    handleConfirmSmite: (targetId: string, cardIndex: number) => void;
    handleCloseOmniscienceModal: () => void;
  };
  resolveDisplayName: (id?: string, fallback?: string) => string;
}

export function ActiveGameModals({
  currentUserId,
  snapshot,
  isMobile,
  cardVariant,
  aliveOpponents,
  currentPlayer,
  actions,
  rematch,
  modals,
  handlers,
  resolveDisplayName,
}: ActiveGameModalsProps) {
  const { t } = useTranslation();

  return (
    <>
      <GameModals
        // Rematch Modal
        showRematchModal={rematch.showRematchModal}
        players={snapshot.players.map((p) => ({
          playerId: p.playerId,
          displayName: resolveDisplayName(
            p.playerId,
            `Player ${p.playerId.slice(0, 8)}`,
          ),
          alive: p.alive,
        }))}
        currentUserId={currentUserId}
        rematchLoading={rematch.rematchLoading}
        onCloseRematchModal={rematch.closeRematchModal}
        onConfirmRematch={rematch.handleRematch}
        // Rematch Invitation
        invitation={rematch.invitation}
        invitationTimeLeft={rematch.invitationTimeLeft}
        onAcceptInvitation={rematch.handleAcceptInvitation}
        onDeclineInvitation={rematch.handleDeclineInvitation}
        onBlockRematch={rematch.handleBlockRematch}
        onBlockUser={rematch.handleBlockUser}
        isAcceptingInvitation={rematch.isAcceptingInvitation}
        // Event Combo Modal
        eventComboModal={modals.eventComboModal}
        onCloseEventComboModal={handlers.handleCloseEventComboModal}
        selectedMode={modals.selectedMode}
        selectedTarget={modals.selectedTarget}
        selectedCard={modals.selectedCard}
        selectedIndex={modals.selectedIndex}
        selectedDiscardCard={modals.selectedDiscardCard}
        selectedFiverCards={modals.selectedFiverCards}
        aliveOpponents={aliveOpponents}
        selfHand={currentPlayer?.hand ?? []}
        discardPile={snapshot?.discardPile ?? []}
        onSelectComboCard={handlers.handleSelectComboCard}
        onSelectMode={handlers.setSelectedMode}
        onSelectTarget={handlers.setSelectedTarget}
        onSelectCard={handlers.setSelectedCard}
        onSelectIndex={handlers.setSelectedIndex}
        onSelectDiscardCard={handlers.setSelectedDiscardCard}
        onToggleFiverCard={handlers.handleToggleFiverCard}
        onConfirmEventCombo={handlers.handleConfirmEventCombo}
        // See the Future Modal
        seeTheFutureModal={modals.seeTheFutureModal}
        onCloseSeeTheFutureModal={handlers.handleCloseSeeTheFutureModal}
        // Alter the Future
        pendingAlter={snapshot?.pendingAlter ?? null}
        onConfirmAlterFuture={handlers.handleConfirmAlterFuture}
        // Targeted Attack Modal
        targetedAttackModal={modals.targetedAttackModal}
        onCloseTargetedAttackModal={handlers.handleCloseTargetedAttackModal}
        onConfirmTargetedAttack={() =>
          handlers.handleConfirmTargetedAttack(
            modals.selectedTarget ?? undefined,
          )
        }
        // Favor Modal
        favorModal={
          modals.targetedAttackModal ? false : !!handlers.handleCloseFavorModal
        }
        onCloseFavorModal={handlers.handleCloseFavorModal}
        onConfirmFavor={() => {}}
        // Defuse Modal
        pendingDefuse={snapshot?.pendingDefuse ?? null}
        onPlayDefuse={actions.playDefuse}
        deck={snapshot?.deck ?? []}
        // Give Favor Modal
        pendingFavor={snapshot?.pendingFavor ?? null}
        myHand={currentPlayer?.hand ?? []}
        onGiveFavorCard={actions.giveFavorCard}
        // Shared
        resolveDisplayName={resolveDisplayName}
        t={(key, params) =>
          t(key as TranslationKey, params as Record<string, string | number>)
        }
        cardVariant={cardVariant}
        // Theft Pack
        stashModal={modals.stashModal}
        onCloseStashModal={handlers.handleCloseStashModal}
        onConfirmStash={handlers.handleConfirmStash}
        markModal={modals.markModal}
        onCloseMarkModal={handlers.handleCloseMarkModal}
        onConfirmMark={() =>
          handlers.handleConfirmMark(
            modals.selectedTarget ?? '',
            modals.selectedIndex ?? 0,
          )
        }
        onCloseStealDrawModal={handlers.handleCloseStealDrawModal}
        onConfirmStealDraw={() =>
          handlers.handleConfirmStealDraw(modals.selectedTarget ?? '')
        }
        smiteModal={modals.smiteModal}
        onCloseSmiteModal={handlers.handleCloseSmiteModal}
        onConfirmSmite={() =>
          handlers.handleConfirmSmite(
            modals.selectedTarget ?? '',
            modals.selectedIndex ?? 0,
          )
        }
        // Omniscience Modal
        omniscienceModal={modals.omniscienceModal}
        onCloseOmniscienceModal={handlers.handleCloseOmniscienceModal}
        stealDrawModal={modals.stealDrawModal}
        isMobile={isMobile}
      />

      {isMobile && (
        <MobileActionSheet
          isOpen={modals.targetedAttackModal}
          title={t('games.table.mobile.attack.title' as TranslationKey)}
          description={t(
            'games.table.mobile.attack.description' as TranslationKey,
          )}
          opponents={aliveOpponents}
          resolveDisplayName={resolveDisplayName}
          confirmLabel={t('games.table.mobile.play' as TranslationKey)}
          cancelLabel={t('games.table.mobile.cancel' as TranslationKey)}
          onConfirm={(targetId) => {
            actions.playActionCard('targeted_strike', {
              targetPlayerId: targetId,
            });
            handlers.handleCloseTargetedAttackModal();
          }}
          onCancel={handlers.handleCloseTargetedAttackModal}
        />
      )}

      {isMobile && !modals.targetedAttackModal && (
        <MobileActionSheet
          isOpen={!!handlers.handleCloseFavorModal}
          title={t('games.table.mobile.favor.title' as TranslationKey)}
          description={t(
            'games.table.mobile.favor.description' as TranslationKey,
          )}
          opponents={aliveOpponents}
          resolveDisplayName={resolveDisplayName}
          confirmLabel={t('games.table.mobile.play' as TranslationKey)}
          cancelLabel={t('games.table.mobile.cancel' as TranslationKey)}
          onConfirm={(targetId) => {
            actions.playFavor(targetId);
            handlers.handleCloseFavorModal();
          }}
          onCancel={handlers.handleCloseFavorModal}
        />
      )}
    </>
  );
}

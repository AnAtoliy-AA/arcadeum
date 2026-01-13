'use client';

import { useCallback } from 'react';
import type { CriticalCard, CatComboModalState } from '../types';
import { FIVER_COMBO_SIZE } from '../types';
import type { ChatScope } from '@/shared/types/games';

interface UseGameHandlersOptions {
  selectedMode: 'pair' | 'trio' | 'fiver' | null;
  selectedTarget: string | null;
  selectedCard: CriticalCard | null;
  selectedIndex: number | null;
  selectedFiverCards: CriticalCard[];
  selectedDiscardCard: CriticalCard | null;
  catComboModal: CatComboModalState | null;
  chatMessage: string;
  chatScope: ChatScope;
  currentPlayerHand: CriticalCard[];
  actions: {
    playCatCombo: (
      cat: string | null,
      mode: string,
      targetPlayerId?: string,
      desiredCard?: string,
      selectedIndex?: number,
      requestedDiscardCard?: string,
      cards?: string[],
    ) => void;
    playActionCard: (card: string, payload?: Record<string, unknown>) => void;
    postHistoryNote: (message: string, scope: ChatScope) => void;
    commitAlterFuture: (orderedCards: CriticalCard[]) => void;
  };
  handleCloseCatComboModal: () => void;
  handleOpenCatCombo: (cats: never[], hand: CriticalCard[]) => void;
  setSelectedMode: (mode: 'pair' | 'trio' | 'fiver' | null) => void;
  setSelectedTarget: (target: string | null) => void;
  setStashModal: (isOpen: boolean) => void;
  setMarkModal: (isOpen: boolean) => void;
  setStealDrawModal: (isOpen: boolean) => void;
  setTargetedAttackModal: (isOpen: boolean) => void;
  clearChatMessage: () => void;
}

export function useGameHandlers(options: UseGameHandlersOptions) {
  const {
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    selectedFiverCards,
    selectedDiscardCard,
    catComboModal,
    chatMessage,
    chatScope,
    currentPlayerHand,
    actions,
    handleCloseCatComboModal,
    handleOpenCatCombo,
    setSelectedMode,
    setSelectedTarget,
    setStashModal,
    setMarkModal,
    setStealDrawModal,
    setTargetedAttackModal,
    clearChatMessage,
  } = options;

  const handleConfirmCatCombo = useCallback(() => {
    if (selectedMode === 'fiver') {
      if (
        selectedFiverCards.length !== FIVER_COMBO_SIZE ||
        !selectedDiscardCard
      )
        return;
      actions.playCatCombo(
        null,
        'fiver',
        undefined,
        undefined,
        undefined,
        selectedDiscardCard,
        selectedFiverCards,
      );
      handleCloseCatComboModal();
      return;
    }
    if (!catComboModal?.selectedCat || !selectedMode || !selectedTarget) return;
    if (selectedMode === 'trio' && !selectedCard) return;
    if (selectedMode === 'pair' && selectedIndex === null) return;
    actions.playCatCombo(
      catComboModal.selectedCat,
      selectedMode,
      selectedTarget,
      selectedMode === 'trio' ? selectedCard! : undefined,
      selectedMode === 'pair' ? selectedIndex! : undefined,
    );
    handleCloseCatComboModal();
  }, [
    catComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    selectedFiverCards,
    selectedDiscardCard,
    actions,
    handleCloseCatComboModal,
  ]);

  const handleSendChatMessage = useCallback(() => {
    const trimmed = chatMessage.trim();
    if (!trimmed) return;
    actions.postHistoryNote(trimmed, chatScope);
    clearChatMessage();
  }, [chatMessage, chatScope, actions, clearChatMessage]);

  const handleOpenFiverCombo = useCallback(() => {
    setSelectedMode('fiver');
    const uniqueCards = new Set(currentPlayerHand);
    if (uniqueCards.size >= FIVER_COMBO_SIZE) {
      handleOpenCatCombo([], currentPlayerHand);
      setSelectedMode('fiver');
    }
  }, [currentPlayerHand, handleOpenCatCombo, setSelectedMode]);

  const handleConfirmStash = useCallback(
    (cards: CriticalCard[]) => {
      actions.playActionCard('stash', { cardsToStash: cards });
      setStashModal(false);
    },
    [actions, setStashModal],
  );

  const handleConfirmMark = useCallback(() => {
    if (!selectedTarget) return;
    actions.playActionCard('mark', { targetPlayerId: selectedTarget });
    setMarkModal(false);
    setSelectedTarget(null);
  }, [actions, selectedTarget, setMarkModal, setSelectedTarget]);

  const handleConfirmStealDraw = useCallback(() => {
    if (!selectedTarget) return;
    actions.playActionCard('steal_draw', { targetPlayerId: selectedTarget });
    setStealDrawModal(false);
    setSelectedTarget(null);
  }, [actions, selectedTarget, setStealDrawModal, setSelectedTarget]);

  const handleUnstash = useCallback(
    (card: CriticalCard) => {
      actions.playActionCard('unstash', { cardsToUnstash: [card] });
    },
    [actions],
  );

  const handlePlayActionCard = useCallback(
    (card: CriticalCard) => {
      if (card === 'targeted_strike') {
        setTargetedAttackModal(true);
      } else if (card === 'mark') {
        setMarkModal(true);
      } else if (card === 'steal_draw') {
        setStealDrawModal(true);
      } else if (card === 'stash') {
        setStashModal(true);
      } else {
        actions.playActionCard(card);
      }
    },
    [
      actions,
      setTargetedAttackModal,
      setMarkModal,
      setStealDrawModal,
      setStashModal,
    ],
  );

  const handleCloseTargetedAttackModal = useCallback(() => {
    setTargetedAttackModal(false);
    setSelectedTarget(null);
  }, [setTargetedAttackModal, setSelectedTarget]);

  const handleCloseMarkModal = useCallback(() => {
    setMarkModal(false);
    setSelectedTarget(null);
  }, [setMarkModal, setSelectedTarget]);

  const handleCloseStealDrawModal = useCallback(() => {
    setStealDrawModal(false);
    setSelectedTarget(null);
  }, [setStealDrawModal, setSelectedTarget]);

  const handleConfirmTargetedAttack = useCallback(() => {
    if (selectedTarget) {
      actions.playActionCard('targeted_strike', {
        targetPlayerId: selectedTarget,
      });
      setTargetedAttackModal(false);
      setSelectedTarget(null);
    }
  }, [selectedTarget, actions, setTargetedAttackModal, setSelectedTarget]);

  const handleConfirmAlterFuture = useCallback(
    (orderedCards: CriticalCard[]) => {
      actions.commitAlterFuture(orderedCards);
    },
    [actions],
  );

  return {
    handleConfirmCatCombo,
    handleSendChatMessage,
    handleOpenFiverCombo,
    handleConfirmStash,
    handleConfirmMark,
    handleConfirmStealDraw,
    handleUnstash,
    handlePlayActionCard,
    handleCloseTargetedAttackModal,
    handleCloseMarkModal,
    handleCloseStealDrawModal,
    handleConfirmTargetedAttack,
    handleConfirmAlterFuture,
  };
}

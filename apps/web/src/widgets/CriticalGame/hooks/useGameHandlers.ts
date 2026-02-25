'use client';

import { useCallback } from 'react';
import type {
  CriticalCard,
  EventComboModalState,
  CriticalComboCard,
} from '../types';
import { FIVER_COMBO_SIZE } from '../types';
import type { ChatScope } from '@/shared/types/games';

interface UseGameHandlersOptions {
  selectedMode: 'pair' | 'trio' | 'fiver' | null;
  selectedTarget: string | null;
  selectedCard: CriticalCard | null;
  selectedIndex: number | null;
  selectedFiverCards: CriticalCard[];
  selectedDiscardCard: CriticalCard | null;
  eventComboModal: EventComboModalState | null;
  chatMessage: string;
  chatScope: ChatScope;
  currentPlayerHand: CriticalCard[];
  discardPile: CriticalCard[];
  actions: {
    playEventCombo: (
      card: string | null,
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
  handleCloseEventComboModal: () => void;
  handleOpenEventCombo: (
    cards: CriticalComboCard[],
    hand: CriticalCard[],
  ) => void;
  setSelectedMode: (mode: 'pair' | 'trio' | 'fiver' | null) => void;
  setSelectedTarget: (target: string | null) => void;
  setStashModal: (isOpen: boolean) => void;
  setMarkModal: (isOpen: boolean) => void;
  setStealDrawModal: (isOpen: boolean) => void;
  setTargetedAttackModal: (isOpen: boolean) => void;
  setSmiteModal: (isOpen: boolean) => void;
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
    eventComboModal,
    chatMessage,
    chatScope,
    currentPlayerHand,
    actions,
    handleCloseEventComboModal,
    handleOpenEventCombo,
    setSelectedMode,
    setSelectedTarget,
    setStashModal,
    setMarkModal,
    setStealDrawModal,
    setTargetedAttackModal,
    setSmiteModal,
    clearChatMessage,
  } = options;

  const handleConfirmEventCombo = useCallback(() => {
    if (selectedMode === 'fiver') {
      if (
        selectedFiverCards.length !== FIVER_COMBO_SIZE ||
        !selectedDiscardCard
      )
        return;
      actions.playEventCombo(
        null,
        'fiver',
        undefined,
        undefined,
        undefined,
        selectedDiscardCard,
        selectedFiverCards,
      );
      handleCloseEventComboModal();
      return;
    }
    if (!eventComboModal?.selectedComboCard || !selectedMode || !selectedTarget)
      return;
    if (selectedMode === 'trio' && !selectedCard) return;
    if (selectedMode === 'pair' && selectedIndex === null) return;
    actions.playEventCombo(
      eventComboModal.selectedComboCard,
      selectedMode,
      selectedTarget,
      selectedMode === 'trio' ? selectedCard! : undefined,
      selectedMode === 'pair' ? selectedIndex! : undefined,
    );
    handleCloseEventComboModal();
  }, [
    eventComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    selectedFiverCards,
    selectedDiscardCard,
    actions,
    handleCloseEventComboModal,
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
      handleOpenEventCombo([], currentPlayerHand);
      setSelectedMode('fiver');
    }
  }, [currentPlayerHand, handleOpenEventCombo, setSelectedMode]);

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
      } else if (card === 'smite') {
        setSmiteModal(true);
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
      setSmiteModal,
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

  const handleCloseSmiteModal = useCallback(() => {
    setSmiteModal(false);
    setSelectedTarget(null);
  }, [setSmiteModal, setSelectedTarget]);

  const handleConfirmSmite = useCallback(() => {
    if (selectedTarget) {
      actions.playActionCard('smite', {
        targetPlayerId: selectedTarget,
      });
      setSmiteModal(false);
      setSelectedTarget(null);
    }
  }, [selectedTarget, actions, setSmiteModal, setSelectedTarget]);

  return {
    handleConfirmEventCombo,
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
    handleCloseSmiteModal,
    handleConfirmSmite,
  };
}

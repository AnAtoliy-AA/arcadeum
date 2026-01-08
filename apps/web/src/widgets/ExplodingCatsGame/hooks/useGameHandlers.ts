'use client';

import { useCallback } from 'react';
import type { ExplodingCatsCard, CatComboModalState } from '../types';
import { FIVER_COMBO_SIZE } from '../types';
import type { ChatScope } from '@/shared/types/games';

interface UseGameHandlersOptions {
  selectedMode: 'pair' | 'trio' | 'fiver' | null;
  selectedTarget: string | null;
  selectedCard: ExplodingCatsCard | null;
  selectedIndex: number | null;
  selectedFiverCards: ExplodingCatsCard[];
  selectedDiscardCard: ExplodingCatsCard | null;
  catComboModal: CatComboModalState | null;
  chatMessage: string;
  chatScope: ChatScope;
  currentPlayerHand: ExplodingCatsCard[];
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
    postHistoryNote: (message: string, scope: ChatScope) => void;
  };
  handleCloseCatComboModal: () => void;
  handleOpenCatCombo: (cats: never[], hand: ExplodingCatsCard[]) => void;
  setSelectedMode: (mode: 'pair' | 'trio' | 'fiver' | null) => void;
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

  return { handleConfirmCatCombo, handleSendChatMessage, handleOpenFiverCombo };
}

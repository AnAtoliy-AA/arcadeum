import { useEffect, useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
import { useCriticalGameStore } from '../store/criticalGameStore';
import type { CriticalCard } from '../types';

interface UseCriticalModalsOptions {
  playFavor?: (targetId: string) => void;
  playEventCombo?: (
    card: string | null,
    mode: string,
    targetPlayerId?: string,
    desiredCard?: string,
    selectedIndex?: number,
    requestedDiscardCard?: string,
    cards?: string[],
  ) => void;
}

/**
 * Hook for managing game modals and chat state
 */
export function useCriticalModals({
  playFavor,
  playEventCombo,
}: UseCriticalModalsOptions = {}) {
  const store = useCriticalGameStore();

  // Listen for See the Future response
  useEffect(() => {
    const handleSeeTheFuture = (data: { topCards: string[] }) => {
      if (data.topCards) {
        store.setSeeTheFutureModal({ cards: data.topCards as CriticalCard[] });
      }
    };

    const wrappedHandler = async (raw: unknown) => {
      const data = await maybeDecrypt<{ topCards: string[] }>(raw);
      if (data) {
        handleSeeTheFuture(data);
      }
    };

    gameSocket.on('games.session.see_the_future.played', wrappedHandler);

    return () => {
      gameSocket.off('games.session.see_the_future.played', wrappedHandler);
    };
  }, [store]);

  const handleConfirmEventCombo = useCallback(() => {
    if (!playEventCombo) return;
    const comboCard = store.eventComboModal?.selectedComboCard;
    if (store.selectedMode === 'pair') {
      playEventCombo(
        comboCard ?? null,
        'pair',
        store.selectedTarget ?? undefined,
        undefined,
        store.selectedIndex ?? undefined,
      );
    } else if (store.selectedMode === 'trio') {
      playEventCombo(
        comboCard ?? null,
        'triple',
        store.selectedTarget ?? undefined,
        comboCard ?? undefined,
      );
    }
    store.closeEventComboModal();
  }, [store, playEventCombo]);

  return {
    // Event combo modal
    eventComboModal: store.eventComboModal,
    selectedMode: store.selectedMode,
    selectedTarget: store.selectedTarget,
    selectedCard: store.selectedCard,
    selectedIndex: store.selectedIndex,
    setSelectedMode: store.setSelectedMode,
    setSelectedTarget: store.setSelectedTarget,
    setSelectedCard: store.setSelectedCard,
    setSelectedIndex: store.setSelectedIndex,
    handleOpenEventCombo: store.openEventCombo,
    handleCloseEventComboModal: store.closeEventComboModal,
    handleSelectComboCard: store.selectComboCard,
    handleConfirmEventCombo,

    // Fiver mode state
    selectedDiscardCard: store.selectedDiscardCard,
    setSelectedDiscardCard: store.setSelectedDiscardCard,
    selectedFiverCards: store.selectedFiverCards,
    setSelectedFiverCards: store.setSelectedFiverCards,
    handleToggleFiverCard: store.toggleFiverCard,

    // Favor modal
    favorModal: store.favorModal,
    setFavorModal: store.setFavorModal,

    // Targeted Attack modal
    targetedAttackModal: store.targetedAttackModal,
    setTargetedAttackModal: store.setTargetedAttackModal,

    // See the future modal
    seeTheFutureModal: store.seeTheFutureModal,
    setSeeTheFutureModal: store.setSeeTheFutureModal,
    // Theft Pack modals
    stashModal: store.stashModal,
    setStashModal: store.setStashModal,
    markModal: store.markModal,
    setMarkModal: store.setMarkModal,
    stealDrawModal: store.stealDrawModal,
    setStealDrawModal: store.setStealDrawModal,
    smiteModal: store.smiteModal,
    setSmiteModal: store.setSmiteModal,
    omniscienceModal: store.omniscienceModal,
    setOmniscienceModal: store.setOmniscienceModal,

    // Handlers
    handleOpenFavorModal: useCallback(() => store.setFavorModal(true), [store]),
    handleCloseFavorModal: useCallback(() => {
      store.setFavorModal(false);
      store.setSelectedTarget(null);
    }, [store]),
    handleConfirmFavor: useCallback(() => {
      if (store.selectedTarget && playFavor) {
        playFavor(store.selectedTarget);
        store.setFavorModal(false);
        store.setSelectedTarget(null);
      }
    }, [store, playFavor]),
    handleCloseSeeTheFutureModal: useCallback(
      () => store.setSeeTheFutureModal(null),
      [store],
    ),
    handleCloseStashModal: useCallback(
      () => store.setStashModal(false),
      [store],
    ),
    handleCloseMarkModal: useCallback(() => store.setMarkModal(false), [store]),
    handleCloseStealDrawModal: useCallback(
      () => store.setStealDrawModal(false),
      [store],
    ),
    handleCloseSmiteModal: useCallback(
      () => store.setSmiteModal(false),
      [store],
    ),
    handleCloseOmniscienceModal: useCallback(
      () => store.setOmniscienceModal(null),
      [store],
    ),
  };
}

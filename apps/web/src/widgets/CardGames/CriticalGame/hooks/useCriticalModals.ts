import { useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
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
 * Hook for managing game modals and chat state.
 *
 * State is subscribed via a shallow-compared slice and actions are read
 * through getState(): this store updates on every card draw/play, so a
 * whole-store subscription here would re-render the hottest tree in the
 * game (and re-register socket listeners) on each tick.
 */
export function useCriticalModals({
  playFavor,
  playEventCombo,
}: UseCriticalModalsOptions = {}) {
  const {
    eventComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    selectedDiscardCard,
    selectedFiverCards,
    favorModal,
    targetedAttackModal,
    seeTheFutureModal,
    stashModal,
    markModal,
    stealDrawModal,
    smiteModal,
    omniscienceModal,
  } = useCriticalGameStore(
    useShallow((s) => ({
      eventComboModal: s.eventComboModal,
      selectedMode: s.selectedMode,
      selectedTarget: s.selectedTarget,
      selectedCard: s.selectedCard,
      selectedIndex: s.selectedIndex,
      selectedDiscardCard: s.selectedDiscardCard,
      selectedFiverCards: s.selectedFiverCards,
      favorModal: s.favorModal,
      targetedAttackModal: s.targetedAttackModal,
      seeTheFutureModal: s.seeTheFutureModal,
      stashModal: s.stashModal,
      markModal: s.markModal,
      stealDrawModal: s.stealDrawModal,
      smiteModal: s.smiteModal,
      omniscienceModal: s.omniscienceModal,
    })),
  );

  // Listen for See the Future response. The handler only touches a stable
  // action, so bind it once instead of re-subscribing per render/tick.
  useEffect(() => {
    const wrappedHandler = async (raw: unknown) => {
      const data = await maybeDecrypt<{ topCards: string[] }>(raw);
      if (data?.topCards) {
        useCriticalGameStore
          .getState()
          .setSeeTheFutureModal({ cards: data.topCards as CriticalCard[] });
      }
    };

    gameSocket.on('games.session.see_the_future.played', wrappedHandler);

    return () => {
      gameSocket.off('games.session.see_the_future.played', wrappedHandler);
    };
  }, []);

  const handleConfirmEventCombo = useCallback(() => {
    if (!playEventCombo) return;
    const current = useCriticalGameStore.getState();
    const comboCard = current.eventComboModal?.selectedComboCard;
    if (current.selectedMode === 'pair') {
      playEventCombo(
        comboCard ?? null,
        'pair',
        current.selectedTarget ?? undefined,
        undefined,
        current.selectedIndex ?? undefined,
      );
    } else if (current.selectedMode === 'trio') {
      playEventCombo(
        comboCard ?? null,
        'triple',
        current.selectedTarget ?? undefined,
        comboCard ?? undefined,
      );
    }
    current.closeEventComboModal();
  }, [playEventCombo]);

  return {
    // Event combo modal
    eventComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    setSelectedMode: useCriticalGameStore((s) => s.setSelectedMode),
    setSelectedTarget: useCriticalGameStore((s) => s.setSelectedTarget),
    setSelectedCard: useCriticalGameStore((s) => s.setSelectedCard),
    setSelectedIndex: useCriticalGameStore((s) => s.setSelectedIndex),
    handleOpenEventCombo: useCriticalGameStore((s) => s.openEventCombo),
    handleCloseEventComboModal: useCriticalGameStore(
      (s) => s.closeEventComboModal,
    ),
    handleSelectComboCard: useCriticalGameStore((s) => s.selectComboCard),
    handleConfirmEventCombo,

    // Fiver mode state
    selectedDiscardCard,
    setSelectedDiscardCard: useCriticalGameStore(
      (s) => s.setSelectedDiscardCard,
    ),
    selectedFiverCards,
    setSelectedFiverCards: useCriticalGameStore((s) => s.setSelectedFiverCards),
    handleToggleFiverCard: useCriticalGameStore((s) => s.toggleFiverCard),

    // Favor modal
    favorModal,
    setFavorModal: useCriticalGameStore((s) => s.setFavorModal),

    // Targeted Attack modal
    targetedAttackModal,
    setTargetedAttackModal: useCriticalGameStore(
      (s) => s.setTargetedAttackModal,
    ),

    // See the future modal
    seeTheFutureModal,
    setSeeTheFutureModal: useCriticalGameStore((s) => s.setSeeTheFutureModal),
    // Theft Pack modals
    stashModal,
    setStashModal: useCriticalGameStore((s) => s.setStashModal),
    markModal,
    setMarkModal: useCriticalGameStore((s) => s.setMarkModal),
    stealDrawModal,
    setStealDrawModal: useCriticalGameStore((s) => s.setStealDrawModal),
    smiteModal,
    setSmiteModal: useCriticalGameStore((s) => s.setSmiteModal),
    omniscienceModal,
    setOmniscienceModal: useCriticalGameStore((s) => s.setOmniscienceModal),

    // Handlers — actions are stable, so these only depend on prop callbacks.
    handleOpenFavorModal: useCallback(
      () => useCriticalGameStore.getState().setFavorModal(true),
      [],
    ),
    handleCloseFavorModal: useCallback(() => {
      const current = useCriticalGameStore.getState();
      current.setFavorModal(false);
      current.setSelectedTarget(null);
    }, []),
    handleConfirmFavor: useCallback(() => {
      const current = useCriticalGameStore.getState();
      if (current.selectedTarget && playFavor) {
        playFavor(current.selectedTarget);
        current.setFavorModal(false);
        current.setSelectedTarget(null);
      }
    }, [playFavor]),
    handleCloseSeeTheFutureModal: useCallback(
      () => useCriticalGameStore.getState().setSeeTheFutureModal(null),
      [],
    ),
    handleCloseStashModal: useCallback(
      () => useCriticalGameStore.getState().setStashModal(false),
      [],
    ),
    handleCloseMarkModal: useCallback(
      () => useCriticalGameStore.getState().setMarkModal(false),
      [],
    ),
    handleCloseStealDrawModal: useCallback(
      () => useCriticalGameStore.getState().setStealDrawModal(false),
      [],
    ),
    handleCloseSmiteModal: useCallback(
      () => useCriticalGameStore.getState().setSmiteModal(false),
      [],
    ),
    handleCloseOmniscienceModal: useCallback(
      () => useCriticalGameStore.getState().setOmniscienceModal(null),
      [],
    ),
  };
}

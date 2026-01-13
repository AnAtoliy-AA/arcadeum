import { useEffect, RefObject } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
import { useCriticalGameStore } from '../store/criticalGameStore';
import type { CriticalCard } from '../types';

interface UseCriticalModalsOptions {
  chatMessagesRef: RefObject<HTMLDivElement | null>;
  chatLogCount: number;
}

/**
 * Hook for managing game modals and chat state
 */
export function useCriticalModals({
  chatMessagesRef,
  chatLogCount,
}: UseCriticalModalsOptions) {
  const store = useCriticalGameStore();

  // Destructure for easier usage, but keep store prefix or similar if needed?
  // Actually, returning 'store' directly or checking differences.
  // The original hook returns a flat object. We can mimic that.

  // Auto-scroll chat to newest message
  useEffect(() => {
    // Scroll to the last message (newest) without scrolling the whole page
    if (chatMessagesRef.current?.lastElementChild) {
      const container = chatMessagesRef.current;
      const lastElement = container.lastElementChild as HTMLElement;

      // With position: relative on the container, offsetTop gives us the precise
      // local position of the element.
      container.scrollTo({
        top: lastElement.offsetTop,
        behavior: 'smooth',
      });
    }
  }, [chatLogCount, chatMessagesRef]);

  // Listen for See the Future response
  // This logic ties socket events to store updates.
  // Ideally this should be in the store or a "SocketController", but keeping it here for now is fine since it's a hook used in the Game component.
  useEffect(() => {
    const handleSeeTheFuture = (data: { topCards: string[] }) => {
      if (data.topCards) {
        store.setSeeTheFutureModal({ cards: data.topCards as CriticalCard[] });
      }
    };

    const wrappedHandler = async (raw: unknown) => {
      const data = await maybeDecrypt<{ topCards: string[] }>(raw);
      handleSeeTheFuture(data);
    };

    gameSocket.on('games.session.see_the_future.played', wrappedHandler);

    return () => {
      gameSocket.off('games.session.see_the_future.played', wrappedHandler);
    };
  }, [store.setSeeTheFutureModal, store]);

  return {
    // Cat combo modal
    catComboModal: store.catComboModal,
    selectedMode: store.selectedMode,
    selectedTarget: store.selectedTarget,
    selectedCard: store.selectedCard,
    selectedIndex: store.selectedIndex,
    setSelectedMode: store.setSelectedMode,
    setSelectedTarget: store.setSelectedTarget,
    setSelectedCard: store.setSelectedCard,
    setSelectedIndex: store.setSelectedIndex,
    handleOpenCatCombo: store.openCatCombo,
    handleCloseCatComboModal: store.closeCatComboModal,
    handleSelectCat: store.selectCat,

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

    // Chat
    chatMessage: store.chatMessage,
    setChatMessage: store.setChatMessage,
    chatScope: store.chatScope,
    setChatScope: store.setChatScope,
    showChat: store.showChat,
    handleToggleChat: () => store.setShowChat((prev) => !prev),
    clearChatMessage: () => store.setChatMessage(''),
  };
}

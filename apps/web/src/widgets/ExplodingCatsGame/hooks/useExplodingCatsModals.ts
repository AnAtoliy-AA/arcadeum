import { useState, useCallback, useEffect, RefObject } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
import type {
  ExplodingCatsCard,
  ExplodingCatsCatCard,
  CatComboModalState,
  SeeTheFutureModalState,
  ChatScope,
} from '../types';
import { FIVER_COMBO_SIZE } from '../types';

interface UseExplodingCatsModalsOptions {
  chatMessagesRef: RefObject<HTMLDivElement | null>;
  chatLogCount: number;
}

/**
 * Hook for managing game modals and chat state
 */
export function useExplodingCatsModals({
  chatMessagesRef,
  chatLogCount,
}: UseExplodingCatsModalsOptions) {
  const [catComboModal, setCatComboModal] = useState<CatComboModalState | null>(
    null,
  );
  const [favorModal, setFavorModal] = useState(false);
  const [seeTheFutureModal, setSeeTheFutureModal] =
    useState<SeeTheFutureModalState | null>(null);
  const [selectedMode, setSelectedMode] = useState<
    'pair' | 'trio' | 'fiver' | null
  >(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ExplodingCatsCard | null>(
    null,
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedDiscardCard, setSelectedDiscardCard] =
    useState<ExplodingCatsCard | null>(null);
  const [selectedFiverCards, setSelectedFiverCards] = useState<
    ExplodingCatsCard[]
  >([]);
  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatScope, setChatScope] = useState<ChatScope>('all');
  const [showChat, setShowChat] = useState(true);

  // Auto-scroll chat to newest message
  useEffect(() => {
    if (chatMessagesRef.current?.lastElementChild) {
      chatMessagesRef.current.lastElementChild.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [chatLogCount, chatMessagesRef]);

  // Listen for See the Future response
  useEffect(() => {
    const handleSeeTheFuture = (data: { topCards: string[] }) => {
      if (data.topCards) {
        setSeeTheFutureModal({ cards: data.topCards as ExplodingCatsCard[] });
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
  }, []);

  const handleOpenCatCombo = useCallback(
    (cats: ExplodingCatsCatCard[], handCards: ExplodingCatsCard[]) => {
      const availableCats = cats
        .map((cat) => {
          const count = handCards.filter((c) => c === cat).length;
          const availableModes: ('pair' | 'trio')[] = [];
          if (count >= 2) availableModes.push('pair');
          if (count >= 3) availableModes.push('trio');
          return { cat, availableModes };
        })
        .filter((item) => item.availableModes.length > 0);

      // Check if fiver combo is available (has at least one of each cat card)
      const fiverAvailable = cats.every((cat) =>
        handCards.some((c) => c === cat),
      );

      if (availableCats.length === 0 && !fiverAvailable) return;

      // Auto-select if only one cat available
      const selectedCat =
        availableCats.length === 1 ? availableCats[0].cat : null;
      const defaultMode = selectedCat
        ? availableCats[0].availableModes[0]
        : null;

      setCatComboModal({ availableCats, selectedCat, fiverAvailable });
      setSelectedMode(defaultMode);
      setSelectedTarget(null);
      setSelectedCard(null);
      setSelectedIndex(defaultMode === 'pair' ? 0 : null);
      setSelectedDiscardCard(null);
    },
    [],
  );

  const handleCloseCatComboModal = useCallback(() => {
    setCatComboModal(null);
    setSelectedMode(null);
    setSelectedTarget(null);
    setSelectedCard(null);
    setSelectedIndex(null);
    setSelectedDiscardCard(null);
    setSelectedFiverCards([]);
  }, []);

  const handleSelectCat = useCallback((cat: ExplodingCatsCatCard) => {
    setCatComboModal((prev) => {
      if (!prev) return prev;
      const catData = prev.availableCats.find((c) => c.cat === cat);
      if (catData) {
        const defaultMode = catData.availableModes[0];
        setSelectedMode(defaultMode);
        setSelectedIndex(defaultMode === 'pair' ? 0 : null);
      }
      return { ...prev, selectedCat: cat };
    });
    setSelectedTarget(null);
    setSelectedCard(null);
  }, []);

  const handleToggleFiverCard = useCallback((card: ExplodingCatsCard) => {
    setSelectedFiverCards((prev) => {
      if (prev.includes(card)) {
        return prev.filter((c) => c !== card);
      }
      if (prev.length >= FIVER_COMBO_SIZE) {
        return prev;
      }
      return [...prev, card];
    });
  }, []);

  const handleToggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const clearChatMessage = useCallback(() => {
    setChatMessage('');
  }, []);

  return {
    // Cat combo modal
    catComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    setSelectedMode,
    setSelectedTarget,
    setSelectedCard,
    setSelectedIndex,
    handleOpenCatCombo,
    handleCloseCatComboModal,
    handleSelectCat,

    // Fiver mode state
    selectedDiscardCard,
    setSelectedDiscardCard,
    selectedFiverCards,
    setSelectedFiverCards,
    handleToggleFiverCard,

    // Favor modal
    favorModal,
    setFavorModal,

    // See the future modal
    seeTheFutureModal,
    setSeeTheFutureModal,

    // Chat
    chatMessage,
    setChatMessage,
    chatScope,
    setChatScope,
    showChat,
    handleToggleChat,
    clearChatMessage,
  };
}

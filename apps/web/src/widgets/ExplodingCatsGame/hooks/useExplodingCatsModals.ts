import { useState, useCallback, useEffect, RefObject } from "react";
import { gameSocket } from "@/shared/lib/socket";
import type { ExplodingCatsCard, ExplodingCatsCatCard, CatComboModalState, SeeTheFutureModalState } from "../types";

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
  const [catComboModal, setCatComboModal] = useState<CatComboModalState | null>(null);
  const [favorModal, setFavorModal] = useState(false);
  const [seeTheFutureModal, setSeeTheFutureModal] = useState<SeeTheFutureModalState | null>(null);
  const [selectedMode, setSelectedMode] = useState<"pair" | "trio" | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ExplodingCatsCard | null>(null);

  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [chatScope, setChatScope] = useState<"all" | "players">("all");
  const [showChat, setShowChat] = useState(true);

  // Auto-scroll chat to newest message
  useEffect(() => {
    if (chatMessagesRef.current?.lastElementChild) {
      chatMessagesRef.current.lastElementChild.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
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

    gameSocket.on("games.session.see_the_future.played", handleSeeTheFuture);

    return () => {
      gameSocket.off("games.session.see_the_future.played", handleSeeTheFuture);
    };
  }, []);

  const handleOpenCatCombo = useCallback((cat: ExplodingCatsCatCard, handCards: ExplodingCatsCard[]) => {
    const count = handCards.filter((c) => c === cat).length;
    const availableModes: ("pair" | "trio")[] = [];

    if (count >= 2) availableModes.push("pair");
    if (count >= 3) availableModes.push("trio");

    if (availableModes.length === 0) return;

    setCatComboModal({ cat, availableModes });
    setSelectedMode(availableModes[0]);
    setSelectedTarget(null);
    setSelectedCard(null);
  }, []);

  const handleCloseCatComboModal = useCallback(() => {
    setCatComboModal(null);
    setSelectedMode(null);
    setSelectedTarget(null);
    setSelectedCard(null);
  }, []);

  const handleToggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const clearChatMessage = useCallback(() => {
    setChatMessage("");
  }, []);

  return {
    // Cat combo modal
    catComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    setSelectedMode,
    setSelectedTarget,
    setSelectedCard,
    handleOpenCatCombo,
    handleCloseCatComboModal,
    
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

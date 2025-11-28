import { useCallback, useEffect } from "react";
import { gameSocket } from "@/shared/lib/socket";

export type GameType = "exploding_cats_v1" | "texas_holdem_v1" | null;

interface UseGameActionsOptions {
  roomId: string;
  userId: string | null;
  gameType: GameType;
  onActionComplete?: () => void;
}

interface UseGameActionsReturn {
  // Exploding Cats actions
  startExplodingCats: () => void;
  drawCard: () => void;
  playActionCard: (card: string) => void;
  playFavor: (targetPlayerId: string, desiredCard: string) => void;
  playSeeTheFuture: () => void;
  playCatCombo: (cat: string, mode: string, targetPlayerId?: string, desiredCard?: string) => void;

  // Texas Hold'em actions
  startHoldem: (startingChips?: number) => void;
  holdemAction: (action: "fold" | "check" | "call" | "raise", raiseAmount?: number) => void;

  // Common actions
  postHistoryNote: (message: string, scope: "all" | "players") => void;
}

/**
 * Hook for managing game-specific actions
 * Provides action emitters for different game types
 */
export function useGameActions(options: UseGameActionsOptions): UseGameActionsReturn {
  const { roomId, userId, gameType, onActionComplete } = options;

  // Setup game-specific listeners
  useEffect(() => {
    if (!gameType) return;

    const handleActionComplete = () => {
      onActionComplete?.();
    };

    if (gameType === "exploding_cats_v1") {
      gameSocket.on("games.session.drawn", handleActionComplete);
      gameSocket.on("games.session.action.played", handleActionComplete);
      gameSocket.on("games.session.see_the_future.played", handleActionComplete);
      gameSocket.on("games.session.favor.played", handleActionComplete);
      gameSocket.on("games.session.cat_combo.played", handleActionComplete);
    } else if (gameType === "texas_holdem_v1") {
      gameSocket.on("games.session.holdem_started", handleActionComplete);
      gameSocket.on("games.session.holdem_action.performed", handleActionComplete);
    }

    return () => {
      if (gameType === "exploding_cats_v1") {
        gameSocket.off("games.session.drawn", handleActionComplete);
        gameSocket.off("games.session.action.played", handleActionComplete);
        gameSocket.off("games.session.see_the_future.played", handleActionComplete);
        gameSocket.off("games.session.favor.played", handleActionComplete);
        gameSocket.off("games.session.cat_combo.played", handleActionComplete);
      } else if (gameType === "texas_holdem_v1") {
        gameSocket.off("games.session.holdem_started", handleActionComplete);
        gameSocket.off("games.session.holdem_action.performed", handleActionComplete);
      }
    };
  }, [gameType, onActionComplete]);

  // Exploding Cats actions
  const startExplodingCats = useCallback(() => {
    if (!userId) return;
    gameSocket.emit("games.session.start", {
      roomId,
      userId,
      engine: "exploding_cats_v1",
    });
  }, [roomId, userId]);

  const drawCard = useCallback(() => {
    if (!userId) return;
    gameSocket.emit("games.session.draw", { roomId, userId });
  }, [roomId, userId]);

  const playActionCard = useCallback((card: string) => {
    if (!userId) return;
    gameSocket.emit("games.session.play_action", { roomId, userId, card });
  }, [roomId, userId]);

  const playFavor = useCallback((targetPlayerId: string, desiredCard: string) => {
    if (!userId) return;
    gameSocket.emit("games.session.play_favor", {
      roomId,
      userId,
      targetPlayerId,
      desiredCard,
    });
  }, [roomId, userId]);

  const playSeeTheFuture = useCallback(() => {
    if (!userId) return;
    gameSocket.emit("games.session.play_see_the_future", { roomId, userId });
  }, [roomId, userId]);

  const playCatCombo = useCallback((
    cat: string,
    mode: string,
    targetPlayerId?: string,
    desiredCard?: string,
  ) => {
    if (!userId) return;
    gameSocket.emit("games.session.play_cat_combo", {
      roomId,
      userId,
      cat,
      mode,
      targetPlayerId,
      desiredCard,
    });
  }, [roomId, userId]);

  // Texas Hold'em actions
  const startHoldem = useCallback((startingChips: number = 1000) => {
    if (!userId) return;
    gameSocket.emit("games.session.start_holdem", {
      roomId,
      userId,
      engine: "texas_holdem_v1",
      startingChips,
    });
  }, [roomId, userId]);

  const holdemAction = useCallback((
    action: "fold" | "check" | "call" | "raise",
    raiseAmount?: number,
  ) => {
    if (!userId) return;
    gameSocket.emit("games.session.holdem_action", {
      roomId,
      userId,
      action,
      raiseAmount,
    });
  }, [roomId, userId]);

  // Common actions
  const postHistoryNote = useCallback((message: string, scope: "all" | "players") => {
    if (!userId) return;

    const event = gameType === "texas_holdem_v1"
      ? "games.session.holdem_history_note"
      : "games.session.history_note";

    gameSocket.emit(event, { roomId, userId, message, scope });
  }, [roomId, userId, gameType]);

  return {
    // Exploding Cats
    startExplodingCats,
    drawCard,
    playActionCard,
    playFavor,
    playSeeTheFuture,
    playCatCombo,

    // Texas Hold'em
    startHoldem,
    holdemAction,

    // Common
    postHistoryNote,
  };
}

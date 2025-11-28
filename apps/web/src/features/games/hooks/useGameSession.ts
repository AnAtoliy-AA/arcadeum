import { useState, useEffect, useCallback } from "react";
import { gameSocket } from "@/shared/lib/socket";
import type { GameSessionSummary } from "@/shared/types/games";

interface UseGameSessionOptions {
  roomId: string;
  enabled?: boolean;
  initialSession?: unknown | null;
}

interface UseGameSessionReturn {
  session: GameSessionSummary | null;
  startBusy: boolean;
  actionBusy: string | null;
  setActionBusy: (action: string | null) => void;
}

/**
 * Hook for managing game session state
 * Handles session snapshots, updates, and action states
 */
export function useGameSession(options: UseGameSessionOptions): UseGameSessionReturn {
  const { roomId, enabled = true, initialSession } = options;

  const [session, setSession] = useState<GameSessionSummary | null>(
    (initialSession as GameSessionSummary) ?? null
  );
  const [startBusy, setStartBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);


  useEffect(() => {
    if (!enabled) return;

    const handleSnapshot = (payload: {
      roomId?: string;
      session?: GameSessionSummary | null;
    }) => {
      if (payload?.roomId && payload.roomId !== roomId) return;
      if (payload && Object.prototype.hasOwnProperty.call(payload, "session")) {
        setSession(payload?.session ?? null);
      }
      setActionBusy(null);
    };

    const handleSessionStarted = (payload: {
      room?: unknown;
      session?: GameSessionSummary;
    }) => {
      setStartBusy(false);
      if (payload?.session) {
        setSession(payload.session);
      }
      setActionBusy(null);
    };

    const handleRoomJoined = (payload: {
      room?: unknown;
      session?: GameSessionSummary | null;
    }) => {
      if (payload?.session) {
        setSession(payload.session);
      }
    };

    // Register listeners
    gameSocket.on("games.session.snapshot", handleSnapshot);
    gameSocket.on("games.session.started", handleSessionStarted);
    gameSocket.on("games.room.joined", handleRoomJoined);

    // Cleanup
    return () => {
      gameSocket.off("games.session.snapshot", handleSnapshot);
      gameSocket.off("games.session.started", handleSessionStarted);
      gameSocket.off("games.room.joined", handleRoomJoined);
    };
  }, [roomId, enabled]);

  return {
    session,
    startBusy,
    actionBusy,
    setActionBusy,
  };
}

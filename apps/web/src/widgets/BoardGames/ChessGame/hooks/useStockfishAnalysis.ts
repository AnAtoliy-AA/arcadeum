'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';

interface EngineEval {
  cp: number | null;
  mate: number | null;
  pv: string[];
  depth: number;
  selDepth: number;
  nodes: number;
  nps: number;
  timeMs: number;
}

interface UseStockfishAnalysisOptions {
  roomId: string;
  enabled: boolean;
}

/**
 * Hook for live Stockfish 19 engine analysis during a chess game.
 *
 * Listens for analysis broadcasts from the server (one Stockfish call per
 * move, shared with all players and spectators). No per-client requests.
 */
export function useStockfishAnalysis({
  roomId,
  enabled,
}: UseStockfishAnalysisOptions) {
  const [eval_, setEval] = useState<EngineEval | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    async function onAnalyzed(raw: unknown) {
      const data = await maybeDecrypt<{ roomId: string; eval: EngineEval }>(raw);
      if (data && data.roomId === roomId) {
        setEval(data.eval);
        setAnalyzing(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    }

    gameSocket.on('chess.session.analyzed', onAnalyzed);

    return () => {
      gameSocket.off('chess.session.analyzed', onAnalyzed);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [roomId, enabled]);

  // Set analyzing=true whenever we receive a session update (move happened)
  // The server will broadcast the eval shortly after
  useEffect(() => {
    if (!enabled) return;

    async function onSessionSnapshot(raw: unknown) {
      const data = await maybeDecrypt<{ roomId?: string }>(raw);
      if (data && data.roomId === roomId) {
        setAnalyzing(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setAnalyzing(false), 5000);
      }
    }

    gameSocket.on('games.session.snapshot', onSessionSnapshot);

    return () => {
      gameSocket.off('games.session.snapshot', onSessionSnapshot);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [roomId, enabled]);

  const clearEval = useCallback(() => {
    setEval(null);
    setAnalyzing(false);
  }, []);

  return { eval: eval_, analyzing, clearEval };
}

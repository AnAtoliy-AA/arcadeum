'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { gameSocket } from '@/shared/lib/socket';

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
  userId: string | null;
  enabled: boolean;
  fen: string | null;
  ply: number;
}

/**
 * Hook for live Stockfish 19 engine analysis during a chess game.
 *
 * Subscribes to engine eval events via WebSocket and requests analysis
 * after each move. Uses Stockfish 19 (latest stable, released 2026-09-05)
 * running server-side via native binary (UCI protocol).
 */
export function useStockfishAnalysis({
  roomId,
  userId,
  enabled,
  fen,
  ply,
}: UseStockfishAnalysisOptions) {
  const [eval_, setEval] = useState<EngineEval | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const lastPlyRef = useRef(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !fen || ply === lastPlyRef.current) return;

    lastPlyRef.current = ply;

    // Debounce: wait 300ms after last move before requesting analysis
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAnalyzing(true);
      gameSocket.emit('chess.session.analyze', {
        roomId,
        userId,
        fen,
        depth: 12,
        timeMs: 1500,
      });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fen, ply, roomId, userId, enabled]);

  useEffect(() => {
    if (!enabled) return;

    function onAnalyzed(data: { roomId: string; eval: EngineEval }) {
      if (data.roomId === roomId) {
        setEval(data.eval);
        setAnalyzing(false);
      }
    }

    function onError(data: { roomId: string; error: string }) {
      if (data.roomId === roomId) {
        setAnalyzing(false);
      }
    }

    gameSocket.on('chess.session.analyzed', onAnalyzed);
    gameSocket.on('chess.session.analyze_error', onError);

    return () => {
      gameSocket.off('chess.session.analyzed', onAnalyzed);
      gameSocket.off('chess.session.analyze_error', onError);
    };
  }, [roomId, enabled]);

  const clearEval = useCallback(() => {
    setEval(null);
    lastPlyRef.current = -1;
  }, []);

  return { eval: eval_, analyzing, clearEval };
}

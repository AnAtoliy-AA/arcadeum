'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { gameSocket } from '@/shared/lib/socket';

interface MatchmakingState {
  queued: boolean;
  position: number;
  queueSize: number;
  waitTime: number;
}

interface UseMatchmakingOptions {
  userId: string | null;
  rating: number;
  timeControlType: string;
  onMatched: (data: { roomId: string; color: string; opponent: string }) => void;
}

export function useMatchmaking({
  userId,
  rating,
  timeControlType,
  onMatched,
}: UseMatchmakingOptions) {
  const [state, setState] = useState<MatchmakingState>({
    queued: false,
    position: 0,
    queueSize: 0,
    waitTime: 0,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const onMatchedRef = useRef(onMatched);

  useEffect(() => {
    onMatchedRef.current = onMatched;
  }, [onMatched]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setState((prev) => ({ ...prev, waitTime: elapsed }));
    }, 1000);
  }, []);

  useEffect(() => {
    const handleMatched = (data: { roomId: string; color: string; opponent: string }) => {
      stopTimer();
      setState((prev) => ({ ...prev, queued: false }));
      onMatchedRef.current(data);
    };

    const handleJoined = (data: { queued: boolean; position: number }) => {
      setState((prev) => ({ ...prev, queued: data.queued, position: data.position }));
    };

    const handleStatus = (data: { position: number; queueSize: number }) => {
      setState((prev) => ({
        ...prev,
        position: data.position,
        queueSize: data.queueSize,
      }));
    };

    const handleLeft = () => {
      stopTimer();
      setState({ queued: false, position: 0, queueSize: 0, waitTime: 0 });
    };

    gameSocket.on('chess.matchmaking.matched', handleMatched);
    gameSocket.on('chess.matchmaking.joined', handleJoined);
    gameSocket.on('chess.matchmaking.status', handleStatus);
    gameSocket.on('chess.matchmaking.left', handleLeft);

    return () => {
      gameSocket.off('chess.matchmaking.matched', handleMatched);
      gameSocket.off('chess.matchmaking.joined', handleJoined);
      gameSocket.off('chess.matchmaking.status', handleStatus);
      gameSocket.off('chess.matchmaking.left', handleLeft);
      stopTimer();
    };
  }, [stopTimer]);

  const joinQueue = useCallback(() => {
    if (!userId) return;
    gameSocket.emit('chess.matchmaking.join', {
      userId,
      rating,
      timeControlType,
    });
    startTimer();
  }, [userId, rating, timeControlType, startTimer]);

  const leaveQueue = useCallback(() => {
    if (!userId) return;
    gameSocket.emit('chess.matchmaking.leave', {
      userId,
      timeControlType,
    });
    stopTimer();
  }, [userId, timeControlType, stopTimer]);

  const refreshStatus = useCallback(() => {
    if (!userId) return;
    gameSocket.emit('chess.matchmaking.status', {
      userId,
      timeControlType,
    });
  }, [userId, timeControlType]);

  return {
    ...state,
    joinQueue,
    leaveQueue,
    refreshStatus,
  };
}

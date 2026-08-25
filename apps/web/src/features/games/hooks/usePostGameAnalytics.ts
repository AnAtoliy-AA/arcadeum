'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  historyApi,
  type HeadToHeadResponse,
  type TrendsResponse,
} from '@/features/history/api';
import type { GameResultStats } from '../ui/GameResultStatsGrid';
import { extractGameStats } from '../lib/game-stat-extractors';

export interface MoveEntry {
  turn: number;
  playerId: string;
  description: string;
}

export interface UsePostGameAnalyticsOptions {
  gameId: string;
  session: Record<string, unknown> | undefined;
  currentUserId: string | null;
  opponentId?: string | null;
}

export interface UsePostGameAnalyticsResult {
  stats: GameResultStats | undefined;
  moveTimeline: MoveEntry[];
  headToHead: HeadToHeadResponse | null;
  headToHeadLoading: boolean;
  trends: TrendsResponse | null;
  trendsLoading: boolean;
  loadHeadToHead: () => void;
  loadTrends: () => void;
}

function extractMoveTimeline(state: Record<string, unknown>): MoveEntry[] {
  const logs = state.logs;
  if (!Array.isArray(logs)) return [];

  const entries: MoveEntry[] = [];
  let turn = 0;

  for (const log of logs) {
    if (typeof log !== 'object' || log === null) continue;
    const entry = log as Record<string, unknown>;
    if (entry.type !== 'action') continue;

    turn++;
    const playerId =
      typeof entry.playerId === 'string'
        ? entry.playerId
        : typeof entry.player === 'string'
          ? entry.player
          : 'unknown';
    const action = entry.action as Record<string, unknown> | undefined;
    const actionType =
      typeof action?.type === 'string'
        ? action.type
        : typeof entry.name === 'string'
          ? entry.name
          : 'move';
    const description = actionType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    entries.push({ turn, playerId, description });
  }

  return entries;
}

export function usePostGameAnalytics({
  gameId,
  session,
  currentUserId,
  opponentId,
}: UsePostGameAnalyticsOptions): UsePostGameAnalyticsResult {
  const { snapshot } = useSessionTokens();
  const [headToHead, setHeadToHead] = useState<HeadToHeadResponse | null>(null);
  const [headToHeadLoading, setHeadToHeadLoading] = useState(false);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const h2hFetched = useRef(false);
  const trendsFetched = useRef(false);

  const stats = useMemo<GameResultStats | undefined>(() => {
    if (!session || !currentUserId) return undefined;
    return extractGameStats(gameId, session, currentUserId) ?? undefined;
  }, [gameId, session, currentUserId]);

  const moveTimeline = useMemo<MoveEntry[]>(() => {
    if (!session) return [];
    return extractMoveTimeline(session);
  }, [session]);

  const loadHeadToHead = useCallback(async () => {
    if (h2hFetched.current || !opponentId || !snapshot.accessToken) return;
    h2hFetched.current = true;
    setHeadToHeadLoading(true);
    try {
      const data = await historyApi.getHeadToHead(opponentId, gameId, {
        token: snapshot.accessToken,
      });
      setHeadToHead(data);
    } catch {
      // silent
    } finally {
      setHeadToHeadLoading(false);
    }
  }, [opponentId, gameId, snapshot.accessToken]);

  const loadTrends = useCallback(async () => {
    if (trendsFetched.current || !snapshot.accessToken) return;
    trendsFetched.current = true;
    setTrendsLoading(true);
    try {
      const data = await historyApi.getTrends(gameId, 10, {
        token: snapshot.accessToken,
      });
      setTrends(data);
    } catch {
      // silent
    } finally {
      setTrendsLoading(false);
    }
  }, [gameId, snapshot.accessToken]);

  return {
    stats,
    moveTimeline,
    headToHead,
    headToHeadLoading,
    trends,
    trendsLoading,
    loadHeadToHead,
    loadTrends,
  };
}

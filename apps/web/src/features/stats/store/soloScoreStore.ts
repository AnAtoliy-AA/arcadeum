'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SoloScoreRecord } from '@/shared/api/soloScores';

interface SoloScoreState {
  records: SoloScoreRecord[];
  syncedSessionIds: string[];
  addScore: (record: SoloScoreRecord) => void;
  markSynced: (sessionIds: string[]) => void;
  getUnsyncedRecords: () => SoloScoreRecord[];
  getPersonalBests: (gameId?: string) => Record<
    string,
    Record<
      string,
      {
        bestScore: number;
        bestMoves: number;
        bestDurationMs: number;
        wins: number;
        totalGames: number;
      }
    >
  >;
  resetScores: () => void;
}

const MAX_SOLO_SCORES = 500;

export const useSoloScoreStore = create<SoloScoreState>()(
  persist(
    (set, get) => ({
      records: [],
      syncedSessionIds: [],

      addScore: (record) => {
        const records = [...get().records, record];
        if (records.length > MAX_SOLO_SCORES) {
          records.splice(0, records.length - MAX_SOLO_SCORES);
        }
        set({ records });
      },

      markSynced: (sessionIds) => {
        const existing = new Set(get().syncedSessionIds);
        for (const id of sessionIds) {
          existing.add(id);
        }
        set({ syncedSessionIds: Array.from(existing) });
      },

      getUnsyncedRecords: () => {
        const { records, syncedSessionIds } = get();
        const syncedSet = new Set(syncedSessionIds);
        return records.filter((r) => !syncedSet.has(r.sessionId));
      },

      getPersonalBests: (gameId) => {
        const { records } = get();
        const bests: Record<
          string,
          Record<
            string,
            {
              bestScore: number;
              bestMoves: number;
              bestDurationMs: number;
              wins: number;
              totalGames: number;
            }
          >
        > = {};

        for (const record of records) {
          if (gameId && record.gameId !== gameId) continue;

          if (!bests[record.gameId]) bests[record.gameId] = {};
          const gameBests = bests[record.gameId];

          if (!gameBests[record.difficulty]) {
            gameBests[record.difficulty] = {
              bestScore: -Infinity,
              bestMoves: Infinity,
              bestDurationMs: Infinity,
              wins: 0,
              totalGames: 0,
            };
          }

          const diff = gameBests[record.difficulty];
          diff.totalGames++;
          if (record.result === 'won') {
            diff.wins++;
            if (record.score > diff.bestScore) diff.bestScore = record.score;
            if (record.moves < diff.bestMoves) diff.bestMoves = record.moves;
            if (record.durationMs < diff.bestDurationMs)
              diff.bestDurationMs = record.durationMs;
          } else {
            if (record.score > diff.bestScore) diff.bestScore = record.score;
          }
        }

        // Replace -Infinity / Infinity with 0 for display
        for (const gameId of Object.keys(bests)) {
          for (const diff of Object.keys(bests[gameId])) {
            const b = bests[gameId][diff];
            if (b.bestScore === -Infinity) b.bestScore = 0;
            if (b.bestMoves === Infinity) b.bestMoves = 0;
            if (b.bestDurationMs === Infinity) b.bestDurationMs = 0;
          }
        }

        return bests;
      },

      resetScores: () => set({ records: [], syncedSessionIds: [] }),
    }),
    {
      name: 'arcadeum_solo_scores_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        records: state.records,
        syncedSessionIds: state.syncedSessionIds,
      }),
    },
  ),
);

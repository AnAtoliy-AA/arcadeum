import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LocalGameRecord {
  gameId: string;
  result: 'won' | 'lost' | 'draw';
  timestamp: number;
  sessionId?: string;
}

export interface GameTypeStats {
  gameId: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

interface LocalStatsState {
  records: LocalGameRecord[];
  recordGameResult: (record: LocalGameRecord) => void;
  resetStats: () => void;
  getOverview: () => {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  };
  getByGameType: () => GameTypeStats[];
}

const MAX_RECORDS = 1000;

export const useLocalStatsStore = create<LocalStatsState>()(
  persist(
    (set, get) => ({
      records: [],

      recordGameResult: (record) => {
        const records = [...get().records, record];
        if (records.length > MAX_RECORDS) {
          records.splice(0, records.length - MAX_RECORDS);
        }
        set({ records });
      },

      resetStats: () => set({ records: [] }),

      getOverview: () => {
        const { records } = get();
        const wins = records.filter((r) => r.result === 'won').length;
        const losses = records.filter((r) => r.result === 'lost').length;
        const draws = records.filter((r) => r.result === 'draw').length;
        const totalGames = records.length;
        return {
          totalGames,
          wins,
          losses,
          draws,
          winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
        };
      },

      getByGameType: () => {
        const { records } = get();
        const byGame = new Map<
          string,
          { totalGames: number; wins: number; losses: number; draws: number }
        >();

        for (const record of records) {
          const existing = byGame.get(record.gameId) ?? {
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
          };
          existing.totalGames++;
          if (record.result === 'won') existing.wins++;
          else if (record.result === 'lost') existing.losses++;
          else existing.draws++;
          byGame.set(record.gameId, existing);
        }

        return Array.from(byGame.entries())
          .map(([gameId, stats]) => ({
            gameId,
            ...stats,
            winRate:
              stats.totalGames > 0
                ? Math.round((stats.wins / stats.totalGames) * 100)
                : 0,
          }))
          .sort((a, b) => b.totalGames - a.totalGames);
      },
    }),
    {
      name: 'arcadeum_local_stats_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ records: state.records }),
    },
  ),
);

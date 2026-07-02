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

export interface StreakInfo {
  currentStreak: number;
  currentStreakType: 'won' | 'lost' | null;
  bestWinStreak: number;
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
  getStreaks: () => StreakInfo;
  getFavoriteGame: () => string | null;
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

      getStreaks: () => {
        const { records } = get();
        if (records.length === 0) {
          return {
            currentStreak: 0,
            currentStreakType: null,
            bestWinStreak: 0,
          };
        }

        let currentStreak = 0;
        let currentStreakType: 'won' | 'lost' | null = null;
        let bestWinStreak = 0;
        let tempWinStreak = 0;

        for (let i = records.length - 1; i >= 0; i--) {
          const result = records[i].result;
          if (result === 'draw') break;
          if (currentStreakType === null) {
            currentStreakType = result;
            currentStreak = 1;
          } else if (result === currentStreakType) {
            currentStreak++;
          } else {
            break;
          }
        }

        for (const record of records) {
          if (record.result === 'won') {
            tempWinStreak++;
            if (tempWinStreak > bestWinStreak) {
              bestWinStreak = tempWinStreak;
            }
          } else {
            tempWinStreak = 0;
          }
        }

        return { currentStreak, currentStreakType, bestWinStreak };
      },

      getFavoriteGame: () => {
        const { records } = get();
        if (records.length === 0) return null;
        const counts = new Map<string, number>();
        for (const record of records) {
          counts.set(record.gameId, (counts.get(record.gameId) ?? 0) + 1);
        }
        let maxId = '';
        let maxCount = 0;
        for (const [id, count] of counts) {
          if (count > maxCount) {
            maxCount = count;
            maxId = id;
          }
        }
        return maxId || null;
      },
    }),
    {
      name: 'arcadeum_local_stats_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ records: state.records }),
    },
  ),
);

export interface DailyStreakState {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDateString: string | null;
  freezeTokens: number;
}

const STORAGE_KEY = 'arcadeum_daily_streak_v1';

export class DailyStreakManager {
  static getTodayDateString(d = new Date()): string {
    return d.toISOString().split('T')[0];
  }

  static getYesterdayDateString(d = new Date()): string {
    const prev = new Date(d);
    prev.setDate(prev.getDate() - 1);
    return prev.toISOString().split('T')[0];
  }

  static getStreakState(): DailyStreakState {
    if (typeof window === 'undefined') {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDateString: null,
        freezeTokens: 1,
      };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedDateString: null,
          freezeTokens: 1,
        };
      }
      return JSON.parse(raw) as DailyStreakState;
    } catch {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDateString: null,
        freezeTokens: 1,
      };
    }
  }

  static recordCompletion(
    todayStr = this.getTodayDateString(),
  ): DailyStreakState {
    const current = this.getStreakState();
    if (current.lastCompletedDateString === todayStr) {
      return current;
    }

    const yesterdayStr = this.getYesterdayDateString();
    let newStreak = 1;

    if (current.lastCompletedDateString === yesterdayStr) {
      newStreak = current.currentStreak + 1;
    } else if (
      current.lastCompletedDateString &&
      current.currentStreak > 0 &&
      current.freezeTokens > 0
    ) {
      newStreak = current.currentStreak + 1;
      current.freezeTokens -= 1;
    }

    const updated: DailyStreakState = {
      currentStreak: newStreak,
      longestStreak: Math.max(current.longestStreak, newStreak),
      lastCompletedDateString: todayStr,
      freezeTokens: current.freezeTokens,
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        return updated;
      }
    }

    return updated;
  }

  static calculateXpMultiplier(streak: number): number {
    if (streak <= 0) return 1.0;
    return Number((1.0 + Math.min(streak * 0.1, 1.0)).toFixed(1));
  }

  static formatShareCard(
    gameTitle: string,
    puzzleId: number | string,
    moves: number,
    streak: number,
  ): string {
    const stars = moves <= 3 ? '⭐⭐⭐' : moves <= 6 ? '⭐⭐' : '⭐';
    return `🕹️ Arcadeum Daily Challenge #${puzzleId}\n${gameTitle} solved in ${moves} moves! ${stars}\n🔥 ${streak}-day streak active!\nhttps://arcadeum.io/daily-challenges`;
  }
}

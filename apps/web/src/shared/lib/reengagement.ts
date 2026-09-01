export interface ReengagementTrigger {
  id: string;
  type: 'streak_danger' | 'rivalry_beat' | 'winback_bonus';
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  dismissible: boolean;
}

export interface ActivityRecord {
  lastActiveTimestamp: number;
  currentStreak: number;
  freezeCount: number;
}

const STORAGE_KEY = 'arcadeum_reengagement_v1';

export class ReengagementManager {
  static getActivityRecord(): ActivityRecord {
    if (typeof window === 'undefined') {
      return {
        lastActiveTimestamp: Date.now(),
        currentStreak: 0,
        freezeCount: 0,
      };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          lastActiveTimestamp: Date.now(),
          currentStreak: 0,
          freezeCount: 0,
        };
      }
      return JSON.parse(raw) as ActivityRecord;
    } catch {
      return {
        lastActiveTimestamp: Date.now(),
        currentStreak: 0,
        freezeCount: 0,
      };
    }
  }

  static recordActivity(streak = 1, freezes = 0): void {
    if (typeof window === 'undefined') return;
    try {
      const record: ActivityRecord = {
        lastActiveTimestamp: Date.now(),
        currentStreak: streak,
        freezeCount: freezes,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      return;
    }
  }

  static evaluateTriggers(now = Date.now()): ReengagementTrigger | null {
    const record = this.getActivityRecord();
    const hoursSinceActive =
      (now - record.lastActiveTimestamp) / (1000 * 60 * 60);

    if (
      hoursSinceActive >= 20 &&
      hoursSinceActive <= 24 &&
      record.currentStreak > 1
    ) {
      return {
        id: 'streak_danger',
        type: 'streak_danger',
        title: 'Streak at Risk!',
        description: `Your ${record.currentStreak}-day streak is expiring soon. Play a quick game to maintain it!`,
        actionLabel: 'Play Daily Challenge',
        actionUrl: '/daily-challenges',
        dismissible: true,
      };
    }

    if (hoursSinceActive > 48) {
      return {
        id: 'winback_bonus',
        type: 'winback_bonus',
        title: 'Welcome Back!',
        description: 'You have a returning reward waiting in the shop.',
        actionLabel: 'Claim Bonus',
        actionUrl: '/shop',
        dismissible: true,
      };
    }

    return null;
  }
}

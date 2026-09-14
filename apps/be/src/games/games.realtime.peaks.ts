import type Redis from 'ioredis';
import { Logger } from '@nestjs/common';

const PEAK_ONLINE_KEY = 'arcadeum:peak:online_users';
const PEAK_ONLINE_TS_KEY = 'arcadeum:peak:online_users:ts';
const PEAK_ROOMS_KEY = 'arcadeum:peak:active_rooms';
const PEAK_ROOMS_TS_KEY = 'arcadeum:peak:active_rooms:ts';

export interface PeakData {
  peakOnlineUsers: number;
  peakOnlineUsersAt: number;
  peakActiveRooms: number;
  peakActiveRoomsAt: number;
}

export class PeakTracker {
  private readonly logger = new Logger(PeakTracker.name);

  constructor(private readonly redis: Redis | null) {}

  async trackPeakOnline(currentCount: number): Promise<void> {
    if (!this.redis) return;
    try {
      const prev = await this.redis.get(PEAK_ONLINE_KEY);
      const prevPeak = prev ? parseInt(prev, 10) : 0;
      if (currentCount > prevPeak) {
        await this.redis.set(PEAK_ONLINE_KEY, String(currentCount));
        await this.redis.set(PEAK_ONLINE_TS_KEY, String(Date.now()));
      }
    } catch {
      // best-effort
    }
  }

  async trackPeakRooms(currentCount: number): Promise<void> {
    if (!this.redis) return;
    try {
      const prev = await this.redis.get(PEAK_ROOMS_KEY);
      const prevPeak = prev ? parseInt(prev, 10) : 0;
      if (currentCount > prevPeak) {
        await this.redis.set(PEAK_ROOMS_KEY, String(currentCount));
        await this.redis.set(PEAK_ROOMS_TS_KEY, String(Date.now()));
      }
    } catch {
      // best-effort
    }
  }

  async getPeaks(): Promise<PeakData> {
    if (!this.redis) {
      return {
        peakOnlineUsers: 0,
        peakOnlineUsersAt: Date.now(),
        peakActiveRooms: 0,
        peakActiveRoomsAt: 0,
      };
    }
    try {
      const [online, onlineTs, rooms, roomsTs] = await Promise.all([
        this.redis.get(PEAK_ONLINE_KEY),
        this.redis.get(PEAK_ONLINE_TS_KEY),
        this.redis.get(PEAK_ROOMS_KEY),
        this.redis.get(PEAK_ROOMS_TS_KEY),
      ]);
      return {
        peakOnlineUsers: online ? parseInt(online, 10) : 0,
        peakOnlineUsersAt: onlineTs ? parseInt(onlineTs, 10) : 0,
        peakActiveRooms: rooms ? parseInt(rooms, 10) : 0,
        peakActiveRoomsAt: roomsTs ? parseInt(roomsTs, 10) : 0,
      };
    } catch {
      return {
        peakOnlineUsers: 0,
        peakOnlineUsersAt: 0,
        peakActiveRooms: 0,
        peakActiveRoomsAt: 0,
      };
    }
  }
}

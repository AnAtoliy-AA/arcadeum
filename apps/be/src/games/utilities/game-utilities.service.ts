import { Injectable } from '@nestjs/common';
import {
  GameHistorySummary,
  GroupedHistorySummary,
} from '../history/game-history.types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { GameRoom } from '../schemas/game-room.schema';

export interface UserSummary {
  id: string;
  username: string | null;
  email: string | null;
  displayName: string;
}

/**
 * Game Utilities Service
 * Provides common utility functions for games
 */
@Injectable()
export class GameUtilitiesService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
  ) {}

  /**
   * Fetch user summaries for a list of user IDs
   */
  async fetchUserSummaries(
    userIds: string[],
  ): Promise<Map<string, UserSummary>> {
    const uniqueUserIds = Array.from(new Set(userIds));

    const users = await this.userModel
      .find({ _id: { $in: uniqueUserIds } })
      .select('username email')
      .exec();

    const userMap = new Map<string, UserSummary>();

    users.forEach((user) => {
      const userId = user._id.toString();
      userMap.set(userId, {
        id: userId,
        username: user.username || null,
        email: user.email || null,
        displayName: user.username || user.email || 'Unknown User',
      });
    });

    // Add placeholders for missing users
    uniqueUserIds.forEach((userId) => {
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          username: null,
          email: null,
          displayName: 'Unknown User',
        });
      }
    });

    return userMap;
  }

  /**
   * Get display name for a user
   */
  async getUserDisplayName(userId: string): Promise<string> {
    const user = await this.userModel
      .findById(userId)
      .select('username email')
      .exec();

    if (!user) {
      return 'Unknown User';
    }

    return user.username || user.email || 'Unknown User';
  }

  /**
   * Validate user IDs exist
   */
  async validateUserIds(userIds: string[]): Promise<boolean> {
    const uniqueUserIds = Array.from(new Set(userIds));

    const count = await this.userModel
      .countDocuments({ _id: { $in: uniqueUserIds } })
      .exec();

    return count === uniqueUserIds.length;
  }

  /**
   * Get room participant user IDs
   */
  async getRoomParticipantIds(roomId: string): Promise<string[]> {
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      return [];
    }

    return room.participants.map((p) => p.userId);
  }

  /**
   * Check if user is in room
   */
  async isUserInRoom(roomId: string, userId: string): Promise<boolean> {
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      return false;
    }

    return (
      room.hostId === userId ||
      room.participants.some((p) => p.userId === userId)
    );
  }

  /**
   * Normalize user IDs from various formats
   */
  normalizeUserIds(values: unknown[]): string[] {
    return values
      .map((v) => {
        if (typeof v === 'string') return v;
        if (v && typeof v === 'object' && 'toString' in v) {
          return v.toString();
        }
        return null;
      })
      .filter((id): id is string => id !== null);
  }

  /**
   * Generate a random code
   */
  generateRandomCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Shuffle array in place
   */
  shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Get random item from array
   */
  getRandomItem<T>(array: T[]): T | null {
    if (array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Chunk array into smaller arrays
   */
  chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Filter and paginate history entries
   */
  filterAndPaginateHistory(
    allHistory: (GameHistorySummary | GroupedHistorySummary)[],
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      grouped?: boolean;
    },
  ) {
    // Apply filters
    const filtered: (GameHistorySummary | GroupedHistorySummary)[] = [
      ...allHistory,
    ];

    // Search filter
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      const searchFiltered = filtered.filter((h) => {
        const gameName = h.gameName?.toLowerCase() || '';
        const gameId = h.gameId?.toLowerCase() || '';
        const roomName = (h as any).roomName?.toLowerCase() || '';

        return (
          gameName.includes(searchLower) ||
          gameId.includes(searchLower) ||
          roomName.includes(searchLower)
        );
      });
      filtered.length = 0;
      filtered.push(...searchFiltered);
    }

    // Status filter
    if (options?.status && !options.grouped) {
      const statusFiltered = (filtered as GameHistorySummary[]).filter(
        (entry) => entry.status === options.status,
      );
      filtered.length = 0;
      filtered.push(...statusFiltered);
    }

    // Pagination
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;
    const entries = filtered.slice(offset, offset + limit);

    return {
      entries,
      total: filtered.length,
      page,
      limit,
      hasMore: offset + entries.length < filtered.length,
    };
  }
}
